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
