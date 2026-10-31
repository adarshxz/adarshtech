import { useEffect, useMemo, useState } from 'react'
import { useInView } from '../lib/hooks'

const USERNAME = 'adarshxz'
const API = `/api/github-contributions?username=${USERNAME}`
const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 }

const toGrid = (weeks = []) =>
  weeks.map((week) => {
    const byDay = new Map(week.contributionDays.map((d) => [d.weekday, d]))
    return Array.from({ length: 7 }, (_, i) => byDay.get(i) || null)
  })

const toMonths = (months = []) => {
  let col = 1
  return months.map((m) => {
    const out = { label: m.name.slice(0, 3), col }
    col += m.totalWeeks
    return out
  })
}

/** Official contribution calendar from the existing /api/github-contributions endpoint. */
export default function GithubActivity() {
  const [ref, near] = useInView({ rootMargin: '300px 0px' })
  const [state, setState] = useState({ status: 'idle', calendar: null })

  useEffect(() => {
    if (!near) return undefined
    const controller = new AbortController()
    setState({ status: 'loading', calendar: null })
    fetch(API, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('unavailable'))))
      .then((data) => setState({ status: 'loaded', calendar: data.calendar }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ status: 'error', calendar: null })
      })
    return () => controller.abort()
  }, [near])

  const weeks = useMemo(() => toGrid(state.calendar?.weeks), [state.calendar])
  const months = useMemo(() => toMonths(state.calendar?.months), [state.calendar])

  if (state.status !== 'loaded') {
    return (
      <p ref={ref} className="muted mono activity-state">
        {state.status === 'error'
          ? 'The contribution graph could not be loaded right now.'
          : 'Loading contribution history…'}
      </p>
    )
  }

  return (
    <div ref={ref} className="activity">
      <div className="activity-scroll">
        <div className="activity-chart" style={{ '--weeks': weeks.length }}>
          <div className="activity-months mono muted" aria-hidden="true">
            {months.map((m) => (
              <span key={`${m.label}-${m.col}`} style={{ gridColumn: m.col }}>
                {m.label}
              </span>
            ))}
          </div>
          <div
            className="activity-grid"
            role="img"
            aria-label={`${state.calendar.totalContributions} contributions in the last year`}
          >
            {weeks.flatMap((week, wi) =>
              week.map((day, di) => (
                <span
                  key={day?.date || `${wi}-${di}`}
                  className={`cell l${day ? LEVELS[day.contributionLevel] : 0}`}
                  title={day ? `${day.contributionCount} contributions on ${day.date}` : undefined}
                />
              )),
            )}
          </div>
        </div>
      </div>
      <div className="activity-foot mono">
        <span>{state.calendar.totalContributions} contributions in the last year</span>
        <span className="activity-legend muted" aria-hidden="true">
          Less
          {[0, 1, 2, 3, 4].map((l) => (
            <i key={l} className={`cell l${l}`} />
          ))}
          More
        </span>
      </div>
    </div>
  )
}
