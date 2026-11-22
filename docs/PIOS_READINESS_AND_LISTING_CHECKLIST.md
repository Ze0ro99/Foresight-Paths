# PiOS Readiness and Ecosystem Listing Checklist

Status: **preparation only — not a PiOS registration, listing approval, or production certification**.

Repository: https://github.com/Ze0ro99/Foresight-Paths  
Production URL previously recorded for this project: https://foresight-paths-observatory.vercel.app

This checklist is based on the official Pi Developer documentation and PiOS repository guidance. Re-check those sources before submitting because requirements can change.

## 1. PiOS license and registry submission

PiOS is a distinct software license, not a generic “open-source” badge. The official PiOS guidance says projects listed in the PiOS app list must use the PiOS license **without alterations other than the copyright notice**. It also directs developers to submit a pull request to the PiOS app-list repository with the required project information. Inclusion is subject to review and approval.

Before changing this repository's license:
- Review the complete official PiOS license and its disclaimer.
- Confirm that the owner accepts its Pi-Ecosystem-only use terms and any legal consequences; obtain legal advice if needed.
- If accepted, copy the canonical license verbatim from the official PiOS repository and change only its copyright notice. Do not paraphrase or modify the license.
- Add the required Pi trademark notice to the application code as directed by the official PiOS instructions: “Pi, Pi Network and the Pi logo are trademarks of the Pi Community Company.”
- Keep the source repository public and ensure the source and project description accurately represent the app.

Required PiOS app-list PR information:
- Category (propose a new category in the PR if needed)
- App title (not “Pi [App Name]”; avoid implying the app was developed by Pi Core Team)
- Short, accurate description
- Programming languages and frameworks
- Link to the Pi Brainstorm project proposal (or project name until the relevant feature is available)

The PiOS repository says its team fills in the repository link after approval; Testnet and Mainnet app links can be submitted later when available. A PR is a request for review, not an approval.

Official PiOS instructions: https://github.com/pi-apps/PiOS  
Official license text: https://github.com/pi-apps/PiOS/blob/main/LICENSE  
PiOS app list: https://github.com/pi-apps/PiOS/blob/main/list.md

## 2. Pi Developer Portal / SDK release gates

- [ ] Confirm the registered app network (Testnet or Mainnet); the network cannot be switched on an existing portal app.
- [ ] Confirm the production HTTPS URL and keep the portal's validation-key file reachable at the domain root.
- [ ] Include and initialize the official Pi SDK on pages that use it.
- [ ] Use Pi authentication only for app login; verify the access token server-side with the official Platform API.
- [ ] For payments, complete the official server-side approval/completion flow and verify settlement by reading the payment back.
- [ ] Keep API keys and wallet secrets server-side; never commit secrets.
- [ ] Complete an end-to-end Testnet transaction before requesting production payment activation.
- [ ] Do not claim payment/entitlement readiness until durable order records, idempotency, recovery, and entitlement delivery are implemented and tested.
- [ ] Do not enable Mainnet payment features until separately registered/approved and explicitly authorized by the owner.
- [ ] Test the app inside Pi Browser and document supported/unsupported features.

## 3. Mainnet Ecosystem listing checks

The official listing guidance calls for a fully functional, professional app; developer KYC; Pi authentication only; Pi-only transactions; no unnecessary personal-data collection; and no unnecessary redirection to external sites. The app must provide meaningful in-ecosystem utility and follow Pi trademark guidance.

Before making listing claims:
- [ ] Verify every interactive feature and remove or clearly mark nonfunctional/demo features.
- [ ] Review app name, domain, visuals, and copy for trademark compliance.
- [ ] Verify login, payment, and any reward flows end to end in the applicable environment.
- [ ] Publish real Privacy Policy and Terms pages; do not use the homepage as a substitute unless it contains the complete, accurate policies.
- [ ] Confirm developer KYC and any portal-specific review items directly in the Developer Portal.
- [ ] Keep a dated test/evidence record and describe limitations accurately.

## 4. Known repository release constraints

The repository's existing engineering notes identify the following as not yet release-ready: durable order/entitlement ledger; end-to-end Testnet payment validation; verified rewarded-ad provider callback; trusted x402 facilitator and settlement verification; automated security/payment tests; rate limits and abuse controls; and privacy/retention review.

Current fail-closed behavior should remain in place until the corresponding implementation and evidence are complete. Do not describe these disabled integrations as live.

## 5. Submission packet to complete

- [ ] Owner-approved app title, category, and final description
- [ ] Public repository URL
- [ ] Programming languages/frameworks verified against the current codebase
- [ ] Pi Brainstorm proposal URL or project name
- [ ] Owner-approved PiOS license decision and exact canonical license file, if accepted
- [ ] Trademark notice in the application code
- [ ] Testnet app URL and test evidence, when available
- [ ] Mainnet app URL and approval evidence, when available
- [ ] Privacy Policy and Terms URLs
- [ ] PiOS app-list PR reviewed by the owner before submission

## Official references

- PiOS license and registry overview: https://developers.minepi.com/docs/concepts/License
- PiOS repository submission instructions: https://github.com/pi-apps/PiOS
- Pi SDK getting started: https://developers.minepi.com/docs/build-first-app/GettingStarted
- App registration: https://developers.minepi.com/docs/build-first-app/RegisterApp
- Mainnet listing requirements: https://developers.minepi.com/docs/build-first-app/MainnetListing
- Production access and domain validation: https://developers.minepi.com/docs/build-first-app/Production
- Mainnet launch steps: https://developers.minepi.com/docs/build-first-app/Launch
