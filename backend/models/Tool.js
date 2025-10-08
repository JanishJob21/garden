const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['hand', 'power', 'watering', 'digging', 'pruning', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'checked_out', 'maintenance', 'retired'],
    default: 'available'
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'needs_repair'],
    default: 'good'
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  },
  nextMaintenance: {
    type: Date
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  purchasePrice: Number,
  replacementCost: Number,
  location: String,
  imageUrl: String,
  notes: String,
  checkoutHistory: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    checkoutDate: {
      type: Date,
      default: Date.now
    },
    returnDate: Date,
    conditionBefore: String,
    conditionAfter: String,
    notes: String
  }]
}, { timestamps: true });

// Add a method to check out the tool
toolSchema.methods.checkOut = async function(memberId, notes = '') {
  if (this.status !== 'available') {
    throw new Error('Tool is not available for checkout');
  }
  
  this.status = 'checked_out';
  this.checkoutHistory.push({
    member: memberId,
    checkoutDate: new Date(),
    conditionBefore: this.condition,
    notes
  });
  
  return this.save();
};

// Add a method to return the tool
toolSchema.methods.returnTool = async function(condition, notes = '') {
  if (this.status !== 'checked_out') {
    throw new Error('Tool is not checked out');
  }
  
  this.status = 'available';
  this.condition = condition;
  const currentCheckout = this.checkoutHistory[this.checkoutHistory.length - 1];
  currentCheckout.returnDate = new Date();
  currentCheckout.conditionAfter = condition;
  currentCheckout.notes = notes;
  
  return this.save();
};

module.exports = mongoose.model('Tool', toolSchema);
