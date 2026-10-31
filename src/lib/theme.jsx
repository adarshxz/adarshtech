import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'

const ThemeContext = createContext(null)
const KEY = 'theme'

const read = () => {
  try {
    const t = localStorage.getItem(KEY)
    return t === 'light' || t === 'dark' ? t : 'dark'
  } catch {
    return 'dark'
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(read)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#000000' : '#eef0f3')
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* storage unavailable */
    }
  }, [theme])

  /*
    Slanted wipe using the View Transitions API.
    Browsers without it (and reduced-motion users) get a quick colour cross-fade or an instant swap.
  */
  const toggle = useCallback((origin) => {
    const next = (t) => (t === 'dark' ? 'light' : 'dark')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = document.documentElement

    if (reduced) {
      setTheme(next)
      return
    }
    if (!document.startViewTransition) {
      root.classList.add('theme-fade')
      setTheme(next)
      setTimeout(() => root.classList.remove('theme-fade'), 450)
      return
    }

    // a slanted wipe: the new theme is drawn left to right across the page
    const W = window.innerWidth
    const H = window.innerHeight
    const slant = Math.round(H * 0.2126)
    const end = W + slant
    const duration = 750
    const easing = 'cubic-bezier(0.65, 0, 0.35, 1)'

    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next))
    })
    transition.ready
      .then(() => {
        const clip = (e) => `polygon(0 0, ${e}px 0, ${e - slant}px 100%, 0 100%)`
        root.animate(
          { clipPath: [clip(0), clip(end)] },
          { duration, easing, pseudoElement: '::view-transition-new(root)' },
        )
      })
      .catch(() => {})
  }, [])
  const value = useMemo(() => ({ theme, isDark: theme === 'dark', toggle }), [theme, toggle])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
