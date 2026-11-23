const PLACEHOLDER_PI_KEY = 'MY_PI_PLATFORM_SERVER_API_KEY';
const PLACEHOLDER_SUPABASE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

function isConfiguredSecret(value, placeholder) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim() !== placeholder;
}

function isHttpsUrl(value) {
  if (typeof value !== 'string' || value.trim().length === 0) return false;
  try {
    return new URL(value.trim()).protocol === 'https:';
  } catch {
    return false;
  }
}

export function getPiGatewayReadiness(env = process.env) {
  const piApiKeyConfigured = isConfiguredSecret(env.PI_API_KEY, PLACEHOLDER_PI_KEY);
  const supabaseUrlConfigured = isHttpsUrl(env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseServiceRoleKeyConfigured = isConfiguredSecret(env.SUPABASE_SERVICE_ROLE_KEY, PLACEHOLDER_SUPABASE_KEY);
  const ledgerConfigured = supabaseUrlConfigured && supabaseServiceRoleKeyConfigured;
  const sandboxMode = env.PI_SANDBOX_MODE !== 'false';
  const paymentFlagEnabled = env.PI_PAYMENTS_ENABLED === 'true';
  const paymentIntentLedgerReady = env.PI_PAYMENT_INTENT_LEDGER_READY === 'true';
  const releaseFlagsEnabled = sandboxMode && paymentFlagEnabled && paymentIntentLedgerReady;

  const missingRequirements = [];
  if (!piApiKeyConfigured) missingRequirements.push('PI_API_KEY');
  if (!supabaseUrlConfigured) missingRequirements.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceRoleKeyConfigured) missingRequirements.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!sandboxMode) missingRequirements.push('PI_SANDBOX_MODE=true');
  if (!paymentFlagEnabled) missingRequirements.push('PI_PAYMENTS_ENABLED=true');
  if (!paymentIntentLedgerReady) missingRequirements.push('PI_PAYMENT_INTENT_LEDGER_READY=true');

  const paymentEnabled = piApiKeyConfigured && ledgerConfigured && releaseFlagsEnabled;
  let status = 'testnet_payment_release_enabled';
  if (!piApiKeyConfigured && !ledgerConfigured) status = 'awaiting_server_credentials';
  else if (!piApiKeyConfigured) status = 'awaiting_server_key';
  else if (!ledgerConfigured) status = 'awaiting_private_ledger_credentials';
  else if (!sandboxMode) status = 'sandbox_disabled';
  else if (!paymentFlagEnabled || !paymentIntentLedgerReady) status = 'payments_disabled_pending_release_gates';

  return {
    piApiKeyConfigured,
    supabaseUrlConfigured,
    supabaseServiceRoleKeyConfigured,
    ledgerConfigured,
    sandboxMode,
    paymentFlagEnabled,
    paymentIntentLedgerReady,
    releaseFlagsEnabled,
    paymentEnabled,
    status,
    missingRequirements,
  };
}
