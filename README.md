# Foresight Paths Observatory

Research workspace for exploring digital-infrastructure risks, scenario trajectories, and source-attributed global hazard signals. The interface includes Arabic-first localization, a scenario timeline, map-based exploration, and analytical views.

## Current implementation

- Next.js App Router, React, and TypeScript.
- Deterministic scenario and trajectory calculations with optional AI-assisted event analysis.
- Global-sense endpoint consuming public USGS earthquake and NASA EONET hazard feeds.
- Source labels and timestamps for retrieved hazard records; feed coverage is explicitly partial.
- Arabic-first UI with multiple locale options.

## Important limitations

- Scenario probabilities and forecast projections are analytical outputs, not validated predictions.
- Symbolic, semiotic, or Q-related map overlays are interpretive material, not evidence of causal links or verified hidden infrastructure.
- Public hazard feeds are not a comprehensive global news or cyber-threat feed.
- Payment, subscription, entitlement, and paid-agent functionality must remain disabled unless their end-to-end server-side flows are implemented, tested, and explicitly approved.
- Do not enter secrets into the client or commit them to this repository.

## Development

Install dependencies with the package manager and lockfile used by the repository, then run:

```bash
npm run dev
npm run lint
npm run build
```

Run lint and build locally or in CI before merging code changes. Documentation-only changes do not establish that application code has passed these checks.

## Engineering plan

See [Implementation Roadmap and Safety Gates](docs/IMPLEMENTATION_ROADMAP_AND_SAFETY_GATES.md) and the [PiOS Readiness and Listing Checklist](docs/PIOS_READINESS_AND_LISTING_CHECKLIST.md). These documents are preparation materials, not certification or approval.
