import express from "express";
import User from "../models/User.js";

const router = express.Router();

// POST /api/matches/request
router.post("/request", async (req, res) => {
  const { fromId, toId } = req.body;
  if (!fromId || !toId) return res.status(400).json({ error: "fromId and toId required" });
  try {
    const toUser = await User.findById(toId);
    if (!toUser) return res.status(404).json({ error: "User not found" });
    toUser.notifications.push({ type: "match", from: fromId, status: "pending" });
    await toUser.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err?.message || "Failed to send match request" });
  }
});

// POST /api/matches/approve
router.post("/approve", async (req, res) => {
  const { userId, fromId } = req.body;
  if (!userId || !fromId) return res.status(400).json({ error: "userId and fromId required" });
  try {
    const user = await User.findById(userId);
    const fromUser = await User.findById(fromId);
    if (!user || !fromUser) return res.status(404).json({ error: "User not found" });
    // Find notification
    const notif = user.notifications.find(n => n.type === "match" && String(n.from) === String(fromId) && n.status === "pending");
    if (!notif) return res.status(404).json({ error: "Match request not found" });
    notif.status = "approved";
    // Add each other as friends
    if (!user.friends.includes(fromId)) user.friends.push(fromId);
    if (!fromUser.friends.includes(userId)) fromUser.friends.push(userId);
    await user.save();
    await fromUser.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err?.message || "Failed to approve match" });
  }
});

export default router;
