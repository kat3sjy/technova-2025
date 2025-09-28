import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';

const router = express.Router();
router.use(express.json());

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, password, ...rest } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const uname = String(username).toLowerCase();
    console.log('[AUTH] signup', uname);

    // If user exists (legacy), set password if missing; otherwise conflict
    const existing = await User.findOne({ username: uname }).select('+passwordHash');
    if (existing) {
      if (!existing.passwordHash) {
        existing.passwordHash = sha256(password);
        Object.assign(existing, rest || {});
        await existing.save();
        const safe = await User.findById(existing._id).lean();
        return res.status(200).json(safe);
      }
      return res.status(409).json({ error: 'Username already exists' });
    }

    const user = new User({ ...rest, username: uname, passwordHash: sha256(password) });
    await user.save();
    const safe = await User.findById(user._id).lean();
    res.status(201).json(safe);
  } catch (err) {
    const dup = err?.code === 11000;
    res.status(dup ? 409 : 400).json({ error: dup ? 'Username already exists' : (err?.message || 'Failed to sign up') });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    const uname = String(username).toLowerCase();
    console.log('[AUTH] login', uname);
    const user = await User.findOne({ username: uname }).select('+passwordHash');
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });

    // Legacy migration: if passwordHash missing, set it now
    const hash = sha256(password);
    if (!user.passwordHash) {
      user.passwordHash = hash;
      await user.save();
    } else if (user.passwordHash !== hash) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Return user without passwordHash
    const safe = await User.findById(user._id).lean();
    res.json(safe);
  } catch (err) {
    res.status(400).json({ error: err?.message || 'Failed to login' });
  }
});

export default router;
