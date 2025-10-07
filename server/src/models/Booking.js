import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    memberName: String,
    plotId: String,
    plotSize: String,
    startDate: String,
    endDate: String,
    cropType: String,
    wateringFreq: String,
    compost: String,
    irrigationSlot: String,
    shared: String,
    toolKit: String,
    waterAccess: String,
    notes: String,
    status: { type: String, default: 'Pending' },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);
