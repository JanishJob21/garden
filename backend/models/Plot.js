const mongoose = require('mongoose');

const plotSchema = new mongoose.Schema({
  plotNumber: {
    type: String,
    required: true,
    unique: true
  },
  size: {
    type: Number, // in square meters
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'under_maintenance'],
    default: 'available'
  },
  pricePerMonth: {
    type: Number,
    required: true
  },
  features: [{
    type: String
  }],
  description: String,
  imageUrl: String
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  plot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plot',
    required: true
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: String,
  notes: String
}, { timestamps: true });

const Plot = mongoose.model('Plot', plotSchema);
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { Plot, Booking };
