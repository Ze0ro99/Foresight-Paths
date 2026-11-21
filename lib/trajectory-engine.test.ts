import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PI_CONST,
  buildDeterministicEventAnalysis,
  buildFullScenarioDossier,
  buildTrajectoryGraph,
  computeGeodesicArcs,
  computeGreatCircleKm,
  computePiTrajectoryMetrics,
  computePlatformImpactMatrix,
  computeScenarioProbabilities,
  evaluateACHMatrix,
  generateFilmBeatFromEvent,
  generateNextForecasts,
  validateEventInput,
} from './trajectory-engine';
import { SEED_EVENTS, SEMIOTIC_MARKERS } from './seed-data';

test('computeScenarioProbabilities always normalizes to 100 and reflects OSINT reliability', () => {
  const baseline = computeScenarioProbabilities([]);
  assert.equal(
    baseline.adaptation + baseline.fragmentation + baseline.fragility,
    100
  );

  const seedProbs = computeScenarioProbabilities(SEED_EVENTS);
  assert.equal(
    seedProbs.adaptation + seedProbs.fragmentation + seedProbs.fragility,
    100
  );
  assert.ok(seedProbs.resilienceIndex >= 18 && seedProbs.resilienceIndex <= 94);

  const lowRelEvent = buildDeterministicEventAnalysis(
    {
      title: 'شائعة مجهولة المصدر',
      summary: 'ادعاء غير موثق بتوقف جميع الشبكات العالمية.',
      sector: 'media',
      track: 'semiotics',
      threatMechanism: 'narrative_swarm',
      platformLayer: 'social_swarm',
      city: 'نيويورك',
      lat: 40.7128,
      lng: -74.006,
      sourceName: 'حساب مجهول',
      reliabilityGrade: 'D4',
      spofNode: 'منصة تواصل',
      parentEventId: null,
      marketImpactBps: 100,
      latencySpikeMs: 0,
      disinfoVelocity: 95,
    },
    1,
    5
  );
  const highRelEvent = { ...lowRelEvent, reliabilityGrade: 'A1' as const };

  const lowProbs = computeScenarioProbabilities([lowRelEvent]);
  const highProbs = computeScenarioProbabilities([highRelEvent]);
  assert.ok(highProbs.contagionRiskBps > lowProbs.contagionRiskBps);
  assert.equal(lowRelEvent.platformLayer, 'social_swarm');
  assert.equal(lowRelEvent.coordinates.city, 'نيويورك');
});

test('computePiTrajectoryMetrics uses Pi (3.14159...) and produces valid bounded equations & forecasts', () => {
  const probs = computeScenarioProbabilities(SEED_EVENTS.slice(0, 4));
  const metrics = computePiTrajectoryMetrics(
    SEED_EVENTS.slice(0, 4),
    SEMIOTIC_MARKERS,
    probs
  );

  assert.equal(metrics.piConstant, Number(PI_CONST.toFixed(6)));
  assert.ok(metrics.piPhaseHarmonic > 0 && metrics.piPhaseHarmonic <= 3.14);
  assert.ok(metrics.entropyBasePi > 0 && metrics.entropyBasePi <= 1.2);
  assert.ok(metrics.crossMapResonance > 0);
  assert.ok(metrics.totalGeodesicSpanKm > 0);
  assert.equal(metrics.equationSteps.length, 4);

  const forecasts = generateNextForecasts(
    SEED_EVENTS.slice(0, 4),
    probs,
    metrics
  );
  assert.equal(forecasts.length, 3);
  const forecastSum = forecasts.reduce((s, f) => s + f.probability, 0);
  assert.equal(forecastSum, 100);
  for (const fc of forecasts) {
    assert.ok(fc.projectedCoords.city.length > 0);
    assert.ok(Math.abs(fc.projectedCoords.lat) <= 90);
    assert.ok(Math.abs(fc.projectedCoords.lng) <= 180);
  }
});

test('computeGreatCircleKm and computeGeodesicArcs accurately calculate spherical spans', () => {
  assert.equal(computeGreatCircleKm(50.1109, 8.6821, 50.1109, 8.6821), 0);

  // Frankfurt -> Suez is roughly ~2950 to 3150 km
  const frankfurtToSuez = computeGreatCircleKm(
    50.1109,
    8.6821,
    29.9668,
    32.5498
  );
  assert.ok(frankfurtToSuez > 2900 && frankfurtToSuez < 3200);

  const arcs = computeGeodesicArcs(SEED_EVENTS, 'ev-02');
  assert.equal(arcs.length, SEED_EVENTS.length - 1);
  assert.ok(arcs.some((a) => a.highlighted));
  for (const arc of arcs) {
    assert.ok(arc.distanceKm > 0);
    assert.ok(arc.piPropagationIndex >= 0);
  }
});

test('computePlatformImpactMatrix aggregates all 5 platform layers cleanly', () => {
  const matrix = computePlatformImpactMatrix(SEED_EVENTS);
  assert.equal(matrix.length, 5);
  for (const layer of matrix) {
    assert.ok(layer.pressurePct >= 12 && layer.pressurePct <= 98);
    assert.ok(layer.label.length > 0);
  }
  const totalEventsInMatrix = matrix.reduce((s, l) => s + l.eventCount, 0);
  assert.equal(totalEventsInMatrix, SEED_EVENTS.length);
});

test('evaluateACHMatrix ranks hypothesis with LOWEST falsification score first', () => {
  const ranking = evaluateACHMatrix(SEED_EVENTS);
  assert.equal(ranking.length, 4);
  assert.equal(ranking[0].isMostLikely, true);
  assert.equal(ranking[0].rank, 1);
  for (let i = 1; i < ranking.length; i++) {
    assert.ok(ranking[i].falsificationScore >= ranking[i - 1].falsificationScore);
  }
  assert.equal(ranking[0].id, 'human_error');
});

test('buildTrajectoryGraph constructs causal edges, SPOFs, scenarios, and forecast horizon nodes', () => {
  const subset = SEED_EVENTS.slice(0, 4);
  const probs = computeScenarioProbabilities(subset);
  const metrics = computePiTrajectoryMetrics(subset, SEMIOTIC_MARKERS, probs);
  const forecasts = generateNextForecasts(subset, probs, metrics);

  const graph = buildTrajectoryGraph(subset, 'ev-02', forecasts);
  const scenarioNodes = graph.nodes.filter((n) => n.kind === 'scenario');
  const forecastNodes = graph.nodes.filter((n) => n.kind === 'forecast');
  const eventNodes = graph.nodes.filter((n) => n.kind === 'event');
  const spofNodes = graph.nodes.filter((n) => n.kind === 'spof');

  assert.equal(scenarioNodes.length, 3);
  assert.equal(forecastNodes.length, 3);
  assert.equal(eventNodes.length, subset.length);
  assert.ok(spofNodes.length >= 1);

  const causalEdges = graph.edges.filter((e) => e.kind === 'causal');
  assert.equal(causalEdges.length, subset.length - 1);
});

test('validateEventInput rejects incomplete event forms', () => {
  const emptyResult = validateEventInput({
    title: '',
    summary: 'قصير',
    sourceName: '',
    spofNode: '',
  });
  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.errors.title);
  assert.ok(emptyResult.errors.summary);
  assert.ok(emptyResult.errors.sourceName);
  assert.ok(emptyResult.errors.spofNode);

  const validResult = validateEventInput({
    title: 'انقطاع كابل بحري في البحر الأحمر',
    summary: 'انخفاض السعة الدولية بنسبة 18% مع تحويل حركة المرور عبر مسارات بديلة.',
    sourceName: 'سجلات مشغلي الكابلات الدولية',
    spofNode: 'ممر الكابلات البحرية Suez-RedSea',
  });
  assert.equal(validResult.valid, true);
});

test('generateFilmBeatFromEvent assigns Acts I/II/III and preserves grounded details', () => {
  const probs = computeScenarioProbabilities(SEED_EVENTS.slice(0, 3));
  const beat = generateFilmBeatFromEvent(SEED_EVENTS[2], probs, 3);
  assert.equal(beat.act, 'II');
  assert.equal(beat.linkedEventId, 'ev-03');
  assert.ok(beat.groundedReality.includes('B2'));
});

test('buildFullScenarioDossier constructs complete 3-stage scenario for both news events and forecasts', () => {
  const subset = SEED_EVENTS.slice(0, 4);
  const probs = computeScenarioProbabilities(subset);
  const metrics = computePiTrajectoryMetrics(subset, SEMIOTIC_MARKERS, probs);
  const forecasts = generateNextForecasts(subset, probs, metrics);
  const rankings = evaluateACHMatrix(subset);

  const eventDossier = buildFullScenarioDossier(
    { kind: 'event', id: 'ev-02' },
    subset,
    forecasts,
    probs,
    rankings,
    metrics
  );
  assert.ok(eventDossier);
  assert.equal(eventDossier.kind, 'event');
  assert.equal(eventDossier.stages.length, 3);
  assert.ok(eventDossier.filmScene.dialogueExcerpt.length > 10);

  const forecastDossier = buildFullScenarioDossier(
    { kind: 'forecast', id: forecasts[0].id },
    subset,
    forecasts,
    probs,
    rankings,
    metrics
  );
  assert.ok(forecastDossier);
  assert.equal(forecastDossier.kind, 'forecast');
  assert.equal(forecastDossier.stages.length, 3);
  assert.equal(forecastDossier.filmScene.act, 'III');
});
