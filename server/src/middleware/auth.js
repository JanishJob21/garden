import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { Manager } from '../models/Manager.js';
import { Member } from '../models/Member.js';

export const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    // decoded carries { id, role }
    const Model = decoded.role === 'admin' ? Admin : decoded.role === 'manager' ? Manager : Member;
    const user = await Model.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = { ...user.toObject(), role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Middleware to check if user has one of the required roles
 * @param {...string} roles - List of allowed roles
 * @returns {Function} Express middleware function
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required. Please log in.' 
    });
  }
  
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ 
      success: false,
      message: 'You do not have permission to perform this action.',
      requiredRoles: roles,
      userRole: req.user.role
    });
  }
  
  next();
};
