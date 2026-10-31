/*
  Small illustrated emblems for the experience and education rows.
  Flat two-tone drawings in the site's own colours; no raster images.
*/
const hues = {
  ml: 'var(--c1)',
  hack: 'var(--c4)',
  community: 'var(--c3)',
  freelance: 'var(--c2)',
  school: 'var(--c5)',
  cloud: 'var(--c-blue)',
  cert: 'var(--c4)',
}

const stroke = { fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

function Art({ kind }) {
  switch (kind) {
    case 'ml': {
      const L = [[11, 14], [11, 24], [11, 34]]
      const M = [[24, 18], [24, 30]]
      const R = [37, 24]
      return (
        <g>
          <g stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2">
            {L.flatMap(([x1, y1]) => M.map(([x2, y2]) => <line key={`${y1}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} />))}
            {M.map(([x, y]) => <line key={y} x1={x} y1={y} x2={R[0]} y2={R[1]} />)}
          </g>
          {[...L, ...M].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="var(--bg)" stroke="currentColor" strokeWidth="1.8" />)}
          <circle cx={R[0]} cy={R[1]} r="4.4" fill="currentColor" />
          <circle cx={R[0]} cy={R[1]} r="7.4" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" />
        </g>
      )
    }
    case 'hack':
      return (
        <g>
          <rect x="9" y="11" width="30" height="21" rx="3" {...stroke} stroke="currentColor" />
          <path d="M5 36h38" {...stroke} stroke="currentColor" />
          <path d="M18.5 17.5 14.5 21.5l4 4M29.5 17.5l4 4-4 4" {...stroke} stroke="currentColor" strokeOpacity="0.6" />
          <path d="M26 15.5 21.5 22.5h4.2L22 28.5l6.5-8h-4.3z" fill="currentColor" />
        </g>
      )
    case 'community':
      return (
        <g>
          <circle cx="24" cy="17" r="4.6" fill="currentColor" />
          <path d="M15.5 34c0-5 3.8-8.5 8.5-8.5s8.5 3.5 8.5 8.5z" fill="currentColor" />
          <circle cx="11.5" cy="21" r="3.2" {...stroke} stroke="currentColor" />
          <path d="M5.5 34c0-3.8 2.6-6.4 6-6.4" {...stroke} stroke="currentColor" />
          <circle cx="36.5" cy="21" r="3.2" {...stroke} stroke="currentColor" />
          <path d="M42.5 34c0-3.8-2.6-6.4-6-6.4" {...stroke} stroke="currentColor" />
          <path d="M24 8.5v-2M30 10l1.4-1.4M18 10l-1.4-1.4" {...stroke} stroke="currentColor" strokeOpacity="0.6" />
        </g>
      )
    case 'freelance':
      return (
        <g>
          <rect x="8" y="10" width="32" height="26" rx="3.5" {...stroke} stroke="currentColor" />
          <path d="M8 17.5h32" {...stroke} stroke="currentColor" />
          <circle cx="12.5" cy="13.8" r="1.1" fill="currentColor" />
          <circle cx="16.2" cy="13.8" r="1.1" fill="currentColor" />
          <circle cx="19.9" cy="13.8" r="1.1" fill="currentColor" />
          <rect x="12.5" y="21.5" width="9" height="10.5" rx="1.5" fill="currentColor" fillOpacity="0.55" />
          <path d="M26 23.5h9M26 28h9M26 32h5.5" {...stroke} stroke="currentColor" strokeOpacity="0.8" />
        </g>
      )
    case 'cloud':
      return (
        <g>
          <path
            d="M14 31h20a7 7 0 0 0 1.5-13.8A9 9 0 0 0 17.5 15a7.5 7.5 0 0 0-5.5 8.2A6.5 6.5 0 0 0 14 31z"
            fill="color-mix(in srgb, currentColor 18%, transparent)"
            stroke="currentColor"
            {...stroke}
          />
          <circle cx="19" cy="24" r="2" fill="currentColor" />
          <circle cx="29" cy="24" r="2" fill="currentColor" />
          <line x1="21" y1="24" x2="27" y2="24" {...stroke} stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.4" />
        </g>
      )
    case 'cert':
      return (
        <g>
          <rect
            x="9"
            y="9"
            width="30"
            height="24"
            rx="3.5"
            fill="color-mix(in srgb, currentColor 15%, transparent)"
            stroke="currentColor"
            {...stroke}
          />
          <line x1="14" y1="16" x2="26" y2="16" {...stroke} stroke="currentColor" strokeOpacity="0.8" strokeWidth="1.5" />
          <line x1="14" y1="21" x2="22" y2="21" {...stroke} stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.4" />
          <line x1="14" y1="25" x2="19" y2="25" {...stroke} stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.4" />
          <circle cx="31" cy="24" r="4.5" fill="currentColor" />
          <path d="M29 27.5 27 34.5l4-2.2 4 2.2-2-7" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
        </g>
      )
    default:
      return (
        <g>
          <path d="M24 10 42 19 24 28 6 19z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M13.5 24.5v6.2c0 3 4.7 5.3 10.5 5.3s10.5-2.3 10.5-5.3v-6.2" {...stroke} stroke="currentColor" />
          <path d="M42 19v10" {...stroke} stroke="currentColor" />
          <circle cx="42" cy="31" r="1.9" fill="currentColor" />
        </g>
      )
  }
}

export default function OrgBadge({ kind = 'school', icon, iconSurface }) {
  const hue = hues[kind] || hues.school
  const effectiveIcon = icon || (kind === 'cloud' ? '/images/google-cloud.png' : null)
  return (
    <svg
      className={`badge${iconSurface ? ` badge--surface-${iconSurface}` : ''}`}
      viewBox="0 0 48 48"
      width="46"
      height="46"
      aria-hidden="true"
      style={{ color: hue }}
    >
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="12"
        fill="color-mix(in srgb, currentColor 14%, var(--bg))"
        stroke="color-mix(in srgb, currentColor 50%, transparent)"
        strokeWidth="1.2"
      />
      {effectiveIcon ? (
        <image
          href={effectiveIcon}
          x="4"
          y="4"
          width="40"
          height="40"
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <g transform="translate(24 24) scale(0.66) translate(-24 -24)">
          <Art kind={kind} />
        </g>
      )}
    </svg>
  )
}

export const kindFor = (org) =>
  /cloud|gcp|google/i.test(org) ? 'cloud'
  : /conference|spark|cert/i.test(org) ? 'cert'
  : /freelance/i.test(org) ? 'freelance'
  : /ai\/ml|club/i.test(org) ? 'ml'
  : /cracked|communit/i.test(org) ? 'community'
  : /hackathon/i.test(org) ? 'hack'
  : 'school'
