import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const Roles = ['member', 'manager', 'admin'];

export const baseUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true },
    // role is implied by collection
  },
  { timestamps: true, versionKey: false }
);

baseUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

baseUserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};
