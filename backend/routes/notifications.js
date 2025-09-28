import express from "express";
import User from "../models/User.js";

const router = express.Router();

// GET /api/notifications/:userId
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.notifications || []);
  } catch (err) {
    res.status(400).json({ error: err?.message || "Failed to fetch notifications" });
  }
});

export default router;
