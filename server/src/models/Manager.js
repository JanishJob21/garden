import mongoose from 'mongoose';
import { baseUserSchema } from './baseUser.js';

export const Manager = mongoose.model('Manager', baseUserSchema, 'managers');
