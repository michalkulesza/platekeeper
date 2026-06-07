# PlateKeeper — Household Feature

Lets a user create or join one or more **households**, switch which one is "active",
and scope recipes / meal plans / tags to that household. Invites are in-app with a
notification bell. Leaving keeps recipes with the household; empty households are wiped.

Status legend: ☐ todo · ◐ in progress · ☑ done

## Decisions (resolved 2026-06-07, via /grill-me)

| Area | Decision |
|---|---|
| Membership | A user can belong to **multiple** households + a "Personal" context. One is **active** at a time. |
| Active context | Stored server-side as `users.active_household_id` (nullable → Personal). Switching = `PATCH`. All list/create endpoints scope by it. |
| Recipe ownership | Reuse `recipes.user_id` as **created_by** (author). Add `household_id` (nullable) + `shared_to_personal` (bool, default **true**). |
| "Add to household" toggle | When adding inside a household, a toggle **"Also add to my private recipes"** (on by default) sets `shared_to_personal`. |
| Same row vs copy | **Same row**, shown in both household + private lists (edits stay in sync, no duplicates). |
| Leaving | Snapshot (copy) your `shared_to_personal` recipes into Personal so they survive; household keeps its own row. Then remove membership. |
| Auto-wipe | Last member out → delete household + its recipes / meal-plan / household tags / pending invitations. |
| Meal plan | **One shared calendar** per household. Partial unique indexes: `(user_id, date)` personal, `(household_id, date)` household. |
| Tags | **Household-shared** custom tags: add `tags.household_id` (nullable). Defaults stay global; personal custom tags stay per-user. |
| Roles | **Flat** — every member can invite, and edit/delete any household recipe / tag / meal-plan entry. No owner/admin. |
| Invites | **By email**: if a registered user exists → pending invite in their bell; else "no user found". Block self / duplicate / already-member. |
| Notifications | Bell (header top-right) shows **pending invites only**, Accept/Decline inline, badge = count. Derived from invitations table, no separate notifications table. |
| Header | **Colored band** = household color, page title + household name subtitle, bell top-right. Neutral in Personal. Tap band → quick switcher (Personal + your households). |
| Management | Settings "Household" section: create, members list, rename/recolor, leave, list of households. Quick-switch via header band. |
| Migrations | No Alembic — **drop & recreate dev DB**; `create_all` rebuilds. |
| Household name | Defaults to `"<creator nickname/email>'s household"`, editable by any member. |
| Color | Chosen at creation from a small preset palette (~6–8 swatches), editable later. |
| "Added by" | Shown in recipe detail **only for household recipes** (author nickname, fallback email). |
| Stats / shopping list | Follow the active context, same as recipes / meal plan. |

## Data model

- **`households`**: `id`, `name`, `color`, `created_at`.
- **`household_members`**: `(household_id, user_id)` PK, `joined_at`. Flat, no roles.
- **`household_invitations`**: `id`, `household_id`, `invited_user_id`, `invited_by_user_id`,
  `status` (pending/accepted/declined), `created_at`.
- **`users`** + `active_household_id` (nullable FK → households, `ON DELETE SET NULL`).
- **`recipes`**: `user_id` = created_by (author); + `household_id` (nullable FK),
  `shared_to_personal` (bool default true).
- **`meal_plan_entries`**: + `household_id` (nullable). Drop `uq_meal_plan_user_date`;
  add two partial unique indexes: `(user_id, date) WHERE household_id IS NULL` and
  `(household_id, date) WHERE household_id IS NOT NULL`.
- **`tags`**: + `household_id` (nullable FK).

## Scoping rules

- **Personal** (`active_household_id IS NULL`):
  - recipes: `user_id == me AND (household_id IS NULL OR shared_to_personal)`
  - tags: defaults + (`user_id == me AND household_id IS NULL`)
  - meal plan: `user_id == me AND household_id IS NULL`
- **Household** (`active_household_id == H`, membership verified):
  - recipes: `household_id == H`
  - tags: defaults + `household_id == H`
  - meal plan: `household_id == H`
- Writes in household context set `household_id = H`, `user_id = me` (author). Any member
  may edit/delete any row scoped to H.

## Build phases

### Phase 1 — Data model + scoping backend  ☐
- [ ] Add models: `Household`, `HouseholdMember`, `HouseholdInvitation`.
- [ ] Add columns: `users.active_household_id`, `recipes.household_id`,
      `recipes.shared_to_personal`, `meal_plan_entries.household_id`, `tags.household_id`.
- [ ] Reusable `active_context` dependency / helper resolving Personal vs household + membership check.
- [ ] Rework recipes routes (list/save/update/delete/tags/stats/export/import) to scope by context.
- [ ] Rework meal-plan routes (shared calendar, new unique indexes).
- [ ] Rework tags routes (household-shared create/list/scoping).
- [ ] Drop & recreate dev DB; verify Personal behavior unchanged.
- [ ] **Commit.**

### Phase 2 — Household CRUD + invites + bell  ☐
- [ ] `households` routes: create, get, list-mine, rename, recolor, leave (with rescue +
      auto-wipe), members list, switch-active (`PATCH active_household_id`).
- [ ] Invitations: invite-by-email, list-mine (pending), accept, decline. Guards: self /
      duplicate / already-member / no-user.
- [ ] Leave logic: copy `shared_to_personal` recipes to Personal; auto-wipe when empty.
- [ ] **Commit.**

### Phase 3 — Frontend  ☐
- [ ] API client additions + types.
- [ ] `PageHeader` → colored band (household name subtitle + color), bell top-right.
- [ ] Bell popover: pending invites with Accept/Decline + badge.
- [ ] Header band tap → quick switcher (Personal + households).
- [ ] Settings "Household" section: create (name + color), members, rename/recolor, leave, list.
- [ ] "Also add to my private recipes" toggle in Add Recipe (household context only).
- [ ] "Added by" in recipe detail (household recipes).
- [ ] App-shell wiring: refetch scoped data on context switch.
- [ ] **Commit.**

## Open / deferred
- Email-based invites require the invitee to already have an account (no email-send infra).
- General activity feed (joined/left/added) deferred — bell is invites-only for v1.
- Per-member meal plans within a household deferred — shared calendar only.
- Transfer-of-ownership / admin roles deferred — flat model.
