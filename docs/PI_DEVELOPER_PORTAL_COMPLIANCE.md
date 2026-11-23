# Pi Developer Portal Compliance Matrix

Audit date: 2026-11-23 (UTC)
Repository: https://github.com/Ze0ro99/Foresight-Paths
Review scope: Pi SDK authentication, U2A payments, incomplete-payment recovery, Testnet-only boundaries

This is an engineering-to-documentation comparison. It is not Pi Core Team approval, a Mainnet listing approval, a security certification, or evidence that a live Pi Browser transaction has passed.

## Official documentation

- Getting Started: https://developers.minepi.com/docs/build-first-app/GettingStarted
- Authentication: https://developers.minepi.com/docs/authenticate-user/Authentication
- Payments: https://developers.minepi.com/docs/accept-payment/Payments
- SDK Reference: https://developers.minepi.com/docs/api-reference/SdkReference
- Platform API: https://developers.minepi.com/docs/api-reference/PlatformAPI
- App registration: https://developers.minepi.com/docs/build-first-app/RegisterApp
- Production validation: https://developers.minepi.com/docs/build-first-app/Production

## Implementation matrix

| Pi requirement | Code location | Assessment |
|---|---|---|
| Load `https://sdk.minepi.com/pi-sdk.js` | `app/layout.tsx` | Implemented with Next.js `afterInteractive` |
| Initialize with SDK v2 and Sandbox enabled for Testnet | `components/PiSandboxPaymentPanel.tsx` | Implemented; Sandbox is explicit |
| Authenticate through Pi SDK and verify token server-side | `components/PiSandboxPaymentPanel.tsx`, `app/api/pi/verify/route.ts` | Implemented using Pi `/v2/me` with Bearer token |
| Keep Server API Key on server only | `app/api/pi/verify/route.ts` | Implemented with `Authorization: Key`; no browser exposure |
| Validate payment against server-known amount and plan | `app/api/pi/verify/route.ts`, `lib/pi-payment.mjs` | Implemented; browser amount is not authoritative |
| Validate payment user, app/network metadata, U2A direction and cancellation status | `app/api/pi/verify/route.ts`, `lib/pi-payment.mjs` | Implemented |
| Server-side approval | `app/api/pi/verify/route.ts` | Implemented with private durable intent persistence |
| Server-side completion and authoritative read-back | `app/api/pi/verify/route.ts` | Implemented; requires verified transaction, completed status and matching txid |
| Handle `onIncompletePaymentFound` before auth resolves | `components/PiSandboxPaymentPanel.tsx`, `app/api/pi/verify/route.ts` | The client queues the callback DTO and blocks new payments. After `Pi.authenticate()` resolves, it sends the verified Pioneer Bearer token. The backend calls `/v2/me`, binds the payment `user_uid` to that identity, then performs server-side retrieval, conditional approval, completion, read-back, and private ledger reconciliation |
| Prevent duplicate payment attempts during recovery | `components/PiSandboxPaymentPanel.tsx` | New payment buttons remain blocked while recovery is pending or failed |
| Avoid granting credits/entitlements before an independent workflow exists | Pi route and Preview configuration | No entitlement is granted; entitlement flag remains false |
| Separate Testnet and Mainnet | `lib/pi-readiness.mjs`, private schema constraints and Preview flags | Testnet only; Mainnet approval remains false |

## Verification status

- Unit tests cover empty/whitespace/placeholder credentials, Sandbox release gates, Testnet payment recovery validation, app/network/direction/plan/amount checks, and cancellation/txid validation.
- GitHub Actions and Vercel Preview for the updated head must complete before this branch's code changes can be considered build-verified.
- Live Pi Browser authentication, actual Pi Sandbox payment approval/completion, and interrupted-payment recovery remain unverified until `PI_API_KEY` is configured and a Testnet app session is tested. The last successful Preview smoke test confirmed the private Supabase ledger credential was available.
- Latest Preview runtime verification reports `PI_API_KEY` absent (`awaiting_server_key`). The earlier non-decrypted sensitive-variable listing does not reveal the Supabase key value, but runtime checks confirmed the private ledger was configured.
- `SUPABASE_SERVICE_ROLE_KEY` is a sensitive Preview variable. Its value is not returned by non-decrypted listings; the last successful Preview runtime check reported `ledgerConfigured: true`, and USGS/NASA ingestion persisted 8 + 6 records, confirming the server-only credential path was working on that deployed commit.
- The Supabase URL and publishable key are configured for the isolated `foresight-paths-dev` database.

## Required owner setup

In Vercel Project Settings → Environment Variables, scoped only to Preview and branch `fix/ci-clean-base`:

1. Set the actual Pi Testnet Server API Key as a sensitive server-only variable named `PI_API_KEY`.
2. Preserve the existing sensitive `SUPABASE_SERVICE_ROLE_KEY` value for the isolated `foresight-paths-dev` project; do not replace it unless an intentional credential rotation is required.
3. Redeploy Preview after both values are saved.
4. Open the deployed app in Pi Browser using the registered Testnet application; test login, a small Sandbox U2A payment, cancellation, callback retry, and incomplete-payment recovery. Verify the Pi payment record and private intent state before considering the flow passed.

Never put either secret in chat, source control, the browser bundle, or a `NEXT_PUBLIC_` variable.

## Release boundary

Keep `PI_SANDBOX_MODE=true`, `PI_ENTITLEMENT_LEDGER_ENABLED=false`, and `PI_MAINNET_PAYMENTS_APPROVED=false`. Do not enable Mainnet, A2U payouts, x402 settlement, automatic signing, or paid entitlement delivery as part of this PR.
