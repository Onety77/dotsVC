import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const read = (): Theme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light')

/** Dark by default. index.html applies a saved "light" before first paint. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(read)

  // keep every switch on the page in step
  useEffect(() => {
    const on = () => setThemeState(read())
    window.addEventListener('themechange', on)
    return () => window.removeEventListener('themechange', on)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    document.documentElement.classList.toggle('dark', t === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#09090b' : '#f4f4f2')
    try {
      if (t === 'light') localStorage.setItem('theme', 'light')
      else localStorage.removeItem('theme')
    } catch {
      /* storage blocked: applies for this visit */
    }
    window.dispatchEvent(new Event('themechange'))
  }, [])

  return [theme, setTheme] as const
}
