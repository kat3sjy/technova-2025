// ...existing code...

router.post('/api/compat/analyze', async (req, res) => {
  // ...existing code...
  console.log('[compat] /api/compat/analyze called', {
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

    console.log('[compat] users loaded (new-fields)', {
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
      console.warn('[compat] insufficient candidates for new-field rule', {
        totalUsersReturned: users.length,
        validCandidates: candidates.length
      });
      return res.status(400).json({
        error:
          'Need at least 2 users with non-empty location, goals, experienceLevel, and bio (or provide exactly two via ids)'
      });
    }

    // Use `candidates` for Gemini instead of vibeTags.
    // Build your prompt/input here (or adapt your existing code to use `candidates`):
    // const prompt = buildPromptFromProfiles(candidates); // e.g., include location/goals/experienceLevel/bio
    // const resultText = await yourGeminiCall(prompt);

    // Make sure your existing analysis code uses `candidates` as the input:
    // ...existing code that calls Gemini, replace previous `users` usage with `candidates`...

    // If your handler responds here, include users and the AI result:
    // return res.json({ users: candidates, resultText });

    // ...existing code...
  } catch (err: any) {
    console.error('[compat] analyze failed', { message: err?.message, stack: err?.stack });
    // ...existing error handling...
  }
});

// ...existing code...
