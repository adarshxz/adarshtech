export default function Section({ id, title, aside, children, flush = false }) {
  const titleId = id ? `${id}-title` : undefined
  return (
    <section id={id} className="section" aria-labelledby={titleId}>
      <div className="band">
        <h2 id={titleId}>{title}</h2>
        {aside}
      </div>
      <div className={flush ? '' : 'section-body'}>{children}</div>
    </section>
  )
}
