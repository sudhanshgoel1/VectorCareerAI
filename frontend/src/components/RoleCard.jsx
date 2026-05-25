/** Premium role card with icon, name, color accent, and optional score. */
export default function RoleCard({ icon, name, color, score }) {
  return (
    <div
      className="glass-card p-4 flex flex-col items-center text-center gap-2.5 group cursor-default relative overflow-hidden"
      style={{ '--stat-color': color }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
        style={{
          background: `${color}15`,
          border: `1.5px solid ${color}25`,
        }}
      >
        {icon}
      </div>

      {/* Name */}
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight text-center">
        {name}
      </span>

      {/* Score badge */}
      {score !== undefined && (
        <span
          className="text-xs font-extrabold px-2.5 py-1 rounded-full transition-all duration-200 group-hover:scale-105"
          style={{ color, background: `${color}12`, border: `1px solid ${color}20` }}
        >
          {score}%
        </span>
      )}
    </div>
  )
}
