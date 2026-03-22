const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  user_id: { type: String, unique: true, required: true },
  full_name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  kyc_status: { type: String, default: 'NOT_STARTED' },
  trade_id: { type: String, unique: true }, // ✅ Will be KS1-XXXX
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

// Generate trade_id in format KS1-ABCD (4 chars)
userSchema.pre('save', function(next) {
  if (!this.trade_id) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 4; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    this.trade_id = 'KS1-' + id;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
