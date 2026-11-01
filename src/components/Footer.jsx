import { useEffect, useState } from 'react'
import { site } from '../data/site'
import './Footer.css'

const VISITOR_ID_KEY = 'portfolio-visitor-id'
const INITIAL_VISITOR_COUNT = 100

const ordinal = (n) => {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return 'th'
  return ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th'
}

export default function Footer() {
  const [visitorCount, setVisitorCount] = useState(INITIAL_VISITOR_COUNT)

  useEffect(() => {
    const visitorId = (() => {
      try {
        const existing = localStorage.getItem(VISITOR_ID_KEY)
        if (existing) return existing
        const created = crypto.randomUUID()
        localStorage.setItem(VISITOR_ID_KEY, created)
        return created
      } catch {
        return crypto.randomUUID()
      }
    })()

    const updateCount = async (method = 'GET') => {
      try {
        const response = await fetch('/api/visitor-count', {
          method,
          headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
          body: method === 'POST' ? JSON.stringify({ visitorId }) : undefined,
        })
        if (!response.ok) return
        const { count } = await response.json()
        if (Number.isFinite(count) && count >= INITIAL_VISITOR_COUNT) setVisitorCount(count)
      } catch {
        // Keep the baseline count visible while the counter service is unavailable.
      }
    }

    updateCount('POST')
    const interval = window.setInterval(() => updateCount(), 5_000)
    return () => window.clearInterval(interval)
  }, [])

  /*
    A random ID is stored per browser only to avoid counting refreshes as new
    visitors. The count itself is shared through the server-side Redis API.
  */

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
