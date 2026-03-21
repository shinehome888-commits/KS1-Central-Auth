// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true,
    required: true
  },
  full_name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  kyc_status: { type: String, default: 'NOT_STARTED' },
  trade_id: { type: String, default: '' },
  trust_score: { type: Number, default: 50 },
  role: { type: String, default: 'user', enum: ['user', 'admin'] }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate user_id on first save
userSchema.pre('save', function(next) {
  if (!this.user_id) {
    this.user_id = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
