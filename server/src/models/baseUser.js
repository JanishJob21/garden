import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const Roles = ['member', 'manager', 'admin'];

export const baseUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      trim: true, 
      lowercase: true, 
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    password: { 
      type: String, 
      required: function() { 
        return !this.googleId; // Not required if signed in with Google
      } 
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true
    },
    picture: { type: String },
    isGoogleSignIn: { type: Boolean, default: false }
    // role is implied by collection
  },
  { 
    timestamps: true, 
    versionKey: false,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password; // Never return the password in API responses
        return ret;
      }
    }
  }
);

baseUserSchema.pre('save', async function (next) {
  // Only hash the password if it's modified (or new) and exists
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

baseUserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};
