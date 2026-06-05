export interface Ingredient {
  qty: string | null;
  unit: string | null;
  name: string;
  note: string | null;
}

export interface RecipeComponent {
  role: string;
  name: string | null;
  yield_note: string | null;
  ingredients: Ingredient[];
  steps: string[];
}

export interface RecipeGroup {
  title: string | null;
  servings: number | null;
  components: RecipeComponent[];
}

export interface ImportMetadata {
  creator_handle: string | null;
  thumbnail_url: string | null;
  source_url: string;
}

export type ImportStage = "description" | "link" | "transcript" | "failed";

export interface ImportResult {
  stage: ImportStage;
  recipe: RecipeGroup | null;
  metadata: ImportMetadata;
  error: string | null;
}

export interface StageEvent {
  key: string;
  label: string;
}

export interface StreamCallbacks {
  onStage: (stage: StageEvent) => void;
  onDone: (result: ImportResult) => void;
  onError: (error: string) => void;
}

export function streamImport(url: string, callbacks: StreamCallbacks): () => void {
  const source = new EventSource(
    `/api/imports/stream?url=${encodeURIComponent(url)}`
  );

  source.onmessage = (event) => {
    const data = JSON.parse(event.data as string);
    if (data.type === "stage") {
      callbacks.onStage({ key: data.key as string, label: data.label as string });
    } else if (data.type === "done") {
      callbacks.onDone(data.result as ImportResult);
      source.close();
    }
  };

  source.onerror = () => {
    callbacks.onError("Connection error — check the API server.");
    source.close();
  };

  return () => source.close();
}
