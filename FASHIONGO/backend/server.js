
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const Product = require('./models/Product');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

// CORS configuration
const allowedOrigins = (
  process.env.CLIENT_URL || 'http://localhost:5173'
)
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Limit repeated authentication requests
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.'
  }
});

app.use(express.json({ limit: '10kb' }));

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to FashionGo API!',
    status: 'Backend is running successfully',
    city: 'Kurnool'
  });
});

// Health route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FashionGo server is healthy',
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected',
    databaseState: mongoose.connection.readyState
  });
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error('Error fetching products:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Handle unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});


// Global error handler
app.use((err, req, res, next) => {
console.error('Server error:', err.message);
  // Handle invalid JSON requests
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON request body'
    });
  }

  // Handle other client errors safely
  const statusCode =
    Number.isInteger(err.status) &&
    err.status >= 400 &&
    err.status < 500
      ? err.status
      : 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? 'Internal server error'
        : 'Request could not be processed'
  });
});


// MongoDB connection and server startup
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from .env');
    }

      if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32
    ) {
      throw new Error(
        'JWT_SECRET is missing or too short. Use a secret of at least 32 characters.'
      );
    }

    console.log('Connecting to MongoDB Atlas...');

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });

    console.log('FashionGo MongoDB connected successfully!');

    app.listen(PORT, () => {
      console.log(
        `FashionGo server running at http://localhost:${PORT}`
      );
    });

  } catch (error) {
    console.error('\n========== FASHIONGO STARTUP ERROR ==========');

    console.error('Error name:', error.name);
    console.error('Error code:', error.code || 'Not available');
    console.error('Error message:', error.message);

    // Display individual MongoDB server errors
    if (error.reason && error.reason.servers) {
      console.error('\nMongoDB server diagnostics:');

      for (const [address, server] of error.reason.servers) {
        console.error('\nHost:', address);
        console.error(
          'Server error:',
          server.error?.message || 'No additional error details'
        );
      }
    }

    console.error('\n=============================================\n');

    await mongoose.disconnect().catch(() => {});

    process.exit(1);
  }
}

startServer();
