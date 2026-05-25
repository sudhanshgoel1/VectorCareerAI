/**
 * VectorCareer AI — Clean, modern brand mark for career guidance.
 * Uses a strong V shape, upward trajectory, and data nodes.
 */
export default function Logo({ className = 'w-8 h-8', title = 'VectorCareer AI' }) {
  return (
    <svg
      role="img"
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="logo-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D8B4FE" />
        </linearGradient>
        <filter id="logo-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.18" />
        </filter>
      </defs>

      <g filter="url(#logo-shadow)">
        <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#logo-bg)" />
      </g>

      <path
        d="M15 31 L22 20 L29 26 L34 15"
        stroke="url(#logo-accent)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M16 29 L22 23 L28 28 L32 20"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.75"
      />

      <circle cx="18" cy="34" r="2.8" fill="#FFFFFF" opacity="0.95" />
      <circle cx="26" cy="25" r="2.8" fill="#FFFFFF" opacity="0.95" />
      <circle cx="32" cy="17" r="3.2" fill="#FFFFFF" opacity="0.95" />

      <circle cx="18" cy="34" r="1.2" fill="#0EA5E9" />
      <circle cx="26" cy="25" r="1.2" fill="#7C3AED" />
      <circle cx="32" cy="17" r="1.4" fill="#C4B5FD" />
    </svg>
  )
}
