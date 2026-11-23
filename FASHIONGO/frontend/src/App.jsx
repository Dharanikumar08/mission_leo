import { useEffect, useMemo, useState } from 'react'

import './App.css'

import Auth from './Auth'

import AdminDashboard from './AdminDashboard'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

const categories = ['All', 'Men', 'Women', 'Footwear', 'Accessories']



const productImages = {

  1: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',

  2: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?w=600',

  3: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',

  4: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',

}



const productTags = {

  1: 'BESTSELLER',

  2: 'POPULAR',

  3: 'TRENDING',

  4: 'NEW',

}



function App() {

  const [apiStatus, setApiStatus] = useState('Connecting...')

  const [products, setProducts] = useState([])

  const [loadingProducts, setLoadingProducts] = useState(true)

  const [productsError, setProductsError] = useState('')

  const [search, setSearch] = useState('')

  const [category, setCategory] = useState('All')

  const [sortBy, setSortBy] = useState('recommended')

  const [cart, setCart] = useState([])

  const [menuOpen, setMenuOpen] = useState(false)

  const [selectedProduct, setSelectedProduct] = useState(null)

  const [showAuth, setShowAuth] = useState(false)

 const [currentUser, setCurrentUser] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('fashiongo_user')) || null
  } catch {
    return null
  }
})

const [authToken, setAuthToken] = useState(
  () => localStorage.getItem('fashiongo_token') || null
)
  const [orders, setOrders] = useState([])

  const [showOrders, setShowOrders] = useState(false)

  const [showAdminDashboard, setShowAdminDashboard] = useState(false)

  const [selectedOrder, setSelectedOrder] = useState(null)

  const [ordersLoading, setOrdersLoading] = useState(false)

  const [ordersError, setOrdersError] = useState('')

  useEffect(() => {

    fetch(`${API_BASE}/api/health`)

      .then(response => {

        if (!response.ok) throw new Error('Health check failed')

        return response.json()

      })

      .then(data => setApiStatus(data.message))

      .catch(() => setApiStatus('Backend connection failed'))

  }, [])



  useEffect(() => {

    fetch(`${API_BASE}/api/products`)

      .then(response => {

        if (!response.ok) throw new Error('Unable to load products')

        return response.json()

      })

      .then(data => {

        if (!data.success || !Array.isArray(data.products)) {

          throw new Error('Invalid products response')

        }



        const formattedProducts = data.products.map(product => {

          const productId = product.id != null

            ? Number(product.id)

            : Number(product._id?.slice(-1)) + 1



          return {

            ...product,

            id: productId,

            image: product.image || productImages[productId],

            tag: product.tag || productTags[productId] || 'NEW',

            oldPrice: product.oldPrice ?? product.price,

            description: product.description ||

              'Discover this stylish addition to your wardrobe. A great choice for everyday fashion.',

            stock: Number(product.stock ?? 0),

          }

        })



        setProducts(formattedProducts)

        setProductsError('')

      })

      .catch(error => {

        setProductsError(error.message || 'Could not load products')

      })

      .finally(() => setLoadingProducts(false))

  }, [])



  const filteredProducts = useMemo(() => {
  const result = products.filter(product => {
    const matchesCategory =
      category === 'All' || product.category === category

    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase())

    return matchesCategory && matchesSearch
  })

  if (sortBy === 'price-low') {
    result.sort((a, b) => Number(a.price) - Number(b.price))
  }

  if (sortBy === 'price-high') {
    result.sort((a, b) => Number(b.price) - Number(a.price))
  }

  if (sortBy === 'newest') {
    result.sort((a, b) =>
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )
  }

  return result
}, [products, category, search, sortBy])



  const addToCart = product => {

    setCart(previous => [...previous, product])

  }



  const openProduct = product => {

    setSelectedProduct(product)

    setMenuOpen(false)

    window.scrollTo({ top: 0, behavior: 'smooth' })

  }



  const fetchMyOrders = async () => {
    if (!authToken) {
      setShowAuth(true)
      return
    }

    setOrdersLoading(true)
    setOrdersError('')

    try {
      const response = await fetch(
        `${API_BASE}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to fetch your orders.')
      }

      setOrders(data.orders || [])
      setShowOrders(true)
      setSelectedProduct(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setOrdersError(error.message || 'Unable to load orders.')
      setShowOrders(true)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleLogin = (user, token) => {
    localStorage.setItem('fashiongo_user', JSON.stringify(user))
    localStorage.setItem('fashiongo_token', token)

    setCurrentUser(user)
    setAuthToken(token)
    setShowAuth(false)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogout = () => {
    localStorage.removeItem('fashiongo_user')
    localStorage.removeItem('fashiongo_token')

    setCurrentUser(null)
    setAuthToken(null)
    setCart([])
    setOrders([])
    setShowOrders(false)
    setSelectedOrder(null)
    setShowAuth(false)
  }

const openAdminDashboard = () => {
  if (!currentUser || currentUser.role !== 'admin') return

  setShowOrders(false)
  setSelectedOrder(null)
  setSelectedProduct(null)
  setShowAdminDashboard(true)
}

const backToShopping = () => {

    setSelectedProduct(null)

    window.scrollTo({ top: 0, behavior: 'smooth' })

  }



     const handleCheckout = async () => {

  if (!currentUser || !authToken) {

    setShowAuth(true)

    return

  }



  if (cart.length === 0) {

    alert('Your cart is empty.')

    return

  }



  const orderItems = cart.map(item => ({

    productId: item._id,

    quantity: 1

  }))



  if (orderItems.some(item => !item.productId)) {

    alert('A product is missing its database ID.')

    return

  }



  try {

    const response = await fetch(

      `${API_BASE}/api/orders`,

      {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          Authorization: `Bearer ${authToken}`

        },

        body: JSON.stringify({

          items: orderItems

        })

      }

    )



    const data = await response.json()



    if (!response.ok) {

      throw new Error(data.message || 'Unable to place order.')

    }



    setCart([])



    alert(

      `Order placed successfully! Order ID: ${data.order._id}`

    )

  } catch (error) {

    alert(error.message || 'Something went wrong. Please try again.')

  }

}



  const cartTotal = cart.reduce(

    (total, item) => total + Number(item.price || 0),

    0

  )



  return (

    <div className="app">

      <div className="api-status">

        Backend Status: {apiStatus}

      </div>



     <div className="announcement">
  <span className="announcement-star">✦</span>
  <span>THE FASHIONGO EDIT</span>
  <span className="announcement-divider">|</span>
  <span>Discover timeless style. Explore new possibilities.</span>
  <span className="announcement-star">✦</span>
</div>

      {showAuth && (

  <Auth

    onClose={() => setShowAuth(false)}

    onLogin={handleLogin}

  />

)}

      <header className="header">

        <a

          className="logo"

          href="#home"

          onClick={backToShopping}

        >

          Fashion<span>Go.</span>

        </a>



        <button

          className="menu-toggle"

          onClick={() => setMenuOpen(!menuOpen)}

          aria-label="Toggle navigation menu"

        >

          &#9776;

        </button>

      <nav className={menuOpen ? 'nav open' : 'nav'}>

  <a href="#home" onClick={() => {
    backToShopping()
    setMenuOpen(false)
  }}>
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z" />
    </svg>
    <span>Home</span>
  </a>

  <a href="#products" onClick={() => {
    backToShopping()
    setMenuOpen(false)
  }}>
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8h14l1 13H4L5 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
    <span>Shop</span>
  </a>

  <a href="#categories" onClick={() => {
    backToShopping()
    setMenuOpen(false)
  }}>
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
    <span>Categories</span>
  </a>

  <a href="#footer" onClick={() => setMenuOpen(false)}>
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
    <span>About</span>
  </a>

</nav>

        <div className="header-actions">

  <a

    href="#products"

    className="search-link"

    onClick={backToShopping}

  >

    Explore

  </a>



  {currentUser ? (

    <>

   <button
  className="account-button"
  onClick={fetchMyOrders}
>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 7h16v14H4z" />
    <path d="M8 7V4h8v3M8 12h8M8 16h5" />
  </svg>
  My Orders
</button>

{currentUser.role === 'admin' && (
  <button
  className="account-button"
  onClick={openAdminDashboard}
>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 21V9h6v12M3 9h18" />
  </svg>
  Admin
</button>
)}

<span className="account-name">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
  Hi, {currentUser.name}
</span>



      <button

        className="account-button"

        onClick={handleLogout}

      >

        Logout

      </button>

    </>

  ) : (

   <button
  className="account-button"
  onClick={() => setShowAuth(true)}
>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
  Login / Register
</button>

  )}



 <a href="#cart" className="cart-button">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 3h2l2.5 12h11L21 7H6" />
    <circle cx="9" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
  </svg>
  Cart <span>{cart.length}</span>
</a>

</div>

      </header>



  <main>

  {showAdminDashboard ? (
    <AdminDashboard
      token={authToken}
      onBack={() => setShowAdminDashboard(false)}
    />
  ) : showOrders ? (
          <section className="orders-page">
            {selectedOrder ? (
              <div className="order-details-page">
                <h2>Order Details</h2>

                <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
                <p>
                  <strong>Order Date:</strong>{' '}
                  {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>

                <h3>Products</h3>
                {selectedOrder.items.map((item, index) => (
                  <div className="order-item" key={index}>
                    <p><strong>{item.name}</strong></p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: &#8377;{Number(item.price).toLocaleString('en-IN')}</p>
                    <p>
                      Subtotal: &#8377;
                      {(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}

                <h3>
                  Total Amount: &#8377;
                  {Number(selectedOrder.totalAmount).toLocaleString('en-IN')}
                </h3>

                <button
                  type="button"
                  className="account-button"
                  onClick={() => setSelectedOrder(null)}
                >
                  Back to My Orders
                </button>
              </div>
            ) : (
              <>
                <h2>My Orders</h2>

                {ordersLoading ? (
                  <p>Loading your orders...</p>
                ) : ordersError ? (
                  <p>{ordersError}</p>
                ) : orders.length === 0 ? (
                  <p>You haven't placed any orders yet.</p>
                ) : (
                  orders.map(order => (
                    <div className="order-card" key={order._id}>
                      <h3>Order #{order._id}</h3>
                      <p>Status: {order.status}</p>
                      <p>
                        Date: {new Date(order.createdAt).toLocaleString('en-IN')}
                      </p>

                      {order.items.map((item, index) => (
                        <p key={index}>
                          {item.name} &#215; {item.quantity} &#8212; &#8377;
                          {(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}
                        </p>
                      ))}

                      <h3>
                        Total: &#8377;{Number(order.totalAmount).toLocaleString('en-IN')}
                      </h3>

                      <button
                        type="button"
                        className="account-button"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
                      </button>
                    </div>
                  ))
                )}

                <button
                  type="button"
                  className="account-button"
                  onClick={() => {
                    setShowOrders(false)
                    setSelectedOrder(null)
                    backToShopping()
                  }}
                >
                  Continue Shopping
                </button>
              </>
            )}
          </section>
        ) : selectedProduct ? (

          <section className="product-detail-page">

            <button

              className="back-button"

              onClick={backToShopping}

            >

              &#8592; Back to Shopping

            </button>



            <div className="product-detail-layout">

              <div className="product-detail-image">

                <img

                  src={selectedProduct.image}

                  alt={selectedProduct.name}

                />

                <span className="product-tag">

                  {selectedProduct.tag}

                </span>

              </div>



              <div className="product-detail-content">

                <span className="eyebrow">

                  {selectedProduct.category}

                </span>



                <h1>{selectedProduct.name}</h1>



                <div className="detail-price">

                  <strong>

                    &#8377;{Number(selectedProduct.price).toLocaleString('en-IN')}

                  </strong>



                  {Number(selectedProduct.oldPrice) >

                    Number(selectedProduct.price) && (

                    <del>

                      &#8377;{Number(selectedProduct.oldPrice).toLocaleString('en-IN')}

                    </del>

                  )}

                </div>



                <p className="detail-description">

                  {selectedProduct.description}

                </p>



                <div className="detail-stock">

                  {selectedProduct.stock > 0

                    ? `${selectedProduct.stock} units available`

                    : 'Currently out of stock'}

                </div>



                <div className="detail-actions">

                  <button

                    className="add-button detail-add-button"

                    disabled={selectedProduct.stock <= 0}

                    onClick={() => addToCart(selectedProduct)}

                  >

                    {selectedProduct.stock > 0

                      ? '+ Add to Cart'

                      : 'Out of Stock'}

                  </button>



                  <button

                    className="back-button"

                    onClick={backToShopping}

                  >

                    Continue Shopping

                  </button>

                </div>



                <div className="detail-extra">

                  <p>FashionGo Marketplace</p>

                  <p>Launching in Kurnool</p>

                  <p>15-minute delivery is our target promise.</p>

                </div>

              </div>

            </div>

          </section>

        ) : (

          <>
          <section className="hero hero-background" id="home">
  <img
    className="hero-background-image"
    src="/images/fashiongo-hero.png"
    alt="FashionGo Indian fashion campaign"
  />

  <div className="hero-background-overlay"></div>

  <div className="hero-content">
    <span className="eyebrow">STYLE, REIMAGINED FOR EVERYDAY</span>

    <h1>
      Discover your<br />
      <span>signature style.</span>
    </h1>

    <p>
      From everyday essentials to statement pieces, explore fashion
      you'll love — all in one place, right here in Kurnool.
    </p>

    <a href="#products" className="primary-button">
      Explore the collection →
    </a>

    <div className="hero-note">
      Your fashion destination. Built for Kurnool.
    </div>
  </div>
</section>

            <section className="benefits">

              <div>&#9889; <span><strong>Fast delivery</strong><small>15-minute target</small></span></div>

              <div>&#128717; <span><strong>Wide collection</strong><small>Multiple fashion brands</small></span></div>

              <div>&#9825; <span><strong>Easy shopping</strong><small>Simple shopping experience</small></span></div>

              <div>&#128205; <span><strong>Local marketplace</strong><small>Starting in Kurnool</small></span></div>

            </section>


<section className="categories-section" id="categories">
  <div className="section-heading">
    <div>
      <span className="eyebrow">CURATED FOR YOUR STYLE</span>
      <h2>Find your fashion</h2>
      <p>Explore the styles that make every day yours.</p>
    </div>
  </div>

  <div className="category-list">
    {categories.filter(item => item !== 'All').map(item => (
      <button
        key={item}
        className={`category-card category-${item.toLowerCase()}`}
        onClick={() => {
          setCategory(item)
          document.getElementById('products')?.scrollIntoView({
            behavior: 'smooth',
          })
        }}
      >
        <img
          className="category-card-image"
          src={{
            Men: '/images/men-campaign.png',
            Women: 'https://faridagupta.com/cdn/shop/files/1_42829d59-95c2-40c7-a12e-021abc482e67.jpg?v=1777956879',
            Footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
            Accessories: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
          }[item]}
          alt={`${item} fashion collection`}
        />

        <span>{item}</span>
        <span className="category-arrow">↗</span>
      </button>
    ))}
  </div>
</section>


            <section className="products-section" id="products">

              <div className="section-heading">

                <div>

                  <span className="eyebrow">CURATED FOR YOU</span>

                  <h2>Trending collections</h2>

                </div>



                <span className="product-count">

                  {filteredProducts.length} products

                </span>

              </div>



              <div className="filters">

                <div className="category-filters">

                  {categories.map(item => (

                    <button

                      key={item}

                      className={category === item ? 'filter active' : 'filter'}

                      onClick={() => setCategory(item)}

                    >

                      {item}

                    </button>

                  ))}

                </div>



                <input

                  className="search-input"

                  type="search"

                  placeholder="Search fashion..."

                  value={search}

                  onChange={event => setSearch(event.target.value)}

                />

                <select
  className="sort-select"
  value={sortBy}
  onChange={event => setSortBy(event.target.value)}
>
  <option value="recommended">Recommended</option>
  <option value="price-low">Price: Low to High</option>
  <option value="price-high">Price: High to Low</option>
  <option value="newest">Newest First</option>
</select>

              </div>



              {loadingProducts && (

                <p className="empty-message">

                  Loading FashionGo products...

                </p>

              )}



              {productsError && (

                <p className="empty-message">

                  {productsError}. Please check your backend server.

                </p>

              )}



              {!loadingProducts && !productsError && (

                <>

                  <div className="product-grid">

                    {filteredProducts.map(product => (

                      <article

                        className="product-card"

                        key={product._id || product.id}

                      >

                        <div

                          className="product-image clickable-product"

                          onClick={() => openProduct(product)}

                          role="button"

                          tabIndex={0}

                          onKeyDown={event => {

                            if (event.key === 'Enter') openProduct(product)

                          }}

                        >

                          <img

                            src={product.image}

                            alt={product.name}

                            loading="lazy"

                          />

                          <span className="product-tag">

                            {product.tag}

                          </span>

                        </div>



                        <div className="product-info">

                          <span className="product-category">

                            {product.category}

                          </span>



                          <h3>{product.name}</h3>



                          <div className="price-row">

                            <strong>

                              &#8377;{Number(product.price).toLocaleString('en-IN')}

                            </strong>

                            {Number(product.oldPrice) >

                              Number(product.price) && (

                              <del>

                                &#8377;{Number(product.oldPrice).toLocaleString('en-IN')}

                              </del>

                            )}

                          </div>



                          <button

                            className="view-details-button"

                            onClick={() => openProduct(product)}

                          >

                            View Details

                          </button>



                          <button

                            className="add-button"

                            disabled={product.stock <= 0}

                            onClick={() => addToCart(product)}

                          >

                            {product.stock > 0 ? '+ Add to Cart' : 'Out of Stock'}

                          </button>

                        </div>

                      </article>

                    ))}

                  </div>



                  {filteredProducts.length === 0 && (

                    <p className="empty-message">

                      No products found. Try another search.

                    </p>

                  )}

                </>

              )}

            </section>



            <section className="promo">

              <div>

                <span className="eyebrow">THE FASHIONGO EXPERIENCE</span>

                <h2>Your next favourite<br />look is waiting.</h2>

              </div>



              <a href="#products" className="primary-button">

                Explore now &#8592;’

              </a>

            </section>

          </>

        )}



        <section className="cart-section" id="cart">

          <div className="section-heading">

            <div>

              <span className="eyebrow">YOUR SHOPPING BAG</span>

              <h2>Shopping cart</h2>

            </div>



            <span className="product-count">

              {cart.length} items

            </span>

          </div>



          {cart.length === 0 ? (

            <p className="empty-message">

              Your cart is empty. Explore our collection!

            </p>

          ) : (

            <>

              {cart.map((item, index) => (

                <div

                  className="cart-item"

                  key={`${item._id || item.id}-${index}`}

                >

                  <span>{item.name}</span>



                  <strong>

                    &#8377;{Number(item.price).toLocaleString('en-IN')}

                  </strong>



                  <button

                    onClick={() =>

                      setCart(previous =>

                        previous.filter((_, i) => i !== index)

                      )

                    }

                  >

                    Remove

                  </button>

                </div>

              ))}



              <div className="cart-total">

                Total: &#8377;{cartTotal.toLocaleString('en-IN')}

              </div>

              <button

  className="checkout-button"

  onClick={handleCheckout}

>

  Proceed to Checkout &#8592;’

</button>

            </>

          )}

        </section>

      </main>



      <footer id="footer">

        <a className="logo footer-logo" href="#home"

          onClick={backToShopping}>

          Fashion<span>Go.</span>

        </a>



        <p>Your style destination. Built for Kurnool.</p>

        <small>&#169; 2026 FashionGo. All rights reserved.</small>

      </footer>
    </div>
  )
}
export default App
