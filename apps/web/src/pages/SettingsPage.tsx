import { useRef, useState } from "react";
import { Avatar, Button } from "@heroui/react";
import PageHeader from "../components/PageHeader";
import { exportRecipes, importRecipes, type RecipeStats } from "../api/client";
import { useAuth } from "../context/AuthContext";

function StatCard({ value, label }: { value: string | number | null; label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 rounded-xl bg-default-50 py-4 px-2">
      <span className="text-2xl font-bold text-default-800">
        {value ?? "—"}
      </span>
      <span className="text-xs text-default-400 text-center">{label}</span>
    </div>
  );
}

interface SettingsPageProps {
  stats: RecipeStats | null;
  onStatsRefresh: () => void;
}

export default function SettingsPage({ stats, onStatsRefresh }: SettingsPageProps) {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
  }

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      await exportRecipes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    setError(null);
    try {
      const { imported } = await importRecipes(file);
      setImportResult(`Imported ${imported} recipe${imported !== 1 ? "s" : ""}`);
      onStatsRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const displayName = user?.nickname || user?.email || "";

  return (
    <>
      <PageHeader title="Settings" />
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Profile */}
        <div className="flex items-center gap-4">
          <Avatar
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg"
            name={displayName}
            size="lg"
          />
          <div className="min-w-0">
            {user?.nickname && (
              <p className="font-semibold text-base truncate">{user.nickname}</p>
            )}
            <p className="text-sm text-default-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-2">
          <StatCard value={stats?.total_recipes ?? null} label="Recipes" />
          <StatCard value={stats?.total_ingredients ?? null} label="Ingredients" />
          <StatCard value={stats?.avg_kcal ?? null} label="Avg kcal" />
        </div>

        {/* Account */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-default-400">Account</h2>
          <div className="rounded-xl border border-divider p-4">
            <Button
              size="sm"
              variant="flat"
              color="danger"
              onPress={handleLogout}
              isLoading={loggingOut}
            >
              Log out
            </Button>
          </div>
        </section>

        {/* Data */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-default-400">Data</h2>

          <div className="flex flex-col gap-2 rounded-xl border border-divider p-4">
            <p className="text-sm font-medium">Export recipes</p>
            <p className="text-xs text-default-400">Download all your recipes as a CSV file.</p>
            <Button size="sm" variant="flat" onPress={handleExport} isLoading={exporting} className="self-start">
              Export CSV
            </Button>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-divider p-4">
            <p className="text-sm font-medium">Import recipes</p>
            <p className="text-xs text-default-400">Import recipes from a previously exported CSV file.</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            <Button size="sm" variant="flat" onPress={() => fileRef.current?.click()} isLoading={importing} className="self-start">
              Choose CSV…
            </Button>
            {importResult && <p className="text-xs text-success font-medium">{importResult}</p>}
          </div>
        </section>

        {error && (
          <div className="bg-danger-50 text-danger rounded-lg p-3 text-sm">{error}</div>
        )}

      </div>
    </>
  );
}
