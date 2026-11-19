
const express = require('express')
const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Product')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

// CREATE A CUSTOMER ORDER
router.post('/', protect, async (req, res) => {
  let session

  try {
    const { items } = req.body

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Please provide between 1 and 50 order items.'
      })
    }

    const quantities = new Map()

    for (const item of items) {
      if (
        !item ||
        typeof item.productId !== 'string' ||
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product or quantity.'
        })
      }

      const id = item.productId
      quantities.set(id, (quantities.get(id) || 0) + item.quantity)

      if (quantities.get(id) > 100) {
        return res.status(400).json({
          success: false,
          message: 'Maximum quantity per product is 100.'
        })
      }
    }

    session = await mongoose.startSession()

    let order

    await session.withTransaction(async () => {
      const productIds = [...quantities.keys()]

      const products = await Product.find({
        _id: { $in: productIds }
      }).session(session)

      if (products.length !== productIds.length) {
        throw new Error('PRODUCT_NOT_FOUND')
      }

      const orderItems = []
      let totalAmount = 0

      for (const product of products) {
        const quantity = quantities.get(product._id.toString())

        const stockUpdate = await Product.updateOne(
          {
            _id: product._id,
            stock: { $gte: quantity }
          },
          {
            $inc: { stock: -quantity }
          },
          { session }
        )

        if (stockUpdate.modifiedCount !== 1) {
          throw new Error('INSUFFICIENT_STOCK')
        }

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity
        })

        totalAmount += product.price * quantity
      }

      const createdOrders = await Order.create(
        [{
          user: req.user._id,
          items: orderItems,
          totalAmount
        }],
        { session }
      )

      order = createdOrders[0]
    })

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order
    })
  } catch (error) {
    if (
      error.message === 'PRODUCT_NOT_FOUND' ||
      error.message === 'INSUFFICIENT_STOCK'
    ) {
      return res.status(409).json({
        success: false,
        message: error.message === 'PRODUCT_NOT_FOUND'
          ? 'One or more products could not be found.'
          : 'Insufficient stock. Please update your cart.'
      })
    }

    console.error('Order creation error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to place order.'
    })
  } finally {
    if (session) {
      await session.endSession()
    }
  }
})

// GET LOGGED-IN CUSTOMER ORDER HISTORY
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id
    })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    })
  } catch (error) {
    console.error('Order history error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch order history.'
    })
  }
})

module.exports = router
