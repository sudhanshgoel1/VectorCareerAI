import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import {
  FiArrowLeft, FiExternalLink, FiClock, FiHome, FiRefreshCw,
  FiShuffle, FiTrendingUp, FiDollarSign, FiTarget, FiStar,
  FiMap, FiCheckCircle, FiAward, FiCpu, FiCode, FiShield, FiPenTool, FiCloud, FiClipboard,
} from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement,
} from 'chart.js'
import { Radar, Bar } from 'react-chartjs-2'

ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler,
  Tooltip, Legend, CategoryScale, LinearScale, BarElement
)

const ROLE_COLORS = {
  'Data Scientist':         '#6366f1',
  'Full-Stack Developer':   '#0ea5e9',
  'Cyber Security Analyst': '#ef4444',
  'UI/UX Designer':         '#f59e0b',
  'Cloud Engineer':         '#10b981',
  'Product Manager':        '#8b5cf6',
}

const ROLE_META_ICONS = {
  'Data Scientist':         <FiCpu className="w-16 h-16 mx-auto" />,
  'Full-Stack Developer':   <FiCode className="w-16 h-16 mx-auto" />,
  'Cyber Security Analyst': <FiShield className="w-16 h-16 mx-auto" />,
  'UI/UX Designer':         <FiPenTool className="w-16 h-16 mx-auto" />,
  'Cloud Engineer':         <FiCloud className="w-16 h-16 mx-auto" />,
  'Product Manager':        <FiClipboard className="w-16 h-16 mx-auto" />,
}

export default function Results() {
  const { state }   = useLocation()
  const navigate    = useNavigate()
  const { theme }   = useTheme()
  const result      = state?.result
  const fromHistory = state?.fromHistory ?? false
  const isDark      = theme === 'dark'

  useEffect(() => {
    if (!result) navigate('/prediction', { replace: true })
  }, [result, navigate])

  if (!result) return null

  const { predicted_role, role_meta, alt_role, alt_score, alt_meta, role_scores, inputs } = result
  const sortedRoles = Object.entries(role_scores).sort((a, b) => b[1] - a[1])
  const topScore = sortedRoles[0]?.[1] ?? 0
  const roleColor = ROLE_META_COLOR(predicted_role)

  // ── Radar chart ──────────────────────────────────────────────────────────
  const radarData = {
    labels: ['CGPA×10', 'Aptitude', 'Prog×10', 'DS×10', 'Comm×10', 'Speaking×10', 'Creative×10'],
    datasets: [{
      label: 'Your Profile',
      data: [
        inputs.cgpa * 10, inputs.aptitude,
        inputs.programming * 10, inputs.data_structures * 10,
        inputs.communication * 10, inputs.public_speaking * 10,
        inputs.creative_thinking * 10,
      ],
      backgroundColor: isDark ? 'rgba(129,140,248,0.15)' : 'rgba(99,102,241,0.12)',
      borderColor:     isDark ? 'rgba(129,140,248,0.9)'  : 'rgba(99,102,241,0.9)',
      pointBackgroundColor: isDark ? '#818cf8' : '#6366f1',
      pointBorderColor: 'transparent',
      pointRadius: 5,
      borderWidth: 2.5,
    }],
  }

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { stepSize: 25, font: { size: 9 }, color: isDark ? '#64748b' : '#94a3b8', backdropColor: 'transparent' },
        pointLabels: { font: { size: 10, weight: '600' }, color: isDark ? '#94a3b8' : '#64748b' },
        grid: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
        angleLines: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
      },
    },
    plugins: { legend: { display: false } },
  }

  // ── Bar chart ────────────────────────────────────────────────────────────
  const barData = {
    labels: sortedRoles.map(([r]) => r),
    datasets: [{
      label: 'Suitability %',
      data: sortedRoles.map(([, s]) => s),
      backgroundColor: sortedRoles.map(([r]) =>
        r === predicted_role
          ? (isDark ? 'rgba(129,140,248,0.9)' : 'rgba(99,102,241,0.9)')
          : (isDark ? 'rgba(51,65,85,0.8)' : 'rgba(226,232,240,0.9)')
      ),
      borderRadius: 8,
      borderSkipped: false,
    }],
  }

  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    scales: {
      x: {
        min: 0, max: 100,
        ticks: { callback: v => v + '%', font: { size: 10 }, color: isDark ? '#64748b' : '#94a3b8' },
        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
      },
      y: {
        ticks: { font: { size: 11 }, color: isDark ? '#94a3b8' : '#64748b' },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x.toFixed(1)}% suitability` } },
    },
  }

  return (
    <div className="page-enter">

      {fromHistory && (
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl shadow-sm transition-all duration-200"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to History
        </button>
      )}

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 text-white text-center mb-6 shadow-2xl"
        style={{ background: `linear-gradient(135deg, ${roleColor}dd, ${roleColor}99, #7C3AED)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold mb-4">
            <FiAward className="w-3.5 h-3.5" /> AI Recommendation
          </div>
          <div className="text-5xl mb-3">
            {ROLE_META_ICONS[predicted_role] || role_meta?.icon || <FiTarget className="w-16 h-16 mx-auto" />}
          </div>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">{predicted_role}</h1>
          <p className="text-white/80 max-w-lg mx-auto text-sm leading-relaxed">{role_meta?.description}</p>
          <div className="inline-flex items-center gap-2 mt-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold">
            <FiStar className="w-4 h-4 text-yellow-300" />
            {topScore}% Suitability Match
          </div>
        </div>
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <div className="glass-card p-6">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Skill Radar</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">All values normalised to 0–100 for comparison.</p>
          <div className="flex justify-center">
            <div style={{ maxWidth: 320, width: '100%' }}>
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Role Suitability</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
            Probability % from the Random Forest's predict_proba() output.
          </p>
          <Bar data={barData} options={barOptions} height={220} />
        </div>
      </div>

      {/* ── Suitability breakdown ────────────────────────────────────────── */}
      <div className="glass-card p-6 mb-5">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <FiTarget className="w-4 h-4 text-brand-500" /> Suitability Breakdown
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedRoles.map(([role, score]) => {
            const isTop = role === predicted_role
            const rc = ROLE_META_COLOR(role)
            return (
              <div
                key={role}
                className={`rounded-2xl p-4 border transition-all duration-300 ${
                  isTop
                    ? 'ring-2 ring-brand-400/50 dark:ring-brand-500/40 border-brand-200 dark:border-brand-800/50 bg-brand-50/50 dark:bg-brand-950/20'
                    : 'border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20'
                }`}
              >
                <div className="flex justify-between items-center mb-2.5">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${isTop ? 'text-brand-700 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    {isTop && <FiStar className="w-3.5 h-3.5 text-amber-400" />}
                    {role}
                  </span>
                  <span className="text-sm font-extrabold" style={{ color: rc }}>{score}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${score}%`, background: isTop ? `linear-gradient(90deg, ${rc}, ${rc}99)` : '#94a3b8' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Input profile ────────────────────────────────────────────────── */}
      <div className="glass-card p-6 mb-5">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Your Input Profile</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            ['CGPA', inputs.cgpa],
            ['Aptitude', inputs.aptitude],
            ['Programming', inputs.programming],
            ['Data Struct.', inputs.data_structures],
            ['Communication', inputs.communication],
            ['Public Speaking', inputs.public_speaking],
            ['Creative', inputs.creative_thinking],
          ].map(([label, val]) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700/50">
              <div className="text-lg font-extrabold gradient-text">{val}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Learning roadmap ─────────────────────────────────────────────── */}
      {role_meta && (
        <div className="glass-card p-6 mb-5">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <FiMap className="w-4 h-4 text-brand-500" />
            Learning Roadmap for <span className="gradient-text ml-1">{predicted_role}</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-5">
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FiCheckCircle className="w-3.5 h-3.5" /> Key Skills to Develop
              </h3>
              <ul className="space-y-2">
                {role_meta.skills?.map(s => (
                  <li key={s} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FiExternalLink className="w-3.5 h-3.5" /> Curated Resources
              </h3>
              <ul className="space-y-2">
                {role_meta.resources?.map(r => (
                  <li key={r.label}>
                    <a
                      href={r.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline transition-colors"
                    >
                      <FiExternalLink className="w-3.5 h-3.5 flex-shrink-0" /> {r.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Career growth path */}
          {role_meta.growth && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-violet-50 dark:from-brand-950/20 dark:to-violet-950/20 border border-brand-100 dark:border-brand-900/30 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <FiTrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider">Career Growth Path</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{role_meta.growth}</p>
            </div>
          )}

          {/* Market data */}
          {(role_meta.salary || role_meta.active_jobs || role_meta.demand_trend) && (
            <div className="grid sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              {role_meta.salary && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700/50">
                  <div className="text-xs text-slate-400 dark:text-slate-500 mb-1 flex items-center justify-center gap-1">
                    <FiDollarSign className="w-3.5 h-3.5" /> Salary Range
                  </div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{role_meta.salary}</div>
                </div>
              )}
              {role_meta.active_jobs && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700/50">
                  <div className="text-xs text-slate-400 dark:text-slate-500 mb-1">Active Jobs</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{role_meta.active_jobs}</div>
                </div>
              )}
              {role_meta.demand_trend && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700/50">
                  <div className="text-xs text-slate-400 dark:text-slate-500 mb-1 flex items-center justify-center gap-1">
                    <FiTrendingUp className="w-3.5 h-3.5" /> Demand
                  </div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{role_meta.demand_trend}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Alternative path ─────────────────────────────────────────────── */}
      {alt_role && (
        <div className="glass-card p-6 mb-5 border-l-4 border-violet-400 dark:border-violet-500">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
            <FiShuffle className="w-4 h-4 text-violet-500" /> Alternative Career Path
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Your profile also shows strong alignment with{' '}
            <strong className="text-violet-600 dark:text-violet-400">{alt_role}</strong>{' '}
            ({alt_score}% suitability).
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{alt_meta?.description}</p>
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {fromHistory ? (
          <button
            onClick={() => navigate(-1)}
            className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" /> Back to History
          </button>
        ) : (
          <Link to="/prediction" className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2">
            <FiRefreshCw className="w-4 h-4" /> Try Again
          </Link>
        )}
        <Link
          to="/history"
          className="btn-secondary px-6 py-2.5 text-sm inline-flex items-center gap-2"
        >
          <FiClock className="w-4 h-4" /> View History
        </Link>
        <Link
          to="/"
          className="px-6 py-2.5 text-sm inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-all duration-200"
        >
          <FiHome className="w-4 h-4" /> Home
        </Link>
      </div>
    </div>
  )
}

function ROLE_META_COLOR(role) {
  const map = {
    'Data Scientist':         '#6366f1',
    'Full-Stack Developer':   '#0ea5e9',
    'Cyber Security Analyst': '#ef4444',
    'UI/UX Designer':         '#f59e0b',
    'Cloud Engineer':         '#10b981',
    'Product Manager':        '#8b5cf6',
  }
  return map[role] || '#6366f1'
}
