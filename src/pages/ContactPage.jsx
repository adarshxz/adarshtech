import { useEffect, useState } from 'react'
import { site, socials } from '../data/site'
import PageHead from '../components/PageHead'
import Section from '../components/Section'
import { socialIcon, Mail, Send, ArrowUpRight } from '../components/Icons'
import './ContactPage.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
/*
  This is a static client app, so it never embeds a delivery webhook or other
  secret in the browser bundle. The visitor sends the prefilled message from
  their own email client instead.
*/
function deliver({ email, message }) {
  const body = `${message}\n\nReply to: ${email}`
  window.location.href = `mailto:${site.email}?subject=${encodeURIComponent('Message from your portfolio')}&body=${encodeURIComponent(body)}`
  return 'handoff'
}

const routes = [
  { icon: Mail, title: 'Write an email', sub: site.email, href: `mailto:${site.email}`, primary: true },
  { icon: socialIcon.LinkedIn, title: 'Message on LinkedIn', sub: 'adarshxzsingh', href: socials.find((s) => s.label === 'LinkedIn').href, external: true },
]

export default function ContactPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | handoff | error

  useEffect(() => {
    document.title = 'Contact — Adarsh Singh'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const emailOk = EMAIL_RE.test(email.trim())
  const messageOk = message.trim().length >= 10
  const valid = emailOk && messageOk

  const submit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, message: true })
    if (!valid) return
    setStatus('sending')
    try {
      const result = deliver({ email: email.trim(), message: message.trim() })
      setStatus(result)
      if (result === 'sent') {
        setEmail('')
        setMessage('')
        setTouched({})
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <>
      <PageHead kicker="Contact" title="I'd love to hear about what you're building.">
        <span className="open-pill">Open to work</span>
      </PageHead>

      <Section id="routes" title="Fastest routes">
        <ul className="routes">
          {routes.map(({ icon: Icon, title, sub, href, primary, external }) => (
            <li key={title}>
              <a
                className={`route ${primary ? 'is-primary' : ''}`}
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className="route-icon">
                  <Icon width={18} height={18} />
                </span>
                <span className="route-text">
                  <strong>{title}</strong>
                  <span>{sub}</span>
                </span>
                <ArrowUpRight width={15} height={15} />
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="message" title="Send a message">
        <form className="cform" onSubmit={submit} noValidate>
          <p className="muted cform-intro">
            Got a role, a freelance project, or just curious about my work? Send me a message right here!
          </p>

          <div className="cfield">
            <label htmlFor="c-email">Your email</label>
            <input
              id="c-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              aria-invalid={touched.email && !emailOk ? 'true' : undefined}
              aria-describedby="c-email-hint"
            />
            {touched.email && !emailOk && (
              <p className="cerr" id="c-email-hint">
                Enter a complete email address so I can reply.
              </p>
            )}
          </div>

          <div className="cfield">
            <label htmlFor="c-message">Your message</label>
            <textarea
              id="c-message"
              rows="5"
              placeholder="What are you building, and where do you want help?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, message: true }))}
              aria-invalid={touched.message && !messageOk ? 'true' : undefined}
              aria-describedby="c-message-hint"
            />
            <p className={`chint ${touched.message && !messageOk ? 'cerr' : 'muted'}`} id="c-message-hint">
              At least 10 characters so I know what you need.
            </p>
          </div>

          <button type="submit" className="cbtn" disabled={status === 'sending' || (touched.email && touched.message && !valid)}>
            <Send width={16} height={16} /> {status === 'sending' ? 'Sending' : 'Send message'}
          </button>

          <p className={`cstatus ${status}`} role="status" aria-live="polite">
            {status === 'sent' && 'Message sent. I will reply to the address you gave.'}
            {status === 'handoff' &&
              'Your email app should have opened with the message filled in. It is only sent once you press send there.'}
            {status === 'error' && `The message could not be delivered. Email ${site.email} directly, or try again.`}
          </p>
          <p className="muted cnote">
            Opens your email app, addressed to{' '}
            <a className="u strong" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
        </form>
      </Section>
    </>
  )
}
