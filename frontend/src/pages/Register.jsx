import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiArrowRight, FiBarChart2, FiLoader, FiUser, FiMail, FiLock } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import toast from 'react-hot-toast'
import SliderField from '../components/SliderField'
import Logo from '../components/Logo'

const DEFAULT_SKILLS = {
  cgpa: 7.0, aptitude: 60, programming: 5, data_structures: 5,
  communication: 5, public_speaking: 5, creative_thinking: 5,
}

const SKILL_FIELDS = [
  { id: 'cgpa',             label: 'CGPA',             desc: 'Cumulative GPA',         min: 0,  max: 10,  step: 0.1 },
  { id: 'aptitude',         label: 'Aptitude Score',   desc: 'Logical reasoning',      min: 1,  max: 100, step: 1   },
  { id: 'programming',      label: 'Programming',      desc: 'Coding proficiency',     min: 1,  max: 10,  step: 0.5 },
  { id: 'data_structures',  label: 'Data Structures',  desc: 'Algorithms & DS',        min: 1,  max: 10,  step: 0.5 },
  { id: 'communication',    label: 'Communication',    desc: 'Verbal & written',       min: 1,  max: 10,  step: 0.5 },
  { id: 'public_speaking',  label: 'Public Speaking',  desc: 'Presenting to groups',   min: 1,  max: 10,  step: 0.5 },
  { id: 'creative_thinking', label: 'Creative Thinking', desc: 'Innovation & ideation', min: 1, max: 10,  step: 0.5 },
]

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', ...DEFAULT_SKILLS })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState({ password: false, confirm: false })
  const [step, setStep] = useState(1) // 1 = account, 2 = skills

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const handleSlider = (id, val) => setForm(p => ({ ...p, [id]: val }))

  const goToStep2 = e => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password || !form.confirm) {
      toast.error('Please fill in all fields.')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    setStep(2)
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await client.post('/auth/register', form)
      login(res.data.token, res.data.user)
      toast.success('Account created! Welcome to VectorCareer AI.')
      navigate('/prediction')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center page-enter px-4 py-8">
      <div className="w-full max-w-lg">

        <div className="glass-card-static p-8 rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/50">

          {/* Header */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Logo className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Create your account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Join VectorCareer AI and discover your ideal career path</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-7">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step >= s
                    ? 'bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  {s}
                </div>
                <span className={`text-xs font-semibold transition-colors ${step >= s ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
                  {s === 1 ? 'Account' : 'Skills'}
                </span>
                {s < 2 && <div className={`flex-1 h-0.5 rounded-full transition-colors ${step > s ? 'bg-brand-400' : 'bg-slate-200 dark:bg-slate-700'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Account details */}
          {step === 1 && (
            <form onSubmit={goToStep2} noValidate className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      name="username" type="text" value={form.username} onChange={handle}
                      placeholder="e.g. alex_dev" required autoComplete="username"
                      className="input-field pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      name="email" type="email" value={form.email} onChange={handle}
                      placeholder="you@example.com" required autoComplete="email"
                      className="input-field pl-9"
                    />
                  </div>
                </div>
              </div>

              {[
                { name: 'password', label: 'Password', ac: 'new-password' },
                { name: 'confirm',  label: 'Confirm Password', ac: 'new-password' },
              ].map(({ name, label, ac }) => (
                <div key={name}>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      name={name}
                      type={showPwd[name] ? 'text' : 'password'}
                      value={form[name]}
                      onChange={handle}
                      placeholder={name === 'password' ? 'At least 6 characters' : 'Repeat password'}
                      required
                      autoComplete={ac}
                      className="input-field pl-9 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(p => ({ ...p, [name]: !p[name] }))}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      aria-label={showPwd[name] ? 'Hide' : 'Show'}
                    >
                      {showPwd[name] ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}

              <button type="submit" className="w-full btn-primary py-3 text-sm inline-flex items-center justify-center gap-2 mt-2">
                Continue to Skills <FiArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Step 2: Skill baselines */}
          {step === 2 && (
            <form onSubmit={submit} noValidate>
              <div className="mb-5 p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/50">
                <div className="flex items-center gap-2 mb-1">
                  <FiBarChart2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider">Baseline Skills</span>
                </div>
                <p className="text-xs text-brand-600/70 dark:text-brand-400/70">
                  These pre-fill your prediction sliders. Rate yourself honestly — you can update anytime.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6">
                {SKILL_FIELDS.map(({ id, label, desc, min, max, step: s }) => (
                  <SliderField
                    key={id} id={id} label={label} description={desc}
                    min={min} max={max} step={s} value={form[id]} onChange={handleSlider}
                  />
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 btn-secondary py-3 text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] btn-primary py-3 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin w-4 h-4" />
                      Creating account…
                    </>
                  ) : (
                    <>Create Account <FiArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
