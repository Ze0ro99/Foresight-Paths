# Evidence and Decoding Policy

## Purpose

This policy governs how the Observatory stores, maps, and explains material from symbolic diagrams, coded-narrative charts, cover art, OSINT reports, and live sensor feeds. It supports investigation without presenting an interpretation as an established event.

## Artifact records

Every uploaded or referenced artifact must have:
- A stable artifact ID and user-provided or publicly verifiable source reference.
- Title or short description, creator/publisher when visible, publication date when known, and capture/upload date.
- Visible text and visual elements separated from analyst interpretation.
- Provenance: user-supplied, retrieved from a public source, or independently verified.
- A content hash only when the application actually computes it; never claim a hash or verification that has not occurred.

## Evidence tiers

Use the existing EpistemicTier vocabulary consistently:
- documented: directly supported by a cited primary source or independently corroborated records. This tier applies only to the narrow claim supported by that evidence.
- plausible: a reasoned interpretation with some supporting evidence but material uncertainty.
- disputed: evidence or credible interpretations conflict.
- speculative: an unverified hypothesis, prediction, or claimed hidden connection.
- symbolic: a reading of imagery, numerology, placement, metaphor, or alleged code. It is not evidence that the depicted or inferred event occurred.

A source's existence can be documented while its claims remain disputed, speculative, or symbolic. Do not assign one tier to an entire artifact when individual claims differ.

## Separation of layers

1. Observed event layer: timestamped event records from identified feeds, with source URL, source publication time, retrieval time, location precision, and source-specific confidence.
2. Artifact layer: the image or diagram and a transcription of visible elements. Unknown text must remain marked as unreadable or uncertain.
3. Interpretation layer: analyst-authored readings linked to the exact artifact element, with author, method, rationale, alternatives, and evidence tier.
4. Correlation layer: candidate relationships between an event and an interpretation. Show the basis and limitations; do not call proximity, shared keywords, numerology, or a computed score proof of causation or prediction.

Keep these layers independently filterable on the map and in search results.

## Required safeguards

- Never invent event timestamps, coordinates, source citations, sensor readings, or verification status.
- Do not geocode a symbolic element to a precise location unless the artifact or a cited source supports it. Otherwise mark it as an approximate analyst association or leave it unmapped.
- Distinguish a real-world place mentioned in an artifact from a claim that an event occurred there.
- A numerical score derived from a chosen formula is a model output, not an observed fact. Display its formula, inputs, and a plain-language limitation.
- Do not infer intent, coordination, identity, or causation from visual resemblance alone.
- Present a counter-reading or falsification question for each major interpretation.
- Use neutral language: “the chart claims,” “the image depicts,” and “this interpretation proposes,” rather than stating unverified claims as fact.
- Label forecasts as forecasts, include their time horizon and assumptions, and record outcomes for later evaluation.

## Initial analysis of the two user-provided images

### Artifact A — The World Ahead 2027

Visible content includes the masthead “The Economist,” the title “THE WORLD AHEAD 2027,” and a collage of political, military, technological, financial, and environmental imagery. The visible subtitle references themes including Trump, artificial intelligence, Iran, climate change, populism, and Hollywood.

The image may be indexed by visible motifs and mapped to broad topics for exploration. A motif does not establish that a depicted event will happen. Any interpretation must cite the specific visual element and be marked symbolic or speculative unless independent evidence supports a narrower factual claim.

### Artifact B — Great Awakening / Disclosure diagram

The diagram visibly contains labels such as “GREAT SOLAR FLASH,” “GREAT AWAKENING,” “ONE INFINITE CREATOR,” “Q ANON,” “SECRET SPACE PROGRAM,” “DISCLOSURE,” “QHHT,” “ANCIENT BUILDER RACE,” and many other linked terms. This is a dense narrative/concept map, not a verified event ledger.

The application may transcribe, search, cluster, and visualize its claims as claims made by the diagram. Connections drawn within the diagram must not be treated as independently established relationships. Individual historical, scientific, or current-event claims require separate, reputable sourcing before receiving a documented tier.

## Acceptance checklist

- [ ] Artifact, transcription, interpretation, event, and correlation have distinct record types or clearly separated fields.
- [ ] Every mapped event displays its source and event/retrieval timestamps.
- [ ] Every symbolic interpretation links to an artifact and a specific visible element.
- [ ] Map filters can hide interpretations and show only documented events.
- [ ] No symbolic node is labelled “verified infrastructure fact” unless that exact statement has a supporting citation.
- [ ] Correlation scores are described as exploratory model outputs and never as proof.
- [ ] Missing sources, uncertain transcription, and approximate coordinates are visible to users.
