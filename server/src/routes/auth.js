import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { Manager } from '../models/Manager.js';
import { Member } from '../models/Member.js';
import { auth } from '../middleware/auth.js';
import { Session } from '../models/Session.js';

const router = Router();

const signToken = (user) => {
  const payload = { id: user._id, role: user.role };
  const secret = process.env.JWT_SECRET || 'dev_secret';
  const expiresIn = process.env.JWT_EXPIRES || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

const getModelByRole = (role) => {
  if (role === 'admin') return Admin;
  if (role === 'manager') return Manager;
  return Member;
};

const findUserByEmailAcross = async (email) => {
  const [admin, manager, member] = await Promise.all([
    Admin.findOne({ email }),
    Manager.findOne({ email }),
    Member.findOne({ email }),
  ]);
  if (admin) return { user: admin, role: 'admin' };
  if (manager) return { user: manager, role: 'manager' };
  if (member) return { user: member, role: 'member' };
  return { user: null, role: null };
};

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6'),
    body('role').notEmpty().isIn(['member', 'manager', 'admin']).withMessage('Invalid role'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;
    try {
      const { user: found } = await findUserByEmailAcross(email);
      if (found) return res.status(409).json({ message: 'Email already in use' });
      const Model = getModelByRole(role);
      const created = await Model.create({ name, email, password });
      const token = signToken({ _id: created._id, role });
      res.status(201).json({ token, user: { id: created._id, name: created.name, email: created.email, role } });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      // Direct login for special accounts via environment variables
      const { ADMIN_EMAIL, ADMIN_PASS, MANAGER_EMAIL, MANAGER_PASS } = process.env;
      const emailLc = String(email || '').toLowerCase();

      // Admin direct login
      if (
        ADMIN_EMAIL && ADMIN_PASS &&
        emailLc === String(ADMIN_EMAIL).toLowerCase() &&
        password === ADMIN_PASS
      ) {
        let admin = await Admin.findOne({ email: ADMIN_EMAIL });
        if (!admin) {
          admin = await Admin.create({ name: 'Admin', email: ADMIN_EMAIL, password: ADMIN_PASS });
        }
        const token = signToken({ _id: admin._id, role: 'admin' });
        // Create session
        await Session.create({ userId: admin._id, username: admin.name, email: admin.email, loginAt: new Date(), status: 'Active' });
        return res.json({ token, user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' } });
      }

      // Manager direct login
      if (
        MANAGER_EMAIL && MANAGER_PASS &&
        emailLc === String(MANAGER_EMAIL).toLowerCase() &&
        password === MANAGER_PASS
      ) {
        let manager = await Manager.findOne({ email: MANAGER_EMAIL });
        if (!manager) {
          manager = await Manager.create({ name: 'Manager', email: MANAGER_EMAIL, password: MANAGER_PASS });
        }
        const token = signToken({ _id: manager._id, role: 'manager' });
        await Session.create({ userId: manager._id, username: manager.name, email: manager.email, loginAt: new Date(), status: 'Active' });
        return res.json({ token, user: { id: manager._id, name: manager.name, email: manager.email, role: 'manager' } });
      }

      const { user, role } = await findUserByEmailAcross(email);
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
      const token = signToken({ _id: user._id, role });
      await Session.create({ userId: user._id, username: user.name, email: user.email, loginAt: new Date(), status: 'Active' });
      res.json({ token, user: { id: user._id, name: user.name, email: user.email, role } });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Logout: closes the latest active session for the current user
router.post('/logout', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const active = await Session.findOne({ userId, status: 'Active' }).sort({ loginAt: -1 });
    if (active) {
      active.status = 'Logged Out';
      active.logoutAt = new Date();
      await active.save();
    }
    return res.json({ ok: true });
  } catch (e) { return res.status(500).json({ message: 'Server error' }); }
});

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
