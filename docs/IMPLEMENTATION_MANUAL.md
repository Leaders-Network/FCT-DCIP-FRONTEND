# FCT-DCIP Implementation Manual — Frontend pointer

The single source of truth for the cleanup, security and scaling programme lives in the **backend repo**:
`FCT-DCIP-BACKEND/docs/IMPLEMENTATION_MANUAL.md` (branch `hardening/phase-0`).

Read **Part 1 — Production safety protocol** there before starting any item. Tick items in the backend manual, linking the frontend PR.

## Branch workflow
- Production: `bolajeee` (Vercel deploys from here — no direct commits).
- Integration / staging: `hardening/phase-0`.
- Per item: `item/<ID>-<short-name>` → PR into `hardening/phase-0` → verify on staging → promote to `bolajeee`.
- PR titles carry the item ID, e.g. `[P0-20] Escape SAR report HTML`.

## Items with frontend work
| ID | Risk | Summary | Coordinate with backend? |
|---|---|---|---|
| P0-09 | 🟢 | Remove debug/test pages; delete `utils/niaTokenSetup.ts`, `utils/testNIALogin.ts`; remove EgolePay key logs in `PolicyList.tsx` | No |
| P0-10 (Migrate stage) | 🔴 | Reset-password screens send `resetToken` | Yes — after BE "Expand" |
| P0-20 | 🔴 | Fix stored XSS in `SARReportGenerator.tsx` | No |
| P0-21 | 🟡 | Remove hardcoded API key fallbacks (check Vercel env first) | No |
| P0-22 | 🔴 | Swap EgolePay keys and new `API_KEY` in Vercel env during rotation | Yes |
| P0-23 | 🟢 | Purge committed `.env` from git history (after rotation) | No |
| P2-19 | 🟡 | Remove calls/screens for non-existent backend routes | Confirm screens with AMMC |
| P2-20 | 🟡 | One API client, one portal per PR | Later uses BE OpenAPI (P2-14) |
| P2-21 | 🟡 | One session helper; no URL/super-admin token guessing | No |
| P2-22 | 🟡 | `src/middleware.ts` portal guards (UX only) | No |
| P2-23 | 🟢 | Remove clutter & unused components (verify with `knip`) | No |
| P2-24 | 🟡 | Break up god files; merge duplicate shells / NIA–AMMC pairs | No |
| P2-25 | 🟢 | ESLint flat config, `ignoreDuringBuilds: false`, dedupe types | No |
| P3-01 / P3-02 | 🔴/🟡 | Cookie-based sessions; stop storing tokens in `localStorage` | Yes — expand/contract |
| P3-11 | 🟡 | Security headers; CSP in Report-Only first | No |
| P3-12 | 🟡 | EgolePay: merchant ID from env, amount/reference from backend | Yes |
| P4-04 | — | Playwright end-to-end tests on staging | — |
| P4-08 | — | CI: lint, type-check, build, gitleaks, CodeQL | — |
