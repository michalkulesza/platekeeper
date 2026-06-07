import { useRef, useState } from "react";
import { Avatar, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, addToast } from "@heroui/react";
import PageHeader from "../components/PageHeader";
import {
  exportRecipes, importRecipes, updatePreferences,
  createHousehold, leaveHousehold, listMembers, updateHousehold, inviteUser,
  type RecipeStats, type UserPreferences, type MemberOut, type HouseholdOut,
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useHousehold } from "../context/HouseholdContext";

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

const WEEK_DAY_OPTIONS = [
  { key: "1", label: "Monday" },
  { key: "0", label: "Sunday" },
  { key: "6", label: "Saturday" },
];

const PRESET_COLORS = [
  "#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6", "#06b6d4",
];

interface SettingsPageProps {
  stats: RecipeStats | null;
  onStatsRefresh: () => void;
  preferences: UserPreferences | null;
  onPreferencesChange: (prefs: UserPreferences) => void;
}

// ── Create Household modal ────────────────────────────────────────────────────

function CreateHouseholdModal({ isOpen, onClose, onCreated }: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setBusy(true);
    setError(null);
    try {
      await createHousehold(name.trim() || undefined, color);
      addToast({ title: "Household created", color: "success", timeout: 3000 });
      setName("");
      setColor(PRESET_COLORS[0]);
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create household");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent>
        <ModalHeader>New household</ModalHeader>
        <ModalBody className="flex flex-col gap-4">
          <Input
            label="Name (optional)"
            placeholder="My household"
            value={name}
            onValueChange={setName}
          />
          <div>
            <p className="text-sm font-medium mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "white" : "transparent",
                    boxShadow: color === c ? `0 0 0 2px ${c}` : undefined,
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>Cancel</Button>
          <Button color="primary" onPress={handleCreate} isLoading={busy}>Create</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── Manage Household modal ────────────────────────────────────────────────────

function ManageHouseholdModal({ household, isOpen, onClose, onChanged }: {
  household: HouseholdOut;
  isOpen: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { switchHousehold } = useHousehold();
  const [members, setMembers] = useState<MemberOut[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [name, setName] = useState(household.name);
  const [color, setColor] = useState(household.color);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMembers() {
    setMembersLoading(true);
    try {
      const m = await listMembers(household.id);
      setMembers(m);
    } catch { /* ignore */ }
    finally { setMembersLoading(false); }
  }

  function handleOpen() {
    setName(household.name);
    setColor(household.color);
    setInviteEmail("");
    setError(null);
    setConfirmLeave(false);
    loadMembers();
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateHousehold(household.id, { name: name.trim() || household.name, color });
      addToast({ title: "Saved", color: "success", timeout: 2000 });
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await inviteUser(household.id, inviteEmail.trim());
      addToast({ title: "Invitation sent", color: "success", timeout: 3000 });
      setInviteEmail("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to invite");
    } finally {
      setBusy(false);
    }
  }

  async function handleLeave() {
    setLeaving(true);
    try {
      await leaveHousehold(household.id);
      addToast({ title: "Left household", color: "default", timeout: 3000 });
      onChanged();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to leave");
      setLeaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" onOpenChange={(open) => open && handleOpen()}>
      <ModalContent>
        <ModalHeader>Manage household</ModalHeader>
        <ModalBody className="flex flex-col gap-5">
          {/* Rename */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-default-400">Name</p>
            <Input size="sm" value={name} onValueChange={setName} />
          </div>

          {/* Recolor */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-default-400">Color</p>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "white" : "transparent",
                    boxShadow: color === c ? `0 0 0 2px ${c}` : undefined,
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <Button size="sm" color="primary" variant="flat" onPress={handleSave} isLoading={saving}>
            Save changes
          </Button>

          {/* Members */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-default-400">Members</p>
            {membersLoading ? (
              <p className="text-sm text-default-400">Loading…</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {members.map((m) => (
                  <li key={m.user_id.toString()} className="text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-default-200 flex items-center justify-center text-xs font-semibold uppercase">
                      {(m.nickname || m.email)[0]}
                    </span>
                    <span className="truncate">{m.nickname || m.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Invite */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-default-400">Invite by email</p>
            <div className="flex gap-2">
              <Input
                size="sm"
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onValueChange={setInviteEmail}
                className="flex-1"
              />
              <Button size="sm" variant="flat" isLoading={inviting} onPress={handleInvite}>
                Invite
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          {/* Leave */}
          <div className="border-t border-divider pt-3">
            {!confirmLeave ? (
              <Button size="sm" color="danger" variant="flat" onPress={() => setConfirmLeave(true)}>
                Leave household
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-danger font-medium">Are you sure?</span>
                <Button size="sm" color="danger" isLoading={leaving} onPress={handleLeave}>
                  Leave
                </Button>
                <Button size="sm" variant="light" onPress={() => setConfirmLeave(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage({ stats, onStatsRefresh, preferences, onPreferencesChange }: SettingsPageProps) {
  const { user, logout } = useAuth();
  const { households, activeHouseholdId, refetchHouseholds } = useHousehold();
  const [loggingOut, setLoggingOut] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [managingHousehold, setManagingHousehold] = useState<HouseholdOut | null>(null);
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

        {/* Households */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-default-400">Households</h2>
            <Button size="sm" variant="flat" onPress={() => setCreateOpen(true)}>+ New</Button>
          </div>

          {households.length === 0 ? (
            <div className="rounded-xl border border-divider p-4 text-sm text-default-400">
              No households yet. Create one to share recipes with others.
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {households.map((h) => (
                <li
                  key={h.id}
                  className="rounded-xl border border-divider p-3 flex items-center gap-3"
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: h.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{h.name}</p>
                    {h.id === activeHouseholdId && (
                      <p className="text-xs text-primary">Active</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => setManagingHousehold(h)}
                  >
                    Manage
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

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

        {/* Preferences */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-default-400">Preferences</h2>
          <div className="rounded-xl border border-divider p-4">
            <Select
              label="Week starts on"
              size="sm"
              selectedKeys={[String(preferences?.week_start_day ?? 1)]}
              onSelectionChange={(keys) => {
                const key = [...keys][0];
                if (key !== undefined) {
                  const day = Number(key);
                  updatePreferences({ week_start_day: day })
                    .then(onPreferencesChange)
                    .catch(() => {});
                }
              }}
            >
              {WEEK_DAY_OPTIONS.map((opt) => (
                <SelectItem key={opt.key}>{opt.label}</SelectItem>
              ))}
            </Select>
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

      <CreateHouseholdModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refetchHouseholds}
      />

      {managingHousehold && (
        <ManageHouseholdModal
          household={managingHousehold}
          isOpen={!!managingHousehold}
          onClose={() => setManagingHousehold(null)}
          onChanged={refetchHouseholds}
        />
      )}
    </>
  );
}
