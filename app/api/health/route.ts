import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const geminiConfigured = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );
  const piServerKeyConfigured = Boolean(
    process.env.PI_API_KEY &&
    process.env.PI_API_KEY !== 'MY_PI_PLATFORM_SERVER_API_KEY'
  );
  const supabaseLedgerConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const piSandboxMode = process.env.PI_SANDBOX_MODE !== 'false';
  const piPaymentExecutionFlag = process.env.PI_PAYMENTS_ENABLED === 'true';
  const piLedgerReleaseFlag = process.env.PI_ENTITLEMENT_LEDGER_ENABLED === 'true';
  const piMainnetReleaseFlag = process.env.PI_MAINNET_PAYMENTS_APPROVED === 'true';
  const piPaymentReleaseFlagsEnabled =
    piPaymentExecutionFlag &&
    piLedgerReleaseFlag &&
    piSandboxMode;
  const piPaymentExecutionEnabled =
    piServerKeyConfigured && supabaseLedgerConfigured && piPaymentReleaseFlagsEnabled;

  const checks = {
    application: 'ok',
    globalSense: 'available_with_partial_source_coverage',
    geminiAnalysis: geminiConfigured ? 'configured' : 'not_configured',
    piIdentity: 'requires_pi_browser_session',
    supabaseLedger: supabaseLedgerConfigured
      ? 'server_credentials_configured'
      : 'read_only_data_only_private_ledger_key_missing',
    piPayments: !piServerKeyConfigured
      ? 'not_configured'
      : !supabaseLedgerConfigured
        ? 'private_ledger_not_configured'
        : piPaymentExecutionEnabled
          ? 'testnet_release_flags_enabled_runtime_verification_required'
          : 'payments_disabled_pending_release_gates',
    piPaymentExecutionEnabled,
    piPaymentReleaseFlags: {
      paymentExecution: piPaymentExecutionFlag,
      entitlementLedger: piLedgerReleaseFlag,
      mainnetApproval: piMainnetReleaseFlag,
    },
    piSandboxMode,
    x402: 'read_only_discovery_only',
    cloudAgent: 'disabled_until_security_gates_pass',
    rewardedAds: 'disabled_until_provider_verification',
  };

  const ready = geminiConfigured && piServerKeyConfigured;

  return NextResponse.json(
    {
      status: ready ? 'operational_with_restricted_features' : 'operational_setup_incomplete',
      checkedAt: new Date().toISOString(),
      checks,
      note: 'This endpoint reports configuration only. It does not verify third-party credentials or guarantee upstream availability.',
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}
