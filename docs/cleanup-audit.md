# Frontend Cleanup Audit (Pre-Launch)

Date: 2026-03-10

## What Was Cleaned Up (Safe Changes)

- Removed unused route-adjacent leftovers:
  - `src/app/admin/dashboard/user-inquiries/page-fixed.tsx`
  - `src/app/broker-admin/dashboard-backup.tsx`
- Moved repo-root debug artifacts out of the app root:
  - `build_output.txt` -> `docs/build_output.txt`
  - `debug-surveyor-api.html` -> `docs/debug-surveyor-api.html`
- Moved unused dev/test utilities out of `src/` so they cannot be accidentally bundled/imported:
  - `src/utils/apiTest.ts` -> `docs/dev/apiTest.ts`
  - `src/utils/niaTokenSetup.ts` -> `docs/dev/niaTokenSetup.ts`
  - `src/utils/testNIALogin.ts` -> `docs/dev/testNIALogin.ts`
- Removed side-effect imports of `src/utils/tokenSetup.ts` from pages where it was not doing anything (auto-setup is disabled).

## Reduced Repetition (No Behavior Change Intended)

- Added a shared responsive sidebar hook:
  - `src/hooks/useResponsiveSidebar.ts`
  - Applied to:
    - `src/app/admin/dashboard/layout.tsx`
    - `src/app/broker-admin/layout.tsx`
    - `src/app/nia-admin/layout.tsx`
    - `src/app/surveyor/dashboard/layout.tsx`

## Dev/Debug Routes Safety

- Added a simple guard helper:
  - `src/utils/devRoutes.ts` (`isDevRoutesEnabled()`)
- Gated these admin-only dev pages so they are disabled in production builds:
  - `src/app/admin/test-payment/page.tsx`
  - `src/app/admin/test-merged-reports/page.tsx`
  - `src/app/admin/debug-merged-reports/page.tsx`

By default, these pages are enabled in development and disabled in production.
To force-enable them in production builds, set `NEXT_PUBLIC_ENABLE_DEV_ROUTES=true`.

## API Layer Cleanup

- Standardized service-level base URL / API key usage via `API_CONFIG`:
  - `src/services/api.ts`
  - `src/services/builderLiabilityPolicyApi.ts`
  - `src/services/fileService.ts`
  - `src/services/notificationApi.ts` (rewritten to remove noisy debug logs and use `API_CONFIG`)
- Gated noisy request/response logging in `src/services/api.ts` behind:
  - `NEXT_PUBLIC_DEBUG_API=true`

## Risks / Things Still Worth Cleaning (Needs Care)

- Many components/pages still duplicate base URL + API key + token plumbing with ad-hoc `fetch(...)` calls.
  - Some use `apiKey` (wrong case) vs `apikey` (expected by backend in other places).
  - Some use `localStorage` tokens, while the core auth util uses cookies.
- Some pages hardcode `http://localhost:5000/...` directly (dev-only).
- Several `test-*`/`debug-*` components exist under `src/components/*` that should remain gated or moved out of `src/` if they are not part of launch.

## Tooling Notes

- `npm run type-check` passes, but a sub-scan inside `scripts/type-check.js` hit an `EPERM` when spawning `cmd.exe` in this environment.
- `npm run lint` currently fails due to ESLint CLI option incompatibilities (suggest aligning `next`, `eslint`, and `eslint-config-next` versions).
- `npm run build` fails here with `spawn EPERM` (likely environment/permission related). Re-run locally to validate the actual production build.

