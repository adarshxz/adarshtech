import { lazy, Suspense, useMemo, Component } from 'react'
import { Link } from 'react-router-dom'
import { aboutData } from '../data/about'
import { achievementsData } from '../data/achievements'
import { certifications } from '../data/certifications'
import { events } from '../data/events'
import { projects } from '../data/projects'
import { site, socials, resume } from '../data/site'
import Section from './Section'
import TechChip from './TechChip'
import ProjectCard from './ProjectCard'
import GithubActivity from './GithubActivity'
import { socialIcon, Mail, File, Send, ArrowRight, ArrowUpRight } from './Icons'
import OrgBadge, { kindFor } from './OrgBadges'
import { useMediaQuery, useInView } from '../lib/hooks'
import { useTheme } from '../lib/theme'
import { hasWebGL } from '../scene/Scene'
import './Sections.css'

const ExpertiseScene = lazy(() => import('./ExpertiseScene'))

class ExpertiseBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error) { console.warn('Expertise 3D scene disabled:', error) }
  render() { return this.state.failed ? null : this.props.children }
}

/* ---- About ----------------------------------------------------- */
export function About() {
  return (
    <Section id="about" title="About">
      <ul className="about-list">
        <li>
          I am a computer science student working across{' '}
          <span className="hl">AI, machine learning and full-stack development</span>, learning what real
          engineering looks like one project at a time.
        </li>
        <li>
          Passionate about architecting <span className="hl">efficient systems</span>, writing clean code, and building
          high-performance web products.
        </li>
        <li>
          Focused on building innovative projects, solving real-world problems, and transforming ideas into
          practical, technology-driven solutions.
        </li>
      </ul>
    </Section>
  )
}

/* ---- Connect --------------------------------------------------- */
const pick = (label) => socials.find((s) => s.label === label)
const connect = [
  { label: 'Resume', href: resume.href, icon: File, external: true, hue: 'var(--c1)' },
  { label: 'Contact', to: '/contact', icon: Send, hue: 'var(--mark-solid)' },
  { label: 'GitHub', href: pick('GitHub').href, icon: socialIcon.GitHub, external: true, hue: 'var(--c5)' },
  { label: 'LinkedIn', href: pick('LinkedIn').href, icon: socialIcon.LinkedIn, external: true, hue: 'var(--c-blue)' },
  { label: 'X (Twitter)', href: pick('X').href, icon: socialIcon.X, external: true, hue: 'var(--c2)' },
  { label: 'Email', href: `mailto:${site.email}`, icon: Mail, hue: 'var(--c3)' },
]

export function Connect() {
  return (
    <Section id="connect" title="Connect">
      <ul className="connect">
        {connect.map(({ label, href, to, icon: Icon, external, hue }) => (
          <li key={label} style={{ '--hue': hue }}>
            {to ? (
              <Link to={to} className="btn connect-btn">
                <Icon /> <span>{label}</span>
              </Link>
            ) : (
              <a
                className="btn connect-btn"
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <Icon /> <span>{label}</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}

/* ---- Certifications -------------------------------------------- */
export function Certifications() {
  return (
    <Section id="certifications" title="Certifications">
      <ul className="xlist cert-list">
        {certifications.map((c) => (
          <li key={c.title} className="xrow cert-row">
            <OrgBadge
              kind={c.badgeKind || kindFor(c.issuer || c.title)}
              icon={c.icon}
              iconSurface={c.iconSurface}
            />
            <div className="xmain">
              <div className="cert-head">
                {c.link ? (
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="u cert-title-link"
                  >
                    <h3>{c.title}</h3>
                    <ArrowUpRight width={14} height={14} className="cert-link-icon" />
                  </a>
                ) : (
                  <h3 className="u">{c.title}</h3>
                )}
              </div>
              <p className="muted cert-issuer">Issued by {c.issuer}</p>
              {c.detail && <p className="muted cert-detail">{c.detail}</p>}
            </div>
            <div className="cert-aside">
              {c.date && <p className="xdate muted">{c.date}</p>}
              {c.link && (
                <a
                  href={c.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cert-verify-btn"
                >
                  Verify <ArrowUpRight width={12} height={12} />
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/* ---- Experience and education ---------------------------------- */
const work = achievementsData.experience
  .filter((e) => e.title && !e.title.includes('*'))
  .map((e) => ({
    org: e.subtitle || e.title,
    role: e.title,
    tag: 'Community',
    period: e.period,
    icon: e.icon,
    iconSurface: e.iconSurface,
    start: Number.parseInt(e.period, 10),
  }))
  .sort((a, b) => b.start - a.start)

function Row({ org, role, tag, period, icon, iconSurface }) {
  return (
    <li className="xrow">
      <OrgBadge kind={kindFor(org)} icon={icon} iconSurface={iconSurface} />
      <div className="xmain">
        <h3 className="u">{org}</h3>
        <p className="muted">
          {role} • {tag}
        </p>
      </div>
      <p className="xdate muted">{period}</p>
    </li>
  )
}

export function Experience() {
  return (
    <Section id="experience" title="Experience">
      <ul className="xlist">
        {work.map((w) => (
          <Row key={`${w.org}-${w.role}`} {...w} />
        ))}
      </ul>
    </Section>
  )
}

export function Education() {
  return (
    <Section id="education" title="Education">
      <ul className="xlist">
        {achievementsData.education.map((e) => (
          <Row
            key={e.title}
            org={e.title}
            role={e.subtitle}
            tag="Indore"
            period={e.period}
            icon={e.icon}
            iconSurface={e.iconSurface}
          />
        ))}
      </ul>
    </Section>
  )
}

/* ---- Activity -------------------------------------------------- */
export function Activity() {
  return (
    <Section id="activity" title="Activity">
      <GithubActivity />
    </Section>
  )
}

/* ---- Projects (two on the home page) --------------------------- */
export function ProjectsPreview() {
  return (
    <Section id="projects" title="Projects" flush>
      <div className="pgrid">
        {projects.slice(0, 2).map((p) => (
          <ProjectCard key={p.id} p={p} />
        ))}
      </div>
      <div className="see-all">
        <Link to="/projects" className="btn btn-lg">
          See all projects <ArrowRight />
        </Link>
      </div>
    </Section>
  )
}

/* ---- Skills ---------------------------------------------------- */
const skills = [
  'TypeScript', 'JavaScript', 'Python', 'React', 'Next.js', 'Vite', 
  'Django', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Supabase', 
  'NumPy', 'Pandas', 'PyTorch', 'TensorFlow', 'Matplotlib',
  'LangChain', 'ChromaDB', 'Streamlit', 'RAG', 'AI agents', 'Git', 'GitHub',
]

export function Skills() {
  return (
    <Section id="skills" title="Skills">
      <ul className="skills">
        {skills.map((s) => (
          <TechChip key={s} name={s} large />
        ))}
      </ul>
    </Section>
  )
}

/* ---- Achievements ---------------------------------------------- */
export function Achievements() {
  return (
    <Section id="achievements" title="Achievements" flush>
      <ul className="ach">
        {events.map((ev, i) => (
          <li key={ev.title} className="ach-row" style={{ '--bullet': ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)'][i % 5] }}>
            <div className="ach-top">
              <h3>
                {ev.role} - {ev.title}
              </h3>
              {ev.date && <p className="mono muted">{ev.date}</p>}
            </div>
            <p className="muted">{ev.detail}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/* ---- Closing expertise 3D scene -------------------------------- */

export function ClosingCta() {
  const mobile = useMediaQuery('(max-width: 767px)')
  const [sectionRef, inView] = useInView({ rootMargin: '200px 0px 200px 0px', threshold: 0.01 })
  const webGL = useMemo(hasWebGL, [])
  const { isDark } = useTheme()

  return (
    <section className="closing" aria-label="Expertise & get in touch" ref={sectionRef}>
      {/* 3D expertise scene */}
      <div className="expertise-3d" aria-label="Backend, frontend, AI and data science overlap in my work">
        {webGL && inView ? (
          <ExpertiseBoundary>
            <Suspense fallback={null}>
              <ExpertiseScene mobile={mobile} dark={isDark} />
            </Suspense>
          </ExpertiseBoundary>
        ) : (
          /* Static fallback when WebGL is not available */
          <div className="expertise-fallback">
            <img className="expertise-fallback-photo" src="/images/image.webp" alt="" width="76" height="76" loading="lazy" />
            <div className="expertise-fallback-labels">
              <span>Frontend Engineering</span>
              <span>Backend Systems</span>
              <span>AI & RAG Systems</span>
              <span>Data Science & ML</span>
            </div>
          </div>
        )}
      </div>
      <p className="closing-text">Made it this far? Let’s talk about what you’re building.</p>
      <Link to="/contact" className="closing-btn">
        <img src="/images/image.webp" alt="" width="20" height="20" loading="lazy" />
        Get in touch
      </Link>
    </section>
  )
}
