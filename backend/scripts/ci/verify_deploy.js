const axios = require('axios');

// Simple CI verification script for deployed auth endpoints
// Usage: set env vars before running:
// BASE_URL (e.g. https://rivaayaat.onrender.com)
// FRONTEND_ORIGIN (e.g. https://rivaayaat.netlify.app)
// GOOGLE_ID_TOKEN (optional) - a valid Google ID token for testing google-login

const BASE_URL = process.env.BASE_URL || process.env.BACKEND_URL || 'https://rivaayaat.onrender.com';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://rivaayaat.netlify.app';
const GOOGLE_ID_TOKEN = process.env.GOOGLE_ID_TOKEN || null;

const timeout = 10000;

function fail(msg) {
  console.error('VERIFICATION FAILED:', msg);
  process.exit(1);
}

async function checkPreflight(path) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await axios.options(url, {
      headers: { Origin: FRONTEND_ORIGIN },
      timeout,
      validateStatus: () => true,
    });

    const headers = res.headers || {};
    const aca = headers['access-control-allow-origin'];
    const acc = headers['access-control-allow-credentials'];

    if (!aca) fail(`Missing Access-Control-Allow-Origin on OPTIONS ${path}`);
    if (aca !== FRONTEND_ORIGIN) fail(`Access-Control-Allow-Origin mismatch on OPTIONS ${path}. Expected ${FRONTEND_ORIGIN} got ${aca}`);
    if (!acc || acc !== 'true') fail(`Missing or invalid Access-Control-Allow-Credentials on OPTIONS ${path}`);

    console.log(`OPTIONS ${path} OK`);
  } catch (err) {
    fail(`Error during OPTIONS ${path}: ${err.message}`);
  }
}

async function checkHealth() {
  const url = `${BASE_URL}/health`;
  try {
    const res = await axios.get(url, {
      headers: { Origin: FRONTEND_ORIGIN },
      timeout,
      validateStatus: () => true,
    });

    const headers = res.headers || {};
    const aca = headers['access-control-allow-origin'];
    const acc = headers['access-control-allow-credentials'];

    if (!aca) fail(`Missing Access-Control-Allow-Origin on GET /health`);
    if (aca !== FRONTEND_ORIGIN) fail(`Access-Control-Allow-Origin mismatch on GET /health. Expected ${FRONTEND_ORIGIN} got ${aca}`);
    if (!acc || acc !== 'true') fail(`Missing or invalid Access-Control-Allow-Credentials on GET /health`);

    if (res.status !== 200) fail(`/health returned status ${res.status}`);

    console.log('/health OK');
  } catch (err) {
    fail(`Error during GET /health: ${err.message}`);
  }
}

async function checkGoogleLoginCookie() {
  if (!GOOGLE_ID_TOKEN) {
    console.log('Skipping Google login cookie check (no GOOGLE_ID_TOKEN provided)');
    return;
  }

  const url = `${BASE_URL}/api/auth/google-login`;
  try {
    const res = await axios.post(url, { credential: GOOGLE_ID_TOKEN }, {
      headers: { Origin: FRONTEND_ORIGIN, 'Content-Type': 'application/json' },
      timeout,
      maxRedirects: 0,
      validateStatus: () => true,
    });

    const headers = res.headers || {};
    const setCookie = headers['set-cookie'];
    if (!setCookie || !Array.isArray(setCookie) || setCookie.length === 0) {
      fail('No Set-Cookie header returned from google-login');
    }

    // Find token cookie
    const tokenCookie = setCookie.find(c => c.startsWith('token='));
    if (!tokenCookie) fail('Set-Cookie does not include token cookie');

    if (!/SameSite=None/i.test(tokenCookie)) fail('token cookie missing SameSite=None');
    if (!/Secure/i.test(tokenCookie)) fail('token cookie missing Secure flag');

    console.log('google-login Set-Cookie OK');
  } catch (err) {
    fail(`Error during POST /api/auth/google-login: ${err.message}`);
  }
}

async function main() {
  console.log('Running deploy verification against', BASE_URL);
  await checkPreflight('/api/auth/google-login');
  await checkHealth();
  await checkGoogleLoginCookie();
  console.log('All verification checks passed');
  process.exit(0);
}

main();
