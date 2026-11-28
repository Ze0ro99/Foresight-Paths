# Pi Network Promotion Runbook — V1

## Scope

Foresight Paths V1 is a Pi Testnet application. The registered Pi app network is immutable: disabling SDK Sandbox does not change a Testnet app into a Mainnet app. A Mainnet release requires a separately registered Mainnet app, its own Server API Key, a separately configured public URL, and an independent release review.

## Testnet operating modes

The browser SDK Sandbox flag and the registered app network are independent settings.

| Mode | Browser SDK | Server configuration | Intended use |
| --- | --- | --- | --- |
| Sandbox Testnet | `sandbox: true` | `PI_NETWORK=Pi Testnet`, `PI_SANDBOX_MODE=true` | SDK sandbox testing |
| Direct Testnet | `sandbox: false` | `PI_NETWORK=Pi Testnet`, `PI_SANDBOX_MODE=false`, `PI_DIRECT_TESTNET_ENABLED=true` | Pi Browser testing against the registered Testnet app |
| Mainnet | Separate Mainnet app | Not supported by this V1 gateway | Future, separately approved release |

Direct Testnet mode is deliberately opt-in. If the browser and server settings disagree, or the explicit Testnet network is missing, payment execution remains disabled.

## Vercel Preview variables

Configure secrets directly in Vercel. Never paste them into chat, source files, build logs, or client-visible variables.

- `PI_API_KEY`: Server API Key copied from the registered **Pi Testnet app**.
- `PI_NETWORK`: exact value `Pi Testnet`.
- `PI_SANDBOX_MODE`: `true` for Sandbox, or `false` for direct Testnet.
- `NEXT_PUBLIC_PI_SANDBOX_MODE`: same boolean string as `PI_SANDBOX_MODE`; controls only browser SDK initialization.
- `PI_DIRECT_TESTNET_ENABLED`: set `true` only when intentionally testing direct Testnet mode; otherwise `false`.
- `PI_PAYMENTS_ENABLED`: keep `false` until the public HTTPS Preview and Pi Browser authentication checks are ready. Enable only for a controlled Testnet payment test.
- `PI_PAYMENT_INTENT_LEDGER_READY`: `true` only while the private Supabase payment-intent RPCs and service-role runtime secret are verified.
- `PI_ENTITLEMENT_LEDGER_ENABLED`: keep `false`; V1 records verified demo settlements but does not grant credits or paid features.
- `PI_MAINNET_PAYMENTS_APPROVED`: keep `false`.

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. The publishable Supabase key may be exposed only for RLS-protected public read operations.

## Pi Developer Portal and public URL

1. Confirm the selected app is registered as **Pi Testnet**.
2. Configure the Testnet app's Development URL to the approved public HTTPS V1 URL.
3. Use a deployment reachable by Pi Browser. Do not disable Vercel SSO on an existing protected deployment merely to bypass authentication; instead arrange an explicitly approved public Testnet preview URL or a separate public Testnet deployment with least-privilege data.
4. Confirm SDK v2 loads from `https://sdk.minepi.com/pi-sdk.js`.
5. Confirm `Pi.authenticate(['username', 'payments'])` succeeds and the server independently validates the Pioneer token with `/v2/me`.
6. Confirm `GET /api/pi/verify` reports `network: Pi Testnet`, the expected Sandbox setting, and the exact missing gates without returning any secret.
7. Test the 0.1 and 1 Test-Pi demo plans only. Verify owner UID, app metadata, U2A direction, network, server-side price, approval, completion, authoritative read-back, and private ledger idempotency.
8. Test cancellation, invalid metadata, wrong user, duplicate callback, and incomplete-payment recovery.
9. Confirm every test response reports `entitlementGranted: false`.

## Mainnet promotion — future, not part of V1

Mainnet is a separate application registration and deployment, not an environment toggle on the Testnet app.

Before any Mainnet work:
- Register a new Mainnet app in Pi Developer Portal and record its immutable app identity.
- Create a separate Vercel environment/project or strictly isolated custom environment with its own Mainnet URL and Server API Key.
- Use a separate database schema/project or independently isolated ledger namespace; do not mix Testnet and Mainnet payment intents.
- Add explicit server-side network allowlisting and verify every returned payment reports the expected Mainnet network.
- Complete entitlement issuance, refund/reversal, reconciliation, abuse controls, audit logging, rate limits, and operational support.
- Obtain explicit owner approval and perform a separate security review and live end-to-end validation.
- Do not enable A2U payouts, automatic signing, x402 settlement, or paid entitlement delivery as a side effect of enabling Mainnet.

## V1 release gates

- GitHub Actions: lint, unit tests, typecheck, and production build all pass on the exact release commit.
- Vercel Preview: READY on the exact commit; no stale deployment may be used as evidence.
- Pi Browser: app URL opens publicly over HTTPS and SDK authentication succeeds.
- Backend: Testnet identity and payment validation succeed; invalid and cross-user cases fail closed.
- Supabase: private ledger RPCs are service-role-only, idempotent, and verified by read-back.
- Operations: health endpoints are accurate; upstream outages are represented as partial/unavailable, never fabricated as success.
- Release: PR reviewed and merged only after all applicable gates have evidence.

## Known external prerequisites

The Testnet Server API Key must be entered directly in Vercel by the project owner. A public Pi Browser URL and a Vercel Preview deployment for the release commit are also required. Do not mark the V1 release complete until those checks are run.
