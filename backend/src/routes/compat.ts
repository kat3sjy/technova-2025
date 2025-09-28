// ...existing code...

// Stamp to verify we're on the new-field rule
const RULE_VERSION = 'compat-new-fields-v2';

router.post('/api/compat/analyze', async (req, res) => {
  // ...existing code...
  console.log('[compat]', `v=${RULE_VERSION}`, '/api/compat/analyze called', {
    ids: req.body?.ids,
    idsType: Array.isArray(req.body?.ids) ? 'array' : typeof req.body?.ids,
    idsCount: Array.isArray(req.body?.ids) ? req.body?.ids?.length : undefined
  });

  try {
    // Replace legacy vibeTags-driven user loading with new-field selection:
    const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids.filter(Boolean).slice(0, 2) : [];

    const projection = { _id: 1, username: 1, location: 1, goals: 1, experienceLevel: 1, bio: 1 };
    const nonEmpty = (v: any) => typeof v === 'string' && v.trim().length > 0;
    const hasAllNewFields = (u: any) =>
      nonEmpty(u?.location) && nonEmpty(u?.goals) && nonEmpty(u?.experienceLevel) && nonEmpty(u?.bio);

    const baseFilter = {
      location: { $type: 'string', $ne: '' },
      goals: { $type: 'string', $ne: '' },
      experienceLevel: { $type: 'string', $ne: '' },
      bio: { $type: 'string', $ne: '' }
    };

    let users: any[] = [];
    if (ids.length === 2) {
      users = await User.find({ _id: { $in: ids } }, projection).lean();
    } else {
      // Sample two users that have the required fields
      users = await User.aggregate([
        { $match: baseFilter },
        { $sample: { size: 2 } },
        { $project: projection }
      ]);
    }

    console.log('[compat]', `v=${RULE_VERSION}`, 'users loaded (new-fields)', {
      total: users.length,
      sample: users.slice(0, 2).map((u: any) => ({
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

    // With two ids: run Gemini using the new fields.
    const prompt = buildPromptFromProfiles(candidates);
    let analysisText = '';
    try {
      analysisText = await analyzeWithGemini(prompt);
    } catch (aiErr: any) {
      console.warn('[compat]', `v=${RULE_VERSION}`, 'Gemini call failed; returning users without analysis', { message: aiErr?.message });
      analysisText = 'AI analysis unavailable right now.';
    }

    res.set('X-Compat-Version', RULE_VERSION);
    return res.json({ ruleVersion: RULE_VERSION, usingNewFields: true, users: candidates, analysisText });
    // ...existing code...
  } catch (err: any) {
    console.error('[compat]', `v=${RULE_VERSION}`, 'analyze failed', { message: err?.message, stack: err?.stack });
    // ...existing error handling...
  }
});

// Helper: Build Gemini prompt from the two profiles (uses new fields).
function buildPromptFromProfiles(users: Array<{
  _id: any;
  username: string;
  location: string;
  goals: string;
  experienceLevel: string;
  bio: string;
}>) {
  const [a, b] = users;
  const fmt = (u: any) =>
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
async function analyzeWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return 'AI analysis not configured.';
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const text = typeof result?.response?.text === 'function' ? result.response.text() : '';
    return (text || '').trim() || 'No analysis generated.';
  } catch (e: any) {
    console.warn('[compat] Gemini import/call failed', { message: e?.message });
    return 'AI analysis library not installed.';
  }
}

// Optional: quick ping to verify the new handler/version
router.get('/api/compat/ping', (_req, res) => {
  res.set('X-Compat-Version', RULE_VERSION);
  res.json({ ok: true, ruleVersion: RULE_VERSION });
});

// ...existing code...
