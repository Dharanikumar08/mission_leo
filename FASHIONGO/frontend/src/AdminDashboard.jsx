
import { useEffect, useState } from 'react'
import './AdminDashboard.css'

const API = 'http://localhost:5000/api/admin'

const emptyForm = {
  name: '',
  category: '',
  price: '',
  oldPrice: '',
  image: '',
  tag: '',
  description: '',
  stock: '0'
}

function AdminDashboard({ token, onBack }) {
  const [overview, setOverview] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
const [updatingOrder, setUpdatingOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  const formatCurrency = value =>
    `₹${Number(value || 0).toLocaleString('en-IN')}`

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError('')

    const [
  overviewResponse,
  productsResponse,
  ordersResponse
] = await Promise.all([
  fetch(`${API}/overview`, { headers }),
  fetch(`${API}/products`, { headers }),
  fetch(`${API}/orders`, { headers })
])

const overviewData = await overviewResponse.json()
const productsData = await productsResponse.json()
const ordersData = await ordersResponse.json()

      if (!overviewResponse.ok) {
        throw new Error(overviewData.message || 'Unable to load dashboard')
      }

      if (!productsResponse.ok) {
        throw new Error(productsData.message || 'Unable to load products')
      }

      if (!ordersResponse.ok) {
  throw new Error(ordersData.message || 'Unable to load orders')
}

      setOverview(overviewData.overview)
      setProducts(productsData.products || [])
      setOrders(ordersData.orders || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) loadDashboard()
  }, [token])

  const handleInput = event => {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setMessage('')
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const url = editingId
        ? `${API}/products/${editingId}`
        : `${API}/products`

      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          oldPrice: form.oldPrice === '' ? '' : Number(form.oldPrice),
          stock: Number(form.stock)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save product')
      }

      setMessage(data.message)
      resetForm()
      await loadDashboard()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const startEditing = product => {
    setEditingId(product._id)
    setForm({
      name: product.name || '',
      category: product.category || '',
      price: String(product.price ?? ''),
      oldPrice: product.oldPrice == null ? '' : String(product.oldPrice),
      image: product.image || '',
      tag: product.tag || '',
      description: product.description || '',
      stock: String(product.stock ?? 0)
    })
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteProduct = async product => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    )

    if (!confirmed) return

    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API}/products/${product._id}`, {
        method: 'DELETE',
        headers
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete product')
      }

      setMessage(data.message)
      await loadDashboard()
    } catch (err) {
      setError(err.message)
    }
  }


const updateOrderStatus = async (orderId, status) => {
  setUpdatingOrder(orderId)
  setError('')
  setMessage('')

  try {
    const response = await fetch(
      `${API}/orders/${orderId}/status`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Unable to update order')
    }

    setMessage('Order status updated successfully.')
    await loadDashboard()
  } catch (err) {
    setError(err.message)
  } finally {
    setUpdatingOrder(null)
  }
}


  if (loading) {
    return (
      <section className="admin-dashboard">
        <p className="admin-message">Loading dashboard...</p>
      </section>
    )
  }

  return (
    <section className="admin-dashboard">
      <div className="admin-heading">
        <div>
          <span className="admin-eyebrow">FASHIONGO MANAGEMENT</span>
          <h1>Admin Dashboard</h1>
          <p>Manage your FashionGo marketplace.</p>
        </div>

        <button className="admin-back-button" onClick={onBack}>
          Back to Store
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {message && <p className="admin-message">{message}</p>}

      {overview && (
        <div className="admin-stats">
          <article className="admin-stat-card">
            <span>Total Products</span>
            <strong>{overview.totalProducts}</strong>
          </article>

          <article className="admin-stat-card">
            <span>Total Orders</span>
            <strong>{overview.totalOrders}</strong>
          </article>

          <article className="admin-stat-card">
            <span>Total Customers</span>
            <strong>{overview.totalCustomers}</strong>
          </article>

          <article className="admin-stat-card">
            <span>Total Revenue</span>
            <strong>{formatCurrency(overview.totalRevenue)}</strong>
          </article>
        </div>
      )}

      <div className="admin-welcome-card">
        <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        <p>Enter product information below.</p>

        <form className="admin-product-form" onSubmit={handleSubmit}>
          <label>
            Product Name *
            <input
              name="name"
              value={form.name}
              onChange={handleInput}
              required
            />
          </label>

          <label>
            Category *
            <select
              name="category"
              value={form.category}
              onChange={handleInput}
              required
            >
              <option value="">Select category</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Footwear">Footwear</option>
              <option value="Accessories">Accessories</option>
            </select>
          </label>

          <label>
            Price (₹) *
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleInput}
              required
            />
          </label>

          <label>
            Old Price (₹)
            <input
              name="oldPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.oldPrice}
              onChange={handleInput}
            />
          </label>

          <label>
            Stock Quantity
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleInput}
            />
          </label>

          <label>
            Product Tag
            <input
              name="tag"
              value={form.tag}
              onChange={handleInput}
              placeholder="NEW, POPULAR, BESTSELLER"
            />
          </label>

          <label className="admin-full-width">
            Product Image URL
            <input
              name="image"
              type="url"
              value={form.image}
              onChange={handleInput}
              placeholder="https://example.com/product.jpg"
            />
          </label>

          <label className="admin-full-width">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleInput}
              rows="3"
            />
          </label>

          <div className="admin-form-actions admin-full-width">
            <button
              className="admin-save-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Product'
                  : 'Add Product'}
            </button>

            {editingId && (
              <button
                className="admin-cancel-button"
                type="button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-welcome-card">
        <h2>Manage Products</h2>
        <p>{products.length} products in your marketplace.</p>

        {products.length === 0 ? (
          <p className="admin-message">No products found.</p>
        ) : (
          <div className="admin-product-list">
            {products.map(product => (
              <article className="admin-product-row" key={product._id}>
                <div className="admin-product-info">
                  <strong>{product.name}</strong>
                  <span>{product.category}</span>
                  <span>{formatCurrency(product.price)}</span>
                  <span>Stock: {product.stock ?? 0}</span>
                </div>

                <div className="admin-product-actions">
                  <button
                    className="admin-edit-button"
                    onClick={() => startEditing(product)}
                  >
                    Edit
                  </button>

                  <button
                    className="admin-delete-button"
                    onClick={() => deleteProduct(product)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>


<div className="admin-welcome-card">
  <h2>Manage Orders</h2>
  <p>{orders.length} orders in your marketplace.</p>

  {orders.length === 0 ? (
    <p className="admin-message">No orders found.</p>
  ) : (
    <div className="admin-product-list">
      {orders.map(order => (
        <article className="admin-product-row" key={order._id}>
          <div className="admin-product-info">
            <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>

            <p>
              Customer: {order.user?.name || 'Unknown'}
            </p>

            <p>
              Email: {order.user?.email || 'Unavailable'}
            </p>

            <p>
              Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}
            </p>

            <p>Items:</p>

            {order.items.map((item, index) => (
              <p key={index}>
                {item.product?.name || item.name}
                {' '}× {item.quantity}
                {' '}— {formatCurrency(item.price * item.quantity)}
              </p>
            ))}

            <strong>
              Total: {formatCurrency(order.totalAmount)}
            </strong>
          </div>

          <div className="admin-product-actions">
            <select
              value={order.status}
              onChange={event =>
                updateOrderStatus(order._id, event.target.value)
              }
              disabled={updatingOrder === order._id}
            >
              <option value="placed">Placed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {updatingOrder === order._id && (
              <span>Updating...</span>
            )}
          </div>
        </article>
      ))}
    </div>
  )}
</div>


    </section>
  )
}

export default AdminDashboard
