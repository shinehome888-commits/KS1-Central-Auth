const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  // System IDs
  user_id: { type: String, unique: true, required: true },
  trade_id: { type: String, unique: true, required: true },

  // Personal Info
  full_name: { type: String, required: true },
  phone: { type: String, unique: true, required: true }, // WhatsApp-enabled
  password: { type: String, required: true },
  user_birthday: { type: Date, required: true },

  // Business Info
  business_name: { type: String, required: true },
  business_birthday: { type: Date, required: true },
  business_type: { 
    type: String, 
    required: true,
    enum: [
      'Entrepreneur', 'Trader', 'SME', 'Vendor', 'Startup',
      'Cooperative', 'NGO', 'Freelancer', 'Individual'
    ]
  },
  industry: { type: String, required: true },

  // Location
  country: { type: String, default: 'Ghana' },
  city: { type: String, required: true },
  town: { type: String, required: true },
  address: { type: String, required: true },

  // Optional
  wallet: { type: String, sparse: true }, // Can be null

  // System Status
  kyc_status: { type: String, default: 'NOT_STARTED' },
  trust_score: { type: Number, default: 50 },
  role: { type: String, default: 'user', enum: ['user', 'admin'] }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate IDs on first save
userSchema.pre('save', function(next) {
  if (!this.user_id) {
    this.user_id = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  if (!this.trade_id) {
    this.trade_id = 'KS1-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
