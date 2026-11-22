# Vercel Deployment Audit — Foresight Paths Observatory

Audit date: 2026-11-22 (UTC)
Repository: https://github.com/Ze0ro99/Foresight-Paths
Vercel project: `foresight-paths-observatory`
Project ID: `prj_99wBK3tnD8KlR4qpWqBdN1weyOAF`
Team plan reported by Vercel: Hobby

## Evidence checked

This audit is based on the connected Vercel project metadata, recent deployment records, project-domain records, non-decrypted environment-variable listing, and a successful HTTP fetch of the production alias. It is not a browser/device QA, a Pi Developer Portal approval, or a security certification.

## Current observed state

| Check | Observed state | Assessment |
|---|---|---|
| Framework / runtime | Next.js; Node.js 22.x | Configured |
| Latest production deployment | READY, commit `c9e6d3d5879ad53052828455936315e92515c0f5` | Build/deployment succeeded |
| Production URL | https://foresight-paths-observatory.vercel.app | HTTP 200; HTML returned |
| Main project alias | `foresight-paths-observatory.vercel.app` | Verified in Vercel project-domain listing |
| Production live flag | `live: false` in project metadata | Needs owner review; do not infer public access from READY alone |
| Deployment protection | SSO protection enabled for production deployment URLs and all previews | Likely prevents public Pi Portal access until owner changes protection |
| Public runtime proof | HTTP fetch returned the app HTML and Pi SDK script reference | Server response verified; interactive/browser behavior not verified |
| Responsive markup | HTML includes viewport meta and responsive breakpoint utility classes | Encouraging evidence only; still needs real viewport/device testing |
| Pi API key | Production variable exists as sensitive but returned no readable value | Presence is visible; configured/non-empty validity is NOT verified |
| Gemini API key | Production variable exists as sensitive but returned no readable value | Presence is visible; configured/non-empty validity is NOT verified |
| Payment release flags | `PI_PAYMENTS_ENABLED=false`, `PI_ENTITLEMENT_LEDGER_ENABLED=false`, `PI_MAINNET_PAYMENTS_APPROVED=false` | Safely fail-closed; keep disabled until documented release gates pass |
| Root URL | Current production alias responds | No independent Pi Portal validation-key check was run in this audit |

## Required Vercel owner actions

1. **Resolve deployment access.** In Vercel → Project → Settings → Deployment Protection, review the SSO protection currently covering production URLs and previews. For Pi Developer Portal validation, the registered URL must be reachable by Pi's validator without an interactive Vercel login. Use the least-restrictive safe configuration that permits the required public access; do not disable protection blindly if private preview deployments rely on it.
2. **Confirm Production branch and Git integration.** The latest production record is associated with repository `Ze0ro99/Foresight-Paths`, branch `main`. Verify the production branch in Vercel Settings → Git matches `main`.
3. **Validate environment values without exposing them.** In Settings → Environment Variables, confirm `PI_API_KEY` and `GEMINI_API_KEY` are non-empty, belong only to the required server-side environments, and are not exposed through `NEXT_PUBLIC_*`. Never paste secret values into chat or commit them. If either value is newly added/changed, redeploy.
4. **Keep Pi payment flags disabled** until the durable order/entitlement ledger, server-side payment approval/completion flow, reconciliation, and release evidence are complete. Do not enable Mainnet payment flags as a deployment workaround.
5. **Run responsive QA** at narrow mobile, tablet, and desktop widths; verify no clipped content, horizontal overflow, inaccessible controls, or broken full-screen layout. Check Pi Browser separately.
6. **Run Pi Developer Portal URL validation** after access settings are resolved. Confirm the portal's validation-key endpoint returns the exact expected content at the exact registered origin.
7. **Record the final release evidence:** production deployment URL + commit SHA, successful public validation, device/browser QA, required API checks, and the owner-approved payment state.

## Pi Developer Portal fields — recommendation, not a portal submission

- **Fullscreen supported:** The delivered HTML has a viewport meta tag and responsive utility classes. Select **Yes** only after completing the device/viewport checks above. This audit does not certify the full-screen experience.
- **Metadata Support Type:** Not selected here because the portal's exact option list and the intended metadata integration were not supplied. Choose only after inspecting the available choices and matching them to the app's actual Pi payment metadata behavior.
- **OAuth client ID / redirect URI:** Keep the client ID and redirect URI aligned with the Pi Developer Portal registration and the app's real callback handler. The supplied root URL is not proof that the root is the correct callback route. Confirm the route and exact URI match before submitting.

## What this audit does not establish

- PiOS license acceptance, PiOS registry inclusion, Pi Developer Portal approval, Mainnet listing approval, or successful Pi authentication/payment.
- Browser-level responsiveness, accessibility, or full-screen behavior.
- Whether sensitive API-key values are valid or functional; secret values were not retrieved.
- That the application is publicly accessible to Pi's validator while SSO protection is enabled.
- That payment or entitlement features are production-ready.

## References

- Vercel deployment environments: https://vercel.com/docs/deployments/environments
- Vercel deployments: https://vercel.com/docs/deployments
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Pi Developer docs: https://developers.minepi.com/docs/
