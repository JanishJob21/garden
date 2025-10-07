import mongoose from 'mongoose';
import { baseUserSchema } from './baseUser.js';

export const Member = mongoose.model('Member', baseUserSchema, 'members');
