# Foresight Paths

Foresight Paths is a research workspace for source-attributed event mapping, competing-hypothesis analysis, and scenario exploration. It helps users inspect signals and distinguish reported observations from analyst interpretations.

## Current application

- Arabic-first, right-to-left interface with multiple locale options.
- Event and trajectory mapping, scenario timeline, map-based exploration, and analytical views.
- Deterministic scenario and trajectory calculations with optional server-side AI-assisted event analysis when configured.
- Global-sense endpoint consuming public USGS earthquake and NASA EONET hazard feeds.
- Source labels and timestamps for retrieved hazard records; feed coverage is explicitly partial.
- Pi SDK is loaded for available/future Pi Browser integration; SDK presence alone does not establish completed Pi authentication or payment functionality.

## Important limitations and safety

- Scenario probabilities and forecast projections are analytical outputs, not validated predictions.
- The map and analysis are research aids, not verified threat intelligence, emergency alerts, or evidence of causation.
- Symbolic, semiotic, or Q-related map overlays are interpretive material, not evidence of causal links or verified hidden infrastructure.
- Public hazard feeds are not a comprehensive global news or cyber-threat feed.
- Payment approval/completion, durable entitlements, rewarded-ad grants, paid x402 execution, and cloud-agent execution must remain disabled unless their end-to-end server-side flows are implemented, tested, and explicitly approved. See [Production Setup](docs/PRODUCTION_SETUP.md) and [Security and Evidence Gates](docs/SECURITY_AND_EVIDENCE_GATES.md).
- This repository does not claim Pi Network/PiOS approval, certification, or listing. PiOS license acceptance and app listing are separate decisions.
- Never expose secrets in client code or commit API keys, signing material, or other credentials.

## Development

Requirements: Node.js compatible with the installed Next.js version. Use the package manager and lockfile already present in the repository.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

The package scripts may not define a `test` command. Check `package.json` and the configured test runner before invoking `npm test`; do not treat a missing test script as a passing test suite.

Run lint, type-check, relevant tests, and build locally or in CI before merging code changes. Documentation-only changes do not establish that application code has passed these checks.

## Deployment

Production deployment is managed separately. See [Production Setup](docs/PRODUCTION_SETUP.md) for environment variables, safe defaults, smoke checks, and release gates. Preview deployment success is not production approval.

## Engineering plan and readiness

- [Implementation Roadmap and Safety Gates](docs/IMPLEMENTATION_ROADMAP_AND_SAFETY_GATES.md)
- [PiOS Readiness and Listing Checklist](docs/PIOS_READINESS_AND_LISTING_CHECKLIST.md)
- [Security and Evidence Gates](docs/SECURITY_AND_EVIDENCE_GATES.md)

These documents are planning and readiness materials, not certification, audit completion, or approval.

## Trademark

Pi, Pi Network, and the Pi logo are trademarks of the Pi Community Company. Use Pi marks only in accordance with applicable brand and trademark guidance.
