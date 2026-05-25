/**
 * AuthContext — global auth state shared across the whole app.
 *
 * Token storage strategy:
 *   - JWT is kept in localStorage under the key "token"
 *   - User object is cached under "user" to avoid a round-trip on every mount
 *   - On mount we verify the token with /api/auth/me; if it fails we clear both
 */
import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

/** Returns true only if the string looks like a valid JWT (3 dot-separated segments). */
function isValidJwt(token) {
  return typeof token === 'string' && token.split('.').length === 3
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!isValidJwt(token)) {
      // Nothing valid in storage — clear any stale garbage and stay logged out
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setLoading(false)
      return
    }

    // Token looks structurally valid — verify it with the server
    client.get('/auth/me')
      .then(res => {
        setUser(res.data.user)
        localStorage.setItem('user', JSON.stringify(res.data.user))
      })
      .catch(() => {
        // Server rejected the token (expired, wrong secret, etc.) — log out cleanly
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = (token, userData) => {
    if (!isValidJwt(token)) {
      console.error('login() received an invalid token — ignoring')
      return
    }
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const refreshUser = async () => {
    const res = await client.get('/auth/me')
    setUser(res.data.user)
    localStorage.setItem('user', JSON.stringify(res.data.user))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
