import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../data/site'
import { prefersReducedMotion } from '../lib/hooks'
import { Mail, Send } from './Icons'
import './Profile.css'

const ROW = 28

/** Roles scroll upward through a one-line window, like a slot machine. */
function RoleRotator({ roles }) {
  const [i, setI] = useState(0)
  const [snap, setSnap] = useState(false)
  const reduced = prefersReducedMotion()
  const list = [...roles, roles[0]]

  useEffect(() => {
    if (reduced) return undefined
    const id = setInterval(() => {
      setSnap(false)
      setI((n) => n + 1)
    }, 2600)
    return () => clearInterval(id)
  }, [reduced])

  useEffect(() => {
    if (i !== roles.length) return undefined
    // after sliding onto the duplicate of the first role, jump back without animating
    const t = setTimeout(() => {
      setSnap(true)
      setI(0)
    }, 520)
    return () => clearTimeout(t)
  }, [i, roles.length])

  return (
    <span className="roles" style={{ height: ROW }}>
      <span className="sr-only">{roles.join(', ')}</span>
      <span
        className="roles-track"
        aria-hidden="true"
        style={{
          transform: `translateY(-${i * ROW}px)`,
          transition: snap || reduced ? 'none' : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {list.map((r, n) => (
          <span key={`${r}-${n}`} style={{ height: ROW }}>
            {r}
          </span>
        ))}
      </span>
    </span>
  )
}

export default function Profile() {
  const [real, setReal] = useState(false)

  return (
    <header className="profile">
      <div className="profile-media">
        <div className="avatar-outer">
          <div
            className="avatar"
            onClick={() => setReal((r) => !r)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setReal((r) => !r)
              }
            }}
            title={real ? 'Switch to animated avatar' : 'Switch to real photo'}
          >
            <img
              className={`avatar-img avatar-animated ${!real ? 'is-active' : ''}`}
              src="/images/avatar.webp"
              alt="Adarsh Singh, animated avatar"
              width="120"
              height="120"
              fetchpriority="high"
            />
            <img
              className={`avatar-img avatar-real ${real ? 'is-active' : ''}`}
              src="/images/image.webp"
              alt="Adarsh Singh, full-stack developer"
              width="120"
              height="120"
            />
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={real}
          aria-label={real ? 'Switch to animated avatar' : 'Switch to real photo'}
          title={real ? 'Switch to animated avatar' : 'Switch to real photo'}
          className="switch"
          onClick={() => setReal((r) => !r)}
        >
          <span aria-hidden="true" />
        </button>
      </div>

      <div className="profile-text">
        <h1>
          {site.name}
          <svg className="scribble" viewBox="0 0 160 8" preserveAspectRatio="none" aria-hidden="true">
            <path d="M2 5.5C30 1.5 60 2 92 4.2S140 6 158 2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </h1>
        <p className="profile-role muted">
          <RoleRotator roles={['Full-stack developer', 'AI engineer', 'GenAI builder']} />
        </p>
        <div className="profile-actions">
          <Link to="/contact" className="btn">
            <Send /> Get in touch
          </Link>
          <a className="btn" href={`mailto:${site.email}`}>
            <Mail /> Send an email
          </a>
        </div>
      </div>
    </header>
  )
}
