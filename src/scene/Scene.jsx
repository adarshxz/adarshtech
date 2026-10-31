import { Component, lazy, Suspense, useMemo } from 'react'
import { useMediaQuery } from '../lib/hooks'
import { useTheme } from '../lib/theme'
import './Banner.css'

// The 3D chunk (three + R3F) loads on demand and never blocks first paint.
export const loadField = () => import('./VectorField')
const VectorField = lazy(loadField)

export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    )
  } catch {
    return false
  }
}

class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    console.warn('3D scene disabled:', error)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** Dotted cover banner with the vector-space sculpture. The dots alone are the fallback. */
export default function Banner() {
  const supported = useMemo(hasWebGL, [])
  const mobile = useMediaQuery('(max-width: 767px)')
  const { isDark } = useTheme()

  return (
    <div className="banner" aria-hidden="true">
      <div className="banner-dots dots" />
      {supported && (
        <div className="banner-canvas">
          <SceneBoundary>
            <Suspense fallback={null}>
              <VectorField mobile={mobile} dark={isDark} />
            </Suspense>
          </SceneBoundary>
        </div>
      )}
      <p className="banner-note">
        &ldquo;It works on my machine.&rdquo;
        <br />
        <span>&mdash; every developer, minutes before it doesn&rsquo;t</span>
      </p>
    </div>
  )
}
