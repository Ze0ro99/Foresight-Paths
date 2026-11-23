# Vercel Deployment Audit — Foresight Paths Observatory

Audit date: 2026-11-22 (UTC)
Repository: https://github.com/Ze0ro99/Foresight-Paths
Vercel project: `foresight-paths-observatory`
Project ID: `prj_99wBK3tnD8KlR4qpWqBdN1weyOAF`

## Evidence checked

Connected Vercel project metadata, latest deployment records, project-domain records, environment-variable metadata (without retrieving secret values), and a successful HTTP fetch of the production alias. This is not browser/device QA, Pi Developer Portal approval, or a security certification.

## Latest observed state

| Check | Observed state | Assessment |
|---|---|---|
| Framework / runtime | Next.js; Node.js 22.x | Configured |
| Latest deployment | READY, production target, commit `3bfb9d23338d1713a780ec891d8e1fbdd166fab3` | Latest docs commit deployed successfully |
| Production URL | https://foresight-paths-observatory.vercel.app | HTTP 200 was observed in the preceding check |
| Registered Vercel domain | `foresight-paths-observatory.vercel.app` | Verified in Vercel project-domain listing |
| Deployment protection | Vercel Authentication/SSO enabled for production deployment URLs and all previews | Public validator access may be blocked; verify anonymously |
| Project live flag | `live: false` in project metadata | Meaning not established by available evidence; owner should review in dashboard |
| Public runtime proof | HTTP fetch returned app HTML and Pi SDK script reference | Server response only; interactive/browser behavior not verified |
| Responsive markup | HTML includes viewport meta and responsive breakpoint utility classes | Encouraging signal, not a substitute for device QA |
| `PI_API_KEY` / `GEMINI_API_KEY` | User confirms values are correct; Vercel's non-decrypted metadata did not expose readable values | Accepted as owner confirmation; this audit cannot independently validate secret values or API behavior |
| Payment release flags | `PI_PAYMENTS_ENABLED=false`, `PI_ENTITLEMENT_LEDGER_ENABLED=false`, `PI_MAINNET_PAYMENTS_APPROVED=false` | Fail-closed; keep disabled until release gates pass |

## Required owner actions

1. **Review public validation access.** In Vercel → Project → Security/Settings → Deployment Protection, use a protection scope that keeps previews protected while allowing the registered production domain to be publicly reached, if that is required for Pi Portal validation. Verify from a logged-out/incognito browser and through the Pi validation flow. Do not expose private preview deployments.
2. **Confirm the production Git branch** is `main` in Vercel Settings → Git. The latest deployment metadata reports repository `Ze0ro99/Foresight-Paths`, branch `main`.
3. **API secrets:** Owner confirms the production `PI_API_KEY` and `GEMINI_API_KEY` values are correct. Keep them server-side, never commit or paste them into chat. Run a non-destructive authenticated API health check in the app's intended environment; the masked listing cannot prove validity.
4. **Keep Pi payment flags disabled** until durable order/entitlement storage, server-side approval/completion, reconciliation, and release evidence are complete.
5. **Run responsive QA** at mobile, tablet, and desktop widths; check overflow, clipped content, keyboard/accessibility, fullscreen behavior, and Pi Browser separately.
6. **Run Pi Developer Portal URL validation** after access configuration. Confirm the validation-key endpoint returns the exact expected content at the registered origin.
7. Record the production URL + deployed commit SHA, anonymous validation result, browser/device QA, API health checks, and owner-approved payment state.

## Pi Developer Portal fields — guidance, not a submission

- **Fullscreen supported:** HTML includes viewport metadata and responsive classes. Select **Yes** only after device/viewport testing confirms the experience works at full-screen and narrow sizes.
- **Metadata Support Type:** Not selected because the portal's exact option list and the app's actual metadata contract were not available for verification. Match the selection to the implemented Pi payment metadata behavior.
- **OAuth client ID / redirect URI:** Match the registered client ID and redirect URI exactly to the app's real callback handler. A root URL alone does not prove that the root is the correct callback route.

## Not established by this audit

- PiOS license acceptance/registry inclusion, Pi Developer Portal approval, Mainnet listing approval, or successful Pi auth/payment.
- Browser-level responsiveness, accessibility, fullscreen behavior, or Pi Browser compatibility.
- Independent validity of secret API values or live API operation.
- Public reachability by Pi's validator while production deployment protection is enabled.
- Production readiness of payment/entitlement features.

## References

- Vercel Deployment Protection: https://vercel.com/docs/deployment-protection
- Vercel deployments: https://vercel.com/docs/deployments
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Pi Developer docs: https://developers.minepi.com/docs/


## 2026-11-23 Preview runtime re-check

This addendum is limited to the Preview branch and does not change or re-audit Production.

- PR #10 current observed Git head at the time of the check: `b8acc22602222f95e6b423be46681c9697d96fc3`.
- The most recent READY Preview available during this check was deployment `dpl_5G2MFiDWVGazi6Xoozg7WCnHru6V`, commit `70f46db6597efa7a6db9e7e0f71c66968a1e3014`. It contains the first incomplete-payment callback fix, but predates the subsequent approval/read-back hardening and compliance docs.
- Live `GET /api/health` on that deployment returned HTTP 200 with `supabaseLedger=server_credentials_configured`, `piPayments=awaiting_server_key`, and `piPaymentExecutionEnabled=false`.
- Live `GET /api/pi/verify` returned HTTP 200 with `ledgerConfigured=true`, `serverKeyConfigured=false`, `paymentEnabled=false`, and `missingRequirements=["PI_API_KEY"]`.
- Therefore the runtime confirms the Supabase service-role value is present/non-empty according to the application's readiness check. The Vercel environment-variable listing was queried with `decrypt=false`; its blank rendered value for a sensitive variable is a redaction and is not evidence that the stored secret is empty.
- `PI_API_KEY` is not configured in Preview and remains the known server-side credential blocker.
- GitHub Actions run #78 is running against current head `b8acc22...`; installation, lint, unit tests and TypeScript have passed, while the production build was still running at this observation.
- Vercel's commit check for the current head reports `build-rate-limit`; no deployment of `b8acc22...` has been confirmed. The READY deployment above must not be described as the current head.
- Runtime error aggregation for the latest hour returned no errors on the READY Preview deployment. This does not establish the behavior of the not-yet-deployed latest head.

No secrets were decrypted or written to source control. Pi payment execution remains disabled; paid entitlements and Mainnet approval remain false.
