const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure efficient queries for tenant isolation
noteSchema.index({ tenantId: 1, createdAt: -1 });
noteSchema.index({ tenantId: 1, createdBy: 1 });
noteSchema.index({ tenantId: 1, isActive: 1 });

// Update the updatedAt field before saving
noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to count notes for a tenant
noteSchema.statics.countByTenant = function(tenantId) {
  return this.countDocuments({ tenantId, isActive: true });
};

// Static method to find notes by tenant
noteSchema.statics.findByTenant = function(tenantId, options = {}) {
  const query = { tenantId, isActive: true };
  return this.find(query)
    .populate('createdBy', 'email role')
    .populate('updatedBy', 'email role')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 0);
};

// Method to check if user can modify this note
noteSchema.methods.canModify = function(userId) {
  return this.createdBy.toString() === userId.toString();
};

module.exports = mongoose.model('Note', noteSchema);