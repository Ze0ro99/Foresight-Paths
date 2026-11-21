import { NextRequest, NextResponse } from 'next/server';

const MCP_TOOLS = [
  {
    name: 'decode_gematria_audit',
    description:
      'Experimental symbolic decoding output. It is not factual evidence, a threat assessment, or an operational signal.',
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
      'Experimental scenario simulation only. It is not a calibrated risk score, payment quote, or operational recommendation.',
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

export async function GET() {
  return NextResponse.json({
    protocol: 'MCP tool discovery',
    status: 'read_only_discovery',
    paidExecution: 'disabled',
    settlement: 'not_implemented',
    tools: MCP_TOOLS,
    note:
      'Tool discovery is available, but paid tool execution and x402 settlement remain disabled until a trusted facilitator and server-side payment verification are implemented.',
  });
}

export async function POST(req: NextRequest) {
  let body: {
    jsonrpc?: string;
    id?: string | number;
    method?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON-RPC payload for /api/x402/mcp' },
      { status: 400 }
    );
  }

  if (body.method === 'tools/list') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: body.id ?? 1,
      result: { tools: MCP_TOOLS },
    });
  }

  if (body.method === 'tools/call') {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: body.id ?? null,
        error: {
          code: -32000,
          message:
            'Paid tool execution is disabled: no payment has been verified or settled.',
          data: { status: 'not_ready', settlement: 'not_implemented' },
        },
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      jsonrpc: '2.0',
      id: body.id ?? null,
      error: { code: -32601, message: 'Method not found. Use tools/list or tools/call.' },
    },
    { status: 400 }
  );
}
