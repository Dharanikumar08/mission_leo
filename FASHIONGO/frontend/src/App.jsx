
import { useEffect, useMemo, useState } from 'react'
import './App.css'

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
  const [cart, setCart] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(response => {
        if (!response.ok) throw new Error('Health check failed')
        return response.json()
      })
      .then(data => setApiStatus(data.message))
      .catch(() => setApiStatus('Backend connection failed'))
  }, [])

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
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
    return products.filter(product => {
      const matchesCategory =
        category === 'All' || product.category === category

      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [products, category, search])

  const addToCart = product => {
    setCart(previous => [...previous, product])
  }

  const openProduct = product => {
    setSelectedProduct(product)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const backToShopping = () => {
    setSelectedProduct(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <span>FAST FASHION, FAST DELIVERY</span>
        <span>Discover your style with FashionGo</span>
      </div>

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
          ☰
        </button>

        <nav className={menuOpen ? 'nav open' : 'nav'}>
          <a href="#home" onClick={() => {
            backToShopping()
            setMenuOpen(false)
          }}>Home</a>

          <a href="#products" onClick={() => {
            backToShopping()
            setMenuOpen(false)
          }}>Shop</a>

          <a href="#categories" onClick={() => {
            backToShopping()
            setMenuOpen(false)
          }}>Categories</a>

          <a href="#footer" onClick={() => setMenuOpen(false)}>
            About
          </a>
        </nav>

        <div className="header-actions">
          <a href="#products" className="search-link"
            onClick={backToShopping}>
            Explore
          </a>

          <a href="#cart" className="cart-button">
            Cart <span>{cart.length}</span>
          </a>
        </div>
      </header>

      <main>
        {selectedProduct ? (
          <section className="product-detail-page">
            <button
              className="back-button"
              onClick={backToShopping}
            >
              ← Back to Shopping
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
                    ₹{Number(selectedProduct.price).toLocaleString('en-IN')}
                  </strong>

                  {Number(selectedProduct.oldPrice) >
                    Number(selectedProduct.price) && (
                    <del>
                      ₹{Number(selectedProduct.oldPrice).toLocaleString('en-IN')}
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
            <section className="hero" id="home">
              <div className="hero-content">
                <span className="eyebrow">YOUR STYLE. YOUR RULES.</span>

                <h1>
                  Fashion that<br />
                  moves <span>with you.</span>
                </h1>

                <p>
                  Discover the latest trends, explore your favourite styles
                  and shop everything you love in one place.
                </p>

                <a href="#products" className="primary-button">
                  Shop Collection →
                </a>

                <div className="hero-note">
                  Now launching in Kurnool
                </div>
              </div>

              <div className="hero-image">
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1100"
                  alt="Fashion collection"
                />

                <div className="delivery-card">
                  <span>⚡</span>
                  <div>
                    <strong>15-Min Delivery</strong>
                    <small>Our target delivery promise</small>
                  </div>
                </div>
              </div>
            </section>

            <section className="benefits">
              <div>⚡ <span><strong>Fast delivery</strong><small>15-minute target</small></span></div>
              <div>♢ <span><strong>Wide collection</strong><small>Multiple fashion brands</small></span></div>
              <div>♡ <span><strong>Easy shopping</strong><small>Simple shopping experience</small></span></div>
              <div>⌖ <span><strong>Local marketplace</strong><small>Starting in Kurnool</small></span></div>
            </section>

            <section className="categories-section" id="categories">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">EXPLORE YOUR STYLE</span>
                  <h2>Shop by category</h2>
                </div>
              </div>

              <div className="category-list">
                {categories.filter(item => item !== 'All').map(item => (
                  <button
                    key={item}
                    onClick={() => {
                      setCategory(item)
                      document.getElementById('products')?.scrollIntoView({
                        behavior: 'smooth',
                      })
                    }}
                  >
                    {item} <span>↗</span>
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
                              ₹{Number(product.price).toLocaleString('en-IN')}
                            </strong>
                            {Number(product.oldPrice) >
                              Number(product.price) && (
                              <del>
                                ₹{Number(product.oldPrice).toLocaleString('en-IN')}
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
                Explore now →
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
                    ₹{Number(item.price).toLocaleString('en-IN')}
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
                Total: ₹{cartTotal.toLocaleString('en-IN')}
              </div>
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
        <small>© 2026 FashionGo. All rights reserved.</small>
      </footer>
    </div>
  )
}

export default App
