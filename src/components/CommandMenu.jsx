import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projects } from '../data/projects'
import { site, socials, resume } from '../data/site'
import { useTheme } from '../lib/theme'
import { useSound } from '../lib/sound'
import { OPEN_MENU } from './Header'
import './CommandMenu.css'

/** ⌘K / Ctrl+K: pages, projects, profiles and preferences. */
export default function CommandMenu() {
  const ref = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { isDark, toggle: toggleTheme } = useTheme()
  const { enabled: soundOn, toggle: toggleSound } = useSound()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)

  const close = () => setOpen(false)

  const items = useMemo(() => {
    const go = (to) => () => {
      setOpen(false)
      navigate(to)
    }
    const out = (href) => () => {
      setOpen(false)
      window.open(href, '_blank', 'noopener,noreferrer')
    }
    return [
      { group: 'Pages', label: 'Home', run: go('/') },
      { group: 'Pages', label: 'Projects', run: go('/projects') },
      { group: 'Pages', label: 'Contact', run: go('/contact') },
      ...projects.map((p) => ({ group: 'Projects', label: p.title, hint: p.shortTag, run: go(`/projects#${p.id}`) })),
      { group: 'Links', label: 'Resume', hint: 'PDF', run: out(resume.href) },
      { group: 'Links', label: 'Google Cloud Certificate', hint: 'Credly', run: out('https://www.credly.com/badges/3e42209b-eca3-4aa0-8f55-eabd4578bdde/public_url') },
      ...socials.map((s) => ({ group: 'Links', label: s.label, hint: s.handle, run: out(s.href) })),
      {
        group: 'Links',
        label: 'Copy email address',
        hint: site.email,
        run: () => {
          navigator.clipboard?.writeText(site.email).catch(() => {})
          setOpen(false)
        },
      },
      { group: 'Preferences', label: isDark ? 'Switch to light theme' : 'Switch to dark theme', run: () => { toggleTheme(); setOpen(false) } },
      { group: 'Preferences', label: soundOn ? 'Turn sounds off' : 'Turn sounds on', run: () => { toggleSound(); setOpen(false) } },
    ]
  }, [navigate, isDark, soundOn, toggleTheme, toggleSound])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? items.filter((i) => `${i.label} ${i.hint || ''} ${i.group}`.toLowerCase().includes(q)) : items
  }, [items, query])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_MENU, onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_MENU, onOpen)
    }
  }, [])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      setQuery('')
      setIndex(0)
      d.showModal()
      inputRef.current?.focus()
    }
    if (!open && d.open) d.close()
  }, [open])

  useEffect(() => setIndex(0), [query])
  useEffect(() => {
    document.getElementById(`cmd-${index}`)?.scrollIntoView({ block: 'nearest' })
  }, [index])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex((i) => Math.min(results.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndex((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      results[index]?.run()
    }
  }

  let last = ''
  return (
    <dialog ref={ref} className="cmd" aria-label="Command menu" onClose={close} onClick={(e) => e.target === ref.current && close()}>
      <input
        ref={inputRef}
        className="cmd-input"
        type="text"
        placeholder="Type a command or search"
        role="combobox"
        aria-expanded="true"
        aria-controls="cmd-list"
        aria-activedescendant={results.length ? `cmd-${index}` : undefined}
        aria-label="Search"
        autoComplete="off"
        spellCheck="false"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <ul id="cmd-list" className="cmd-list" role="listbox">
        {results.map((item, i) => {
          const header = item.group !== last
          last = item.group
          return (
            <li key={`${item.group}-${item.label}`} role="presentation">
              {header && <p className="cmd-group">{item.group}</p>}
              <button
                id={`cmd-${i}`}
                type="button"
                role="option"
                aria-selected={i === index}
                tabIndex={-1}
                className={`cmd-item ${i === index ? 'is-active' : ''}`}
                onMouseMove={() => setIndex(i)}
                onClick={item.run}
              >
                <span>{item.label}</span>
                {item.hint && <span className="cmd-hint">{item.hint}</span>}
              </button>
            </li>
          )
        })}
        {!results.length && <li className="cmd-empty">No results found.</li>}
      </ul>
    </dialog>
  )
}
