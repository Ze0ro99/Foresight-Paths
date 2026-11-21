import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeThreatAndGenerateBundle,
  computeFeeEconomicsStrategies,
  MICRO_SUBSCRIPTION_PI,
  PI_MAINNET_BASE_FEE,
} from './pi-ecosystem-engine';

test('computeFeeEconomicsStrategies quantifies 100x direct fee vs batch-settlement savings', () => {
  const strategies = computeFeeEconomicsStrategies();
  assert.equal(PI_MAINNET_BASE_FEE / MICRO_SUBSCRIPTION_PI, 100);
  assert.equal(strategies[0].effectiveGasRatioPct, 99);
  assert.ok(strategies.some((s) => s.id === 'x402-batch' && s.effectiveGasRatioPct <= 10));
  assert.ok(strategies.some((s) => s.id === 'pirc2-allowance'));
});

test('analyzeThreatAndGenerateBundle generates valid MCP, SoloHost, and Soroban PiRC2 artifacts with PiRC-203 pricing', () => {
  const bundle = analyzeThreatAndGenerateBundle({
    title: 'PHP2Shell Critical Gateway Exploit',
    threatCategory: 'web_exploit',
    severity: 9,
    probabilityPct: 75,
    dependencyFactor: 8,
    estimatedUsdCost: 1200,
    piUsdMedianPrice: 0.6,
    oracleSpreadPct: 2.1,
  });

  assert.equal(bundle.riskLevel, 'critical');
  assert.equal(bundle.oracleStatus, 'healthy');
  assert.ok(bundle.estimatedPiCost > 2000);
  assert.ok(bundle.precautionarySteps.length >= 3);
  assert.ok(bundle.mcpAgentCode.includes('server.paidTool'));
  assert.ok(bundle.mcpAgentCode.includes('withX402Client'));
  assert.ok(bundle.sorobanContractCode.includes('authorize_pirc2'));
  assert.ok(bundle.sorobanContractCode.includes('trigger_pirc254_breaker'));
  assert.ok(bundle.soloHostManifest.includes('solohost.pi.agent/v1'));
  assert.ok(bundle.subscriptionSpecJson.includes('batch-settlement'));
});

test('analyzeThreatAndGenerateBundle triggers spread_warning when PiRC-203 oracle spread exceeds 4.5%', () => {
  const bundle = analyzeThreatAndGenerateBundle({
    title: 'Oracle Spread Shock',
    threatCategory: 'payment_liquidity',
    severity: 7,
    probabilityPct: 60,
    dependencyFactor: 6,
    estimatedUsdCost: 500,
    piUsdMedianPrice: 0.5,
    oracleSpreadPct: 6.2,
  });

  assert.equal(bundle.oracleStatus, 'spread_warning');
  assert.ok(bundle.sorobanContractCode.includes('circuit_halted: true'));
});
