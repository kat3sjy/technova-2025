import express from 'express';
import { MongoClient } from 'mongodb';
import { analyzeCompatibility, healthCheckGemini } from '../scripts/analyze-compatibility.js';

const router = express.Router();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'technova';

let client;
async function getClient() {
  if (client && client.topology && client.topology.isConnected()) return client;
  client = new MongoClient(MONGO_URI, { retryWrites: true, w: 'majority' });
  await client.connect();
  return client;
}

router.get('/api/compat/ai-health', async (req, res) => {
  try {
    const hc = await healthCheckGemini();
    res.json({
      ok: !!hc.ok,
      provider: 'gemini',
      model: hc.model,
      reply: hc.reply,
      error: hc.error,
      reason: hc.reason,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

router.post('/api/compat/analyze', async (req, res) => {
  try {
    if (!MONGO_URI) return res.status(500).json({ ok: false, error: 'Missing MONGO_URI' });
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.join(',')
      : (req.body?.ids || req.query?.ids || '');
    const cli = await getClient();
    const db = cli.db(DB_NAME);

    const { users, analysis, prompt } = await analyzeCompatibility(db, ids || undefined);

    console.log('--- Gemini Compatibility Analysis ---');
    console.log(analysis);
    console.log('-------------------------------------');

    res.json({
      ok: true,
      analysis,
      text: analysis,
      result: analysis,
      message: analysis,
      content: analysis,
      prompt,
      users: users.map(u => ({
        _id: u._id,
        username: u.username || u.name || '',
        goals: Array.isArray(u.goals) ? u.goals : (u.goals ? [u.goals] : []),
        location: u.location || '',
        experienceLevel: u.experienceLevel || '',
      })),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

export default router;
