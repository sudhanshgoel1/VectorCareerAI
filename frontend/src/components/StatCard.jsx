/**
 * StatCard — premium analytics stat card with gradient accent.
 */
export default function StatCard({ icon, label, value, sub, gradient = 'indigo', trend }) {
  const gradients = {
    indigo:  'from-indigo-500/10 to-purple-500/5 border-indigo-200/50 dark:border-indigo-800/30',
    sky:     'from-sky-500/10 to-blue-500/5 border-sky-200/50 dark:border-sky-800/30',
    emerald: 'from-emerald-500/10 to-teal-500/5 border-emerald-200/50 dark:border-emerald-800/30',
    purple:  'from-purple-500/10 to-pink-500/5 border-purple-200/50 dark:border-purple-800/30',
    amber:   'from-amber-500/10 to-orange-500/5 border-amber-200/50 dark:border-amber-800/30',
    red:     'from-red-500/10 to-rose-500/5 border-red-200/50 dark:border-red-800/30',
  }

  const iconColors = {
    indigo:  'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60',
    sky:     'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60',
    purple:  'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60',
    amber:   'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60',
    red:     'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60',
  }

  const valueColors = {
    indigo:  'text-indigo-600 dark:text-indigo-400',
    sky:     'text-sky-600 dark:text-sky-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    purple:  'text-purple-600 dark:text-purple-400',
    amber:   'text-amber-600 dark:text-amber-400',
    red:     'text-red-600 dark:text-red-400',
  }

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-5
      bg-gradient-to-br ${gradients[gradient]}
      border backdrop-blur-sm
      hover:shadow-card-hover hover:-translate-y-0.5
      transition-all duration-300 group
    `}>
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10"
        style={{ background: `radial-gradient(circle, currentColor, transparent)` }} />

      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColors[gradient]} flex-shrink-0`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend > 0
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
              : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className={`text-2xl font-extrabold ${valueColors[gradient]} leading-tight`}>
          {value}
        </p>
        {sub && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>
        )}
      </div>
    </div>
  )
}
