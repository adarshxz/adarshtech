import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const SoundContext = createContext(null)
const KEY = 'sound'

/** Tiny synthesized UI ticks (no audio files). Off by default; the header toggle turns them on. */
export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(KEY) === 'on'
    } catch {
      return false
    }
  })
  const ctx = useRef(null)

  const play = useCallback((freq = 620, ms = 45) => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      ctx.current = ctx.current || new AC()
      const c = ctx.current
      if (c.state === 'suspended') c.resume()
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, c.currentTime)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, c.currentTime + ms / 1000)
      gain.gain.setValueAtTime(0.0001, c.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + ms / 1000)
      osc.connect(gain).connect(c.destination)
      osc.start()
      osc.stop(c.currentTime + ms / 1000 + 0.02)
    } catch {
      /* audio unavailable */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(KEY, enabled ? 'on' : 'off')
    } catch {
      /* ignore */
    }
  }, [enabled])

  // one delegated listener: any link or button gives a tick while sound is on
  useEffect(() => {
    if (!enabled) return undefined
    const onDown = (e) => {
      if (e.target.closest?.('a, button, [role="switch"]')) play()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [enabled, play])

  const toggle = useCallback(() => {
    setEnabled((on) => {
      if (!on) setTimeout(() => play(760, 70), 0)
      return !on
    })
  }, [play])

  const value = useMemo(() => ({ enabled, toggle }), [enabled, toggle])
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export const useSound = () => useContext(SoundContext)
