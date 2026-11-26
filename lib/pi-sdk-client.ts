'use client';

type PiWindowState = Window & { __foresightPiSdkInit?: Promise<void>; __foresightPiSdkSandbox?: boolean };

/** Initialize Pi SDK once per browser session so independent gateways share one network mode. */
export async function initializePiSdk(sandbox:boolean):Promise<void>{
  if(typeof window==='undefined'||!window.Pi)throw new Error('Pi SDK is not available in this browser.');
  const state=window as PiWindowState;
  if(state.__foresightPiSdkInit){
    if(state.__foresightPiSdkSandbox!==sandbox)throw new Error('The Pi SDK is already initialized in a different network mode.');
    return state.__foresightPiSdkInit;
  }
  state.__foresightPiSdkSandbox=sandbox;
  const initialization=Promise.resolve(window.Pi.init({version:'2.0',sandbox}));
  state.__foresightPiSdkInit=initialization;
  try{await initialization;}catch(error){delete state.__foresightPiSdkInit;delete state.__foresightPiSdkSandbox;throw error;}
}