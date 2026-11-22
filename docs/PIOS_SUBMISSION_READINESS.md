# PiOS Submission Readiness

Status: **preparation only — not submitted, approved, certified, or listed**.

This checklist records what is known from the repository and the official PiOS instructions. It is not a guarantee of acceptance.

## Proposed PiOS App List entry

| Field | Proposed value |
|---|---|
| Title | Foresight Paths |
| Description | A research workspace for source-attributed event mapping, competing-hypothesis analysis, and scenario exploration, with clear separation between observed reports and analyst interpretations. |
| Category | Ecosystem Tools (proposed; PiOS maintainers may request a different category) |
| Programming language / framework | TypeScript, React, Next.js |
| Repository | https://github.com/Ze0ro99/Foresight-Paths |
| Pi Brainstorm proposal | **Required for the PiOS submission process; provide the project link before submitting.** |
| Testnet app | Not supplied / not verified |
| Mainnet app | Not supplied / not verified |

The app title avoids the “Pi [name]” pattern. Include this exact trademark notice in the application code:

> Pi, Pi Network and the Pi logo are trademarks of the Pi Community Company.

## PiOS submission steps

1. Review the official [PiOS repository instructions](https://github.com/pi-apps/PiOS) and current [PiOS App List](https://github.com/pi-apps/PiOS/blob/main/list.md).
2. Confirm the proposed title, description, category, stack, and the required Pi Brainstorm proposal link.
3. Decide whether to adopt the PiOS license. The PiOS repository states that listing requires its license without alteration except for the copyright notice. **No license has been added here** because the copyright holder/year and the developer's license decision have not been confirmed.
4. If adopting it, copy the official license verbatim from the PiOS repository and replace only its copyright line with the correct holder/year. Review the license carefully; it restricts use to developing, using, and marketing applications for the official Pi Network.
5. Submit a pull request to the PiOS App List using its required row format. The PiOS maintainers review and decide whether to accept it; listing is not automatic.
6. Add Testnet/Mainnet app links only after those app environments exist and have been verified.

## Readiness and evidence gates

- [ ] Pi Brainstorm proposal link supplied.
- [ ] Owner confirms PiOS license adoption and the exact copyright holder/year.
- [ ] Pi SDK authentication is tested in Pi Browser, including server-side verification; loading the SDK script alone is not proof.
- [ ] Any Pi payment flow is tested end-to-end on Testnet with server-side approval/completion and durable, idempotent order/entitlement handling. Current repository docs state payments are disabled by default and the durable entitlement ledger is not implemented.
- [ ] Mainnet readiness and any Pi Ecosystem listing requirements are checked against current official documentation.
- [ ] A real privacy policy is published at a dedicated, accurate URL and reflects actual data collection, processing, retention, and deletion. Do not use the app homepage as a privacy-policy URL unless it actually contains the policy.
- [ ] The deployed app is tested in Pi Browser and all listing fields accurately describe its current behavior.

## Official references

- [PiOS repository and license/listing instructions](https://github.com/pi-apps/PiOS)
- [PiOS App List format](https://github.com/pi-apps/PiOS/blob/main/list.md)
- [Pi developer documentation](https://developers.minepi.com/docs)
- [Register an app](https://developers.minepi.com/docs/build-first-app/RegisterApp)
- [Production app access and domain validation](https://developers.minepi.com/docs/build-first-app/Production)
- [Mainnet listing requirements](https://pi-apps.github.io/pi-sdk-docs/getting-started/MainnetListing)

## Repository-specific release constraints

The existing [Production Setup](PRODUCTION_SETUP.md) and [Security and Evidence Gates](SECURITY_AND_EVIDENCE_GATES.md) remain authoritative for current project limitations. Keep payments, rewarded-ad grants, paid x402 execution, and cloud-agent execution disabled until their documented release gates are satisfied. Do not describe research interpretations as verified events, predictions, or emergency alerts.
