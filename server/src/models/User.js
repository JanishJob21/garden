import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const Roles = ['member', 'manager', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      trim: true, 
      lowercase: true, 
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: { 
      type: String, 
      required: function() {
        return !this.googleId; // Only required if not using Google OAuth
      }
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true
    },
    role: { 
      type: String, 
      enum: Roles, 
      default: 'member', 
      index: true 
    },
    // Add any profile fields needed later
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password; // Never return the password in API responses
        return ret;
      }
    }
  }
);

// Only hash password if it's modified or new
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password) { // Only hash if password exists
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
export const RoleEnum = Roles;
