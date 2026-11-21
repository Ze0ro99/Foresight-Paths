# Security and Evidence Gates

Status: engineering audit; no production-readiness claim.

This document records implementation blockers found during source review. It is not a substitute for runtime tests, an independent security audit, or official Pi platform documentation.

## Cloud agent endpoint

File: `app/api/cloud-agent/run/route.ts`

### Findings

1. The endpoint accepts `activeSignals` from the request body and uses them to calculate a composite risk score. A caller can therefore submit fabricated or malformed telemetry unless the server validates and independently sources it.
2. The route computes `txHash` from local SHA-256 input and returns it under an `x402Settlement` object. This is not a chain transaction hash and does not demonstrate x402 verification, settlement, or payment.
3. The response labels execution as `cloud_serverless_no_pc`, while the code only shows that this API handler ran. It does not establish a SoloHost execution or distributed agent run.
4. The current risk formula combines event magnitude with a symbolic coupling score. No calibration, validation dataset, or uncertainty interval is established. It must not be presented as an operationally validated probability or threat score.
5. Prompt content includes client-provided signals and symbolic correlations. Those values must be treated as untrusted input, not evidence.

### Required remediation before any paid or operational use

- Fetch eligible signals server-side from allowlisted source adapters; validate source, timestamp, coordinate ranges, schema, freshness, and duplicate IDs.
- Keep symbolic decoding in a separate opt-in analysis layer. It must not change a factual event's severity, operational risk score, payment eligibility, or recommended emergency action.
- Replace the synthetic settlement object with an explicit non-settled state until a real, server-verified payment provider integration is implemented. Never label a locally generated digest as a transaction hash.
- Distinguish API execution from SoloHost execution in the response contract and UI.
- Return a transparent, explainable heuristic only when inputs and formula are documented; otherwise return “not assessed.” Do not imply calibrated probability.
- Add request limits, schema validation, authorization for privileged actions, idempotency, audit logging, and tests for malicious client payloads.

## Evidence and map presentation

- A source record and its timestamp/coordinates are factual data only to the extent supported by that source.
- Geographic proximity, gematria, π-based arithmetic, Q-Clock alignment, or visual adjacency are not evidence of causation, coordination, prediction, or threat severity.
- Narrative-map items must remain explicitly attributed interpretations and be visually separable from observed events.
- “Documented” must describe the cited claim, not automatically validate every inference attached to it.
- Keep the original artifact, its source, capture date, transcription/translation notes, and analyst interpretation as separate fields.

## Release gates

Do not mark the affected functionality production-ready until:

1. Server-side source validation and client-payload tampering tests pass.
2. Payment state is backed by a verified provider response and read-back; no fabricated transaction identifiers remain.
3. Symbolic fields cannot affect operational severity or trigger actions.
4. UI labels distinguish observed, inferred, simulated, and settled states.
5. Build, typecheck, unit tests, and integration tests pass in CI.
6. A reviewer examines the security-sensitive changes and the release notes disclose remaining limitations.
