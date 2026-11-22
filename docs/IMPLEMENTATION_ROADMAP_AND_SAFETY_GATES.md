# Implementation Roadmap and Safety Gates

Status: **engineering plan — not a claim that the listed integrations are implemented or approved**.

This roadmap keeps the application useful while payment, Pi platform, data, and external-agent integrations are verified. Re-check official platform documentation and the current repository before implementation.

## Release principles

- Keep payment, paid-agent, x402, and entitlement features disabled until their complete server-side flow is tested.
- Treat browser input, scanned URLs, external API responses, agent output, and imported files as untrusted.
- Never expose API keys, service-role keys, wallet secrets, or signing material to the client or repository.
- Prefer small, reviewable changes on feature branches; do not deploy automatically from documentation or scaffolding work.
- Label mock, estimated, and unverified information in the UI. Do not present a model output as a verified fact.

## Workstreams

### 1. App structure and reliability
- Inventory current routes, server actions, environment variables, and provider integrations before changing architecture.
- Keep privileged operations server-side; validate and normalize inputs at the boundary.
- Add request IDs, structured error handling, bounded timeouts, and safe retry behavior.
- Add tests for authentication boundaries, malformed inputs, provider failures, and disabled-feature behavior.

### 2. Pi platform integration
- Confirm current SDK/API behavior against official Pi Developer documentation before implementing or documenting it.
- Keep Pi authentication separate from payment authorization.
- For payments, require server-side approval and completion, durable order state, idempotency, recovery, and settlement read-back.
- Do not assume a fixed minimum payment, configurable network fee, or a particular fee field without authoritative current documentation and an end-to-end Testnet test.
- Keep Mainnet payment activation behind explicit approval and separate configuration.

### 3. Data and Supabase
- Use a new, separately named project only after the owner confirms the organization and region and any nonzero cost is approved.
- Design schema and migrations from actual application requirements; apply least privilege and row-level security.
- Keep service-role credentials server-only. Do not migrate or modify the existing Supabase project as a shortcut.
- Add retention, export, deletion, and privacy handling before collecting user data.

### 4. URL and file inspection
- Treat URL inspection as advisory, not a guarantee that a link is safe.
- Reject non-HTTP(S) schemes, credentials in URLs, localhost/private-network targets, and redirect chains that resolve to private addresses.
- Enforce response-size, redirect-count, and timeout limits; do not execute downloaded content.
- For uploaded files, enforce type/size limits, store privately, and avoid exposing raw contents in logs.

### 5. Agents, marketplace, and subscriptions
- Start with a catalog and explicit capability declarations; do not imply agents can transact or access private data by default.
- Require user confirmation for consequential actions and maintain an auditable action record.
- Keep subscriptions and entitlements off until durable billing records, idempotent webhooks, cancellation/refund handling, and access-revocation tests exist.
- Separate demo listings from available, reviewed, or paid listings.

### 6. Evidence-based research and monitoring
- Display source, timestamp, and confidence basis for claims; distinguish sourced facts, inference, and speculation.
- Avoid presenting conspiracy narratives or speculative maps as established facts. Include competing explanations and uncertainty.
- Make monitoring opt-in where it involves personal data; document what is collected and how long it is retained.

### 7. Readiness gates
- [ ] Repository inventory and environment-variable audit completed.
- [ ] Automated unit/integration tests pass.
- [ ] Authentication and authorization boundaries reviewed.
- [ ] URL/file inspection abuse cases tested.
- [ ] Privacy, retention, and RLS reviewed.
- [ ] Pi Testnet payment flow verified end-to-end, if payments are in scope.
- [ ] Production configuration and rollback plan reviewed.
- [ ] Owner reviews the final diff and approves deployment/submission.

## Current scope boundary

This document is a plan only. It does not assert that payment processing, fee routing, a transaction ledger, marketplace billing, URL scanning, file sharing, agent execution, PiOS listing, or Mainnet approval is currently operational. Keep unavailable features visibly disabled or clearly marked as prototypes until evidence is recorded.
