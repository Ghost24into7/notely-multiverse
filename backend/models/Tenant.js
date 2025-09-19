const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  subscription: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
tenantSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to get subscription limits
tenantSchema.methods.getNotesLimit = function() {
  return this.subscription === 'free' ? 3 : null; // null means unlimited
};

// Method to upgrade subscription
tenantSchema.methods.upgradeToPro = function() {
  this.subscription = 'pro';
  return this.save();
};

module.exports = mongoose.model('Tenant', tenantSchema);