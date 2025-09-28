import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const router = express.Router();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'technova';

// New-fields rule stamp
const RULE_VERSION = 'compat-new-fields-v2';

// Enable this handler by default (it is the one server.js mounts)
const DISABLED = false;

let client;
async function getClient() {
  if (client && client.topology && client.topology.isConnected()) return client;
  client = new MongoClient(MONGO_URI, { retryWrites: true, w: 'majority' });
  await client.connect();
  return client;
}

if (DISABLED) {
  console.warn('[compat][legacy] compatibility.js disabled; using src/routes/compat.ts new-field rule.');
} else {
  console.warn('[compat] compatibility.js enabled; using new-field rule.');
  router.post('/compat/analyze', async (req, res) => {
    console.log('[compat]', `v=${RULE_VERSION}`, '/api/compat/analyze called', {
      ids: req.body?.ids,
      idsType: Array.isArray(req.body?.ids) ? 'array' : typeof req.body?.ids,
      idsCount: Array.isArray(req.body?.ids) ? req.body?.ids?.length : undefined
    });

    try {
      if (!MONGO_URI) return res.status(500).json({ error: 'Missing MONGO_URI' });
      const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(Boolean).slice(0, 2) : [];
      const cli = await getClient();
      const db = cli.db(DB_NAME);
      const usersCol = db.collection('users');

      const projection = { _id: 1, username: 1, location: 1, goals: 1, experienceLevel: 1, bio: 1 };
      const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
      const hasAllNewFields = (u) =>
        nonEmpty(u?.location) && nonEmpty(u?.goals) && nonEmpty(u?.experienceLevel) && nonEmpty(u?.bio);

      const baseFilter = {
        location: { $type: 'string', $ne: '' },
        goals: { $type: 'string', $ne: '' },
        experienceLevel: { $type: 'string', $ne: '' },
        bio: { $type: 'string', $ne: '' }
      };

      let users = [];
      if (ids.length === 2) {
        const objectIds = ids
          .map((s) => {
            try { return new ObjectId(s); } catch { return null; }
          })
          .filter(Boolean);
        users = await usersCol.find({ _id: { $in: objectIds } }, { projection }).toArray();
      } else {
        users = await usersCol
          .aggregate([{ $match: baseFilter }, { $sample: { size: 2 } }, { $project: projection }])
          .toArray();
      }

      console.log('[compat]', `v=${RULE_VERSION}`, 'users loaded (new-fields)', {
        total: users.length,
        sample: users.slice(0, 2).map((u) => ({
          id: u._id,
          username: u.username,
          location: u.location,
          experienceLevel: u.experienceLevel,
          hasGoals: !!u.goals,
          hasBio: !!u.bio
        }))
      });

      const candidates = users.filter(hasAllNewFields).slice(0, 2);
      if (candidates.length !== 2) {
        console.warn('[compat]', `v=${RULE_VERSION}`, 'insufficient candidates for new-field rule', {
          totalUsersReturned: users.length,
          validCandidates: candidates.length
        });
        res.set('X-Compat-Version', RULE_VERSION);
        return res.status(400).json({
          ruleVersion: RULE_VERSION,
          usingNewFields: true,
          error:
            'Need at least 2 users with non-empty location, goals, experienceLevel, and bio (or provide exactly two via ids)'
        });
      }

      // If no ids provided: return two sampled users only (no AI call).
      if (ids.length !== 2) {
        console.log('[compat]', `v=${RULE_VERSION}`, 'returning sampled users without analysis');
        res.set('X-Compat-Version', RULE_VERSION);
        return res.json({ ruleVersion: RULE_VERSION, usingNewFields: true, users: candidates });
      }

      // With two ids: run Gemini using the new fields (optional).
      const prompt = buildPromptFromProfiles(candidates);
      let analysisText = '';
      try {
        analysisText = await analyzeWithGemini(prompt);
      } catch (aiErr) {
        console.warn('[compat]', `v=${RULE_VERSION}`, 'Gemini call failed; returning users without analysis', { message: aiErr?.message });
        analysisText = 'AI analysis unavailable right now.';
      }

      res.set('X-Compat-Version', RULE_VERSION);
      return res.json({ ruleVersion: RULE_VERSION, usingNewFields: true, users: candidates, analysisText });
    } catch (e) {
      console.error('[compat]', `v=${RULE_VERSION}`, 'handler failed', { message: e?.message });
      res.status(500).json({ error: e?.message || 'Internal error' });
    }
  });

  // Helper: Build Gemini prompt
  function buildPromptFromProfiles(users) {
    const [a, b] = users;
    const fmt = (u) =>
`Username: ${u.username}
Location: ${u.location}
Experience Level: ${u.experienceLevel}
Goals: ${u.goals}
Bio: ${u.bio}`;
    return `You are a helpful mentor/mentee match analyzer.
Compare these two profiles and provide:
- A short compatibility summary (2-3 sentences).
- 3 strengths of the match.
- 3 potential gaps with constructive tips.

Profile A:
${fmt(a)}

Profile B:
${fmt(b)}

Return plain text, concise.`;
  }

  // Helper: Call Gemini if configured; otherwise return a fallback message.
  async function analyzeWithGemini(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return 'AI analysis not configured.';
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = typeof result?.response?.text === 'function' ? result.response.text() : '';
      return (text || '').trim() || 'No analysis generated.';
    } catch (e) {
      console.warn('[compat] Gemini import/call failed', { message: e?.message });
      return 'AI analysis library not installed.';
    }
  }

  // Ping to verify route/version on the JS router
  router.get('/compat/ping', (_req, res) => {
    res.set('X-Compat-Version', RULE_VERSION);
    res.json({ ok: true, ruleVersion: RULE_VERSION });
  });
}

export default router;
