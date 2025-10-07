import mongoose from 'mongoose';
import { baseUserSchema } from './baseUser.js';

export const Admin = mongoose.model('Admin', baseUserSchema, 'admins');
