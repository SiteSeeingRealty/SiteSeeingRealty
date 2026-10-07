import { timingSafeEqual } from 'node:crypto';

// Keeps the Supabase project from being paused for inactivity. Free-tier
// projects are frozen after ~7 days with no requests, so this is hit daily by
// two independent schedulers: the Vercel cron in vercel.json and the GitHub
// Actions workflow in .github/workflows/supabase-keepalive.yml.

// Compare without leaking the secret through response timing.
function secretMatches(header, secret) {
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header || '');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

const ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function pingSupabase(url, key) {
  const response = await fetch(`${url}/rest/v1/plots?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`);
  }
  return response.json();
}

export default async function handler(req, res) {
  // CRON_SECRET is optional. When it is set, Vercel signs cron calls with it and
  // anything else is refused. When it is not set the route stays open, which is
  // safe: it only runs the same one-row public read that the website itself
  // makes with the public anon key. Requiring it unconditionally is what kept
  // the cron silently failing and let the project pause.
  const secret = process.env.CRON_SECRET;
  if (secret && !secretMatches(req.headers.authorization, secret)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return res.status(500).json({ ok: false, error: 'Supabase env vars are not configured' });
  }

  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      const rows = await pingSupabase(url, key);
      return res.status(200).json({ ok: true, rows: rows.length, attempt, at: new Date().toISOString() });
    } catch (error) {
      // Log the upstream detail for debugging, but never echo it back -- the
      // response body can carry Supabase internals.
      console.error(`keepalive attempt ${attempt} failed`, error);
      if (attempt < ATTEMPTS) await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  return res.status(502).json({ ok: false, error: 'Upstream request failed' });
}
