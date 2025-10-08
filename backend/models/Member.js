const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make optional for public registration
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    street: { type: String, required: [true, 'Street address is required'] },
    city: { type: String, required: [true, 'City is required'] },
    state: { type: String, required: [true, 'State is required'] },
    zipCode: { type: String, required: [true, 'ZIP code is required'] }
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  emergencyContact: {
    name: { type: String, required: [true, 'Emergency contact name is required'] },
    relationship: { type: String, default: 'Emergency Contact' },
    phone: { type: String, required: [true, 'Emergency contact phone is required'] }
  },
  membershipType: {
    type: String,
    enum: ['individual', 'family', 'senior', 'student'],
    default: 'individual'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'suspended'],
    default: 'pending'
  },
  // Additional fields from the form
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    default: 'Prefer not to say'
  },
  experience: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  preferredTime: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'Any'],
    default: 'Morning'
  },
  disabilitySupport: {
    type: Boolean,
    default: false
  },
  gardenRulesAccepted: {
    type: Boolean,
    default: false,
    required: [true, 'You must accept the garden rules']
  },
  consent: {
    type: Boolean,
    default: false,
    required: [true, 'You must give consent to process your data']
  },
  newsletter: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
