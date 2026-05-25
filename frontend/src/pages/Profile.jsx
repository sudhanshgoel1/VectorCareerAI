import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiLoader, FiLock, FiUser, FiSave, FiEdit2, FiBarChart2, FiRefreshCw, FiMail, FiCalendar, FiShield } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import toast from 'react-hot-toast'
import SliderField from '../components/SliderField'

const SKILL_FIELDS = [
  { id: 'cgpa',              label: 'CGPA',             min: 0,  max: 10,  step: 0.1 },
  { id: 'aptitude',          label: 'Aptitude Score',   min: 1,  max: 100, step: 1   },
  { id: 'programming',       label: 'Programming',      min: 1,  max: 10,  step: 0.5 },
  { id: 'data_structures',   label: 'Data Structures',  min: 1,  max: 10,  step: 0.5 },
  { id: 'communication',     label: 'Communication',    min: 1,  max: 10,  step: 0.5 },
  { id: 'public_speaking',   label: 'Public Speaking',  min: 1,  max: 10,  step: 0.5 },
  { id: 'creative_thinking', label: 'Creative Thinking', min: 1, max: 10,  step: 0.5 },
]

export default function Profile() {
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()

  const [profileForm, setProfileForm] = useState({
    username: '', email: '',
    cgpa: 7.0, aptitude: 60, programming: 5.0,
    data_structures: 5.0, communication: 5.0,
    public_speaking: 5.0, creative_thinking: 5.0,
  })

  useEffect(() => {
    if (user) {
      setProfileForm({
        username:          user.username          || '',
        email:             user.email             || '',
        cgpa:              user.cgpa              ?? 7.0,
        aptitude:          user.aptitude          ?? 60,
        programming:       user.programming       ?? 5.0,
        data_structures:   user.data_structures   ?? 5.0,
        communication:     user.communication     ?? 5.0,
        public_speaking:   user.public_speaking   ?? 5.0,
        creative_thinking: user.creative_thinking ?? 5.0,
      })
    }
  }, [user])

  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [profileLoading,  setProfileLoading]  = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState({ current_password: false, new_password: false, confirm_password: false })
  const [editingProfile, setEditingProfile] = useState(false)

  const handleProfileSlider = (id, val) => setProfileForm(p => ({ ...p, [id]: val }))
  const handleProfileText   = e => setProfileForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const handlePasswordText  = e => setPasswordForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const saveProfile = async e => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const res = await client.put('/profile', profileForm)
      toast.success(res.data.message)
      await refreshUser()
      setEditingProfile(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Profile update failed.')
    } finally {
      setProfileLoading(false)
    }
  }

  const submitPassword = async e => {
    e.preventDefault()
    setPasswordError('')
    const { current_password, new_password, confirm_password } = passwordForm
    if (!current_password || !new_password || !confirm_password) {
      setPasswordError('All password fields are required.')
      return
    }
    if (new_password !== confirm_password) {
      setPasswordError('New password and confirm password do not match.')
      return
    }
    setPasswordLoading(true)
    try {
      const res = await client.put('/profile', passwordForm, { skipAuthRedirect: true })
      toast.success(res.data.message)
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      setPasswordError('')
      logout()
      navigate('/login')
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Password update failed.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U'
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  // Compute overall skill score
  const skillScore = user ? Math.round(
    ((user.cgpa / 10) * 100 * 0.15 +
     (user.aptitude / 100) * 100 * 0.15 +
     (user.programming / 10) * 100 * 0.2 +
     (user.data_structures / 10) * 100 * 0.2 +
     (user.communication / 10) * 100 * 0.15 +
     (user.public_speaking / 10) * 100 * 0.075 +
     (user.creative_thinking / 10) * 100 * 0.075)
  ) : 0

  return (
    <div className="page-enter max-w-4xl mx-auto">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-md">
            <FiUser className="w-4 h-4 text-white" />
          </div>
          My Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account details, baseline skills, and security settings.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">

        {/* ── Left: Profile + Skills ── */}
        <div className="md:col-span-2 space-y-5">

          {/* Profile form */}
          <form onSubmit={saveProfile} className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4 text-brand-500" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">Account Details</h2>
                <span className={`badge ${editingProfile ? 'badge-success' : 'badge-primary'}`}>
                  {editingProfile ? 'Editing' : 'Locked'}
                </span>
              </div>
              {!editingProfile && (
                <button
                  type="button"
                  onClick={() => setEditingProfile(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-all duration-200"
                >
                  <FiEdit2 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" name="username" value={profileForm.username}
                    onChange={handleProfileText} required disabled={!editingProfile}
                    className={`input-field pl-9 ${!editingProfile ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email" name="email" value={profileForm.email}
                    onChange={handleProfileText} required disabled={!editingProfile}
                    className={`input-field pl-9 ${!editingProfile ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* Baseline skills */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <div className="flex items-center gap-2 mb-1">
                <FiBarChart2 className="w-4 h-4 text-brand-500" />
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Baseline Prediction Skills
                </h3>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">
                These values pre-fill your Prediction page sliders by default.
              </p>
              <div className="grid sm:grid-cols-2 gap-x-6">
                {SKILL_FIELDS.map(({ id, label, min, max, step }) => (
                  <SliderField
                    key={id} id={id} label={label}
                    min={min} max={max} step={step}
                    value={profileForm[id]} onChange={handleProfileSlider}
                    disabled={!editingProfile}
                  />
                ))}
              </div>
            </div>

            {editingProfile && (
              <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="btn-secondary px-5 py-2.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {profileLoading ? (
                    <><FiLoader className="animate-spin w-4 h-4" /> Saving…</>
                  ) : (
                    <><FiSave className="w-4 h-4" /> Save Changes</>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* ── Right: Avatar + Password ── */}
        <div className="space-y-5">

          {/* Avatar card */}
          <div className="glass-card p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-500 to-violet-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-xl mx-auto">
                {initial}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-950 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{user?.username}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mb-3">{user?.email}</p>

            {/* Skill score */}
            <div className="bg-gradient-to-br from-brand-50 to-violet-50 dark:from-brand-950/20 dark:to-violet-950/20 rounded-2xl p-3 mb-3 border border-brand-100 dark:border-brand-900/30">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Overall Skill Score</div>
              <div className="text-2xl font-extrabold gradient-text">{skillScore}%</div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <FiCalendar className="w-3.5 h-3.5" />
              Member since {memberSince}
            </div>
          </div>

          {/* Change password */}
          <form onSubmit={submitPassword} className="glass-card p-5 space-y-4" noValidate>
            <div className="flex items-center gap-2">
              <FiShield className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Change Password</h3>
            </div>

            {[
              { name: 'current_password', label: 'Current Password', ac: 'current-password' },
              { name: 'new_password',     label: 'New Password',     ac: 'new-password' },
              { name: 'confirm_password', label: 'Confirm Password', ac: 'new-password' },
            ].map(({ name, label, ac }) => (
              <div key={name}>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {label}
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword[name] ? 'text' : 'password'}
                    name={name}
                    value={passwordForm[name]}
                    onChange={handlePasswordText}
                    autoComplete={ac}
                    required
                    className="input-field pl-9 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => ({ ...p, [name]: !p[name] }))}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showPassword[name] ? 'Hide' : 'Show'}
                  >
                    {showPassword[name] ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            {passwordError && (
              <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 px-4 py-3 text-xs font-medium">
                {passwordError}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full btn-secondary py-2.5 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {passwordLoading ? (
                <><FiLoader className="animate-spin w-4 h-4" /> Updating…</>
              ) : (
                <><FiRefreshCw className="w-4 h-4" /> Update Password</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
