
require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: 'Classic White Sneakers',
    category: 'Footwear',
    price: 1299,
    oldPrice: 1999,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    tag: 'BESTSELLER',
    description: 'Comfortable everyday sneakers.',
    stock: 25
  },
  {
    name: 'Premium Casual Shirt',
    category: 'Men',
    price: 899,
    oldPrice: 1499,
    image: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?w=600',
    tag: 'POPULAR',
    description: 'Smart casual shirt for everyday wear.',
    stock: 30
  },
  {
    name: 'Elegant Handbag',
    category: 'Women',
    price: 1499,
    oldPrice: 2499,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
    tag: 'TRENDING',
    description: 'Stylish handbag for everyday use.',
    stock: 15
  },
  {
    name: 'Classic Wrist Watch',
    category: 'Accessories',
    price: 1199,
    oldPrice: 1899,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    tag: 'NEW',
    description: 'Classic wristwatch with a timeless design.',
    stock: 20
  }
];

async function seedProducts() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Connected to FashionGo MongoDB.');

    // Remove existing sample products before inserting them again.
    await Product.deleteMany({
      name: {
        $in: sampleProducts.map(product => product.name)
      }
    });

    const insertedProducts = await Product.insertMany(sampleProducts);

    console.log(`${insertedProducts.length} products inserted successfully!`);

  } catch (error) {
    console.error('Product seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
