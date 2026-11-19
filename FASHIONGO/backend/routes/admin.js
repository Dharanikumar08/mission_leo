
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const protect = require('../middleware/authMiddleware')
const authorizeAdmin = require('../middleware/adminMiddleware')

const Product = require('../models/Product')
const Order = require('../models/Order')
const User = require('../models/User')

// All routes below require an authenticated admin
router.use(protect, authorizeAdmin)

// GET /api/admin/overview
router.get('/overview', async (req, res) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      orders
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.find().select('totalAmount status createdAt')
    ])

    const totalRevenue = orders
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.totalAmount, 0)

    res.json({
      success: true,
      overview: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue
      }
    })
  } catch (error) {
    console.error('Admin overview error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to load admin overview'
    })
  }
})


// GET /api/admin/products - View all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1
    })

    res.status(200).json({
      success: true,
      count: products.length,
      products
    })
  } catch (error) {
    console.error('Admin products error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    })
  }
})


// POST /api/admin/products - Add a new product
router.post('/products', async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      oldPrice,
      image,
      tag,
      description,
      stock
    } = req.body

    if (
      !name?.trim() ||
      !category?.trim() ||
      price === undefined ||
      price === null ||
      price === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name, category and price are required'
      })
    }

    const numericPrice = Number(price)
    const numericStock = stock === undefined ? 0 : Number(stock)
    const numericOldPrice =
      oldPrice === undefined || oldPrice === ''
        ? undefined
        : Number(oldPrice)

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0 ||
      !Number.isInteger(numericStock) ||
      numericStock < 0 ||
      (numericOldPrice !== undefined &&
        (!Number.isFinite(numericOldPrice) || numericOldPrice < 0))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please enter valid price and stock values'
      })
    }

    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      price: numericPrice,
      oldPrice: numericOldPrice,
      image: image || '',
      tag: tag || '',
      description: description || '',
      stock: numericStock
    })

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product
    })
  } catch (error) {
    console.error('Add product error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to add product'
    })
  }
})


// PUT /api/admin/products/:id - Update a product
router.put('/products/:id', async (req, res) => {
  try {
        if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      })
    }
    const {
      name,
      category,
      price,
      oldPrice,
      image,
      tag,
      description,
      stock
    } = req.body

    const updates = {}

   if (name !== undefined) {
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    name.trim().length > 100
  ) {
    return res.status(400).json({
      success: false,
      message: 'Product name must be between 1 and 100 characters'
    })
  }

  updates.name = name.trim()
}
    if (category !== undefined) {
  const allowedCategories = [
    'Men',
    'Women',
    'Footwear',
    'Accessories'
  ]

  if (
    typeof category !== 'string' ||
    !allowedCategories.includes(category.trim())
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product category'
    })
  }

  updates.category = category.trim()
}

    if (price !== undefined) {
      const value = Number(price)
      if (price === '' || !Number.isFinite(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid price'
        })
      }
      updates.price = value
    }

    if (oldPrice !== undefined) {
      if (oldPrice === '') {
        updates.oldPrice = undefined
      } else {
        const value = Number(oldPrice)
        if (!Number.isFinite(value) || value < 0) {
          return res.status(400).json({
            success: false,
            message: 'Invalid old price'
          })
        }
        updates.oldPrice = value
      }
    }

    if (stock !== undefined) {
      const value = Number(stock)
      if (!Number.isInteger(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid stock quantity'
        })
      }
      updates.stock = value
    }

    for (const field of ['image', 'tag', 'description']) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== 'string') {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field}`
          })
        }
        updates[field] = req.body[field]
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }
    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    })
  } catch (error) {
    console.error('Update product error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    })
  }
})


// DELETE /api/admin/products/:id - Delete a product
router.delete('/products/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      })
    }

    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Delete product error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    })
  }
})

// GET /api/admin/orders - View all customer orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name image category')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    })
  } catch (error) {
    console.error('Admin orders error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    })
  }
})

// PUT /api/admin/orders/:id/status - Update order status
router.put('/orders/:id/status', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      })
    }

    const { status } = req.body

    const allowedStatuses = [
      'placed',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    ]

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('items.product', 'name image category')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    })
  } catch (error) {
    console.error('Admin order status error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    })
  }
})

module.exports = router
