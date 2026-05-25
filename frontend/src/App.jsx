import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { FiLoader } from 'react-icons/fi'
import Logo from './components/Logo'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Prediction from './pages/Prediction'
import Results from './pages/Results'
import History from './pages/History'
import Profile from './pages/Profile'
import Retrain from './pages/Retrain'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-mesh">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg animate-pulse">
          <FiLoader className="animate-spin w-6 h-6 text-white" />
        </div>
        <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Loading VectorCareer AI…</p>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/prediction" replace /> : children
}

function AppLayout() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-mesh dark:bg-mesh text-slate-800 dark:text-slate-100 transition-colors duration-300">

      {/* Top navbar */}
      <Navbar />

      {/* Main content */}
      <main className="min-h-screen pt-16 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/"           element={<Landing />} />
            <Route path="/login"      element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register"   element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/prediction" element={<PrivateRoute><Prediction /></PrivateRoute>} />
            <Route path="/results"    element={<PrivateRoute><Results /></PrivateRoute>} />
            <Route path="/history"    element={<PrivateRoute><History /></PrivateRoute>} />
            <Route path="/profile"    element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/retrain"    element={<PrivateRoute><Retrain /></PrivateRoute>} />
            <Route path="*"           element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200/60 dark:border-slate-800/60 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Brand (with meta under it) */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-md">
                    <Logo className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">VectorCareer AI</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Personalised career guidance powered by ML</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">Use predictive models to discover best-fit tech careers and a tailored learning roadmap to reach them.</p>
                <div className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                  <div>ML-driven career guidance</div>
                  <div className="mt-2">© 2026 VectorCareer AI</div>
                </div>
              </div>

              {/* Quick links (plain text) */}
              <div className="flex flex-col gap-3">
                <div className="text-sm font-semibold text-slate-800 dark:text-white">Quick Links</div>
                <div className="flex flex-col gap-2 text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Predict</span>
                  <span className="text-slate-600 dark:text-slate-300">History</span>
                  <span className="text-slate-600 dark:text-slate-300">Retrain Model</span>
                  <span className="text-slate-600 dark:text-slate-300">Profile</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </ThemeProvider>
  )
}
