import { useEffect, useRef, useState } from 'react'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/** Flips to true the first time the element approaches the viewport. */
export function useInView({ rootMargin = '0px 0px -12% 0px', threshold = 0.01 } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin, threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, threshold])
  return [ref, inView]
}

/** Pointer-driven tilt. Mouse only, skipped under reduced motion, never touches children's hit areas. */
export function useTilt(max = 7) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || !hasFinePointer()) return undefined
    let frame = 0
    let next = null
    const apply = () => {
      frame = 0
      if (!next) return
      el.style.setProperty('--rx', `${next.rx}deg`)
      el.style.setProperty('--ry', `${next.ry}deg`)
      el.style.setProperty('--mx', `${next.mx}%`)
      el.style.setProperty('--my', `${next.my}%`)
    }
    const queue = (v) => {
      next = v
      if (!frame) frame = requestAnimationFrame(apply)
    }
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      queue({ rx: (0.5 - py) * max, ry: (px - 0.5) * max, mx: px * 100, my: py * 100 })
    }
    const onLeave = () => queue({ rx: 0, ry: 0, mx: 50, my: 50 })
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [max])
  return ref
}
