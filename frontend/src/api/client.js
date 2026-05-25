/**
 * Axios instance pre-configured for the Flask REST API.
 * The Vite dev server proxy forwards /api/* → http://127.0.0.1:5000,
 * so no hardcoded backend URL is needed here.
 */
import axios from 'axios'

const client = axios.create({ baseURL: '/api' })

/**
 * Request interceptor — attach the JWT token to every outgoing request.
 *
 * We validate the token string before using it. A stored value of
 * "undefined", "null", or an empty string would produce a malformed
 * Authorization header and cause Flask-JWT-Extended to return 422.
 */
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  // Only attach if the token is a non-empty string that looks like a JWT
  // (three base64url segments separated by dots)
  if (token && typeof token === 'string' && token.split('.').length === 3) {
    config.headers.Authorization = `Bearer ${token}`
  } else if (token) {
    // Token exists but is malformed — clear it so the user gets redirected
    // to login rather than hitting a confusing 422 loop
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return config
})

/**
 * Response interceptor — handle auth errors globally.
 *
 * 401 → credentials rejected (wrong password, expired token) → go to login
 * 422 → malformed/missing token (JWT parse error) → clear storage, go to login
 */
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const skipRedirect = err.config?.skipAuthRedirect === true

    if (!skipRedirect && (status === 401 || status === 422)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Only redirect if we're not already on a public page
      const publicPaths = ['/login', '/register', '/']
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default client
