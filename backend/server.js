import 'dotenv/config';
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { randomUUID, scryptSync, timingSafeEqual } from 'crypto';
import chatRouter from './chat/router.js';
import { chatStore } from './chat/store.js';
import compatRouter from './routes/compatibility.js';
import User from './models/User.js';
import profileRoutes from "./routes/profile.js";
import legacyMatchesRoutes from "./routes/matches.js";
import messageRoutes from "./routes/messages.js";
import matchRoutes from './routes/matchRoutes.js';

// ensure `app` is exported for tests
export const app = express();
app.use(express.json());

// CORS (allow specific origin if provided)
const rawOrigins = (process.env.FRONTEND_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = rawOrigins.length ? rawOrigins : ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Basic API request logger (helps trace 400s/500s)
app.use((req, _res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`[req] ${req.method} ${req.path} ct=${req.get('content-type') || '-'} len=${req.get('content-length') || '-'}`);
  }
  next();
});

// Log JSON parse errors explicitly as 400 with JSON payload
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('[json] parse error:', err.message);
    return res.status(400).json({ error: 'Invalid JSON', details: err.message });
  }
  next(err);
});

// MongoDB connection (optional in dev)
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (mongoUri) {
  mongoose
    .connect(mongoUri, { dbName: process.env.MONGODB_DB || 'technova' })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
      console.error("MongoDB connection error:", err?.message || err);
      // Do not exit; allow chat-only mode to continue
    });
} else {
  console.warn("No MONGODB_URI set. Skipping MongoDB connection (dev chat mode).");
}

// Mount chat HTTP routes
app.use('/api/chat', chatRouter);

// Mount compatibility router
app.use(compatRouter);

// --- Auth routes must be registered BEFORE any generic '/api' routers ---
function hashPassword(password) {
  const salt = randomUUID();
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, storedHex] = (stored || '').split(':');
  if (!salt || !storedHex) return false;
  const computed = scryptSync(password, salt, 64).toString('hex');
  try {
    return timingSafeEqual(Buffer.from(storedHex, 'hex'), Buffer.from(computed, 'hex'));
  } catch {
    return false;
  }
}

function sanitizeUser(u) {
  if (!u) return null;
  if (typeof u.toSafeJSON === 'function') return u.toSafeJSON();
  return {
    id: u._id,
    username: u.username,
    email: u.email,
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    tags: Array.isArray(u.tags) ? u.tags : [],
    experienceLevel: u.experienceLevel || '',
    goals: u.goals || '',
    bio: u.bio || '',
    location: u.location || '',
    avatarUrl: u.avatarUrl || undefined,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
  };
}

app.post('/api/auth/signup', async (req, res) => {
  console.debug('[auth.signup.v2] incoming body:', req.body);
  const { username, password, email } = req.body || {};
  const missing = ['username', 'password'].filter(k => !req.body || !req.body[k]);
  if (missing.length) {
    console.warn('[auth.signup.v2] missing fields:', missing, 'content-type:', req.get('content-type'));
    return res.status(400).json({ error: 'username and password are required', missing });
  }

  try {
    const usernameLower = String(username).trim().toLowerCase();
    const emailLower = email ? String(email).trim().toLowerCase() : undefined;

    // Check for existing username/email
    const orConds = [{ usernameLower }];
    if (emailLower) orConds.push({ emailLower });
    const existing = await User.findOne({ $or: orConds });
    if (existing) {
      const taken = existing.usernameLower === usernameLower ? 'username' : 'email';
      return res.status(409).json({ error: `${taken} already taken` });
    }

    const passwordHash = hashPassword(password);
    const user = new User({
      username: String(username).trim(),
      usernameLower,
      passwordHash,
      email: email ? String(email).trim() : undefined,
      emailLower,
    });
    await user.save();
    return res.status(201).json({ user: sanitizeUser(user) });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'username or email already taken' });
    }
    console.error('[auth.signup.v2] error:', err);
    return res.status(500).json({ error: 'internal error' });
  }
});

// Add login
app.post('/api/auth/login', async (req, res) => {
  console.debug('[auth.login.v2] incoming keys:', req.body ? Object.keys(req.body) : null);
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  try {
    const usernameLower = String(username).trim().toLowerCase();
    const user = await User.findOne({ usernameLower });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('[auth.login.v2] error:', err);
    return res.status(500).json({ error: 'internal error' });
  }
});

// Upsert profile fields into the existing user document (users collection)
app.post('/api/users/profile', async (req, res) => {
  try {
    const { username, ...rest } = req.body || {};
    if (!username) return res.status(400).json({ error: 'username is required' });

    const usernameLower = String(username).trim().toLowerCase();
    const user = await User.findOne({ usernameLower });
    if (!user) return res.status(404).json({ error: 'user not found' });

    // Allow only known profile fields
    const allowed = ['firstName','lastName','tags','experienceLevel','goals','bio','location','avatarUrl'];
    const update = {};
    for (const k of allowed) {
      if (k in rest) {
        if (k === 'tags' && Array.isArray(rest[k])) {
          update[k] = rest[k].map(String);
        } else if (typeof rest[k] !== 'undefined') {
          update[k] = rest[k];
        }
      }
    }

    const saved = await User.findOneAndUpdate(
      { usernameLower },
      { $set: update },
      { new: true }
    );

    return res.json({ user: sanitizeUser(saved) });
  } catch (err) {
    console.error('[users.profile] error:', err);
    return res.status(500).json({ error: 'internal error' });
  }
});

// Mount remaining routes AFTER auth so they don't shadow it
app.use("/api/profile", profileRoutes);
app.use("/api/matches", legacyMatchesRoutes);
app.use("/api/messages", messageRoutes);
app.use('/api', matchRoutes);

// Start HTTP server + Socket.IO
const port = Number(process.env.PORT) || 3000;
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

io.on('connection', (socket) => {
  console.log('[io] client connected', socket.id);
  socket.on('disconnect', () => console.log('[io] client disconnected', socket.id));
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`FRONTEND_ORIGIN env: ${process.env.FRONTEND_ORIGIN || '-'}`);
});
