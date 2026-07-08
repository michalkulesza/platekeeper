# Web (React) code conventions

Scoped to `apps/web/`. Root `CLAUDE.md` conventions still apply; these add/override for web-specific code.

## Components
- Functional components only, declared as `const` arrow functions, one per file.
- Keep components small and focused; extract sub-components instead of nesting JSX deeply.
- Co-locate a component's hooks/helpers in the same file unless reused elsewhere.

## Styling
- Tailwind utility classes; avoid inline `style={}` unless the value is dynamic/computed.
- No custom CSS files unless Tailwind genuinely can't express it.

## State & data
- React Query for all server data (see root `CLAUDE.md`).
- Local UI state via `useState`/`useReducer`; lift state only as high as needed.
- Derive values instead of duplicating state; memoize expensive derivations with `useMemo`.

## Props & types
- Explicit TypeScript prop interfaces/types per component — no implicit `any`.
- Prefer narrow, specific prop types over broad/optional-everything shapes.
