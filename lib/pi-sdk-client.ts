'use client';

type PiWindowState = Window & { __foresightPiSdkInit?: Promise<void> };

/** Initialize Pi SDK once; leave network selection to Pi Browser's automatic detection. */
export async function initializePiSdk(): Promise<void> {
  if (typeof window === 'undefined' || !window.Pi) {
    throw new Error('Pi SDK is not available in this browser.');
  }

  const state = window as PiWindowState;
  if (state.__foresightPiSdkInit) return state.__foresightPiSdkInit;

  const initialization = Promise.resolve(window.Pi.init({ version: '2.0' }));
  state.__foresightPiSdkInit = initialization;
  try {
    await initialization;
  } catch (error) {
    delete state.__foresightPiSdkInit;
    throw error;
  }
}
