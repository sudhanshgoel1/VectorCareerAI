import { Link } from 'react-router-dom'
import {
  FiCpu, FiBarChart2, FiMap, FiActivity, FiArrowRight,
  FiZap, FiTrendingUp, FiAward, FiCheckCircle, FiStar,
  FiTarget, FiShield, FiUsers, FiCode, FiPenTool, FiCloud, FiClipboard,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

const ROLES = [
  { icon: <FiCpu className="w-7 h-7" />, name: 'Data Scientist',         color: '#6366f1', bg: 'rgba(99,102,241,0.08)'  },
  { icon: <FiCode className="w-7 h-7" />, name: 'Full-Stack Developer',    color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)'  },
  { icon: <FiShield className="w-7 h-7" />, name: 'Cyber Security Analyst', color: '#ef4444', bg: 'rgba(239,68,68,0.08)'   },
  { icon: <FiPenTool className="w-7 h-7" />, name: 'UI/UX Designer',          color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
  { icon: <FiCloud className="w-7 h-7" />, name: 'Cloud Engineer',          color: '#10b981', bg: 'rgba(16,185,129,0.08)'  },
  { icon: <FiClipboard className="w-7 h-7" />, name: 'Product Manager',         color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)'  },
]

const FEATURES = [
  {
    icon: <FiCpu className="w-6 h-6" />,
    title: 'ML-Powered Matching',
    desc: 'Random Forest Classifier trained on 2,000+ student profiles delivers 87%+ accuracy in career role prediction.',
    color: '#6366f1',
  },
  {
    icon: <FiBarChart2 className="w-6 h-6" />,
    title: 'Visual Skill Radar',
    desc: 'See exactly where you stand across 7 skill dimensions with interactive radar and bar charts.',
    color: '#0ea5e9',
  },
  {
    icon: <FiMap className="w-6 h-6" />,
    title: 'Personalised Roadmap',
    desc: 'Get curated learning resources, salary insights, and a step-by-step growth path for your top role.',
    color: '#10b981',
  },
  {
    icon: <FiTrendingUp className="w-6 h-6" />,
    title: 'Market Intelligence',
    desc: 'Real-time demand trends, active job counts, and salary ranges to help you make informed decisions.',
    color: '#f59e0b',
  },
  {
    icon: <FiActivity className="w-6 h-6" />,
    title: 'Prediction History',
    desc: 'Track how your profile evolves over time and see your career alignment shift as you grow.',
    color: '#8b5cf6',
  },
  {
    icon: <FiShield className="w-6 h-6" />,
    title: 'Secure & Private',
    desc: 'JWT-authenticated accounts keep your data safe. Your skill profile is yours alone.',
    color: '#ef4444',
  },
]

const STATS = [
  { value: '2,000+', label: 'Training Samples', icon: <FiActivity className="w-5 h-5" />, color: '#6366f1' },
  { value: '6',      label: 'Career Roles',     icon: <FiAward className="w-5 h-5" />,    color: '#8b5cf6' },
  { value: '7',      label: 'Skill Dimensions', icon: <FiBarChart2 className="w-5 h-5" />, color: '#0ea5e9' },
  { value: '87%+',   label: 'Model Accuracy',   icon: <FiTrendingUp className="w-5 h-5" />, color: '#10b981' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Set Your Skills', desc: 'Rate yourself across 7 dimensions — CGPA, aptitude, programming, data structures, communication, public speaking, and creativity.', icon: <FiCode className="w-5 h-5" /> },
  { step: '02', title: 'Run the AI Model', desc: 'Our Random Forest model analyses your profile against patterns from thousands of real student career outcomes.', icon: <FiCpu className="w-5 h-5" /> },
  { step: '03', title: 'Get Your Roadmap', desc: 'Receive your top career match, suitability scores for all 6 roles, and a personalised learning roadmap.', icon: <FiMap className="w-5 h-5" /> },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="page-enter overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center py-8 lg:py-12">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 40%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.2) 0%, transparent 70%)' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="max-w-6xl mx-auto w-full px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16 justify-between">

            {/* Left copy */}
            <div className="flex-1 max-w-2xl text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 text-xs font-bold
                bg-brand-50 dark:bg-brand-950/40
                border border-brand-200/60 dark:border-brand-800/40
                text-brand-700 dark:text-brand-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                AI-Powered Career Intelligence Platform
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6
                text-slate-900 dark:text-white">
                Find your<br />
                <span className="gradient-text">ideal career</span><br />
                with AI
              </h1>

              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                Enter your skills, run the ML model, and get a personalised career recommendation with a full learning roadmap — in seconds.
              </p>

              {/* Checklist */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-10 max-w-md mx-auto lg:mx-0 text-left">
                {['Instant AI career matching', 'Skill gap analysis', 'Personalised roadmap', 'Market salary data'].map(b => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                    <FiCheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                {user ? (
                  <Link to="/prediction" className="btn-primary px-8 py-4 text-base gap-2">
                    <FiZap className="w-5 h-5" /> Run AI Prediction <FiArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-primary px-8 py-4 text-base gap-2">
                      <FiZap className="w-5 h-5" /> Get Started Free <FiArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to="/login" className="btn-secondary px-8 py-4 text-base">
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              {/* Social proof */}
              <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
                No credit card required · Free forever · 2,000+ students guided
              </p>
            </div>

            {/* Right: Demo card */}
            <div className="flex-shrink-0 w-full max-w-[340px]">
              <div className="glass-card-static p-6 relative">
                {/* Floating badge */}
                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                  LIVE DEMO
                </div>

                {/* Header */}
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                    <Logo className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">AI Career Match</p>
                    <p className="text-xs text-slate-400">Random Forest · 87% accuracy</p>
                  </div>
                </div>

                {/* Top match */}
                <div className="rounded-xl p-4 mb-4"
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Top Career Match</p>
                  <div className="flex items-center gap-3">
                    <FiCpu className="w-8 h-8 text-slate-900 dark:text-white" />
                    <div className="flex-1">
                      <p className="font-black text-slate-900 dark:text-white text-sm">Data Scientist</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: '94%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                        </div>
                        <span className="text-xs font-black text-brand-600 dark:text-brand-400">94%</span>
                      </div>
                    </div>
                    <FiStar className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                  </div>
                </div>

                {/* Other roles */}
                <div className="space-y-3 mb-4">
                  {[
                    { role: 'Full-Stack Dev',  pct: 78, color: '#0ea5e9' },
                    { role: 'Cloud Engineer',  pct: 65, color: '#10b981' },
                    { role: 'Product Manager', pct: 42, color: '#8b5cf6' },
                  ].map(({ role, pct, color }) => (
                    <div key={role} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 w-28 font-medium">{role}</span>
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{pct}%</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FiTarget className="w-3.5 h-3.5 text-brand-500" />
                    <span className="text-[11px] text-slate-400 font-medium">7 skill dimensions</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-500">✓ Model loaded</span>
                </div>
              </div>

              {/* Floating skill chips */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {['CGPA 8.5', 'Aptitude 82', 'Programming 8', 'Communication 7'].map(chip => (
                  <span key={chip} className="text-[11px] font-semibold px-2.5 py-1 rounded-full
                    bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                    text-slate-600 dark:text-slate-300 shadow-sm">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-10 border-y border-slate-100 dark:border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon, color }) => (
              <div key={label} className="text-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: `${color}15`, color }}>
                  {icon}
                </div>
                <div className="text-3xl font-black mb-1 gradient-text">{value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              From skills to career path<br />
              <span className="gradient-text">in three steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 dark:from-brand-900 dark:via-brand-600 dark:to-brand-900" />

            {HOW_IT_WORKS.map(({ step, title, desc, icon }, i) => (
              <div key={step} className="glass-card-static p-7 text-center relative">
                {/* Step number */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 relative"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}>
                  <span className="text-white font-black text-lg">{i + 1}</span>
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg mb-3">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50/80 dark:bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Everything you need to<br />
              <span className="gradient-text">navigate your career</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, title, desc, color }) => (
              <div key={title} className="glass-card p-6 group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${color}15`, color, border: `1.5px solid ${color}25` }}>
                  {icon}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Career Roles ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">Career Paths</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              6 in-demand tech roles<br />
              <span className="gradient-text">analysed for you</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Our AI evaluates your profile against these roles and tells you exactly where you fit best.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ROLES.map(({ icon, name, color, bg }) => (
              <div key={name} className="glass-card-static p-5 flex flex-col items-center text-center gap-3 group cursor-default">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl
                  transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: bg, border: `1.5px solid ${color}30` }}>
                  {icon}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">{name}</span>
                <div className="w-8 h-0.5 rounded-full opacity-60" style={{ background: color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      {!user && (
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="relative overflow-hidden rounded-3xl p-12 text-center"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #4f46e5 100%)' }}>
              {/* Decoration */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute inset-0 opacity-5"
                  style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              </div>

              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Logo className="w-9 h-9" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
                  Ready to discover your path?
                </h2>
                <p className="text-indigo-200 mb-8 max-w-md mx-auto text-base leading-relaxed">
                  Join thousands of students who've found their ideal tech career with VectorCareer AI. It's free, instant, and surprisingly accurate.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-bold
                      px-8 py-4 rounded-xl text-sm hover:bg-brand-50 transition-all duration-200
                      shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    <FiZap className="w-4 h-4" />
                    Create Free Account
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/login"
                    className="inline-flex items-center justify-center gap-2 bg-white/15 text-white font-semibold
                      px-8 py-4 rounded-xl text-sm border border-white/30
                      hover:bg-white/25 transition-all duration-200 backdrop-blur-sm">
                    Sign In
                  </Link>
                </div>
                <p className="mt-5 text-indigo-300 text-xs">No credit card · Free forever · Takes 2 minutes</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
