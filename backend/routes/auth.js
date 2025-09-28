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
    console.log('[auth] signup attempt', uname);
    const user = new User({ ...rest, username: uname, passwordHash: sha256(password) });
    await user.save();
    const safe = await User.findById(user._id).lean();
    console.log('[auth] signup success', safe?._id?.toString());
    res.status(201).json(safe);
  } catch (err) {
    const dup = err?.code === 11000;
    if (dup) console.warn('[auth] signup duplicate username');
    else console.error('[auth] signup error', err?.message || err);
    res.status(dup ? 409 : 400).json({ error: dup ? 'Username already exists' : (err?.message || 'Failed to sign up') });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    const user = await User.findOne({ username: String(username).toLowerCase() }).select('+passwordHash');
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });
    if (user.passwordHash !== sha256(password)) return res.status(401).json({ error: 'Invalid username or password' });

    // Return user without passwordHash
    const safe = await User.findById(user._id).lean();
    console.log('[auth] login ok', safe?._id?.toString());
    res.json(safe);
  } catch (err) {
    console.error('[auth] login error', err?.message || err);
    res.status(400).json({ error: err?.message || 'Failed to login' });
  }
});

// GET /api/auth/user/:username (debug)
router.get('/user/:username', async (req, res) => {
  try {
    const uname = String(req.params.username || '').toLowerCase();
    if (!uname) return res.status(400).json({ error: 'username required' });
    const user = await User.findOne({ username: uname }).lean();
    if (!user) return res.status(404).json({ error: 'not found' });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: 'failed to fetch' });
  }
});

export default router;
