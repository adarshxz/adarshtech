import ProjectArt from './ProjectArt'
import TechChip from './TechChip'
import { GitHub } from './Icons'

const isLink = (url) => Boolean(url) && url !== '#'

export default function ProjectCard({ p }) {
  return (
    <article className="pcard" id={p.id}>
      <div className="preview dots">
        {p.preview ? (
          <img src={p.preview} alt={`${p.title} home page`} width="1000" height="625" loading="lazy" decoding="async" />
        ) : (
          <ProjectArt id={p.id} title={p.title} />
        )}
      </div>

      <div className="pcard-head">
        <h3>{p.title}</h3>
        <div className="pcard-links">
          {isLink(p.live) && (
            <a
              className="btn btn-outline"
              href={p.live}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.title}: live demo (opens in a new tab)`}
            >
              Live
            </a>
          )}
          {isLink(p.github) && (
            <a
              className="btn btn-outline"
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.title}: source code on GitHub (opens in a new tab)`}
            >
              <GitHub /> Code
            </a>
          )}
        </div>
      </div>

      <p className="pcard-desc muted" title={p.summary}>
        {p.summary}
      </p>
      <ul className="pcard-chips" aria-label={`${p.title} technologies`}>
        {p.stack.map((t) => (
          <TechChip key={t} name={t} />
        ))}
      </ul>
    </article>
  )
}
