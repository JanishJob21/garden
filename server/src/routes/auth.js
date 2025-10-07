import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { Admin } from '../models/Admin.js';
import { Manager } from '../models/Manager.js';
import { Member } from '../models/Member.js';
import { auth } from '../middleware/auth.js';
import { Session } from '../models/Session.js';

const router = Router();

// Initialize Google OAuth client when needed
const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth client configuration is missing. Please check your environment variables.');
  }
  return new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  });
};

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

// Google OAuth endpoint
router.post('/google', async (req, res) => {
  try {
    console.log('Google auth request received');
    const { credential } = req.body;
    
    if (!credential) {
      console.error('No credential provided in request');
      return res.status(400).json({ 
        success: false,
        message: 'No credential provided' 
      });
    }
    
    const client = getGoogleClient();
    
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
    }
    
    const { name, email, picture, sub: googleId } = payload;
    console.log('Google user authenticated:', { email, name });
    if (!email) {
      throw new Error('No email in Google token');
    }
    
    // Check if user exists with this email
    const { user: existingUser, role: existingRole } = await findUserByEmailAcross(email) || {};
    
    if (existingUser) {
      // User exists, update Google ID if not set
      if (!existingUser.googleId) {
        existingUser.googleId = googleId;
        await existingUser.save();
      }
      
      // Generate token
      const token = signToken({ _id: existingUser._id, role: existingRole });
      
      // Create session
      await Session.create({ 
        userId: existingUser._id,
        username: existingUser.name,
        email: existingUser.email,
        loginAt: new Date(),
        status: 'Active',
        authMethod: 'google'
      });
      
      return res.json({
        success: true,
        token,
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingRole,
          profilePicture: existingUser.profilePicture || picture
        }
      });
    }
    
    // User doesn't exist, create new member
    const newMember = new Member({
      name,
      email,
      googleId,
      phone: '',
      address: '',
      plotNumber: '',
      joinDate: new Date(),
      status: 'Active',
      profilePicture: picture || ''
    });

    try {
      await newMember.save();
      console.log('New user created with Google OAuth:', { email, userId: newMember._id });
      
      // Generate token
      const token = signToken({ _id: newMember._id, role: 'member' });
      
      // Create session
      await Session.create({ 
        userId: newMember._id,
        username: newMember.name,
        email: newMember.email,
        loginAt: new Date(),
        status: 'Active',
        authMethod: 'google'
      });
      
      return res.status(201).json({
        success: true,
        token,
        user: {
          _id: newMember._id,
          name: newMember.name,
          email: newMember.email,
          role: 'member',
          profilePicture: newMember.profilePicture
        }
      });
    } catch (error) {
      console.error('Error in creating new member:', error);
      return res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to create new member' 
      });
    }
    
  } catch (error) {
    console.error('Error in Google OAuth:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message || 'Authentication failed' 
    });
  }
});

// Login route
router.post('/login', 
  body('email').isEmail(), 
  body('password').notEmpty(),
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
        await Session.create({ 
          userId: admin._id, 
          username: admin.name, 
          email: admin.email, 
          loginAt: new Date(), 
          status: 'Active' 
        });
        return res.json({ 
          token, 
          user: { 
            id: admin._id, 
            name: admin.name, 
            email: admin.email, 
            role: 'admin' 
          } 
        });
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
        await Session.create({ 
          userId: manager._id, 
          username: manager.name, 
          email: manager.email, 
          loginAt: new Date(), 
          status: 'Active' 
        });
        return res.json({ 
          token, 
          user: { 
            id: manager._id, 
            name: manager.name, 
            email: manager.email, 
            role: 'manager' 
          } 
        });
      }

      // Regular user login
      const { user, role } = await findUserByEmailAcross(email);
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
      
      const token = signToken({ _id: user._id, role });
      await Session.create({ 
        userId: user._id, 
        username: user.name, 
        email: user.email, 
        loginAt: new Date(), 
        status: 'Active' 
      });
      
      res.json({ 
        token, 
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          role,
          picture: user.picture
        } 
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Logout route
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
  } catch (e) { 
    return res.status(500).json({ message: 'Server error' }); 
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

export default router;