import { Link } from 'react-router-dom'
import { ArrowLeft } from './Icons'
import './PageHead.css'

/** Shared top of the inner pages: muted kicker, headline, then a back link with an optional control. */
export default function PageHead({ kicker, title, children }) {
  return (
    <div className="pagehead">
      <div className="band">
        <p className="band-title muted">{kicker}</p>
      </div>
      <div className="band">
        <h1 className="band-title pagehead-title">{title}</h1>
      </div>
      <div className="pagehead-row">
        <Link to="/" className="pagehead-back muted">
          <ArrowLeft width={16} height={16} /> Home
        </Link>
        {children}
      </div>
    </div>
  )
}
