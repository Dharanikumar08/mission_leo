
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ['Men', 'Women', 'Footwear', 'Accessories']
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    oldPrice: {
      type: Number,
      min: 0
    },
    image: {
      type: String,
      default: '',
      maxlength: 2048
    },
    tag: {
      type: String,
      default: '',
      maxlength: 30
    },
    description: {
      type: String,
      default: '',
      maxlength: 1000
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Stock must be a whole number'
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
