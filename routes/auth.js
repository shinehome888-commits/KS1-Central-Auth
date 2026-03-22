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
    const { full_name, phone, password } = req.body;

    if (!full_name || !phone || !password) {
      return res.status(400).json({ error: 'Full name, phone, and password are required' });
    }

    const existing = await User.findOne({ $or: [{ phone }, { email: req.body.email }] });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = new User({ full_name, phone, password });
    await user.save();

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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Trade ID, phone, or email and password are required' });
    }

    const user = await User.findOne({
      $or: [
        { trade_id: identifier },
        { phone: identifier },
        { email: identifier }
      ]
    });

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
  const token = req.headers.authorization?.split(' ')[1];
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
