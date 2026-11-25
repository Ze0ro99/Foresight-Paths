# Agent Operations Workbench — Testnet Delivery

## Delivered capability

- Pi Browser authentication requests the username scope only. The Edge Function validates the Pi access token with Pi Platform /v2/me and derives the Pioneer UID server-side.
- Users can create saved agent profiles from reviewed templates. This workbench does not accept executable tools, arbitrary URLs, or uploaded scripts.
- Agent runs are bounded, deterministic, read-only analyses over records already stored in the isolated foresight-paths-dev project. The Pi Testnet observer reads the public Horizon ledger only. This workbench slice does not invoke an LLM for every run; it uses reviewed, template-specific analysis rules and source attribution.
- Results include source freshness, coverage gaps, attributed findings, safe recommendations, and explicit unavailable/partial states.
- Proposals and votes persist off-chain. Each verified Pi UID may vote once per proposal. Voting never executes a proposal and is not represented as binding Pi governance.
- Recurring monitoring plans can be saved as off-chain previews. Separately, the native Pi Testnet subscription panel reads an already-registered Developer Portal service and calls `Pi.SmartContract.Subscription.subscribe(..., { mode: 'simulate' })` after the user explicitly requests the `payments` scope. This is a contract simulation only: it does not sign, pay, create an on-chain subscription, renew, or grant an entitlement.

## Safety model

- Agent runs and subscription contract calls are simulation-only. External actions, account changes, service changes, transactions, and entitlements remain zero.
- Cybersecurity guidance is defensive and authorized: evidence preservation, corroboration, containment of owned/authorized systems, patch planning, credential rotation, and clean recovery. No exploit execution, hack-back, unauthorized scanning, attacker pursuit, or deanonymization.
- The workbench bootstrap requests username only. The optional native subscription simulator requests username + payments scope only after the user presses its explicit simulation button; no write/submit mode is exposed.
- The Edge Function validates the Pi token on each request. Client-supplied Pioneer IDs are ignored.
- Personal workbench tables have RLS enabled and no anon/authenticated grants. Only the service-role-backed Edge Function can access them.
- The run limiter allows one run every 20 seconds and caps each Pioneer at 40 runs in a rolling 24-hour window.
- Market prices, financial forecasts, crash probabilities, and trade signals are withheld until timestamped market and macro series are connected.
- Space/anomaly claims retain evidence labels; no extraordinary conclusion is generated from symbolism or a single report.

## Threat model

| Threat | Control |
|---|---|
| Forged client UID or cross-user access | Verify Pi token against /v2/me; derive UID server-side; filter every private query by that UID |
| Duplicate votes | Unique proposal and Pioneer UID constraint |
| Run amplification | Atomic database run slot, cooldown, and daily cap |
| Arbitrary tool execution or SSRF | Fixed template catalogue; no user-provided URL fetching, code execution, shell, or external targets |
| Prompt injection in source data | Source records are treated as untrusted data; deterministic renderer; no source content is executed |
| Secret exposure | Supabase secret key stays inside Edge Function runtime; browser receives only the publishable key |
| Accidental payment or chain writes | No payments scope, no Pi submit/process, no signing, no transaction builder, no entitlements; Horizon is read-only |
| False certainty | Explicit ok/partial/unavailable states, attribution, freshness, null calibrated risk score when unassessed |

## Known limitations

- GDELT ingestion is routed through the fixed-query `news-refresh` Supabase Edge Function. The function validates the project's publishable API key, uses the Supabase-injected secret only inside the Edge runtime, and claims a shared 300-second database refresh lease before fetching or persisting news. It rejects arbitrary URLs, source overrides, and query overrides.
- GDELT, USGS, and NASA freshness is independent and may be stale or unavailable. The app displays partial/unavailable states and does not synthesize replacement records.
- Licensed market feeds, macroeconomic series, CVE/NVD enrichment, public-health authority feeds, and dedicated space-object telemetry are not connected by this slice. Therefore market prices, crash probabilities, outbreak forecasts, and extraordinary space claims are not generated.
- Native Pi Subscriptions are Testnet-only during the documented v1 period and require a Developer Portal Service ID. This delivery stores a preview only. A separate change is required to call the official Subscription SDK simulation method after a real Service ID is registered; no submit or merchant processing is implemented here.
- The existing Soroban generator exports a reviewable design/source artifact and can be submitted as an off-chain governance proposal. No contract is deployed, signed, or invoked with state-changing operations here. The new workbench's `smart_contract` proposal type is not a contract compiler or on-chain registry.

## Cost and validation

- No new paid service, AI model, market-data provider, or Lovable project is provisioned.
- Uses the existing GitHub repository, existing Supabase project, existing Pi Testnet, and registered public feeds.
- Required CI: npm test, lint, TypeScript, and production build on the exact PR head.


## GDELT Edge Function contract

- Endpoint: `POST /functions/v1/news-refresh`, called server-to-server by `GET /api/news`.
- The request accepts only an empty JSON object; clients cannot select a URL, category query, source, or destination.
- The Edge Function checks the configured project publishable key in the `apikey` header. It uses the Supabase-injected `SUPABASE_SECRET_KEYS` default key inside the Edge runtime; the secret key is never copied to Vercel or the browser.
- Database RPCs `claim_source_refresh` and `ingest_news_batch` enforce a five-minute shared refresh interval and idempotent source-key/external-URL upserts.
- GDELT `seendate` is stored as `observed_at`, not publisher `published_at`; all records remain `unverified` until independently corroborated.



## Native Pi Subscription Testnet simulation

- Official SDK calls: `Pi.SmartContract.Subscription.getService(walletAddress, serviceId, { mode: 'simulate' })` and `subscribe(walletAddress, serviceId, autoRenew, periods, { mode: 'simulate' })`.
- Service IDs must already be registered in the Pi Developer Portal. Do not create unlinked services with the SDK for the production app catalogue.
- The simulator explicitly asks for the Pi `payments` scope only after the user starts it. It accepts a public wallet address, validates its format, and checks the on-chain service before simulation.
- The UI has no `submit` mode. No wallet signing, charge, transaction, auto-renew processing, or entitlement grant can occur from this panel.
- Pi documentation currently describes subscriptions as Testnet v1 only, with approval windows just under 180 days. Renewals do not run automatically: the merchant must call `process` each billing period. A scheduled merchant worker and its signing controls are not implemented in this slice.

