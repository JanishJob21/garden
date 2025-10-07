import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'roleModel', required: false },
    roleModel: { type: String, enum: ['Admin', 'Manager', 'Member'], required: false },
    memberName: String,
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    age: Number,
    gender: String,
    experience: String,
    preferredTime: String,
    emergencyName: String,
    emergencyPhone: String,
    consent: Boolean,
    newsletter: Boolean,
    idProofUrl: String,
    gardenRulesAccepted: Boolean,
    toolsTraining: String,
    disabilitySupport: String,
    notes: String,
  },
  { timestamps: true }
);

registrationSchema.index({ email: 1 }, { unique: true });

export const Registration = mongoose.model('Registration', registrationSchema);
