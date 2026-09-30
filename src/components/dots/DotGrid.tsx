import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'

const GAP = 22
const REACH = 150

/**
 * The space the network lives in: a faint grid of dots. Near the pointer the dots
 * wake up (grow, brighten, lean away), like a lamp moving over the field.
 * Draws once and stays still on touch screens and under reduced motion.
 */
export function DotGrid({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const lively = matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let raf = 0
    // pointer (target) and lamp (eased position), in canvas pixels
    const target = { x: -1e4, y: -1e4, on: 0 }
    const lamp = { x: -1e4, y: -1e4, on: 0 }
    let dim = ''
    let lit = ''

    const colours = () => {
      const s = getComputedStyle(document.documentElement)
      dim = s.getPropertyValue('--grid').trim()
      lit = s.getPropertyValue('--ink').trim()
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          const dx = x - lamp.x
          const dy = y - lamp.y
          const d = Math.hypot(dx, dy)
          const k = d < REACH ? (1 - d / REACH) ** 2 * lamp.on : 0
          const push = k * 6
          ctx.globalAlpha = 1
          ctx.fillStyle = dim
          if (k > 0.02) {
            ctx.fillStyle = lit
            ctx.globalAlpha = 0.12 + k * 0.5
          }
          ctx.beginPath()
          ctx.arc(x + (d ? (dx / d) * push : 0), y + (d ? (dy / d) * push : 0), 1 + k * 1.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const tick = () => {
      lamp.x += (target.x - lamp.x) * 0.18
      lamp.y += (target.y - lamp.y) * 0.18
      lamp.on += (target.on - lamp.on) * 0.12
      draw()
      const settled = Math.abs(target.x - lamp.x) < 0.3 && Math.abs(target.y - lamp.y) < 0.3 && Math.abs(target.on - lamp.on) < 0.01
      raf = settled ? 0 : requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const r = canvas.getBoundingClientRect()
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
      if (inside) {
        // jump the lamp to the pointer when it (re)enters, then ease
        if (!target.on) {
          lamp.x = e.clientX - r.left
          lamp.y = e.clientY - r.top
        }
        target.x = e.clientX - r.left
        target.y = e.clientY - r.top
      }
      target.on = inside ? 1 : 0
      wake()
    }
    const onTheme = () => {
      colours()
      draw()
    }

    colours()
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    window.addEventListener('themechange', onTheme)
    if (lively) window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('themechange', onTheme)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={ref} aria-hidden className={cn('pointer-events-none absolute inset-0 size-full', className)} />
}
