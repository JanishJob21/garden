import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { ToolsConfirmation } from '../models/ToolsConfirmation.js';

const router = Router();

// Create tools confirmation
router.post('/', auth, async (req, res) => {
  const payload = req.body || {};
  const doc = await ToolsConfirmation.create({
    ...payload,
    userId: req.user._id,
  });
  res.status(201).json({ tools: doc });
});

// My tools confirmations
router.get('/me', auth, async (req, res) => {
  const list = await ToolsConfirmation.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ tools: list });
});

// Admin list all
router.get('/', auth, requireRole('admin', 'manager'), async (_req, res) => {
  const list = await ToolsConfirmation.find().sort({ createdAt: -1 });
  res.json({ tools: list });
});

export default router;
