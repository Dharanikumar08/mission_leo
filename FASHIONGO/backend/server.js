
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = (
  process.env.CLIENT_URL || 'http://localhost:5173'
).split(',').map(origin => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' }));

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

// Get all products from MongoDB
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

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});
// Connect MongoDB and start server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('FashionGo MongoDB connected successfully!');

    app.listen(PORT, () => {
      console.log(
        `FashionGo server running at http://localhost:${PORT}`
      );
    });

  } catch (error) {
    console.error('FashionGo startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
