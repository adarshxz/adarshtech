import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { projects } from '../data/projects'
import PageHead from '../components/PageHead'
import ProjectCard from '../components/ProjectCard'
import { Search } from '../components/Icons'
import './ProjectsPage.css'

export default function ProjectsPage() {
  const [query, setQuery] = useState('')
  const { hash } = useLocation()

  useEffect(() => {
    document.title = 'Projects — Adarsh Singh'
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return undefined
    }
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80)
    return () => clearTimeout(t)
  }, [hash])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => `${p.title} ${p.summary} ${p.shortTag} ${p.stack.join(' ')}`.toLowerCase().includes(q))
  }, [query])

  return (
    <>
      <PageHead kicker="Projects" title="Cool stuff I've built ">
        <label className="psearch">
          <Search width={16} height={16} />
          <span className="sr-only">Search projects</span>
          <input
            type="search"
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </label>
      </PageHead>

      {shown.length ? (
        <div className="pgrid pgrid-page">
          {shown.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <p className="muted pempty">No projects match “{query}”. Try a technology or a project name.</p>
      )}
    </>
  )
}
