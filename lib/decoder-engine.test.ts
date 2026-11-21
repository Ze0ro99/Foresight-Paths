import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BENCHMARK_DECODER_TERMS,
  computeCoincidenceProbability,
  computeGematria,
  computeQClockProjection,
  computeVortexSequence,
  findGematriaCollisions,
} from './decoder-engine';

test('computeGematria matches exact values from the Q-Decoder 6-cipher benchmark table', () => {
  const q = computeGematria('Q');
  assert.equal(q.letterCount, 1);
  assert.equal(q.englishOrdinal, 17);
  assert.equal(q.reverseOrdinal, 10);
  assert.equal(q.fullReduction, 8);
  assert.equal(q.reverseFullReduction, 1);
  assert.equal(q.englishSumerian, 102);
  assert.equal(q.jewishLatin, 70);

  const pi = computeGematria('PI');
  assert.equal(pi.englishOrdinal, 25);
  assert.equal(pi.reverseOrdinal, 29);
  assert.equal(pi.fullReduction, 16);
  assert.equal(pi.reverseFullReduction, 11);
  assert.equal(pi.englishSumerian, 150);

  const nesara = computeGematria('NESARA');
  assert.equal(nesara.englishOrdinal, 58);
  assert.equal(nesara.reverseOrdinal, 104);
  assert.equal(nesara.fullReduction, 22);
  assert.equal(nesara.reverseFullReduction, 41);
  assert.equal(nesara.englishSumerian, 348);

  const swift = computeGematria('SWIFT');
  assert.equal(swift.englishOrdinal, 77);
  assert.equal(swift.reverseOrdinal, 58);
  assert.equal(swift.ordinalSumCheck, 27 * 5);

  const iso = computeGematria('ISO');
  assert.equal(iso.englishOrdinal, 43);
  assert.equal(iso.fullReduction, 16);

  const trump = computeGematria('DONALD TRUMP');
  assert.equal(trump.letterCount, 11);
  assert.equal(trump.englishOrdinal, 138);
  assert.equal(trump.reverseOrdinal, 159);
  assert.equal(trump.fullReduction, 48);
  assert.equal(trump.reverseFullReduction, 60);
  assert.equal(trump.englishSumerian, 828);
});

test('findGematriaCollisions automatically detects cross-cipher overlaps like NESARA=SWIFT=58 and PI=ISO=16', () => {
  const collisions = findGematriaCollisions(BENCHMARK_DECODER_TERMS);
  assert.ok(
    collisions.some(
      (c) =>
        c.value === 58 &&
        ((c.termA === 'NESARA' && c.termB === 'SWIFT') ||
          (c.termA === 'SWIFT' && c.termB === 'NESARA'))
    )
  );
  assert.ok(
    collisions.some(
      (c) =>
        c.value === 16 &&
        ((c.termA === 'PI' && c.termB === 'ISO') ||
          (c.termA === 'ISO' && c.termB === 'PI'))
    )
  );
});

test('computeCoincidenceProbability confirms ~99.983% match probability for 6 ciphers x 50 words x 10 targets', () => {
  const stats = computeCoincidenceProbability(6, 50, 10, 350);
  assert.equal(stats.trials, 300);
  assert.ok(stats.matchProbabilityPct >= 99.98 && stats.matchProbabilityPct <= 99.99);
});

test('computeQClockProjection computes 6-degree sectors and 180-degree opposite projections', () => {
  const p = computeQClockProjection(17);
  assert.equal(p.sector, 17);
  assert.equal(p.angleDeg, 102);
  assert.equal(p.oppositeSector, 47);
  assert.equal(p.radialMatchOffset, 77);
});

test('computeVortexSequence produces repeating Tesla 1-2-4-8-7-5 cycle for powers of 2', () => {
  const seq = computeVortexSequence(8);
  assert.deepEqual(
    seq.map((s) => s.digitalRoot),
    [1, 2, 4, 8, 7, 5, 1, 2]
  );
});
