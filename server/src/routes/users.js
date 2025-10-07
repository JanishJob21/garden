import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { Admin } from '../models/Admin.js';
import { Manager } from '../models/Manager.js';
import { Member } from '../models/Member.js';

const router = Router();

// Get current user profile
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

const models = {
  admin: Admin,
  manager: Manager,
  member: Member,
};

const listAllUsers = async () => {
  const [admins, managers, members] = await Promise.all([
    Admin.find().select('-password').lean(),
    Manager.find().select('-password').lean(),
    Member.find().select('-password').lean(),
  ]);
  const addRole = (arr, role) => arr.map((u) => ({ ...u, role }));
  return [...addRole(admins, 'admin'), ...addRole(managers, 'manager'), ...addRole(members, 'member')]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// List all users (accessible by both admin and manager)
router.get('/', auth, requireRole('admin', 'manager'), async (req, res) => {
  const users = await listAllUsers();
  // For managers, filter out sensitive information
  if (req.user.role === 'manager') {
    const filteredUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    return res.json({ users: filteredUsers });
  }
  res.json({ users });
});

// Admin only: update a user's role by moving doc across collections
router.patch('/:id/role', auth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { role: newRole } = req.body;
  if (!['member', 'manager', 'admin'].includes(newRole)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  // Find user in any collection
  const [a, m, me] = await Promise.all([
    Admin.findById(id),
    Manager.findById(id),
    Member.findById(id),
  ]);
  const currentDoc = a || m || me;
  const currentRole = a ? 'admin' : m ? 'manager' : me ? 'member' : null;
  if (!currentDoc) return res.status(404).json({ message: 'User not found' });
  if (currentRole === newRole) return res.json({ user: { ...currentDoc.toObject(), role: currentRole } });

  // Create in new collection and delete old
  const NewModel = models[newRole];
  const payload = {
    name: currentDoc.name,
    email: currentDoc.email,
    password: currentDoc.password, // already hashed
    createdAt: currentDoc.createdAt,
    updatedAt: new Date(),
  };
  const created = await NewModel.create(payload);
  await currentDoc.deleteOne();

  const result = (await NewModel.findById(created._id).select('-password')).toObject();
  res.json({ user: { ...result, role: newRole } });
});

export default router;
