# PlateKeeper — Google Login/Signup (Mobile)

Status legend: ☐ todo · ◐ in progress · ☑ done

## Problem

The app only supports email/password auth today, with a signup flow that
requires verifying a 6-digit emailed code before an account is created
(see [`signup-flow-restructure.md`](./signup-flow-restructure.md)). We want
"Sign in with Google" as an additional entry point that skips that
verification step entirely — Google has already verified the user's email,
so a successful Google sign-in should log the user in (creating an account
on first use, with no code step) in one tap.

Scope: **mobile only** (`apps/mobile`) for now, not web.

## Decisions

| Area | Decision |
|---|---|
| Library | `@react-native-google-signin/google-signin` — native Google account picker on iOS/Android, not a web-based OAuth browser flow. Requires a native rebuild (EAS dev client or local `expo prebuild`); will not run in plain Expo Go. `ios`/`android` dirs are already gitignored/CNG-generated in this app, so this is consistent with the existing workflow. |
| Credentials | Three OAuth client IDs created in Google Cloud Console: iOS, Android, Web. No client secret needed — verification is public-client (ID-token) based. User creates these manually; not automatable from here. |
| Token verification | Backend verifies the Google ID token itself (`google-auth` Python lib) rather than trusting the client. Accepts either the iOS or Android client ID as valid `aud`, since either could have issued the token. |
| Existing-email collision | If the Google account's email matches an existing password-based `User`, **log them in** — no merge/disambiguation UI. Treated as the same person; out of scope to build account linking. |
| New account creation | `is_verified=True` from creation (Google already verified the email), random unusable password (`secrets.token_urlsafe(32)`) since the account only ever authenticates via Google going forward. |
| Session issuance | Identical to `complete-signup`'s tail: `get_jwt_strategy().write_token(user)`, `access_token` JSON response + `pk_auth` cookie set with the same params. |
| Invitation claiming | Same `claim_email_invitations` call as `complete-signup`, run for newly-created users. |

## Not doing

- No account-linking UI for email collisions.
- No Android SHA-1 fingerprint automation — manual step via `eas credentials` when the user is ready to test Android.
- No web client changes.

## Backend (`services/api`)

- **`pyproject.toml`**: add `google-auth>=2.0`.
- **`src/api/config.py`**: add `google_ios_client_id: str = ""`, `google_android_client_id: str = ""`.
- **New `src/api/routes/google_auth.py`**:
  - `POST /api/auth/google {id_token}`.
  - Verify via `google.oauth2.id_token.verify_oauth2_token(token, google_requests.Request())` (no `audience=` kwarg — a token could carry either client ID). Manually assert `idinfo['aud']` is one of the two configured client IDs and `idinfo['iss']` is `accounts.google.com` / `https://accounts.google.com`. 400 on failure or falsy `email_verified`.
  - Look up `User` by `idinfo['email'].lower()`; if missing, create via `UserManager.create(UserCreate(email=..., password=secrets.token_urlsafe(32), nickname=idinfo.get('name'), is_verified=True))` (mirrors `complete_signup` in `signup.py`).
  - `claim_email_invitations` for new users, issue token + cookie exactly like `complete_signup`.
- **`src/api/main.py`**: register the new router at prefix `/api/auth`.
- **`.env.example`**: add `GOOGLE_IOS_CLIENT_ID=`, `GOOGLE_ANDROID_CLIENT_ID=`.

## Shared package (`packages/shared/src/api/client.ts`)

- Add `googleLogin(idToken: string): Promise<{ access_token: string; token_type: string }>`, following the exact pattern of `completeSignup` (POST `/api/auth/google`, body `{ id_token: idToken }`, same `parseAuthError` handling), exported from `createApiClient`.

## Mobile (`apps/mobile`)

- **Dependency**: `@react-native-google-signin/google-signin`.
- **`app.json`**: add the plugin with `{ "iosUrlScheme": "<reversed iOS client ID>" }` once the user supplies it.
- **`.env` / `.env.example`**: add `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (the web client ID doubles as the `webClientId` google-signin needs for a consistent ID token across platforms).
- **New `src/utils/googleAuth.ts`**: one-time `GoogleSignin.configure({ iosClientId, webClientId })` called from the root layout (`app/_layout.tsx`), plus `signInWithGoogle()` (calls `hasPlayServices()`, `signIn()`, returns the `idToken`, throws if absent).
- **`src/context/AuthContext.tsx`**: add `loginWithGoogle()` — calls `signInWithGoogle()` → `mobileClient.googleLogin(idToken)` → persists/sets the token → fetches `/me`, mirroring the tail of `completeSignup`.
- **`LoginScreen.tsx` / `RegisterScreen.tsx`**: add a "Continue with Google" `Pressable` (AntDesign `google` icon from `@expo/vector-icons`, already a dependency) below the existing buttons, calling `loginWithGoogle()`, same `setError`/`setSubmitting` pattern plus a light haptic on press.
- **Translations**: `auth.continueWithGoogle`, `auth.orDivider` added to all 5 locales in `packages/shared/src/locales/{en,pl,de,fr,es}.json`.

## Build order

1. Backend: dependency, config, `google_auth.py` route, router registration, `.env.example`.
2. Shared client: `googleLogin` method.
3. Mobile: dependency, `app.json` plugin (needs iOS client ID from user first), `googleAuth.ts`, `AuthContext` method, Login/Register screen buttons, i18n.
4. User creates Google Cloud OAuth client IDs (iOS, Android, Web), provides them → wire into `app.json` / `.env`.
5. `npx expo prebuild --clean` + dev client build (EAS or local Xcode/Android Studio) — required since this adds a native module.

## Verification

- Backend: existing `pytest` suite, plus a manual check once a real device round-trip is possible (can't fabricate a valid Google-signed ID token locally).
- Mobile: after prebuild + dev client build, exercise on a real device/simulator — fresh Google account (new account created, logged in) and repeat sign-in (existing account, straight login).
- `npm run typecheck` / `lint` in `apps/mobile` and `packages/shared` after the edits.
