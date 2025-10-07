import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { Session } from '../models/Session.js';

const router = Router();

// List sessions with filters and pagination
router.get('/', auth, requireRole('admin'), async (req, res) => {
  const { q = '', status, from, to, page = 1, pageSize = 10 } = req.query;
  const query = {};
  if (q) {
    const rx = new RegExp(String(q), 'i');
    query.$or = [{ username: rx }, { email: rx }];
  }
  if (status && ['Active', 'Logged Out'].includes(status)) query.status = status;
  if (from || to) {
    query.loginAt = {};
    if (from) query.loginAt.$gte = new Date(from);
    if (to) query.loginAt.$lte = new Date(to);
  }

  const p = Math.max(1, parseInt(page));
  const ps = Math.min(100, Math.max(1, parseInt(pageSize)));

  const [items, total] = await Promise.all([
    Session.find(query).sort({ loginAt: -1 }).skip((p - 1) * ps).limit(ps).lean(),
    Session.countDocuments(query),
  ]);

  // compute durations on the fly
  const withDur = items.map(it => ({
    ...it,
    durationSec: Math.max(0, Math.floor(((it.logoutAt ? new Date(it.logoutAt) : new Date()) - new Date(it.loginAt)) / 1000))
  }));

  res.json({ items: withDur, total, page: p, pageSize: ps });
});

// Summary metrics for dashboard
router.get('/summary', auth, requireRole('admin'), async (_req, res) => {
  const total = await Session.countDocuments({});
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todayCount = await Session.countDocuments({ loginAt: { $gte: todayStart } });
  const active = await Session.countDocuments({ status: 'Active' });
  const uniqueUsersAgg = await Session.distinct('userId');
  res.json({ total, today: todayCount, active, uniqueUsers: uniqueUsersAgg.length });
});

// Delete a session by ID
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ message: 'Error deleting session', error: error.message });
  }
});

// Delete multiple sessions
router.delete('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No session IDs provided' });
    }
    
    const result = await Session.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No sessions found to delete' });
    }
    
    res.json({ 
      message: `${result.deletedCount} session(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting sessions:', error);
    res.status(500).json({ message: 'Error deleting sessions', error: error.message });
  }
});

export default router;
