import { Link } from 'react-router-dom'
import { ArrowLeft } from '../components/Icons'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <div className="not-found-content">
        <p className="not-found-code">404</p>
        <h1 id="not-found-title">This page doesn&apos;t exist</h1>
        <p className="not-found-copy">
          The link may be out of date. Everything lives on the home page — start there, or search with ⌘K.
        </p>
        <Link className="not-found-home" to="/">
          <ArrowLeft width={18} height={18} />
          Back home
        </Link>
      </div>
    </section>
  )
}
