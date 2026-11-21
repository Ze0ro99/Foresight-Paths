# Production setup and release checklist

The public deployment can serve the read-only map without credentials. Optional integrations remain unavailable until their credentials and supporting infrastructure are configured.

## 1. Vercel environment variables

Add the following under **Project → Settings → Environment Variables**, for Preview and Production as appropriate:

| Variable | Required for | Notes |
| --- | --- | --- |
| `GEMINI_API_KEY` | Gemini event analysis | Server-only secret. |
| `PI_API_KEY` | Pi server-side identity/payment operations | Server-only secret; never expose to the browser. |
| `PI_SANDBOX_MODE` | Pi server environment | `true` by default. |
| `NEXT_PUBLIC_PI_SANDBOX_MODE` | Pi browser SDK environment | Must match `PI_SANDBOX_MODE`. |

After changing variables, redeploy the relevant environment. Never commit real credentials.

## 2. Pi integration boundary

The backend uses the official Pi Platform API v2:
- Verify the user access token with `GET /me`.
- Retrieve the payment record before approval/completion.
- Check the server-known plan amount, payment owner UID, and plan metadata.
- Approve only a matching payment.
- Complete with the transaction ID supplied by the Pi SDK.
- Read the payment back and require both `transaction_verified` and `developer_completed` before reporting settlement.

**Important:** this repository does not yet have a durable order/entitlement database. A verified settlement response is not the same as granting a prepaid credit or premium entitlement. Do not sell or advertise redeemable credits until an order ledger, unique constraints/idempotency, refund/recovery workflow, and entitlement delivery are implemented and tested.

Rewarded ads remain disabled until a trusted provider callback is integrated and verified server-side. Mainnet must remain disabled until the owner explicitly approves a production payment test and the end-to-end Testnet flow passes.

## 3. Current capability status

| Capability | Status |
| --- | --- |
| Public Arabic/RTL application | Available |
| Global sensing | Partial coverage: USGS + NASA EONET polling |
| Gemini analysis | Requires `GEMINI_API_KEY` |
| Pi identity | Requires Pi Browser SDK session and server verification |
| Pi payment approval/completion | Server API integration; requires `PI_API_KEY` and verified payment metadata |
| Durable prepaid/premium entitlements | Not implemented; requires persistent database |
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
