'use client';

import { useCallback, useEffect, useState } from 'react';

type PiPaymentDto = {
  identifier?: string;
  metadata?: Record<string, unknown>;
  transaction?: { txid?: string } | null;
  status?: { developer_completed?: boolean; transaction_verified?: boolean };
};
type PiAuth = { accessToken: string; user: { uid: string; username?: string } };
type PiSdk = {
  init: (config: { version: string; sandbox: boolean }) => Promise<void> | void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: PiPaymentDto) => void,
  ) => Promise<PiAuth>;
  createPayment: (
    data: { amount: number; memo: string; metadata: Record<string, unknown> },
    callbacks: {
      onReadyForServerApproval: (paymentId: string) => void | Promise<void>;
      onReadyForServerCompletion: (paymentId: string, txid: string) => void | Promise<void>;
      onCancel: (paymentId: string) => void;
      onError: (error: Error, payment?: PiPaymentDto) => void;
    },
  ) => void;
};

declare global {
  interface Window {
    Pi?: PiSdk;
  }
}

type GatewayStatus = { paymentEnabled?: boolean; status?: string; sandboxMode?: boolean };

export default function PiSandboxPaymentPanel({ locale }: { locale: string }) {
  const ar = locale === 'ar';
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [username, setUsername] = useState('');
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState('checking');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [incomplete, setIncomplete] = useState<PiPaymentDto | null>(null);

  const refreshGateway = useCallback(async () => {
    try {
      const response = await fetch('/api/pi/verify', { cache: 'no-store' });
      const data = (await response.json()) as GatewayStatus;
      setPaymentEnabled(data.paymentEnabled === true);
      setGatewayStatus(data.status ?? 'unknown');
    } catch {
      setPaymentEnabled(false);
      setGatewayStatus('unavailable');
    }
  }, []);

  useEffect(() => {
    let active = true;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (!window.Pi) {
        if (attempts >= 40) {
          window.clearInterval(timer);
          if (active) setSdkError(ar ? 'لم يتم تحميل Pi SDK. افتح التطبيق من Pi Browser.' : 'Pi SDK did not load. Open this app in Pi Browser.');
        }
        return;
      }
      window.clearInterval(timer);
      void Promise.resolve(window.Pi.init({ version: '2.0', sandbox: true }))
        .then(() => {
          if (active) setSdkReady(true);
        })
        .catch(() => {
          if (active) setSdkError(ar ? 'تعذر تهيئة Pi SDK في وضع Sandbox.' : 'Pi SDK Sandbox initialization failed.');
        });
    }, 250);
    const firstStatus = window.setTimeout(() => void refreshGateway(), 0);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.clearTimeout(firstStatus);
    };
  }, [ar, refreshGateway]);

  useEffect(() => {
    if (!incomplete || !accessToken) return;
    const planId = typeof incomplete.metadata?.planId === 'string' ? incomplete.metadata.planId : '';
    const txid = incomplete.transaction?.txid;
    if (!incomplete.identifier || !planId || !txid) {
      const warning = window.setTimeout(() => setMessage(ar
        ? 'توجد دفعة غير مكتملة؛ لا تتوفر بيانات كافية لإكمالها بأمان. لا تبدأ دفعة جديدة.'
        : 'An incomplete payment was found without enough verified metadata to recover safely. Do not start another payment.'), 0);
      return () => window.clearTimeout(warning);
    }
    let active = true;
    void fetch('/api/pi/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ action: 'payment_complete', paymentId: incomplete.identifier, planId, txid }),
    }).then(async (response) => {
      const result = await response.json();
      if (!active) return;
      setMessage(response.ok && result.verified
        ? (ar ? 'تمت استعادة الدفعة والتحقق منها على Testnet.' : 'Incomplete Testnet payment was recovered and verified.')
        : (result.error || (ar ? 'تعذرت استعادة الدفعة؛ يلزم التحقق اليدوي.' : 'Payment recovery needs manual review.')));
      if (response.ok) setIncomplete(null);
    }).catch(() => {
      if (active) setMessage(ar ? 'تعذر الاتصال بخدمة استعادة الدفعة.' : 'Could not reach the payment recovery service.');
    });
    return () => { active = false; };
  }, [incomplete, accessToken, ar]);

  const signIn = async () => {
    if (!window.Pi || !sdkReady) {
      setMessage(ar ? 'افتح التطبيق داخل Pi Browser ثم أعد المحاولة.' : 'Open this app in Pi Browser and try again.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const auth = await window.Pi.authenticate(['username', 'payments'], (payment) => {
        setIncomplete(payment);
      });
      const response = await fetch('/api/pi/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.accessToken}` },
        body: JSON.stringify({ action: 'auth_me' }),
      });
      const result = await response.json();
      if (!response.ok || !result.verified) throw new Error(result.error || 'Pi identity verification failed.');
      setAccessToken(auth.accessToken);
      setUsername(result.user?.username || auth.user.username || result.user?.uid || '');
      setMessage(ar ? 'تم التحقق من هوية Pi عبر الخادم.' : 'Pi identity was verified by the backend.');
      await refreshGateway();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (ar ? 'فشل تسجيل الدخول.' : 'Pi sign-in failed.'));
    } finally {
      setBusy(false);
    }
  };

  const startPayment = (planId: 'testnet_payment_0_1_demo' | 'testnet_payment_1_0_demo') => {
    if (!window.Pi || !accessToken || !paymentEnabled) return;
    const amount = planId === 'testnet_payment_0_1_demo' ? 0.1 : 1;
    const memo = planId === 'prepaid_0_1_credit'
      ? 'Foresight Paths Testnet payment demo — no entitlement'
      : 'Foresight Paths Testnet payment demo — no entitlement';
    setBusy(true);
    setMessage(ar ? 'تم فتح تدفق دفع Testnet. أكمل التوقيع في محفظة Pi.' : 'Testnet payment flow opened. Confirm it in Pi Wallet.');
    try {
      window.Pi.createPayment(
        { amount, memo, metadata: { planId, app: 'foresight-paths', network: 'Pi Testnet' } },
        {
          onReadyForServerApproval: async (paymentId) => {
            const response = await fetch('/api/pi/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
              body: JSON.stringify({ action: 'payment_approve', paymentId, planId }),
            });
            const result = await response.json();
            if (!response.ok || !result.approved) throw new Error(result.error || 'Server approval failed.');
            setMessage(ar ? 'وافق الخادم على دفعة Testnet.' : 'Backend approved the Testnet payment.');
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            const response = await fetch('/api/pi/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
              body: JSON.stringify({ action: 'payment_complete', paymentId, planId, txid }),
            });
            const result = await response.json();
            if (!response.ok || !result.verified) throw new Error(result.error || 'Server completion failed.');
            setMessage(ar
              ? 'تم التحقق من التسوية على Testnet وتسجيلها. لم يتم منح رصيد أو ميزة مدفوعة.'
              : 'Testnet settlement verified and persisted. No credit or paid entitlement was granted.');
            setBusy(false);
          },
          onCancel: () => {
            setMessage(ar ? 'ألغى المستخدم دفعة Testnet.' : 'Testnet payment was cancelled.');
            setBusy(false);
          },
          onError: (error) => {
            setMessage(error.message || (ar ? 'حدث خطأ في دفع Testnet.' : 'Testnet payment failed.'));
            setBusy(false);
          },
        },
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payment could not start.');
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-violet-300/15 bg-violet-300/[0.035] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold text-white">{ar ? 'مصادقة Pi وتجربة Testnet' : 'Pi authentication & Testnet checkout'}</h3>
          <p className="mt-1 text-[10px] text-white/45">
            {ar ? 'Sandbox ثابت · لا توجد عمليات Mainnet' : 'Sandbox-only · no Mainnet operations'}
          </p>
        </div>
        <span className="text-[10px] text-white/50">
          {sdkReady ? 'Pi SDK ready' : (ar ? 'تهيئة SDK…' : 'SDK loading…')}
        </span>
      </div>
      {sdkError && <p role="status" className="mt-2 text-[11px] text-amber-200">{sdkError}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void signIn()}
          disabled={!sdkReady || busy}
          className="rounded border border-violet-200/25 px-3 py-2 text-[11px] text-violet-100 disabled:opacity-40"
        >
          {busy ? (ar ? 'جارٍ التنفيذ…' : 'Working…') : accessToken ? (ar ? 'إعادة التحقق' : 'Re-verify Pi') : (ar ? 'تسجيل الدخول عبر Pi' : 'Sign in with Pi')}
        </button>
        {username && <span className="text-[11px] text-emerald-200">{username}</span>}
        <span className="text-[10px] text-white/40">{gatewayStatus}</span>
      </div>
      {accessToken && paymentEnabled && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => startPayment('testnet_payment_0_1_demo')} className="rounded border border-emerald-300/20 px-3 py-2 text-[11px] text-emerald-100 disabled:opacity-40">
            {ar ? 'اختبار 0.1 Test-Pi' : 'Test 0.1 Test-Pi'}
          </button>
          <button type="button" disabled={busy} onClick={() => startPayment('testnet_payment_1_0_demo')} className="rounded border border-emerald-300/20 px-3 py-2 text-[11px] text-emerald-100 disabled:opacity-40">
            {ar ? 'اختبار 1 Test-Pi' : 'Test 1 Test-Pi'}
          </button>
        </div>
      )}
      {accessToken && !paymentEnabled && (
        <p className="mt-2 text-[10px] text-white/45">
          {ar ? 'الدفع معطّل حتى إدخال مفتاح Pi Testnet ومفتاح Supabase الخادمي وتفعيل بوابات Preview بعد المراجعة.' : 'Payments remain disabled until the Pi Testnet key, server-only Supabase key, and reviewed Preview release gates are configured.'}
        </p>
      )}
      {message && <p role="status" className="mt-3 text-[11px] leading-relaxed text-cyan-100/80">{message}</p>}
    </div>
  );
}
