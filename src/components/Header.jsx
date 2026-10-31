import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTheme } from '../lib/theme'
import { useSound } from '../lib/sound'
import { Search, Sun, Moon, Volume, VolumeOff, Menu, Close } from './Icons'
import './Header.css'

export const OPEN_MENU = 'portfolio:open-menu'
const openMenu = () => window.dispatchEvent(new Event(OPEN_MENU))

const links = [
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const { isDark, toggle: toggleTheme } = useTheme()
  const { enabled: soundOn, toggle: toggleSound } = useSound()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  return (
    <header className="header">
      <div className="header-bar">
        <Link to="/" className="wordmark" aria-label="Adarsh Singh, home">
          Adarsh
        </Link>

        <nav className="header-nav" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `header-link ${isActive ? 'is-active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
          <button type="button" className="search-btn" onClick={openMenu} aria-label="Open command menu">
            <Search width={14} height={14} />
            <span>Search</span>
            <kbd>⌘K</kbd>
          </button>
        </nav>

        <span className="header-divider" aria-hidden="true" />

        <div className="header-tools">
          <button
            type="button"
            className="tool"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Turn interface sounds off' : 'Turn interface sounds on'}
          >
            {soundOn ? <Volume width={16} height={16} /> : <VolumeOff width={16} height={16} />}
          </button>
          <button
            type="button"
            className="tool"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun width={16} height={16} /> : <Moon width={16} height={16} />}
          </button>
        </div>

        <button
          type="button"
          className="burger"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <Close width={18} height={18} /> : <Menu width={18} height={18} />}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile">
          <Link to="/">Home</Link>
          {links.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
          <button type="button" onClick={openMenu}>
            Search
          </button>
        </nav>
      )}
    </header>
  )
}
