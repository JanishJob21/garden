import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  loginAt: { type: Date, required: true, default: Date.now },
  logoutAt: { type: Date, default: null },
  status: { type: String, enum: ['Active', 'Logged Out'], default: 'Active', index: true },
}, { timestamps: true, versionKey: false });

SessionSchema.virtual('durationSec').get(function () {
  const end = this.logoutAt || new Date();
  return Math.max(0, Math.floor((end - this.loginAt) / 1000));
});

SessionSchema.set('toJSON', { virtuals: true });
SessionSchema.set('toObject', { virtuals: true });

export const Session = mongoose.model('Session', SessionSchema, 'sessions');
