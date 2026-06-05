import { FormEvent, useState, useRef } from "react";
import { streamImport, ImportResult, RecipeComponent, StageEvent } from "./api/client";
import AdUnit from "./components/AdUnit";

// ── Progress list ────────────────────────────────────────────────────────────

interface StepState extends StageEvent {
  status: "active" | "done";
}

function ProgressList({ steps }: { steps: StepState[] }) {
  if (steps.length === 0) return null;
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0" }}>
      {steps.map((s) => (
        <li
          key={s.key}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 0",
            color: s.status === "active" ? "#1d4ed8" : "#555",
            fontWeight: s.status === "active" ? 600 : 400,
          }}
        >
          <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>
            {s.status === "done" ? "✓" : "⋯"}
          </span>
          {s.label}
        </li>
      ))}
    </ul>
  );
}

// ── Recipe display ───────────────────────────────────────────────────────────

function IngredientList({ ingredients }: { ingredients: RecipeComponent["ingredients"] }) {
  return (
    <ul style={{ margin: "4px 0 8px", paddingLeft: 20 }}>
      {ingredients.map((ing, i) => (
        <li key={i} style={{ marginBottom: 2 }}>
          {[ing.qty, ing.unit, ing.name, ing.note ? `(${ing.note})` : null]
            .filter(Boolean)
            .join(" ")}
        </li>
      ))}
    </ul>
  );
}

function ComponentSection({ component }: { component: RecipeComponent }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>
        {component.name ?? component.role}
        {component.yield_note && (
          <span style={{ fontWeight: 400, color: "#666", fontSize: 13, marginLeft: 8 }}>
            {component.yield_note}
          </span>
        )}
      </h3>
      {component.ingredients.length > 0 && (
        <>
          <strong style={{ fontSize: 13 }}>Ingredients</strong>
          <IngredientList ingredients={component.ingredients} />
        </>
      )}
      {component.steps.length > 0 && (
        <>
          <strong style={{ fontSize: 13 }}>Steps</strong>
          <ol style={{ margin: "4px 0 0", paddingLeft: 20 }}>
            {component.steps.map((step, i) => (
              <li key={i} style={{ marginBottom: 4 }}>{step}</li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

function proxyImage(url: string | null): string | null {
  if (!url) return null;
  return `/api/proxy/image?url=${encodeURIComponent(url)}`;
}

const stageLabel: Record<string, string> = {
  description: "caption",
  link: "linked page",
  transcript: "video transcript",
};

function RecipeResult({ result }: { result: ImportResult }) {
  const { recipe, metadata, stage, error } = result;

  if (error || !recipe) {
    return (
      <div style={{ color: "#c0392b", background: "#ffeaea", padding: 16, borderRadius: 8, marginTop: 24 }}>
        <strong>Import failed</strong>
        {error && <p style={{ margin: "8px 0 0" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24, borderTop: "1px solid #ddd", paddingTop: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
        {metadata.thumbnail_url && (
          <img
            src={proxyImage(metadata.thumbnail_url)!}
            alt="thumbnail"
            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
          />
        )}
        <div>
          <h2 style={{ margin: "0 0 4px" }}>{recipe.title ?? "Untitled"}</h2>
          {recipe.servings && (
            <p style={{ margin: "0 0 4px", color: "#555", fontSize: 14 }}>Serves {recipe.servings}</p>
          )}
          {metadata.creator_handle && (
            <p style={{ margin: "0 0 4px", color: "#555", fontSize: 13 }}>@{metadata.creator_handle}</p>
          )}
          <p style={{ margin: 0, color: "#888", fontSize: 12 }}>
            Extracted from {stageLabel[stage] ?? stage}
          </p>
        </div>
      </div>
      {recipe.components.map((comp, i) => (
        <ComponentSection key={i} component={comp} />
      ))}
    </div>
  );
}

// ── Main app ─────────────────────────────────────────────────────────────────

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<StepState[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Cancel any in-flight stream
    cancelRef.current?.();

    setLoading(true);
    setError(null);
    setResult(null);
    setSteps([]);

    cancelRef.current = streamImport(url, {
      onStage(stage) {
        setSteps((prev) => {
          // Mark previous active step as done, append new active step
          const updated = prev.map((s) =>
            s.status === "active" ? { ...s, status: "done" as const } : s
          );
          return [...updated, { ...stage, status: "active" }];
        });
      },
      onDone(res) {
        setSteps((prev) =>
          prev.map((s) => (s.status === "active" ? { ...s, status: "done" as const } : s))
        );
        setResult(res);
        setLoading(false);
      },
      onError(msg) {
        setError(msg);
        setLoading(false);
      },
    });
  };

  return (
    <main style={{ maxWidth: 680, margin: "48px auto", padding: "0 24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ margin: "0 0 32px", fontSize: 28 }}>PlateKeeper</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Instagram or TikTok reel URL"
          required
          style={{
            flex: 1,
            padding: "10px 14px",
            fontSize: 15,
            border: "1px solid #ccc",
            borderRadius: 8,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            fontSize: 15,
            background: loading ? "#aaa" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Importing…" : "Import"}
        </button>
      </form>

      <ProgressList steps={steps} />

      {loading && steps.length > 0 && (
        <AdUnit
          slot="1234567890"  // ← replace with your ad slot ID
          style={{ marginTop: 28 }}
        />
      )}

      {error && (
        <div style={{ color: "#c0392b", background: "#ffeaea", padding: 12, borderRadius: 8, marginTop: 16 }}>
          {error}
        </div>
      )}

      {result && <RecipeResult result={result} />}
    </main>
  );
}
