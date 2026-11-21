# Pi Next Implementation Roadmap

> Status: planning baseline. This document records the submitted product plan; it is not evidence that any external platform capability, hackathon rule, protocol status, payment rail, or deployment is currently available.

## Product outcomes

1. A public, multilingual event map and evidence-analysis workspace.
2. A risk-analysis workflow that can produce reviewable response plans and exportable agent/tool templates.
3. A public discovery path that works without Pi authentication; Pi-only actions are gated at the point of use.
4. A testable Pi integration with server-side identity/payment verification, idempotent payment handling, and no client-trusted entitlements.
5. A separately scoped local/SoloHost companion, only after its supported runtime and submission requirements are verified.

## Architecture boundaries

- **Observed events:** source-attributed records with source URL, source timestamp, retrieval timestamp, coordinates and location precision, and a provenance trail.
- **Analysis:** hypotheses, interpretations, symbolic associations, and scenario outputs. These must never be promoted to observed facts without independent evidence.
- **Generated artifacts:** agent/MCP definitions, defensive playbooks, and Soroban templates. Generated code is untrusted until reviewed, tested in isolation, and explicitly approved.
- **Payments and identity:** server-owned verification only. Never trust browser user objects, payment-close callbacks, client prices, or client entitlement flags.
- **Community proposals:** distinguish official Pi Network specifications from independent/community proposals in names, docs, UI, and code. Community proposals are not protocol requirements.

## Delivery sequence and acceptance gates

### Gate 0 — repository integrity and evidence quality
- Remove fabricated or stale records presented as live events.
- Preserve source timestamps; omit records with invalid provenance.
- Do not invent severity, precision, or geocoding confidence.
- Separate observed-event and interpretation layers; allow users to hide interpretations.
- Acceptance: tests cover missing timestamps, malformed coordinates, unavailable feeds, and source attribution; no synthetic records enter the verified layer.

### Gate 1 — public map and localization
- Implement a public read-only experience before authentication.
- Support English, Arabic, French, Indonesian, and Vietnamese; switch RTL only for Arabic.
- Show source, event time, retrieval time, location precision, and epistemic tier.
- Acceptance: locale and RTL/LTR tests; accessible keyboard controls; map data is source-attributed and partial coverage is explicit.

### Gate 2 — durable ingestion
- Add scheduled server-side ingestion, persistence, deduplication, retention, source health, and retry/backoff.
- Add feeds only after licensing, reliability, schema, and attribution review.
- Acceptance: replayable ingestion tests, duplicate/idempotency tests, stale-feed indicators, and documented coverage limits.
- Deployment requires a configured hosted scheduler and database; this repository alone does not prove continuous operation.

### Gate 3 — Pi authentication and payments (Testnet first)
- Use official Pi SDK/platform documentation and verify exact API versions and current requirements before implementation.
- Verify identity and payment state on the server; implement approval/completion, incomplete-payment recovery, idempotency, read-back, and audit logs.
- Keep secrets server-side and use sandbox/testnet for all initial integration.
- Do not claim that 0.0001 Pi is economically viable for direct settlement or that batching/x402 is supported on Pi until measured and documented.
- Acceptance: mocked failure-path tests plus successful end-to-end Testnet transaction; no Mainnet payment without explicit release approval.

### Gate 4 — risk analysis and artifact export
- Use transparent, versioned scoring inputs (likelihood, impact, confidence, freshness) and explain uncertainty.
- Export defensive MCP agent templates and Soroban examples as untrusted starter artifacts.
- Require schema validation, sandbox checks, human review, and explicit user confirmation before execution.
- Acceptance: deterministic test fixtures, malicious-input tests, safe default permissions, and reproducible export validation.

### Gate 5 — API, MCP, and paid access
- Implement only the currently verified x402 version and payment scheme; isolate experimental Pi/Testnet adapters behind feature flags.
- Publish OpenAPI/MCP schemas, rate limits, authentication boundaries, pricing units, and failure semantics.
- Acceptance: protocol conformance tests, replay protection, idempotency, and no access before server-side settlement confirmation.

### Gate 6 — governance, privacy, and release
- Separate evidence labels from moderation severity; symbolic associations are not emergency alerts.
- Publish privacy policy, retention/deletion rules, abuse reporting, and review/audit procedures.
- Validate all hackathon dates, submission limits, app naming rules, and SoloHost requirements against official current materials before relying on them.
- Acceptance: threat model, privacy review, accessibility/localization checks, demo checklist, and a signed release checklist.

## Payment economics: required validation

The submitted plan proposes a 0.0001 Pi monthly subscription and discusses batching, x402, prepayment, and advertising. Treat these as product hypotheses until confirmed against current official Pi documentation and measured network fees. The application must not promise a settlement mechanism that is not implemented and tested. Prefer a clear Testnet demonstration and a documented fee model over a Mainnet claim that cannot be verified.

## Evidence and source status

The submitted plan contains assertions about Pi Next dates/prizes, user and node counts, PiRC1/PiRC2 status, x402 support, SoloHost capabilities, ad APIs, PiNet behavior, and Mainnet fees. Those assertions are **not verified by this roadmap**. Before implementation depends on any of them, record:
- the exact official source URL and retrieval date;
- whether the source is official, community-maintained, or third-party commentary;
- the claim supported and any version/network scope;
- a test or acceptance criterion.

Do not treat Ze0ro99/PiRC or other community proposals as official Pi Network standards.

## Current repository status

The global sensing endpoint currently represents partial coverage from USGS and NASA EONET. The existing PR #1 is a prerequisite for this roadmap branch. This branch is intentionally stacked on PR #1 and should be reviewed only after its base is accepted or updated. Static review is not a substitute for build, lint, and runtime tests.
