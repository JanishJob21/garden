import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: false },
    rating: { type: Number, min: 1, max: 5 },
    comments: String,
    maintenanceType: String,
    photoUrl: String,
    hoursVolunteered: Number,
    urgency: String,
    contactMethod: String,
  },
  { timestamps: true }
);

export const Feedback = mongoose.model('Feedback', feedbackSchema);
