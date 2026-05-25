import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import toast from 'react-hot-toast'
import {
  FiBook, FiCode, FiLoader, FiUsers, FiPlay, FiZap,
  FiInfo, FiCpu, FiTarget, FiTrendingUp,
} from 'react-icons/fi'
import SliderField from '../components/SliderField'

const SKILL_GROUPS = [
  {
    id: 'academic',
    label: 'Academic',
    icon: FiBook,
    color: '#6366f1',
    bg: 'from-indigo-500/10 to-violet-500/5',
    fields: [
      { id: 'cgpa',     label: 'CGPA',           desc: 'Cumulative GPA (0.0 – 10.0)',          min: 0,  max: 10,  step: 0.1 },
      { id: 'aptitude', label: 'Aptitude Score',  desc: 'Logical reasoning test (1 – 100)',     min: 1,  max: 100, step: 1   },
    ],
  },
  {
    id: 'technical',
    label: 'Technical',
    icon: FiCode,
    color: '#06B6D4',
    bg: 'from-cyan-500/10 to-blue-500/5',
    fields: [
      { id: 'programming',     label: 'Programming Skill',  desc: 'Writing & debugging code (1–10)',  min: 1, max: 10, step: 0.5 },
      { id: 'data_structures', label: 'Data Structures',    desc: 'Arrays, trees, algorithms (1–10)', min: 1, max: 10, step: 0.5 },
    ],
  },
  {
    id: 'soft',
    label: 'Soft Skills',
    icon: FiUsers,
    color: '#10b981',
    bg: 'from-emerald-500/10 to-teal-500/5',
    fields: [
      { id: 'communication',     label: 'Communication',    desc: 'Conveying ideas clearly (1–10)',  min: 1, max: 10, step: 0.5 },
      { id: 'public_speaking',   label: 'Public Speaking',  desc: 'Presenting to groups (1–10)',     min: 1, max: 10, step: 0.5 },
      { id: 'creative_thinking', label: 'Creative Thinking', desc: 'Generating novel ideas (1–10)',  min: 1, max: 10, step: 0.5 },
    ],
  },
]

const HOW_IT_WORKS = [
  { n: '1', text: 'Drag sliders to reflect your current skill levels honestly.' },
  { n: '2', text: 'Scores are scaled and passed to a trained Random Forest model.' },
  { n: '3', text: 'The model returns a recommended role with suitability percentages.' },
  { n: '4', text: 'Review your Radar Chart and personalised learning roadmap.' },
]

export default function Prediction() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [skills, setSkills] = useState({
    cgpa:              user?.cgpa              ?? 7.0,
    aptitude:          user?.aptitude          ?? 60,
    programming:       user?.programming       ?? 5,
    data_structures:   user?.data_structures   ?? 5,
    communication:     user?.communication     ?? 5,
    public_speaking:   user?.public_speaking   ?? 5,
    creative_thinking: user?.creative_thinking ?? 5,
  })
  const [loading, setLoading] = useState(false)
  const [loadingMode, setLoadingMode] = useState(null)

  const handleSlider = (id, val) => setSkills(p => ({ ...p, [id]: val }))

  const runPredict = async (mode) => {
    setLoading(true)
    setLoadingMode(mode)
    try {
      const payload = mode === 'quick' ? { mode: 'quick' } : { mode: 'custom', ...skills }
      const res = await client.post('/predict', payload)
      await refreshUser()
      navigate('/results', { state: { result: res.data } })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Prediction failed.')
    } finally {
      setLoading(false)
      setLoadingMode(null)
    }
  }

  // Compute overall skill score for display
  const avgScore = Math.round(
    ((skills.cgpa / 10) * 100 * 0.15 +
     (skills.aptitude / 100) * 100 * 0.15 +
     (skills.programming / 10) * 100 * 0.175 +
     (skills.data_structures / 10) * 100 * 0.175 +
     (skills.communication / 10) * 100 * 0.175 +
     (skills.public_speaking / 10) * 100 * 0.075 +
     (skills.creative_thinking / 10) * 100 * 0.075)
  )

  return (
    <div className="page-enter">

      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-md">
              <FiCpu className="w-4 h-4 text-white" />
            </div>
            AI Career Prediction
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Adjust your skill levels and run the Random Forest ML model.
          </p>
        </div>

        {/* Live score indicator */}
        <div className="glass-card-static px-5 py-3 rounded-2xl flex items-center gap-3 flex-shrink-0">
          <div className="text-center">
            <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Skill Score</div>
            <div className="text-2xl font-extrabold gradient-text">{avgScore}%</div>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Profile</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {avgScore >= 70 ? '🌟 Strong' : avgScore >= 50 ? '📈 Growing' : '🌱 Developing'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Main form */}
        <div className="lg:col-span-2 space-y-5">
          {SKILL_GROUPS.map(({ id, label, icon: Icon, color, bg, fields }) => (
            <div key={id} className="glass-card p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center`}
                  style={{ color }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ width: '1.1rem', height: '1.1rem' }} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">{label} Skills</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{fields.length} dimensions</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-8">
                {fields.map(f => (
                  <SliderField
                    key={f.id} id={f.id} label={f.label} description={f.desc}
                    min={f.min} max={f.max} step={f.step}
                    value={skills[f.id]} onChange={handleSlider}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Action buttons */}
          <div className="glass-card p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => runPredict('custom')}
                disabled={loading}
                className="flex-1 btn-primary py-3.5 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingMode === 'custom' ? (
                  <>
                    <FiLoader className="animate-spin w-4 h-4" />
                    Running ML Model…
                  </>
                ) : (
                  <><FiPlay className="w-4 h-4" /> Run Custom Prediction</>
                )}
              </button>
              <button
                onClick={() => runPredict('quick')}
                disabled={loading}
                className="flex-1 btn-secondary py-3.5 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingMode === 'quick' ? (
                  <>
                    <FiLoader className="animate-spin w-4 h-4" />
                    Loading…
                  </>
                ) : (
                  <><FiZap className="w-4 h-4" /> Quick Predict (Profile)</>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-3">
              Quick Predict uses your saved profile skills · Custom uses the sliders above
            </p>
          </div>
        </div>

        <div className="space-y-5">

          {/* How it works */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiInfo className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">How It Works</h3>
            </div>
            <ol className="space-y-3">
              {HOW_IT_WORKS.map(({ n, text }) => (
                <li key={n} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                    {n}
                  </span>
                  <span className="leading-relaxed">{text}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Skill summary */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiTarget className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Current Profile</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'CGPA',             val: skills.cgpa,             max: 10,  fmt: v => v.toFixed(1) },
                { label: 'Aptitude',         val: skills.aptitude,         max: 100, fmt: v => v },
                { label: 'Programming',      val: skills.programming,      max: 10,  fmt: v => v },
                { label: 'Data Structures',  val: skills.data_structures,  max: 10,  fmt: v => v },
                { label: 'Communication',    val: skills.communication,    max: 10,  fmt: v => v },
                { label: 'Public Speaking',  val: skills.public_speaking,  max: 10,  fmt: v => v },
                { label: 'Creative',         val: skills.creative_thinking, max: 10, fmt: v => v },
              ].map(({ label, val, max, fmt }) => {
                const pct = (val / max) * 100
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{fmt(val)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 70 ? 'linear-gradient(90deg,#10b981,#06B6D4)' :
                                      pct >= 40 ? 'linear-gradient(90deg,#6366f1,#8b5cf6)' :
                                                  'linear-gradient(90deg,#f59e0b,#ef4444)',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tip */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-800/30">
            <div className="flex items-start gap-2">
              <span className="text-lg flex-shrink-0">💡</span>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <strong>Pro tip:</strong> Rate yourself honestly — the model works best when scores reflect where you are today, not where you aspire to be.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
