# Implementation Roadmap and Verified Delivery Matrix

Status: **living engineering record**. A checked item requires code, tests, and evidence on the current branch; a proposal or document alone is not implementation.

## Release principles

- Keep Mainnet payment, A2U payouts, paid-agent execution, x402 settlement, and production secrets disabled until explicitly approved by the owner and verified end-to-end.
- Treat browser input, scanned URLs, external API responses, agent output, and imported files as untrusted.
- Never expose API keys, service-role keys, wallet secrets, or signing material to the client or repository.
- Use small, reviewable changes on feature branches. Merge only after required CI and Preview checks pass.
- Label sourced facts, inference, estimates, and speculation separately. Never present model output as verified fact.

## Delivery matrix

| Workstream | Current evidence | Required before marking complete |
|---|---|---|
| Global news | GDELT DOC 2.0 route and eight-category panel exist on the review branch; refresh interval is two minutes; original publisher links and partial-coverage notice are displayed. | Add independent source adapters, provider health tests, category-level fixtures, deduplication tests, and monitored rate-limit/failure behavior. GDELT is not exhaustive or guaranteed instant. |
| Hazard signals | Existing USGS/NASA signal integration and source-count/coverage UI are present. | Verify each adapter, timestamp semantics, geo coordinates, stale-data handling, and attribution; do not claim all disasters are covered. |
| Evidence and Q-Clock | Existing narrative/time-map UI requires a source/evidence audit. | Separate symbolic projections from empirical analysis; publish reproducible formulas, test cases, confidence basis, alternative explanations, and uncertainty. |
| Pi authentication and payments | No verified end-to-end payment implementation is evidenced by this PR. | Implement SDK initialization, authentication verification, payment approval/completion, incomplete-payment recovery, idempotency, ownership checks, durable order state, and Testnet tests. |
| Automatic transaction-fee handling | Not implemented or validated by this PR. | For Stellar SDK-built transactions, read the latest ledger's `base_fee_in_stroops` from the selected Pi Horizon network and pass the returned fee to TransactionBuilder. Recheck the ledger value per transaction/batch and handle RPC failure safely. |
| Micro-payments / x402 | Not implemented or validated by this PR. | Do not assume an on-chain minimum of 0.01 Pi or promise that Pi.createPayment supports a custom fee. Design any prepaid-credit or batched-settlement ledger as a separate custodial accounting feature with explicit user consent, durable double-entry records, refunds, reconciliation, and legal/security review. Do not represent internal credits as on-chain Pi. |
| URL inspection | Not evidenced as complete. | Enforce HTTP(S)-only URLs, reject credentials, block loopback/private/link-local/reserved IP ranges after DNS resolution, revalidate every redirect, cap redirects/body/time, defend against DNS rebinding, and never execute fetched content. Add SSRF regression tests. |
| File sharing and storage | Not evidenced as complete. | Verify current Pi SDK support before calling native sharing; otherwise use a clearly labeled browser download/share fallback. Add private storage, MIME/size limits, retention, deletion, and access controls. |
| Agent builder / marketplace | Not evidenced as a production-ready service. | Start with reviewed templates and declared capabilities. Require confirmation for consequential actions, isolate execution, apply quotas, log actions, and keep paid listings disabled until billing and revocation flows pass. |
| Simple / Pro modes | Existing UI needs feature-by-feature verification. | Test keyboard/accessibility, responsive layout, localization, and ensure developer diagnostics never expose secrets to ordinary users. |
| SoloHost / Pi Desktop | Not evidenced as packaged or certified. | Build reproducible Docker Compose/config bundles, document supported Pi Desktop versions, scan images/dependencies, and test install/upgrade/rollback on a clean host. |
| Governance / staking | Not evidenced as live or approved. | Use only documented and authorized APIs; distinguish proposal voting from binding protocol governance; prevent claims of voting weight unless the source and eligibility are verified. |

## Pi SDK and fee-policy guardrails

- The documented Pi payment flow is frontend `Pi.createPayment(paymentData, callbacks)`, followed by server-side approval and server-side completion through the Pi Platform API. Deliver an entitlement only after successful completion is confirmed by the backend.
- Pi SDK payment data includes amount, memo, and metadata. Do not invent or pass an undocumented custom network-fee parameter.
- Pi's current developer examples for Stellar token operations retrieve the latest ledger record and read `base_fee_in_stroops`, then pass that value as the `fee` option to `StellarSdk.TransactionBuilder`. This applies to transactions the application itself constructs with Stellar SDK; it is not a fee override for the Pi.createPayment wallet flow.
- Do not hard-code a universal `0.01 Pi` minimum or a priority multiplier without an authoritative, current Pi network source and a Testnet measurement. Network base fees are ledger/network data and must be handled in stroops with exact integer arithmetic.
- If an application offers prepaid service credits or internal micro-billing, show that they are internal account units, not blockchain transfers. Require an auditable ledger, balance reconciliation, explicit terms, refund handling, and security review before enabling.
- x402 is not a Pi SDK payment method. Any bridge between x402 and Pi must be specified and audited as a separate integration; never imply that batch settlement is automatically supported by Pi.

## Security and backend requirements

- Keep privileged operations server-side. Validate and normalize all inputs at the boundary.
- Store `GEMINI_API_KEY`, `PI_API_KEY`, Supabase service credentials, and signing material only in server-side environment scopes. Never ask users to paste secrets into chat or commit them.
- Pi authentication and payment authorization are separate. Verify the access token against the Pi Platform API; verify each payment belongs to this app and matches a server-side order before approval/completion.
- Make approve/complete callbacks idempotent because callbacks can be retried. Persist state transitions and perform read-back before delivering value.
- Use request IDs, structured errors, bounded timeouts, rate limits, safe retries, and provider circuit breakers.
- For URL scanning, resolve and validate every destination IP and redirect to prevent SSRF and DNS rebinding.
- For personal data, define opt-in, retention, export, deletion, and access-control behavior before collection.

## Data and Supabase

- Do not alter or migrate an existing Supabase production project as a shortcut.
- Use a separate development project only after the owner confirms the organization and region and approves any nonzero cost.
- Design schema and migrations from actual requirements; apply least privilege and row-level security.
- Keep service-role credentials server-only. Add migration tests, RLS tests, backups, and rollback procedures before production use.

## Testing and readiness gates

- [ ] Current branch lint passes.
- [ ] TypeScript check passes.
- [ ] Production build passes.
- [ ] Unit and integration tests cover news adapters, provider failures, timestamps, deduplication, and category mapping.
- [ ] URL/file inspection abuse cases and SSRF regression tests pass.
- [ ] Authentication and authorization boundaries reviewed.
- [ ] Privacy, retention, and RLS reviewed.
- [ ] Pi Testnet authentication/payment flow verified end-to-end, if payments are in scope.
- [ ] Fee calculation uses current Testnet ledger data and exact stroop arithmetic, if Stellar transactions are in scope.
- [ ] Preview deployment reaches READY and routes are smoke-tested.
- [ ] Owner reviews the final diff and explicitly approves merge/release.

## Current scope boundary

This document is a delivery and safety record, not evidence that every row is already implemented. In this change set, the news panel and source-coverage presentation are the delivered work; CI and Preview are still being validated. Pi payment processing, automatic fee routing, x402, internal credits, marketplace billing, URL scanning, file sharing, agent execution, SoloHost packaging, governance, and Mainnet approval must remain disabled or clearly labeled as planned until code and test evidence exist. Mainnet activation requires a separate explicit instruction from the owner.


## Verified Testnet infrastructure added in the current development slice

The isolated Supabase project `foresight-paths-dev` (project ref `mlrbbnjoczpfmbgewgrm`) is separate from the PiRC Supabase project. It is on the organization's Free plan. The following schema is deployed there and versioned in `supabase/migrations/20261122195345_foresight_core_data_and_testnet_ledger.sql`, `20261122195413_secure_private_ledger_permissions_and_balance.sql`, and `20261122195539_service_role_private_ledger_policies_and_indexes.sql`:

- Public, read-only datasets: `source_registry`, `news_items`, `hazard_events`, `risk_assessments`, `agent_templates`, and `scenario_snapshots`.
- Private schema: `payment_intents`, `ledger_accounts`, `ledger_transactions`, and immutable `ledger_entries`. Private schema access is revoked from `anon` and `authenticated`; only the server `service_role` is granted access.
- Public tables have RLS enabled and only SELECT policies for `anon` and `authenticated`. No client-side insert/update/delete policy exists.
- Testnet-only constraints are applied to payment intent and ledger network fields; Mainnet is rejected by the schema. Ledger entries are append-only, and posting a ledger transaction is blocked unless debit and credit totals are equal.
- Seeded source registry records identify GDELT, USGS, NASA EONET, and Pi Testnet Horizon. Agent cards are explicitly marked `demo` or `prototype`, not live automated agents.

The Preview environment on branch `fix/ci-clean-base` has only the Supabase project URL and publishable key. No service-role key or Pi server key was added. The UI uses the public read-only endpoint `/api/intelligence/overview`; the Pi Testnet telemetry endpoint `/api/pi/testnet-fee` reads the latest Horizon ledger and reports the live `base_fee_in_stroops` value as a string and a Pi-denominated display value. It does not construct, sign, or submit transactions.

### Payment activation remains gated

The database structure is a foundation, not a completed payment integration. The application must not approve, complete, or deliver paid entitlements until all of the following are implemented and verified:

1. Add `PI_API_KEY` as a Preview-only encrypted environment secret through Vercel; never commit or paste it into source.
2. Add `SUPABASE_SERVICE_ROLE_KEY` as a Preview-only encrypted server secret; never prefix it with `NEXT_PUBLIC_`.
3. Implement server-side Pi `/v2/me` verification, server-side payment retrieval, exact order/amount/user/network matching, idempotent approve/complete, and reconciliation for incomplete payments.
4. Verify all flows using Pi Sandbox/Testnet and a real developer app configuration. Deliver no entitlement before successful server-side completion.
5. Add a Testnet fee quote path for any Stellar SDK-built transaction; use the current ledger base fee in stroops, integer arithmetic, and a safe failure mode. The fee endpoint in this slice is telemetry only, not a transaction builder.
6. Add refund, dispute, replay, callback retry, ledger balancing, and audit tests before enabling prepaid credits or x402 settlement.

The public news feed is currently fetched from GDELT by the Next.js route. Supabase storage tables are ready for server-side ingestion, but live article/hazard ingestion into those tables is not yet wired because no server-only database credential is configured. The UI must not imply that empty persisted tables mean no real-world events.

### Video demonstration boundary

A Testnet walkthrough can currently demonstrate the global news feed, source attribution, partial coverage disclosures, hazard-source coverage, the isolated Supabase read-only data panel, and live Pi Testnet ledger/fee telemetry. Agent templates should be presented as prototypes. Do not demonstrate a payment as successful unless the full Pi Sandbox/Testnet approve → wallet transaction → complete flow has passed with the project's own credentials. Do not switch `Pi.init` to production or enable Mainnet.
