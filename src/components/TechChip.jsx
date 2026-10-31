import { useState } from 'react'
import { useTheme } from '../lib/theme'
import { techIconUrl } from '../lib/techIcons'
import { Glyph } from './Icons'

export default function TechChip({ name, large = false, as: Tag = 'li' }) {
  const { isDark } = useTheme()
  const [failed, setFailed] = useState(false)
  const src = techIconUrl(name, isDark)
  return (
    <Tag className={`chip ${large ? 'chip-lg' : ''}`}>
      {src && !failed ? (
        <img src={src} alt="" width="16" height="16" loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : (
        <Glyph className="muted" />
      )}
      <span>{name}</span>
    </Tag>
  )
}
