import { useEffect, useState } from 'react'
import { site } from '../data/site'
import './Footer.css'

const VISITOR_COUNT_KEY = 'portfolio-visitor-count'
const VISITOR_SESSION_KEY = 'portfolio-visitor-count-recorded'
const INITIAL_VISITOR_COUNT = 100

const ordinal = (n) => {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return 'th'
  return ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th'
}

export default function Footer() {
  const [visitorCount, setVisitorCount] = useState(INITIAL_VISITOR_COUNT)

  useEffect(() => {
    try {
      const saved = Number.parseInt(localStorage.getItem(VISITOR_COUNT_KEY), 10)
      const current = Number.isFinite(saved) && saved >= INITIAL_VISITOR_COUNT ? saved : INITIAL_VISITOR_COUNT
      const countedThisSession = sessionStorage.getItem(VISITOR_SESSION_KEY) === 'true'
      const next = countedThisSession ? current : (saved ? current + 1 : current)

      if (!countedThisSession) sessionStorage.setItem(VISITOR_SESSION_KEY, 'true')
      localStorage.setItem(VISITOR_COUNT_KEY, String(next))
      setVisitorCount(next)
    } catch {
      // Storage can be unavailable in privacy-focused browser settings.
    }
  }, [])

  return (
    <footer className="footer">
      <div className="footer-text">
        <p className="muted">
          Designed and developed by{' '}
          <a className="u footer-name" href="https://github.com/adarshxz" target="_blank" rel="noopener noreferrer">
            {site.name}
          </a>
        </p>
        <p className="muted">© {new Date().getFullYear()}. Built in {site.location.split(',')[0]}.</p>
      </div>
      <div className="footer-count-area">
        <div className="footer-dots dots" aria-hidden="true" />
        <p className="visitor-count" aria-label={`You are the ${visitorCount}${ordinal(visitorCount)} visitor`}>
          You are the <strong>{visitorCount.toLocaleString('en-IN')}<sup>{ordinal(visitorCount)}</sup></strong> visitor
        </p>
      </div>
    </footer>
  )
}
