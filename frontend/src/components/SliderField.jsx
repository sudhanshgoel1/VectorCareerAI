/**
 * SliderField — premium range slider with live value display.
 * Used on Prediction and Profile pages for all 7 skill inputs.
 */
export default function SliderField({ id, label, description, min, max, step, value, onChange, disabled }) {
  const pct = ((value - min) / (max - min)) * 100

  const displayValue = typeof value === 'number' && id === 'cgpa'
    ? value.toFixed(1)
    : value

  return (
    <div className="mb-5 group">
      <div className="flex justify-between items-center mb-1.5">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-tight"
        >
          {label}
        </label>
        <span className={`
          text-xs font-bold px-2.5 py-1 rounded-lg tabular-nums min-w-[3.25rem] text-center
          transition-all duration-200
          ${disabled
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
            : 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/50 shadow-glow-xs'
          }
        `}>
          {displayValue}
        </span>
      </div>

      {description && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2.5 leading-relaxed">{description}</p>
      )}

      <div className="relative py-1">
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={e => onChange(id, id === 'aptitude' ? parseInt(e.target.value) : parseFloat(e.target.value))}
          className={`
            w-full h-2 rounded-full appearance-none outline-none
            transition-opacity duration-200
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
          style={{
            background: disabled
              ? `linear-gradient(to right, #94a3b8 0%, #94a3b8 ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`
              : `linear-gradient(to right, #6366f1 0%, #8b5cf6 ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
          }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-600 mt-1 font-semibold">
        <span>{min}{id === 'cgpa' ? '.0' : ''}</span>
        <span className="text-[10px] text-slate-300 dark:text-slate-700 font-medium">
          {Math.round(pct)}%
        </span>
        <span>{max}{id === 'cgpa' ? '.0' : ''}</span>
      </div>
    </div>
  )
}
