#!/usr/bin/env node
/* Minimal Node 18+ script. Requires deps: mongodb, dotenv */
/* Usage:
   node backend/scripts/analyze-compatibility.js
   node backend/scripts/analyze-compatibility.js --db technova
   node backend/scripts/analyze-compatibility.js --ids <id1>,<id2>
*/
import path from 'node:path';
import fs from 'node:fs';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure fetch exists on Node < 18 fallback
const fetch = globalThis.fetch ?? (await import('node-fetch')).default;

// Load .env if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// Simple args
const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.findIndex(a => a === name);
  if (i >= 0 && i < args.length - 1) return args[i + 1];
  const pref = `${name}=`;
  const kv = args.find(a => a.startsWith(pref));
  return kv ? kv.slice(pref.length) : undefined;
};
const DB_NAME = getArg('--db') || process.env.MONGODB_DB || 'technova';
const idsArg = getArg('--ids'); // comma-separated _id strings

if (!MONGO_URI) {
  console.error('Missing MONGO_URI (or MONGODB_URI) in backend/.env');
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY in backend/.env');
  process.exit(1);
}

function redactUri(u) {
  return String(u).replace(/(mongodb(\+srv)?:\/\/[^:@/]+):[^@/]+@/i, '$1:***@');
}

// Change: accept idsArg as a param so we can reuse from HTTP
export async function fetchUsers(db, idsArgLocal) {
  const col = db.collection('users');
  if (idsArgLocal) {
    const ids = idsArgLocal.split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => {
        try { return new ObjectId(s); } catch { return s; }
      });
    const cursor = col.find(
      { _id: { $in: ids } },
      { projection: { username: 1, name: 1, goals: 1, location: 1, experienceLevel: 1 } }
    );
    const docs = await cursor.toArray();
    return docs;
  }

  // Prefer users that have at least one of the three fields, otherwise fall back to any
  const projection = { username: 1, name: 1, goals: 1, location: 1, experienceLevel: 1 };
  let docs = await col.find(
    {
      $or: [
        { goals: { $exists: true } },
        { location: { $exists: true } },
        { experienceLevel: { $exists: true } },
      ]
    },
    { projection }
  ).sort({ _id: -1 }).limit(10).toArray();

  if (docs.length < 2) {
    docs = await col.find({}, { projection }).sort({ _id: -1 }).limit(2).toArray();
  }
  return docs.slice(0, 2);
}

function userLabel(u, label) {
  const name = u.name || u.username || '';
  const id = u._id ? ` (${u._id})` : '';
  const nm = name ? ` - ${name}` : '';
  return `${label}${nm}${id}`;
}

// New: normalize for AI prompt
function normalizeUserForAI(u) {
  return {
    username: u.username || u.name || '',
    goals: Array.isArray(u.goals) ? u.goals : (u.goals ? [u.goals] : []),
    location: u.location || '',
    experienceLevel: u.experienceLevel || '',
  };
}

export function buildPrompt(u1, u2) {
  const a = normalizeUserForAI(u1);
  const b = normalizeUserForAI(u2);
  return [
    'You are an expert at group matching.',
    'Use ONLY these fields per user: goals, location, experienceLevel.',
    'Return a concise analysis of compatibility and suggested groupings.',
    '',
    `${userLabel(u1, 'User A')}:`,
    `goals: ${JSON.stringify(a.goals)}`,
    `location: ${a.location || ''}`,
    `experienceLevel: ${a.experienceLevel || ''}`,
    '',
    `${userLabel(u2, 'User B')}:`,
    `goals: ${JSON.stringify(b.goals)}`,
    `location: ${b.location || ''}`,
    `experienceLevel: ${b.experienceLevel || ''}`,
  ].join('\n');
}

// Add back: Gemini call helper
export async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`;
  const body = { contents: [{ role: 'user', parts: [{ text: prompt }]}] };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-goog-api-key': GEMINI_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gemini error ${res.status}: ${text}`);
  }
  const json = await res.json();
  const text =
    json?.candidates?.[0]?.content?.parts
      ?.map(p => p?.text)
      ?.filter(Boolean)
      ?.join('') || '';
  return text.trim();
}

// New: lightweight health check for Gemini API
export async function healthCheckGemini() {
  if (!GEMINI_API_KEY) {
    return { ok: false, reason: 'missing_api_key', model: GEMINI_MODEL };
  }
  try {
    const reply = await callGemini('Reply with "pong" only.');
    const ok = /^pong$/i.test(reply.trim());
    return { ok, model: GEMINI_MODEL, reply };
  } catch (err) {
    return { ok: false, model: GEMINI_MODEL, error: err?.message || String(err) };
  }
}

// New: high-level helper to run the full analysis flow
export async function analyzeCompatibility(db, idsArgLocal) {
  const users = await fetchUsers(db, idsArgLocal);
  if (!users || users.length < 2) {
    throw new Error('Need at least two users to analyze.');
  }
  const [u1, u2] = users.slice(0, 2);
  const prompt = buildPrompt(u1, u2);
  const analysis = await callGemini(prompt);
  return { users: [u1, u2], prompt, analysis };
}

// CLI entrypoint (only runs when executed directly)
async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    console.error(`Connected to ${redactUri(MONGO_URI)}/${DB_NAME}`);

    const { users, analysis } = await analyzeCompatibility(db, idsArg);

    console.log('--- Compatibility Analysis ---');
    console.log(analysis);
    console.log('');
    console.log(userLabel(users[0], 'User A'));
    console.log(userLabel(users[1], 'User B'));
  } finally {
    await client.close().catch(() => {});
  }
}

const isDirect = (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url));
if (isDirect) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
