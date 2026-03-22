const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_2026';
const JWT_EXPIRES_IN = 86400; // 24 hours

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      full_name,
      phone,
      password,
      user_birthday,
      business_name,
      business_birthday,
      business_type,
      industry,
      country = 'Ghana',
      city,
      town,
      address,
      wallet
    } = req.body;

    // Validate required fields
    if (!full_name || !phone || !password || !user_birthday ||
        !business_name || !business_birthday || !business_type ||
        !industry || !city || !town || !address) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Check if user exists
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(409).json({ error: 'User with this phone already exists' });
    }

    // Create user
    const user = new User({
      full_name,
      phone,
      password,
      user_birthday: new Date(user_birthday),
      business_name,
      business_birthday: new date(business_birthday),
      business_type,
      industry,
      country,
      city,
      town,
      address,
      wallet: wallet || undefined // omit if empty
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        trade_id: user.trade_id,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      user_id: user.user_id,
      trade_id: user.trade_id,
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Phone number already registered' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        trade_id: user.trade_id,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      user_id: user.user_id,
      trade_id: user.trade_id,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /auth/verify
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    res.json(decoded);
  });
});

module.exports = router;
