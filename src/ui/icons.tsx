// ---------------------------------------------------------------------------
// Minimal shared UI icons.
//
// Inline SVG, stroke-based, sized in em so they inherit font size and keep the
// thin/technical line quality used across the HUD. No icon library dependency.
// ---------------------------------------------------------------------------

interface IconProps {
  size?: number
  className?: string
}

/** Speaker volume icon. `level`: 0 muted, 1 low, 2 medium, 3 high. */
export function SpeakerIcon({ size = 14, level, className }: IconProps & { level: 0 | 1 | 2 | 3 }) {
  const waves = level >= 1 ? <path d="M9.5 9.5a4 4 0 0 1 0 5" /> : null
  const waves2 = level >= 2 ? <path d="M11.5 7.5a7 7 0 0 1 0 9" /> : null
  const waves3 = level >= 3 ? <path d="M13.5 5.5a10 10 0 0 1 0 13" /> : null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 8v4h3l4 3V5L6 8H3z" fill="currentColor" stroke="none" />
      {level === 0 ? <path d="M13 7.5l5 5M18 7.5l-5 5" /> : waves}
      {level >= 2 ? waves2 : null}
      {level >= 3 ? waves3 : null}
    </svg>
  )
}

/** Gear icon — System settings toggle. */
export function GearIcon({ size = 15, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 2.4v2M10 15.6v2M2.4 10h2M15.6 10h2M4.6 4.6l1.4 1.4M14 14l1.4 1.4M15.4 4.6L14 6M6 14l-1.4 1.4" />
    </svg>
  )
}

/** Curved back arrow — return from a project to the overview. */
export function BackArrowIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9.5 14L5.5 10l4-4" />
      <path d="M5.5 10H15a4 4 0 0 1 4 4" />
    </svg>
  )
}
