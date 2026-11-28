'use client';

type PiSdk = {
  init: (config: { version: string }) => Promise<void> | void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: unknown) => void,
  ) => Promise<{ accessToken: string; user?: { uid?: string; username?: string } }>;
};

declare global {
  interface Window {
    Pi?: PiSdk;
    __foresightPiSdkInit?: Promise<void>;
  }
}

/** Initialize Pi SDK once and let Pi Browser detect the network automatically. */
export async function initializePiSdk(): Promise<void> {
  if (typeof window === 'undefined' || !window.Pi) {
    throw new Error('Pi SDK is not available in this browser.');
  }

  if (window.__foresightPiSdkInit) {
    return window.__foresightPiSdkInit;
  }

  const pi = window.Pi;
  const initialization = Promise.resolve(pi.init({ version: '2.0' })).then(() => undefined);
  window.__foresightPiSdkInit = initialization;

  try {
    await initialization;
  } catch (error) {
    delete window.__foresightPiSdkInit;
    throw error;
  }
}
