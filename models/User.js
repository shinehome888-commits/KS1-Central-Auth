// KS1-Central-Auth/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Helper to generate unique IDs
const generateUserId = () => 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
const generateTradeId = () => 'KS1-' + Math.random().toString(36).substr(2, 8).toUpperCase();

const userSchema = new mongoose.Schema({
  user_id: { 
    type: String, 
    unique: true, 
    required: true,
    default: generateUserId
  },
  trade_id: { 
    type: String, 
    unique: true, 
    required: true,
    default: generateTradeId
  },
  full_name: { type: String, required: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  user_birthday: { type: Date, required: true },
  business_name: { type: String, required: true },
  business_birthday: { type: Date, required: true },
  business_type: { 
    type: String, 
    required: true,
    enum: ['Entrepreneur','Trader','SME','Vendor','Startup','Cooperative','NGO','Freelancer','Individual']
  },
  industry: { type: String, required: true },
  country: { type: String, default: 'Ghana' },
  city: { type: String, required: true },
  town: { type: String, required: true },
  address: { type: String, required: true },
  wallet: { type: String, sparse: true },
  kyc_status: { type: String, default: 'NOT_STARTED' },
  trust_score: { type: Number, default: 50 },
  role: { type: String, default: 'user', enum: ['user', 'admin'] }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Hash password BEFORE save
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
