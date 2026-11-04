
import { useMemo, useState } from 'react'
import './App.css'

const products = [
  { id: 1, name: 'Classic White Sneakers', category: 'Footwear', price: 1299, oldPrice: 1999, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', tag: 'BESTSELLER' },
  { id: 2, name: 'Premium Casual Shirt', category: 'Men', price: 899, oldPrice: 1499, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600', tag: 'TRENDING' },
  { id: 3, name: 'Elegant Handbag', category: 'Women', price: 1499, oldPrice: 2499, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', tag: 'NEW' },
  { id: 4, name: 'Classic Wrist Watch', category: 'Accessories', price: 1199, oldPrice: 1899, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', tag: 'POPULAR' },
  { id: 5, name: 'Everyday Denim Jacket', category: 'Men', price: 1799, oldPrice: 2499, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', tag: 'TRENDING' },
  { id: 6, name: 'Fashion Sunglasses', category: 'Accessories', price: 699, oldPrice: 1199, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600', tag: 'HOT DEAL' },
  { id: 7, name: 'Women’s Casual Outfit', category: 'Women', price: 1399, oldPrice: 2199, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600', tag: 'NEW' },
  { id: 8, name: 'Running Sneakers', category: 'Footwear', price: 1599, oldPrice: 2299, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', tag: 'POPULAR' },
]

const categories = ['All', 'Men', 'Women', 'Footwear', 'Accessories']

function App() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = category === 'All' || product.category === category
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [category, search])

  const addToCart = (product) => {
    setCart(previous => [...previous, product])
  }

  const cartTotal = cart.reduce((total, item) => total + item.price, 0)

  return (
    <div className="app">
      <div className="announcement">
        <span>⚡ FAST FASHION, FAST DELIVERY</span>
        <span>Discover your style with FashionGo</span>
      </div>

      <header className="header">
        <a className="logo" href="#">
          Fashion<span>Go.</span>
        </a>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <nav className={menuOpen ? 'nav open' : 'nav'}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#products" onClick={() => setMenuOpen(false)}>Shop</a>
          <a href="#categories" onClick={() => setMenuOpen(false)}>Categories</a>
          <a href="#footer" onClick={() => setMenuOpen(false)}>About</a>
        </nav>

        <div className="header-actions">
          <a href="#products" className="search-link">Explore</a>
          <a href="#cart" className="cart-button">
            🛍️ Cart <span>{cart.length}</span>
          </a>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">YOUR STYLE. YOUR RULES.</span>
            <h1>Fashion that<br />moves <span>with you.</span></h1>
            <p>Discover the latest trends, explore your favourite styles and shop everything you love in one place.</p>
            <a href="#products" className="primary-button">Shop Collection →</a>
            <div className="hero-note">📍 Now launching in Kurnool</div>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1100" alt="Fashion collection" />
            <div className="delivery-card">
              <span>⚡</span>
              <div><strong>15-Min Delivery</strong><small>Our target delivery promise</small></div>
            </div>
          </div>
        </section>

        <section className="benefits">
          <div>⚡ <span><strong>Fast delivery</strong><small>15-minute target</small></span></div>
          <div>🛍️ <span><strong>Wide collection</strong><small>Multiple fashion brands</small></span></div>
          <div>💳 <span><strong>Easy shopping</strong><small>Simple checkout experience</small></span></div>
          <div>📍 <span><strong>Local marketplace</strong><small>Starting in Kurnool</small></span></div>
        </section>

        <section className="categories-section" id="categories">
          <div className="section-heading">
            <div><span className="eyebrow">EXPLORE YOUR STYLE</span><h2>Shop by category</h2></div>
          </div>
          <div className="category-list">
            {categories.filter(item => item !== 'All').map(item => (
              <button key={item} onClick={() => {
                setCategory(item)
                document.getElementById('products').scrollIntoView({ behavior: 'smooth' })
              }}>
                {item} <span>↗</span>
              </button>
            ))}
          </div>
        </section>

        <section className="products-section" id="products">
          <div className="section-heading">
            <div><span className="eyebrow">CURATED FOR YOU</span><h2>Trending collections</h2></div>
            <span className="product-count">{filteredProducts.length} products</span>
          </div>

          <div className="filters">
            <div className="category-filters">
              {categories.map(item => (
                <button
                  key={item}
                  className={category === item ? 'filter active' : 'filter'}
                  onClick={() => setCategory(item)}
                >{item}</button>
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

          <div className="product-grid">
            {filteredProducts.map(product => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  <span className="product-tag">{product.tag}</span>
                </div>
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3>{product.name}</h3>
                  <div className="price-row">
                    <strong>₹{product.price.toLocaleString('en-IN')}</strong>
                    <del>₹{product.oldPrice.toLocaleString('en-IN')}</del>
                  </div>
                  <button className="add-button" onClick={() => addToCart(product)}>
                    + Add to cart
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <p className="empty-message">No products found. Try another search.</p>
          )}
        </section>

        <section className="promo">
          <div><span className="eyebrow">THE FASHIONGO EXPERIENCE</span><h2>Your next favourite<br />look is waiting.</h2></div>
          <a href="#products" className="primary-button">Explore now →</a>
        </section>

        <section className="cart-section" id="cart">
          <div className="section-heading">
            <div><span className="eyebrow">YOUR SHOPPING BAG</span><h2>Shopping cart</h2></div>
            <span className="product-count">{cart.length} items</span>
          </div>
          {cart.length === 0 ? (
            <p className="empty-message">Your cart is empty. Explore our collection!</p>
          ) : (
            <>
              {cart.map((item, index) => (
                <div className="cart-item" key={`${item.id}-${index}`}>
                  <span>{item.name}</span>
                  <strong>₹{item.price.toLocaleString('en-IN')}</strong>
                  <button onClick={() => setCart(previous => previous.filter((_, i) => i !== index))}>Remove</button>
                </div>
              ))}
              <div className="cart-total">Total: ₹{cartTotal.toLocaleString('en-IN')}</div>
            </>
          )}
        </section>
      </main>

      <footer id="footer">
        <a className="logo footer-logo" href="#">Fashion<span>Go.</span></a>
        <p>Your style destination. Built for Kurnool.</p>
        <small>© 2026 FashionGo. All rights reserved.</small>
      </footer>
    </div>
  )
}

export default App
