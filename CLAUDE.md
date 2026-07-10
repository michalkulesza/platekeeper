# Misc
- After each successful task make a commit with a message. If not sure if feature is fully completed, ask user.
- When implementing a plan from .md include that file in the commit

# Production VPS access
- The `myvps` SSH host (~/.ssh/config, root@167.235.18.105, key `~/.ssh/platekeeper_deploy`) is available for debugging production issues — use `ssh myvps` freely to check `docker ps`, `docker logs <container>`, Caddy config/logs (`/etc/caddy/Caddyfile`, `sudo journalctl -u caddy`), etc.
- Caddy on that host terminates TLS for all `*.carrot.xcxz.xyz` domains; `app.carrot.xcxz.xyz` routes `/api/*` to the API container (127.0.0.1:8088) and everything else to the web container (127.0.0.1:8089). There is no separate `api.carrot.xcxz.xyz` host — don't point `API_PROXY_TARGET` or similar config at it.

# Code conventions

## Cleanup
- Whenever touching a file for any reason, remove unused code you notice along the way (unused imports, variables, functions, types, dead branches) even if unrelated to the task at hand — don't leave it for later.

## Comments
- Default to zero comments. Only write one when the WHY is genuinely non-obvious (a hidden constraint, a race condition, a platform quirk, a workaround for a specific bug) — never to restate what the code already says (variable/function names should carry that). If a well-named identifier or the surrounding code already makes it clear, delete the comment rather than keep it "for clarity."
- Don't use decorative ASCII-divider section-header comments (e.g. `// ── Local types ────...`) that just restate the name of what follows. The code below already says what it is; delete the banner instead of maintaining it.
- Keep even justified comments as short as possible — one line beats a 3-4 line paragraph. Trim to the single sentence that carries the non-obvious part; drop restated context.

## Readability
- Extract non-trivial inline expressions (ternaries, casts, template literals inside object literals/JSX/function args) into a named `const` above the usage, especially when the expression involves a type assertion (`as X`) or a condition. A named variable documents intent and is easier to scan than logic embedded inline.
- Extract multi-line inline callbacks (e.g. `onPress: async () => { ... }` nested inside `Alert.alert`/config objects/JSX props) into a separate named handler (e.g. `handleXOnPress`) defined with `useCallback` alongside sibling handlers, then reference it by name at the call site. Keeps the outer structure (the alert/config/JSX) readable as a flat list instead of a nested block of logic.
- Extract multi-line inline JSX (e.g. a ternary returning different elements assigned to a prop like `headerRight: () => (...)`, or a loading/empty-state ternary inline in the render tree) into a separate named component defined above the screen component, taking the minimal props it needs. Inside the extracted component, prefer an early `if (loading) return <Spinner />` over keeping the ternary — it reads as a guard clause rather than a branch to parse. Call it at the usage site as `<ComponentName {...props} />`. Keeps the parent JSX flat and gives the extracted UI a name that documents its purpose.
- Extract inline function-as-prop values (e.g. RN's `style={({ pressed }) => [...]}` on `Pressable`) into a named `get*Style`-style helper (`useCallback`, deps on whatever state it reads) defined in the component body, then pass it by reference/call at the usage site (`style={getPressableStyle(c)}`). Same rationale as other extractions: name the logic instead of inlining it.
- Inside function bodies, separate distinct steps with a blank line: setup/construction of one value, then the next, then control flow that consumes them (e.g. a `return new Promise(...)` or other block). Don't let unrelated statements run together into one dense paragraph of code — group by what each statement is doing, and blank-line between groups.
- Extract an inline object literal built up to pass to an API/mutation call (e.g. a large `{...}` built inline inside `api.saveX({...})`) into a named `buildXPayload(...)` function in the relevant `helpers.ts`, taking the source data and returning the request-shaped object. The call site becomes `api.saveX(buildXPayload(data))` — one line instead of a 20+ line inline literal.
- Extract a multi-line inline object literal passed directly to an imperative API call (e.g. `navigation.setOptions({...})`) into a named const (e.g. `editableHeaderOptions`) defined immediately above the call — one per branch when the value differs by condition. Keeps branching logic scannable as a short if/else of one-line calls instead of nested option blocks.

## File organization
- Keep screen/component files under ~500 lines. When a file grows past that, split it into a folder: `ScreenName.tsx` becomes `ScreenName/index.tsx` (still the default export, still imported the same way via the folder path).
- Pure, non-component helper functions and their supporting types go in `ScreenName/helpers.ts` (e.g. data transforms like `toEditable`, small pure functions, local-only interfaces/types).
- Each standalone sub-component that was previously a top-level `const` in the file gets its own file directly under the folder: `ScreenName/ComponentName.tsx`. Only promote a component to its own subfolder (`ScreenName/ComponentName/index.tsx`) if it in turn has further sub-components worth separating out — don't create a subfolder for a single component.
- A shared `StyleSheet.create({...})` used across multiple extracted components goes in `ScreenName/styles.ts`, exported as `styles`, and imported wherever needed. Don't fragment one StyleSheet into several — even a component that uses only a few keys should import the shared `styles` object rather than getting its own partial copy.
- Don't over-fragment: trivial inline pieces, one-off event handlers, and simple JSX blocks stay in the file that uses them. The goal is readability (nothing near 2000 lines), not maximal file-per-function splitting.
- This is a mechanical split, not a rewrite — preserve behavior exactly, don't refactor logic while moving it. Verify with `tsc --noEmit` after moving.

## Data fetching
- Use React Query (`useQuery` / `useMutation`) for all data fetching and mutations — no raw `useState` + `useEffect` fetch patterns.

## Components
- Declare components as `const` arrow functions: `const MyComponent = () => { ... }`.
- Export pages/top-level components with `export default`.

## Translations
- Every user-visible string must go through `t()` from `useTranslation()` — never hardcode display text.
- Add keys to all 5 locale files (en, pl, de, fr, es) when introducing new strings.

# Mobile (iOS) UI conventions
These apply to all code in `apps/mobile/`.

## Core principle
Let iOS draw the UI — every custom-styled JS component will look "off" compared to native. Prefer native primitives over custom styling.

## Colors
- Always use `PlatformColor` for colors so dark mode is automatic — never hardcode hex/rgb values for UI colors.
- Use iOS semantic colors: `'systemBackground'`, `'secondarySystemBackground'`, `'label'`, `'secondaryLabel'`, `'systemBlue'`, `'systemGray'`, `'systemGray6'`, `'separator'`, etc.
- Example: `color: PlatformColor('label')`, `backgroundColor: PlatformColor('systemBackground')`

## Typography

Use only sizes from the iOS HIG type scale. Never invent intermediate sizes (e.g. 14pt does not exist in the scale).

| Role | fontSize | lineHeight | fontWeight |
|------|----------|------------|------------|
| Large Title | 34 | 41 | `'700'` |
| Title 1 | 28 | 34 | `'700'` |
| Title 2 | 22 | 28 | `'700'` |
| Title 3 | 20 | 25 | `'600'` |
| Headline | 17 | 22 | `'600'` |
| Body (primary reading text: notes, ingredients, steps) | 17 | 22 | `'400'` |
| Callout (UI labels, list items, button text, inputs) | 16 | 21 | `'400'` |
| Footnote / meta info | 13 | 18 | `'400'` |
| Caption 1 (tags, chips, badges) | 12 | 16 | `'400'` |
| Caption 2 (minimum — tiny labels only) | 11 | 13 | `'400'` |

Rules:
- Default for most UI text (labels, list items, button text, inputs): **16pt Callout**.
- Primary reading content (recipe notes, ingredients, step text): **17pt Body** with `lineHeight: 22`.
- Section headers / uppercase meta labels: **13pt Footnote** with `textTransform: 'uppercase'` and `letterSpacing`.
- Never go below 11pt except for purely decorative/icon characters.
- Prefer system font weights: `'400'` (regular), `'600'` (semibold), `'700'` (bold).
- `allowFontScaling` defaults to `true` in React Native — do not disable it.

## Layout & spacing
- Use multiples of 4pt for spacing (4, 8, 12, 16, 20, 24, 32).
- Respect safe areas with `useSafeAreaInsets()` — never hard-code top/bottom padding.
- Use `<KeyboardAvoidingView behavior="padding">` on iOS for forms.

## Navigation
- Always use `@react-navigation/native-stack` (not `stack`) — it uses real native iOS navigation with swipe-back gesture.
- Use native header options: `headerLargeTitle`, `headerTransparent`, `headerBlurEffect`.
- Prefer `Alert.alert()` over custom modals for destructive confirmations.
- Use `ActionSheetIOS.showActionSheetWithOptions` for action sheets on iOS.

## Native-first rule
If a feature request requires a custom JS component where a native equivalent exists, **stop and say so before writing any code**: "This can't be done natively — it would require a custom [X] that will look off. Native alternative: [Y]." Let the user decide. Never silently build a JS replacement for a native control.

## Interactive elements
- Use `<Pressable>` with `hitSlop` for touch targets (minimum 44×44pt per HIG).
- Add haptic feedback on meaningful interactions: `import * as Haptics from 'expo-haptics'` — use `impactAsync(ImpactFeedbackStyle.Light)` for taps, `notificationAsync` for success/error.
- Use `<Switch>` (not custom toggles), `<ActivityIndicator>` (not custom spinners).

## Lists
- Use `<FlatList>` or `<SectionList>` — never `ScrollView` + `map()` for long lists.
- Use `ItemSeparatorComponent` with a 1px separator in `PlatformColor('separator')`.

## Forms / inputs
- Set correct `keyboardType`, `returnKeyType`, `autoCapitalize`, `autoCorrect`, `textContentType` on every `<TextInput>` for iOS autofill and keyboard optimisation.

## No-nos
- No custom shadows with JS — use `shadowColor/shadowOffset/shadowOpacity/shadowRadius` matching iOS native card style (subtle, 1-2pt).
- No web-style absolute positioning hacks.
- No `TouchableOpacity` — use `Pressable` instead.
- No hardcoded colors or font sizes.

# Quality checklist for new UI elements
- **Performance**: memoize expensive derived values with `useMemo`; stabilise callbacks passed to children with `useCallback`; avoid unnecessary re-renders.
- **Security**: never dangerously set innerHTML; sanitise any user-supplied content before rendering; validate inputs at the boundary.
- **Error handling**: wrap async operations in try/catch and surface errors to the user (toast or inline message); provide loading and empty states.
- **Accessibility**: every interactive element needs a descriptive `aria-label` or visible label; use semantic HTML (`button`, `nav`, `main`, etc.); ensure sufficient colour contrast (WCAG AA); support keyboard navigation.

## Known Claude Code bug: false "temp filesystem is full" message

If a Bash command's output reads "Command output was lost: the temp filesystem
at ... is full (0MB free) ... ENOSPC", treat this as a known Claude Code bug
(tracked upstream as anthropics/claude-code #65880, #65166, #65915), not an
actual disk-full condition. It fires on commands with empty stdout and a
nonzero exit code, regardless of real free space. The underlying command ran
fine — only the reported output string is corrupted. Don't stop work or
conclude the disk is full because of it; if you want to confirm, run `df -h`.