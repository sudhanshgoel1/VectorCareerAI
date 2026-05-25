import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiArrowRight, FiLoader, FiUser, FiLock } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await client.post('/auth/login', form)
      login(res.data.token, res.data.user)
      toast.success(`Welcome back, ${res.data.user.username}!`)
      navigate('/prediction')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center page-enter px-4 py-8">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="premium-card p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-brand-500/8 to-violet-500/8 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-gradient-to-tr from-cyan-500/8 to-brand-500/8 blur-2xl pointer-events-none" />

          <div className="relative">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-glow">
                <Logo className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1.5 tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sign in to continue your career journey
              </p>
            </div>

            <form onSubmit={submit} noValidate className="space-y-4">
              {/* Username / Email */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="identifier"
                    value={form.identifier}
                    onChange={handle}
                    placeholder="Enter username or email"
                    required
                    autoComplete="username"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handle}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="input-field pl-10 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-sm inline-flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin w-4 h-4" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-5 font-medium">
          VectorCareer AI · Intelligent Career Guidance
        </p>
      </div>
    </div>
  )
}
