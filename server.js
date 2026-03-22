const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS: Allow only your Cloudflare Pages domains
app.use(cors({
  origin: [
    'https://ks1-alkebulan-pay-identity-hub.pages.dev',
    'https://ks1-alkebulan-pay-trade-coordination.pages.dev',
    'https://ks1-alkebulan-pay-secure-transaction.pages.dev',
    'https://ks1-alkebulan-pay-trade-support.pages.dev',
    'https://ks1-alkebulan-pay-admin.pages.dev'
  ],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Fail fast on DB error
  });

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'KS1 Central Auth' });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 KS1 Central Auth running on port ${PORT}`);
});
