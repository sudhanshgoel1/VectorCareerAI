import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import client from '../api/client'
import toast from 'react-hot-toast'
import { FiCalendar, FiCheckCircle, FiClock, FiCode, FiCpu, FiClipboard, FiCloud, FiEye, FiLoader, FiPenTool, FiShield, FiTarget, FiTrendingUp, FiZap, FiBarChart2 } from 'react-icons/fi'

ChartJS.register(ArcElement, Tooltip, Legend)

const ROLE_COLORS = {
  'Data Scientist':         '#6366f1',
  'Full-Stack Developer':   '#0ea5e9',
  'Cyber Security Analyst': '#ef4444',
  'UI/UX Designer':         '#f59e0b',
  'Cloud Engineer':         '#10b981',
  'Product Manager':        '#8b5cf6',
}

const ROLE_ICONS = {
  'Data Scientist':         <FiCpu className="w-4 h-4" />,
  'Full-Stack Developer':   <FiCode className="w-4 h-4" />,
  'Cyber Security Analyst': <FiShield className="w-4 h-4" />,
  'UI/UX Designer':         <FiPenTool className="w-4 h-4" />,
  'Cloud Engineer':         <FiCloud className="w-4 h-4" />,
  'Product Manager':        <FiClipboard className="w-4 h-4" />,
}

export default function History() {
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [loadingId, setLoadingId] = useState(null)
  const { theme } = useTheme()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  useEffect(() => {
    client.get('/history')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load history.'))
      .finally(() => setLoading(false))
  }, [])

  const handleViewResult = async (e, predId) => {
    e.stopPropagation()
    setLoadingId(predId)
    try {
      const res = await client.get(`/history/${predId}`)
      navigate('/results', { state: { result: res.data, fromHistory: true } })
    } catch {
      toast.error('Failed to load prediction details.')
    } finally {
      setLoadingId(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg">
          <FiLoader className="animate-spin w-5 h-5 text-white" />
        </div>
        <p className="text-sm text-slate-400 dark:text-slate-500">Loading history…</p>
      </div>
    </div>
  )
  if (!data) return null

  const { predictions, total, role_dist, avg_scores } = data

  const doughnutData = {
    labels: role_dist.map(r => r.role),
    datasets: [{
      data: role_dist.map(r => r.count),
      backgroundColor: role_dist.map(r => ROLE_COLORS[r.role] || '#94a3b8'),
      borderWidth: 2,
      borderColor: isDark ? '#020617' : '#ffffff',
      hoverBorderWidth: 3,
    }],
  }

  const topRole = role_dist[0]?.role
  const topRoleCount = role_dist[0]?.count ?? 0

  return (
    <div className="page-enter">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-md">
              <FiClock className="w-4 h-4 text-white" />
            </div>
            Prediction History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {total} prediction{total !== 1 ? 's' : ''} on record
          </p>
        </div>
        <Link
          to="/prediction"
          className="btn-primary px-5 py-2.5 text-sm inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <FiZap className="w-4 h-4" /> New Prediction
        </Link>
      </div>

      {total === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-3xl">
            📭
          </div>
          <h3 className="text-base font-bold text-slate-700 dark:text-white mb-2">No predictions yet</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6 max-w-xs mx-auto">
            Head to the prediction page and run your first career analysis.
          </p>
          <Link to="/prediction" className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2">
            <FiZap className="w-4 h-4" /> Start Predicting
          </Link>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Predictions', value: total, icon: <FiBarChart2 className="w-4 h-4" />, color: '#6366f1' },
              { label: 'Top Role', value: topRole ? (<span className="inline-flex items-center gap-2"><span>{ROLE_ICONS[topRole]}</span><span>{topRole.split(' ')[0]}</span></span>) : '—', icon: <FiTrendingUp className="w-4 h-4" />, color: ROLE_COLORS[topRole] || '#6366f1' },
              { label: 'Top Role Count', value: topRoleCount, icon: <FiClock className="w-4 h-4" />, color: '#10b981' },
              { label: 'Avg CGPA', value: avg_scores?.cgpa ? avg_scores.cgpa.toFixed(1) : '—', icon: <FiBarChart2 className="w-4 h-4" />, color: '#f59e0b' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, color }}>
                    {icon}
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{label}</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white truncate">{value}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-5">

            {/* Table */}
            <div className="lg:col-span-2 glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">All Predictions</h3>
                <span className="badge-primary">{total} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Predicted Role</th>
                      <th>CGPA</th>
                      <th>Aptitude</th>
                      <th>Programming</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((p, i) => {
                      const isRowLoading = loadingId === p.id
                      const rc = ROLE_COLORS[p.predicted_role] || '#6366f1'
                      return (
                        <tr
                          key={p.id}
                          onClick={e => !isRowLoading && handleViewResult(e, p.id)}
                          className={`cursor-pointer ${isRowLoading ? 'opacity-60' : ''}`}
                        >
                          <td className="text-slate-400 dark:text-slate-600 text-xs font-medium">{i + 1}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <span className="text-base">{ROLE_ICONS[p.predicted_role] || <FiTarget className="w-4 h-4" />}</span>
                              <span className="text-xs font-bold" style={{ color: rc }}>{p.predicted_role}</span>
                            </div>
                          </td>
                          <td className="text-slate-600 dark:text-slate-300 font-semibold text-xs">{p.cgpa}</td>
                          <td className="text-slate-600 dark:text-slate-300 font-semibold text-xs">{p.aptitude}</td>
                          <td className="text-slate-600 dark:text-slate-300 font-semibold text-xs">{p.programming}</td>
                          <td>
                            <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                              <FiCalendar className="w-3 h-3" />
                              {new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          </td>
                          <td>
                            <button
                              onClick={e => handleViewResult(e, p.id)}
                              disabled={isRowLoading}
                              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/50 hover:bg-brand-100 dark:hover:bg-brand-900/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 whitespace-nowrap"
                            >
                              {isRowLoading ? (
                                <FiLoader className="animate-spin w-3 h-3" />
                              ) : (
                                <FiEye className="w-3 h-3" />
                              )}
                              {isRowLoading ? 'Loading…' : 'View'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Doughnut chart */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiBarChart2 className="w-4 h-4 text-brand-500" /> Role Distribution
                </h3>
                {role_dist.length > 0 ? (
                  <Doughnut
                    data={doughnutData}
                    options={{
                      responsive: true,
                      cutout: '65%',
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            font: { size: 11, weight: '600' },
                            padding: 12,
                            color: isDark ? '#94a3b8' : '#64748b',
                            usePointStyle: true,
                            pointStyleWidth: 8,
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: ctx => ` ${ctx.label}: ${ctx.parsed} prediction${ctx.parsed !== 1 ? 's' : ''}`,
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-8">No data yet.</p>
                )}
              </div>

              {/* Role breakdown list */}
              {role_dist.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Role Breakdown</h3>
                  <div className="space-y-2.5">
                    {role_dist.map(({ role, count }) => {
                      const pct = Math.round((count / total) * 100)
                      const rc = ROLE_COLORS[role] || '#6366f1'
                      return (
                        <div key={role}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                              <span>{ROLE_ICONS[role] || <FiTarget className="w-4 h-4" />}</span>
                              {role}
                            </span>
                            <span className="font-bold" style={{ color: rc }}>{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: rc }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
