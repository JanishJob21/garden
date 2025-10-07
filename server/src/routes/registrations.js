import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { auth, requireRole } from '../middleware/auth.js';
import { Registration } from '../models/Registration.js';

const router = Router();

// Helper: try decode token if present
const tryDecode = (req) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET || 'dev_secret'); }
  catch { return null; }
};

// Create a registration; token optional. If valid token, link to user.
router.post('/', async (req, res) => {
  const payload = req.body || {};
  const decoded = tryDecode(req);
  try {
    const doc = await Registration.create({
      ...payload,
      userId: decoded?.id || null,
      roleModel: decoded?.role ? (decoded.role.charAt(0).toUpperCase() + decoded.role.slice(1)) : undefined,
    });
    res.status(201).json({ registration: doc });
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.email) {
      return res.status(409).json({ message: 'This email is already registered' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my registrations
router.get('/me', auth, async (req, res) => {
  const list = await Registration.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ registrations: list });
});

// Admin list
router.get('/', auth, requireRole('admin', 'manager'), async (_req, res) => {
  const list = await Registration.find().sort({ createdAt: -1 });
  res.json({ registrations: list });
});

export default router;
