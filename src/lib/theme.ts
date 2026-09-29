import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const read = (): Theme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light')

function apply(t: Theme) {
  document.documentElement.classList.toggle('dark', t === 'dark')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#09090b' : '#f4f4f2')
  try {
    if (t === 'light') localStorage.setItem('theme', 'light')
    else localStorage.removeItem('theme')
  } catch {
    /* storage blocked: applies for this visit */
  }
  window.dispatchEvent(new Event('themechange'))
}

/**
 * Dark by default. index.html applies a saved "light" before first paint.
 * Pass the point that was clicked and the new theme spreads out from it as a growing circle
 * (View Transitions). Browsers without it, and reduced motion, switch instantly.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(read)

  // keep every switch on the page in step
  useEffect(() => {
    const on = () => setThemeState(read())
    window.addEventListener('themechange', on)
    return () => window.removeEventListener('themechange', on)
  }, [])

  const setTheme = useCallback((t: Theme, from?: { x: number; y: number }) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
    if (!from || !doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return apply(t)
    const r = Math.hypot(Math.max(from.x, innerWidth - from.x), Math.max(from.y, innerHeight - from.y))
    const vt = doc.startViewTransition(() => apply(t))
    vt.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${from.x}px ${from.y}px)`, `circle(${r}px at ${from.x}px ${from.y}px)`] },
          { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
        )
      })
      .catch(() => {})
  }, [])

  return [theme, setTheme] as const
}
