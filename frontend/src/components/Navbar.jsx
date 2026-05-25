import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FiSun, FiMoon, FiUser, FiLogOut,
  FiZap, FiClock, FiRefreshCw, FiChevronDown,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Logo from './Logo'
import toast from 'react-hot-toast'

const DASHBOARD_LINKS = [
  { to: '/prediction', icon: FiZap,   label: 'Predict' },
  { to: '/history',    icon: FiClock, label: 'History' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => { setDropdownOpen(false) }, [pathname])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully.')
    navigate('/')
  }

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U'

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-white/90 dark:bg-surface-950/90 backdrop-filter backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-800/70 shadow-navbar transition-all duration-300">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-glow-sm transition-transform duration-200 hover:-translate-y-0.5">
            <Logo className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight text-slate-950 dark:text-white">VectorCareer AI</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Premium AI career guidance</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 ml-auto">
          {user && (
            <nav className="hidden md:flex items-center gap-2">
              {DASHBOARD_LINKS.map(({ to, icon: Icon, label }) => {
                const isActive = pathname === to
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </nav>
          )}

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex items-center justify-center w-10 h-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 transition hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
          >
            {theme === 'dark'
              ? <FiSun className="w-5 h-5" />
              : <FiMoon className="w-5 h-5" />
            }
          </button>

          

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(p => !p)}
                className="flex items-center gap-3 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 transition hover:-translate-y-0.5 shadow-sm"
                aria-label="User menu"
                aria-expanded={dropdownOpen}
              >
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-500 to-violet-600 text-white font-bold flex items-center justify-center">
                  {initial}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold">{user.username}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Student</span>
                </div>
                <FiChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl py-2 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-violet-600 text-white font-bold flex items-center justify-center">
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.username}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="px-2 space-y-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                    >
                      <div className="w-9 h-9 rounded-2xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center">
                        <FiUser className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      </div>
                      <span>Profile Settings</span>
                    </Link>
                    <Link
                      to="/retrain"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                    >
                      <div className="w-9 h-9 rounded-2xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center">
                        <FiRefreshCw className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      </div>
                      <span>Retrain Model</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    >
                      <div className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                        <FiLogOut className="w-4 h-4" />
                      </div>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-950 px-4 py-2 rounded-2xl hover:shadow-lg transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
