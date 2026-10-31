import { site } from '../data/site'
import './Footer.css'

export default function Footer() {
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
      <div className="footer-dots dots" aria-hidden="true" />
    </footer>
  )
}
