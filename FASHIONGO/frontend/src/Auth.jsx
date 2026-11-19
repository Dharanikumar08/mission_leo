import { useState } from 'react'

function Auth({ onClose, onLogin }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (mode === 'register' && name.trim().length < 2) {
      setError('Please enter a valid name.')
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const endpoint =
        mode === 'register' ? 'register' : 'login'

      const body =
        mode === 'register'
          ? { name, email, password }
          : { email, password }

      const response = await fetch(
        `http://localhost:5000/api/auth/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed.')
      }

      if (!data.token || !data.user) {
        throw new Error('The server returned an incomplete response.')
      }

      onLogin(data.user, data.token)
    } catch (err) {
      setError(err.message || 'Unable to connect to FashionGo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <button
          type="button"
          className="auth-close"
          onClick={onClose}
          aria-label="Close authentication"
        >
          ×
        </button>

        <div className="auth-brand">
          Fashion<span>Go.</span>
        </div>

        <h1>
          {mode === 'login'
            ? 'Welcome Back!'
            : 'Create Your Account'}
        </h1>

        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Sign in to continue shopping.'
            : 'Join FashionGo and discover your style.'}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login')
              setError('')
              setMessage('')
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => {
              setMode('register')
              setError('')
              setMessage('')
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              Full Name
              <input
                type="text"
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="Enter your name"
                minLength={2}
                maxLength={60}
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            Email Address
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="Enter your email"
              maxLength={254}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              minLength={8}
              autoComplete={
                mode === 'register'
                  ? 'new-password'
                  : 'current-password'
              }
              required
            />
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="auth-success" role="status">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login'
            ? "Don't have an account?"
            : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
              setMessage('')
            }}
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </section>
  )
}

export default Auth