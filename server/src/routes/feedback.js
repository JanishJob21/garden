import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { Feedback } from '../models/Feedback.js';

const router = Router();

// Create feedback
router.post('/', auth, async (req, res) => {
  const payload = req.body || {};
  const doc = await Feedback.create({
    ...payload,
    userId: req.user._id,
  });
  res.status(201).json({ feedback: doc });
});

// My feedback
router.get('/me', auth, async (req, res) => {
  const list = await Feedback.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ feedback: list });
});

// Admin list all
router.get('/', auth, requireRole('admin', 'manager'), async (_req, res) => {
  const list = await Feedback.find().sort({ createdAt: -1 });
  res.json({ feedback: list });
});

export default router;
