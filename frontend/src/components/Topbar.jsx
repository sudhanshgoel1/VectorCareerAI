import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiSun, FiMoon, FiUser, FiLogOut, FiSettings } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Logo from './Logo'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/prediction', label: 'Prediction', auth: true },
  { to: '/history',    label: 'History',    auth: true },
]

export default function Topbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
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

  const visibleLinks = NAV_LINKS.filter(l => l.public || (l.auth && user))

  return (
    <header className="h-16 flex items-center justify-between px-6
      bg-white/80 dark:bg-slate-900/80
      backdrop-blur-md
      border-b border-slate-200/80 dark:border-slate-800/80
      sticky top-0 z-30 transition-all duration-300">

      {/* Left: Logo */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="transform group-hover:rotate-12 transition-transform duration-300">
            <Logo className="w-7 h-7" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white hidden sm:block">
            Vector<span className="gradient-text">Career</span> AI
          </span>
        </Link>
      </div>

      {/* Right: Nav + Actions */}
      <div className="flex items-center gap-2">

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 mr-2">
          {visibleLinks.map(({ to, label }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-xl flex items-center justify-center
            border border-slate-200 dark:border-slate-700
            text-slate-500 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-800
            hover:text-slate-800 dark:hover:text-slate-100
            transition-all duration-200"
        >
          {theme === 'dark'
            ? <FiSun className="w-4 h-4" />
            : <FiMoon className="w-4 h-4" />
          }
        </button>

        {/* User menu or auth buttons */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(p => !p)}
              className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl
                hover:bg-slate-100 dark:hover:bg-slate-800
                transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-purple-600
                text-white font-bold text-sm flex items-center justify-center shadow-glow-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{user.username}</p>
                <p className="text-xs text-slate-400 leading-tight truncate max-w-[120px]">{user.email}</p>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56
                bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-700
                rounded-2xl shadow-xl py-2
                animate-slide-down origin-top-right">

                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{user.username}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>

                <div className="px-2 py-1.5 space-y-0.5">
                  <Link to="/profile"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium
                      text-slate-600 dark:text-slate-300
                      hover:bg-slate-50 dark:hover:bg-slate-800
                      hover:text-slate-900 dark:hover:text-white
                      transition-all duration-150">
                    <FiUser className="w-4 h-4" /> My Profile
                  </Link>
                  <Link to="/retrain"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium
                      text-slate-600 dark:text-slate-300
                      hover:bg-slate-50 dark:hover:bg-slate-800
                      hover:text-slate-900 dark:hover:text-white
                      transition-all duration-150">
                    <FiSettings className="w-4 h-4" /> Retrain Model
                  </Link>
                </div>

                <div className="px-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium
                      text-red-500 dark:text-red-400
                      hover:bg-red-50 dark:hover:bg-red-950/30
                      transition-all duration-150 text-left"
                  >
                    <FiLogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300
                hover:text-slate-900 dark:hover:text-white
                px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800
                transition-all duration-200">
              Login
            </Link>
            <Link to="/register"
              className="text-sm font-semibold text-white px-4 py-2 rounded-xl
                shadow-glow-sm hover:shadow-glow hover:-translate-y-0.5
                transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
