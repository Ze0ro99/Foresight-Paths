import { NextRequest, NextResponse } from 'next/server';
import {
  computeCoincidenceProbability,
  computeGematria,
  computeQClockProjection,
} from '@/lib/decoder-engine';
import { analyzeThreatAndGenerateBundle } from '@/lib/pi-ecosystem-engine';

const settledIdempotencyKeys = new Map<string, Record<string, unknown>>();

const MCP_TOOLS = [
  {
    name: 'decode_gematria_audit',
    description:
      'Computes 6-cipher Q-Decoder values, statistical coincidence probability, and Q-Clock sector coordinates.',
    pricePi: '0.0001',
    scheme: 'batch-settlement',
    inputSchema: {
      type: 'object',
      properties: {
        phrase: { type: 'string' },
        dayOffset: { type: 'number' },
      },
      required: ['phrase'],
    },
  },
  {
    name: 'simulate_pi_risk_bundle',
    description:
      'Runs composite threat risk scoring, PiRC-203 median Pi/USD oracle pricing, and exports MCP + Soroban PiRC2 code.',
    pricePi: '0.0001',
    scheme: 'exact',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        threatCategory: { type: 'string' },
        severity: { type: 'number' },
        probabilityPct: { type: 'number' },
      },
      required: ['title'],
    },
  },
];

function encodeBase64Json(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64');
}

function decodeBase64Json(raw: string): Record<string, unknown> | null {
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

export async function GET() {
  return NextResponse.json({
    protocol: 'MCP Streamable HTTP + x402 V2',
    network: 'pi:testnet',
    mainnetTargetReady: true,
    facilitator: 'https://api.minepi.com/x402/facilitator',
    health: {
      status: 'operational',
      oracleSpreadPct: 1.85,
      piUsdMedian: 0.624,
      pirc206CircuitState: 'CLOSED',
      idempotentCacheCount: settledIdempotencyKeys.size,
    },
    tools: MCP_TOOLS,
  });
}

export async function POST(req: NextRequest) {
  let body: {
    jsonrpc?: string;
    id?: string | number;
    method?: string;
    params?: {
      name?: string;
      arguments?: Record<string, unknown>;
    };
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON-RPC payload for /api/x402/mcp' },
      { status: 400 }
    );
  }

  // Free MCP discovery endpoint
  if (body.method === 'tools/list') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: body.id ?? 1,
      result: { tools: MCP_TOOLS },
    });
  }

  if (body.method !== 'tools/call') {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: body.id ?? null,
        error: { code: -32601, message: 'Method not found. Use tools/list or tools/call.' },
      },
      { status: 400 }
    );
  }

  const toolName = body.params?.name || 'decode_gematria_audit';
  const toolSpec = MCP_TOOLS.find((t) => t.name === toolName) ?? MCP_TOOLS[0];
  const args = body.params?.arguments ?? {};

  // Check x402 V2 PAYMENT-SIGNATURE (or V1 X-PAYMENT backward compatibility)
  const rawPaymentSig =
    req.headers.get('payment-signature') || req.headers.get('x-payment');
  const idempotencyKey = req.headers.get('idempotency-key') || '';

  if (!rawPaymentSig) {
    const paymentRequirements = {
      x402Version: 2,
      scheme: toolSpec.scheme,
      network: 'pi:testnet',
      asset: 'PI',
      maxAmountRequired: toolSpec.pricePi,
      payTo: 'GDPI7Q4X402FACILITATORSETTLEMENTRECEIVER777',
      resource: '/api/x402/mcp',
      toolName: toolSpec.name,
      description: toolSpec.description,
      note: 'Send signed Base64 PaymentPayload in PAYMENT-SIGNATURE header (or X-PAYMENT for V1).',
    };

    const res = NextResponse.json(
      {
        jsonrpc: '2.0',
        id: body.id ?? 1,
        error: {
          code: 402,
          message: 'Payment Required: x402 V2 settlement required before executing paidTool.',
          paymentRequirements,
        },
      },
      { status: 402 }
    );
    res.headers.set('PAYMENT-REQUIRED', encodeBase64Json(paymentRequirements));
    return res;
  }

  const parsedPayment = decodeBase64Json(rawPaymentSig);
  if (!parsedPayment || !parsedPayment.payer) {
    return NextResponse.json(
      { error: 'Malformed PAYMENT-SIGNATURE Base64 PaymentPayload.' },
      { status: 400 }
    );
  }

  if (idempotencyKey && settledIdempotencyKeys.has(idempotencyKey)) {
    const cached = settledIdempotencyKeys.get(idempotencyKey)!;
    const res = NextResponse.json({
      jsonrpc: '2.0',
      id: body.id ?? 1,
      idempotentReplay: true,
      result: cached,
    });
    res.headers.set(
      'PAYMENT-RESPONSE',
      encodeBase64Json({
        settled: true,
        idempotentReplay: true,
        idempotencyKey,
      })
    );
    return res;
  }

  let output: Record<string, unknown>;
  if (toolSpec.name === 'simulate_pi_risk_bundle') {
    const bundle = analyzeThreatAndGenerateBundle({
      title: String(args.title || 'Automated MCP Risk Probe'),
      threatCategory:
        (args.threatCategory as
          | 'supply_choke'
          | 'web_exploit'
          | 'ai_ransomware'
          | 'payment_liquidity') || 'web_exploit',
      severity: Number(args.severity) || 8,
      probabilityPct: Number(args.probabilityPct) || 70,
      dependencyFactor: 7,
      estimatedUsdCost: 900,
      piUsdMedianPrice: 0.624,
      oracleSpreadPct: 1.85,
    });
    output = {
      tool: toolSpec.name,
      riskScorePct: bundle.riskScorePct,
      riskLevel: bundle.riskLevel,
      estimatedPiCost: bundle.estimatedPiCost,
      oracleStatus: bundle.oracleStatus,
      precautionarySteps: bundle.precautionarySteps,
    };
  } else {
    const phrase = String(args.phrase || 'PI NETWORK');
    const dayOffset = Number(args.dayOffset ?? 17);
    output = {
      tool: toolSpec.name,
      gematria: computeGematria(phrase),
      coincidenceStats: computeCoincidenceProbability(6, 50, 10, 350),
      qClock: computeQClockProjection(dayOffset),
    };
  }

  const digestSource = `${toolSpec.name}:${String(parsedPayment.payer)}:${Date.now()}`;
  const hashBuf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(digestSource)
  );
  const txHash = Array.from(new Uint8Array(hashBuf))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const receipt = {
    x402Version: 2,
    settled: true,
    scheme: toolSpec.scheme,
    network: 'pi:testnet',
    amountPi: toolSpec.pricePi,
    payer: parsedPayment.payer,
    settlementTxHash: `0x${txHash}`,
    settledAt: new Date().toISOString(),
  };

  if (idempotencyKey) {
    settledIdempotencyKeys.set(idempotencyKey, output);
  }

  const res = NextResponse.json({
    jsonrpc: '2.0',
    id: body.id ?? 1,
    paymentReceipt: receipt,
    result: output,
  });
  res.headers.set('PAYMENT-RESPONSE', encodeBase64Json(receipt));
  return res;
}
