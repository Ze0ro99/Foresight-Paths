import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('loads official Pi SDK in the document head before hydration', async () => {
  const layout = await read('../app/layout.tsx');
  assert.match(layout, /https:\/\/sdk\.minepi\.com\/pi-sdk\.js/);
  assert.match(layout, /strategy="beforeInteractive"/);
  assert.match(layout, /<head>/);
});

test('awaits Pi SDK v2 initialization without passing sandbox', async () => {
  const sdk = await read('../lib/pi-sdk-client.ts');
  assert.match(sdk, /await initialization/);
  assert.match(sdk, /init\(\{ version: '2\.0' \}\)/);
  assert.doesNotMatch(sdk, /sandbox/i);
});

test('server Pi verification uses App Studio session and no direct /v2/me authentication', async () => {
  const route = await read('../app/api/pi/verify/route.ts');
  assert.match(route, /openPiAppStudioSession/);
  assert.match(route, /getAuthenticatedPiUser/);
  assert.doesNotMatch(route, /api\.minepi\.com\/v2\/me|verifyUser\(|getBearer\(/);
});

test('Pi auth controls request username scope and never trust SDK user identity', async () => {
  const panel = await read('../components/PiAppStudioSignInPanel.tsx');
  const protocol = await read('../components/ProtocolGatewayView.tsx');
  const payment = await read('../components/PiSandboxPaymentPanel.tsx');
  assert.match(panel, /Pi\.authenticate\(\s*\['username'\]/);
  assert.match(panel, /body: JSON\.stringify\(\{ accessToken: auth\.accessToken \}\)/);
  assert.match(protocol, /Pi\.authenticate\(\s*\['username'\]/);
  assert.match(protocol, /body: JSON\.stringify\(\{ accessToken: auth\.accessToken \}\)/);
  assert.doesNotMatch(panel + protocol + payment, /auth\.user\??\.(uid|username)/);
  assert.doesNotMatch(payment, /setAccessToken|accessToken\s*&&/);
});

test('Pi CSP has explicit connect origins, PiNet frame ancestors, and no wildcard connections', async () => {
  const config = await read('../next.config.ts');
  assert.match(config, /https:\/\/socialchain\.app/);
  assert.match(config, /https:\/\/sdk\.minepi\.com/);
  assert.match(config, /https:\/\/\*\.pinet\.com/);
  assert.match(config, /https:\/\/\*\.minepi\.com/);
  assert.doesNotMatch(config, /connect-src[^;]*\*/);
  assert.doesNotMatch(config, /X-Frame-Options/);
  assert.doesNotMatch(config, /backend\.appstudio/);
});

test('PiNet session cookie is HttpOnly, Secure and SameSite=None', async () => {
  const route = await read('../app/api/pi/auth/route.ts');
  assert.match(route, /httpOnly:\s*true/);
  assert.match(route, /secure:\s*true/);
  assert.match(route, /sameSite:\s*'none'/);
  assert.match(route, /PI_APP_SESSION_COOKIE/);
});

test('App Studio exchange accepts only accessToken and stores server response identity', async () => {
  const helper = await read('../lib/pi-appstudio-auth.mjs');
  const route = await read('../app/api/pi/auth/route.ts');
  assert.match(helper, /pi\/auth\/v1\/login/);
  assert.match(route, /exchangePiAccessToken\(body\.accessToken\)/);
  assert.doesNotMatch(route, /body\.uid|body\.username/);
});
