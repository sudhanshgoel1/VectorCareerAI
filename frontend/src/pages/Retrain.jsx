import { useState, useEffect, useRef } from 'react'
import client from '../api/client'
import toast from 'react-hot-toast'
import { FiRefreshCw, FiCheckCircle, FiAlertCircle, FiClock, FiCpu, FiDatabase, FiZap, FiLoader } from 'react-icons/fi'

const STATUS_CONFIG = {
  idle:    { color: 'text-slate-500 dark:text-slate-400',   bg: 'bg-slate-50 dark:bg-slate-800/50',   border: 'border-slate-200 dark:border-slate-700',   label: 'Idle',      icon: FiClock },
  running: { color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-950/20',   border: 'border-amber-200 dark:border-amber-800/50', label: 'Running',   icon: FiRefreshCw },
  success: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800/50', label: 'Complete', icon: FiCheckCircle },
  error:   { color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-950/20',       border: 'border-red-200 dark:border-red-800/50',     label: 'Failed',    icon: FiAlertCircle },
}

const PIPELINE_STEPS = [
  {
    n: '1',
    icon: FiDatabase,
    title: 'data_pipeline.py',
    desc: 'Generates 498 synthetic student records with realistic skill distributions, applies StandardScaler, and saves train/test splits.',
    color: '#6366f1',
  },
  {
    n: '2',
    icon: FiCpu,
    title: 'train_model.py',
    desc: 'Trains Random Forest (300 trees) and Decision Tree classifiers, prints confusion matrix + classification report, saves the best model.',
    color: '#06B6D4',
  },
  {
    n: '3',
    icon: FiZap,
    title: 'Hot Reload',
    desc: 'The Flask model service reloads the new .pkl files in-memory — predictions immediately use the retrained model without restart.',
    color: '#10b981',
  },
]

export default function Retrain() {
  const [state, setState]     = useState({ status: 'idle', message: '', accuracy: null, started_at: null, finished_at: null })
  const [loading, setLoading] = useState(false)
  const pollRef               = useRef(null)

  const startPolling = () => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await client.get('/retrain/status')
        setState(res.data)
        if (res.data.status !== 'running') {
          clearInterval(pollRef.current)
          if (res.data.status === 'success') toast.success('Model retrained successfully!')
          if (res.data.status === 'error')   toast.error('Retraining failed. Check server logs.')
        }
      } catch {
        clearInterval(pollRef.current)
      }
    }, 2000)
  }

  useEffect(() => {
    client.get('/retrain/status').then(res => {
      setState(res.data)
      if (res.data.status === 'running') startPolling()
    }).catch(() => {})
    return () => clearInterval(pollRef.current)
  }, [])

  const handleRetrain = async () => {
    setLoading(true)
    try {
      await client.post('/retrain')
      setState(s => ({ ...s, status: 'running', message: 'Starting pipeline and training…' }))
      startPolling()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start retraining.')
    } finally {
      setLoading(false)
    }
  }

  const cfg = STATUS_CONFIG[state.status] || STATUS_CONFIG.idle
  const StatusIcon = cfg.icon
  const isRunning = state.status === 'running'

  return (
    <div className="page-enter max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-md">
            <FiRefreshCw className="w-4 h-4 text-white" />
          </div>
          Retrain ML Model
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Regenerate the dataset, retrain the classifier, and hot-reload it into the running server.
        </p>
      </div>

      {/* Status card */}
      <div className={`${cfg.bg} ${cfg.border} border rounded-2xl p-6 mb-5 transition-all duration-300`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} border ${cfg.border}`}>
            <StatusIcon className={`w-5 h-5 ${cfg.color} ${isRunning ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className={`font-bold text-base ${cfg.color}`}>{cfg.label}</div>
            {state.message && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{state.message}</p>
            )}
          </div>
        </div>

        {state.accuracy !== null && (
          <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-emerald-200/50 dark:border-emerald-800/30">
            <FiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Model Accuracy</div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{state.accuracy}%</div>
            </div>
          </div>
        )}

        {(state.started_at || state.finished_at) && (
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400 dark:text-slate-500">
            {state.started_at && (
              <div className="flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5" />
                Started: {new Date(state.started_at).toLocaleTimeString()}
              </div>
            )}
            {state.finished_at && (
              <div className="flex items-center gap-1.5">
                <FiCheckCircle className="w-3.5 h-3.5" />
                Finished: {new Date(state.finished_at).toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pipeline steps */}
      <div className="glass-card p-6 mb-5">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
          <FiCpu className="w-4 h-4 text-brand-500" /> What Happens During Retraining
        </h2>
        <div className="space-y-4">
          {PIPELINE_STEPS.map(({ n, icon: Icon, title, desc, color }) => (
            <div key={n} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {n !== '3' && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 mt-2" />}
              </div>
              <div className="pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${color}15`, color }}
                  >
                    Step {n}
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white font-mono">{title}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 mb-5">
        <div className="flex items-start gap-2">
          <FiAlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>Note:</strong> Retraining takes 30–60 seconds. Predictions will continue using the current model until retraining completes and hot-reloads.
          </p>
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={handleRetrain}
        disabled={loading || isRunning}
        className="btn-primary px-8 py-3.5 text-sm inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isRunning ? (
          <>
            <FiLoader className="animate-spin w-4 h-4" />
            Retraining in progress…
          </>
        ) : (
          <>
            <FiRefreshCw className="w-4 h-4" />
            {state.status === 'success' ? 'Retrain Again' : 'Start Retraining'}
          </>
        )}
      </button>
    </div>
  )
}
