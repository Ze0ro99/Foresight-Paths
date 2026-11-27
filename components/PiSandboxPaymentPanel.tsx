'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getPiAuthScopes } from '@/lib/pi-auth-scopes.mjs';

type PiPaymentDto = {
  identifier?: string;
  metadata?: Record<string, unknown>;
  transaction?: { txid?: string } | null;
  status?: { developer_completed?: boolean; transaction_verified?: boolean };
};
type PiAuth = { accessToken: string; user: { uid?: string; username?: string } };
type PiSdk = NonNullable<Window['Pi']> & {
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

type GatewayStatus = {
  paymentEnabled?: boolean;
  status?: string;
  sandboxMode?: boolean;
  network?: string;
  ledgerConfigured?: boolean;
  missingRequirements?: string[];
};

export default function PiSandboxPaymentPanel({ locale }: { locale: string }) {
  const ar = locale === 'ar';
  const sdkSandboxMode = process.env.NEXT_PUBLIC_PI_SANDBOX_MODE !== 'false';
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [username, setUsername] = useState('');
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [ledgerConfigured, setLedgerConfigured] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState('checking');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const incompletePaymentRef = useRef<PiPaymentDto | null>(null);
  const [recoveryPending, setRecoveryPending] = useState(false);
  const [recoveryBlocked, setRecoveryBlocked] = useState(false);

  const refreshGateway = useCallback(async () => {
    try {
      const response = await fetch('/api/pi/verify', { cache: 'no-store' });
      const data = (await response.json()) as GatewayStatus;
      setPaymentEnabled(data.paymentEnabled === true);
      setLedgerConfigured(data.ledgerConfigured === true);
      setGatewayStatus(data.status ?? 'unknown');
    } catch {
      setPaymentEnabled(false);
      setLedgerConfigured(false);
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
      void Promise.resolve(window.Pi.init({ version: '2.0', sandbox: sdkSandboxMode }))
        .then(() => {
          if (active) setSdkReady(true);
        })
        .catch(() => {
          if (active) setSdkError(
            sdkSandboxMode
              ? (ar ? 'تعذر تهيئة Pi SDK في وضع Sandbox.' : 'Pi SDK Sandbox initialization failed.')
              : (ar ? 'تعذر تهيئة Pi SDK مباشرة على Testnet.' : 'Direct Pi SDK Testnet initialization failed.')
          );
        });
    }, 250);
    const firstStatus = window.setTimeout(() => void refreshGateway(), 0);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.clearTimeout(firstStatus);
    };
  }, [ar, refreshGateway, sdkSandboxMode]);

  const handleIncompletePaymentFound = useCallback((payment: unknown) => {
    const incompletePayment = payment as PiPaymentDto;
    incompletePaymentRef.current = incompletePayment;
    const hasPaymentId = typeof incompletePayment?.identifier === 'string' &&
      /^[A-Za-z0-9_-]{6,160}$/.test(incompletePayment.identifier);
    setRecoveryBlocked(true);
    setRecoveryPending(hasPaymentId);
    setMessage(hasPaymentId
      ? (ar
          ? 'وجد Pi دفعة غير مكتملة؛ نتحقق من هوية صاحبها أولًا قبل استعادتها.'
          : 'Pi found an incomplete payment. Verifying its owner before recovery.')
      : (ar
          ? 'وجد Pi دفعة غير مكتملة دون معرّف صالح؛ أوقفنا الدفع الجديد لحين المراجعة.'
          : 'Pi found an incomplete payment without a valid identifier. New payments are blocked pending review.'));
  }, [ar]);

  const signIn = async () => {
    if (!window.Pi || !sdkReady) {
      setMessage(ar ? 'افتح التطبيق داخل Pi Browser ثم أعد المحاولة.' : 'Open this app in Pi Browser and try again.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const auth = await window.Pi.authenticate(getPiAuthScopes(), handleIncompletePaymentFound);
      const response = await fetch('/api/pi/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.accessToken}` },
        body: JSON.stringify({ action: 'auth_me' }),
      });
      const result = await response.json();
      if (!response.ok || !result.verified) throw new Error(result.error || 'Pi identity verification failed.');
      setAccessToken(auth.accessToken);
      setUsername(result.user?.username || auth.user.username || result.user?.uid || auth.user.uid || '');

      const incompletePayment = incompletePaymentRef.current;
      if (incompletePayment) {
        const paymentId = incompletePayment.identifier;
        if (!paymentId || !/^[A-Za-z0-9_-]{6,160}$/.test(paymentId)) {
          setRecoveryBlocked(true);
          setRecoveryPending(false);
          setMessage(ar
            ? 'توجد دفعة غير مكتملة دون معرّف صالح؛ لا تبدأ دفعة جديدة قبل المراجعة.'
            : 'An incomplete payment has no valid identifier. Do not start another payment before manual review.');
        } else {
          setRecoveryBlocked(true);
          setRecoveryPending(true);
          try {
            const recoveryResponse = await fetch('/api/pi/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.accessToken}` },
              body: JSON.stringify({ action: 'payment_recover_incomplete', paymentId }),
            });
            const recoveryResult = await recoveryResponse.json();
            if (!recoveryResponse.ok || recoveryResult.verified !== true) {
              throw new Error(recoveryResult.error || 'Incomplete payment recovery failed.');
            }
            incompletePaymentRef.current = null;
            setRecoveryBlocked(false);
            setMessage(ar
              ? 'تمت استعادة الدفعة السابقة والتحقق منها على Testnet. لا توجد أرصدة أو مزايا مدفوعة ممنوحة.'
              : 'The previous Testnet payment was recovered and verified. No paid entitlement or credit was granted.');
          } catch (recoveryError) {
            setRecoveryBlocked(true);
            setMessage(recoveryError instanceof Error
              ? recoveryError.message
              : (ar ? 'تعذرت استعادة الدفعة؛ يلزم التحقق اليدوي.' : 'Payment recovery needs manual review.'));
          } finally {
            setRecoveryPending(false);
          }
        }
      } else {
        setMessage(ar ? 'تم التحقق من هوية Pi عبر الخادم.' : 'Pi identity was verified by the backend.');
      }
      await refreshGateway();
    } catch (error) {
      if (incompletePaymentRef.current) {
        setRecoveryBlocked(true);
        setRecoveryPending(false);
      }
      setMessage(error instanceof Error ? error.message : (ar ? 'فشل تسجيل الدخول.' : 'Pi sign-in failed.'));
    } finally {
      setBusy(false);
    }
  };

  const startPayment = (planId: 'testnet_payment_0_1_demo' | 'testnet_payment_1_0_demo') => {
    const pi = window.Pi as PiSdk | undefined;
    if (!pi || !accessToken || !paymentEnabled || recoveryPending || recoveryBlocked) return;
    const amount = planId === 'testnet_payment_0_1_demo' ? 0.1 : 1;
    const memo = 'Foresight Paths Testnet payment demo — no entitlement';
    setBusy(true);
    setMessage(ar ? 'تم فتح تدفق دفع Testnet. أكمل التوقيع في محفظة Pi.' : 'Testnet payment flow opened. Confirm it in Pi Wallet.');
    try {
      pi.createPayment(
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
            {sdkSandboxMode
              ? (ar ? 'Pi Testnet عبر Sandbox · لا توجد عمليات Mainnet' : 'Pi Testnet via Sandbox · no Mainnet operations')
              : (ar ? 'Pi Testnet مباشر · Sandbox معطّل · لا توجد عمليات Mainnet' : 'Direct Pi Testnet · Sandbox disabled · no Mainnet operations')}
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
          disabled={!sdkReady || busy || recoveryPending}
          className="rounded border border-violet-200/25 px-3 py-2 text-[11px] text-violet-100 disabled:opacity-40"
        >
          {busy ? (ar ? 'جارٍ التنفيذ…' : 'Working…') : accessToken ? (ar ? 'إعادة التحقق' : 'Re-verify Pi') : (ar ? 'تسجيل الدخول عبر Pi' : 'Sign in with Pi')}
        </button>
        {username && <span className="text-[11px] text-emerald-200">{username}</span>}
        <span className="text-[10px] text-white/40">{gatewayStatus}</span>
      </div>
      {accessToken && paymentEnabled && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={busy || recoveryPending || recoveryBlocked} onClick={() => startPayment('testnet_payment_0_1_demo')} className="rounded border border-emerald-300/20 px-3 py-2 text-[11px] text-emerald-100 disabled:opacity-40">
            {ar ? 'اختبار 0.1 Test-Pi' : 'Test 0.1 Test-Pi'}
          </button>
          <button type="button" disabled={busy || recoveryPending || recoveryBlocked} onClick={() => startPayment('testnet_payment_1_0_demo')} className="rounded border border-emerald-300/20 px-3 py-2 text-[11px] text-emerald-100 disabled:opacity-40">
            {ar ? 'اختبار 1 Test-Pi' : 'Test 1 Test-Pi'}
          </button>
        </div>
      )}
      {accessToken && !paymentEnabled && (
        <p className="mt-2 text-[10px] text-white/45">
          {gatewayStatus === 'awaiting_server_key' && ledgerConfigured
            ? (ar
                ? 'دفتر Supabase الخاص متصل. أضف مفتاح Server API لتطبيق Pi Testnet باسم PI_API_KEY في إعدادات Vercel Preview؛ لا تضعه في الواجهة أو المستودع.'
                : 'The private Supabase ledger is connected. Add the Testnet app Server API Key as PI_API_KEY in Vercel Preview; never expose it in client code or source control.')
            : gatewayStatus === 'awaiting_private_ledger_credentials'
              ? (ar
                  ? 'بيانات اعتماد دفتر Supabase الخاص غير مكتملة؛ يلزم ضبط المفتاح الخادمي قبل تشغيل الدفع.'
                  : 'Private Supabase ledger credentials are incomplete; configure the server-only key before enabling payments.')
              : (ar
                  ? 'الدفع ما زال معطّلًا حتى اجتياز بوابات شبكة Testnet ومفاتيح الخادم والتحقق الكامل.'
                  : 'Payments remain disabled until Testnet network, server credentials, and verification gates pass.')}
        </p>
      )}
      {recoveryPending && <p role="status" className="mt-2 text-[10px] text-amber-200">{ar ? 'استعادة الدفعة السابقة جارية؛ لن نبدأ دفعة جديدة الآن.' : 'Previous payment recovery is in progress; a new payment is blocked.'}</p>}
      {recoveryBlocked && !recoveryPending && <p role="status" className="mt-2 text-[10px] text-amber-200">{ar ? 'يوجد تعارض أو دفعة غير مكتملة؛ يلزم إكمال الاستعادة أو المراجعة قبل بدء دفعة جديدة.' : 'An incomplete payment still needs recovery or manual review before another payment can start.'}</p>}
      {message && <p role="status" className="mt-3 text-[11px] leading-relaxed text-cyan-100/80">{message}</p>}
    </div>
  );
}
