# Security and Evidence Gates

Status: **fail-closed mitigations committed; production readiness not established**.

This is an engineering status record, not an independent security audit, proof of runtime behavior, or substitute for current official Pi Platform documentation.

## Mitigations in this branch

- `app/api/cloud-agent/run/route.ts`: returns `503 not_ready` for every request. Cloud-agent execution, scoring, and settlement claims are disabled.
- `app/api/pi/verify/route.ts`: identity is verified against `/v2/me`; payment approval/completion require a bearer-authenticated owner, a server-priced plan, matching Pi payment owner and metadata, and a successful completion read-back. No product entitlement is granted because a durable order ledger is not configured. Rewarded-ad grants remain disabled pending a trusted provider callback.
- `app/api/x402/mcp/route.ts`: exposes read-only tool discovery; paid tool execution returns `503` until a trusted facilitator, payment verification, replay protection, and settlement read-back are implemented.
- `app/api/global-sense/route.ts`: rejects invalid/out-of-range coordinates, future timestamps beyond a small clock-skew allowance, and USGS records without a finite source magnitude. It continues to label coverage partial and does not invent severity for NASA EONET records.

## Remaining release blockers

1. Complete an end-to-end Pi Testnet transaction against the current official API, then add a durable order ledger with unique payment IDs, idempotent entitlement delivery, incomplete-payment recovery, and audit records before enabling entitlements.
2. Integrate a real rewarded-ad provider callback and verify its signature/server-side status before granting anything.
3. Implement x402 only against a currently documented facilitator and supported scheme; validate signatures, payer, recipient, amount, network, nonce/replay, settlement status, and read-back. Current paid execution is disabled.
4. Keep symbolic decoding opt-in and separate from observed evidence, operational severity, payment eligibility, and emergency actions.
5. Add automated tests for malformed JSON, invalid coordinates, stale/future source records, duplicate IDs, source outages, client-payload tampering, fake payment payloads, replay attempts, and upstream API failures.
6. Add request rate limits, abuse controls, privacy/retention policy, and a security review before enabling sensitive actions.
7. Confirm Pi Network API versions, Testnet/Mainnet behavior, hackathon requirements, and SoloHost availability from current official sources before making product claims.

## Evidence and map presentation

- A source record is factual only to the extent supported by its cited source and provenance.
- Geographic proximity, gematria, π-based arithmetic, Q-Clock alignment, and visual adjacency do not establish causation, coordination, prediction, or threat severity.
- Narrative-map items must remain explicitly attributed interpretations and visually separable from observed events.
- Keep original artifacts, source URLs, capture dates, translation notes, and analyst interpretations as separate fields.
- USGS/NASA EONET data is fetched by the browser on initial load and periodically while the page is active (45-second client polling). This is partial source polling, not continuous background ingestion or a durable scheduled pipeline.

## Release gates

Do not mark the app or affected functionality production-ready until:

1. The production build, typecheck, lint, and automated tests pass.
2. Runtime smoke tests confirm the homepage and read-only API behavior.
3. Payment state is backed by a verified provider response and read-back; no locally generated digest is described as a transaction hash.
4. Symbolic fields cannot affect operational severity or trigger actions.
5. UI labels distinguish observed, inferred, simulated, unavailable, and settled states.
6. A reviewer examines security-sensitive changes and release notes disclose remaining limitations.
