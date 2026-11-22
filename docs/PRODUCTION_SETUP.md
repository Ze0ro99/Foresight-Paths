# Production setup and release checklist

The public deployment can serve the read-only map without credentials. Optional integrations remain unavailable until their credentials and supporting infrastructure are configured.

## 1. Vercel environment variables

Add the following under **Project → Settings → Environment Variables**, for Preview and Production as appropriate:

| Variable | Required for | Notes |
| --- | --- | --- |
| `GEMINI_API_KEY` | Gemini event analysis | Server-only secret. |
| `PI_API_KEY` | Pi server-side identity/payment operations | Testnet app key for Preview; server-only secret. |\n| `NEXT_PUBLIC_SUPABASE_URL` | Public read-only Foresight data | Must point to `foresight-paths-dev`, not the PiRC project. |\n| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public read-only Foresight data | Publishable key; RLS limits public access to SELECT. |\n| `SUPABASE_SERVICE_ROLE_KEY` | Private Testnet payment-intent RPCs | Server-only secret; never use a `NEXT_PUBLIC_` prefix. |
| `PI_SANDBOX_MODE` | Pi server environment | `true` by default. |
| `NEXT_PUBLIC_PI_SANDBOX_MODE` | Pi browser SDK environment | Must match `PI_SANDBOX_MODE`. |
| `PI_PAYMENTS_ENABLED` | Pi Testnet approval/completion | `false` by default; Preview-only demo release gate. |\n| `PI_PAYMENT_INTENT_LEDGER_READY` | Private payment-intent persistence | `false` by default; set only when the isolated Supabase private RPCs are configured. |
| `PI_ENTITLEMENT_LEDGER_ENABLED` | Paid credit/entitlement delivery | Must remain `false` until balances, refunds, and entitlement delivery are separately implemented and tested. |
| `PI_MAINNET_PAYMENTS_APPROVED` | Mainnet payment release | `false` by default; requires the owner’s explicit approval after Testnet end-to-end validation. |

After changing variables, redeploy the relevant environment. Never commit real credentials.

## 2. Pi integration boundary

The backend uses the official Pi Platform API v2:
- Verify the user access token with `GET /me`.
- Retrieve the payment record before approval/completion.
- Check the server-known plan amount, payment owner UID, and plan metadata.
- Approve only a matching payment.
- Complete with the transaction ID supplied by the Pi SDK.
- Read the payment back and require both `transaction_verified` and `developer_completed` before reporting settlement.

**Important:** a private Testnet payment-intent ledger and service-role-only RPCs are now deployed in the isolated Foresight Supabase project. This persists idempotent intent state and verifies the Pi transaction read-back, but it does not yet implement product entitlements, prepaid-credit balances, refunds, or merchant settlement. A verified settlement is not the same as granting a prepaid credit or premium entitlement. Do not sell or advertise redeemable credits until those workflows are implemented and tested.

Testnet payment approval/completion fail closed unless `PI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, the isolated Foresight Supabase URL, `PI_PAYMENTS_ENABLED=true`, and `PI_PAYMENT_INTENT_LEDGER_READY=true` are all configured in Preview. `PI_ENTITLEMENT_LEDGER_ENABLED` remains false: a verified test payment is recorded, but no prepaid balance or paid feature is granted. The Pi route accepts Sandbox/Testnet only; Mainnet is not enabled by this route. Mainnet payment operations additionally require `PI_MAINNET_PAYMENTS_APPROVED=true`. All three flags default to false. Do not enable them until a durable order/entitlement ledger, idempotency constraints, refund/recovery workflow, and end-to-end Testnet validation are complete and the owner explicitly approves the Mainnet payment release. The Pi Developer Portal locks an app to the network chosen at registration; a Testnet app cannot be switched to Mainnet. Use a separately registered Mainnet app for production. Rewarded ads remain disabled until a trusted provider callback is integrated and verified server-side.

## 3. Current capability status

| Capability | Status |
| --- | --- |
| Public Arabic/RTL application | Available |
| Global sensing | Partial coverage: USGS + NASA EONET polling |
| Gemini analysis | Requires `GEMINI_API_KEY` |
| Pi identity | Requires Pi Browser SDK session and server verification |
| Pi payment approval/completion | Disabled by default; requires `PI_API_KEY`, a durable ledger, and explicit release flags |
| Private Testnet payment-intent persistence | Implemented in Supabase; server credentials and Pi key still required for live flow |\n| Durable prepaid/premium entitlements | Not implemented; requires separate credit/entitlement and refund workflows |
| x402 paid execution | Disabled; no trusted facilitator/settlement integration |
| Rewarded-ad grants | Disabled; no verified provider callback |
| Cloud-agent execution | Disabled pending telemetry validation, calibrated scoring, and independent settlement verification |

## 4. Smoke checks

After deployment:
- `GET /` should return HTTP 200 and render Arabic RTL.
- `GET /api/health` should return HTTP 200 and accurately report configuration state.
- `GET /api/global-sense` should return source-attributed signals or an empty partial-coverage result when upstream sources are unavailable.
- `GET /api/pi/verify` should report sandbox mode and whether the server key is configured, without exposing secrets.
- `GET /api/x402/mcp` should expose discovery only; paid execution remains disabled.

## 5. Security and release gates

- Keep Preview protected; only Production is public.
- Keep API keys server-side.
- Do not accept client-supplied prices or identity claims.
- Do not grant entitlements from a browser callback alone.
- Do not describe symbolic correlations as factual evidence or calibrated threat scores.
- Keep cloud-agent execution, paid x402 execution, and rewarded-ad grants disabled until their respective evidence and security gates are met.
- Run build, typecheck, unit tests, and a security review before enabling any paid feature.
