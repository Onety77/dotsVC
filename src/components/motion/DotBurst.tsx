import { m, useReducedMotion } from 'motion/react'
import { EASE_OUT } from '@/lib/motion'

/**
 * A celebration in the site's own material: a ring of dots flies out from the centre and fades.
 * Place it inside a `relative` parent; it centres itself and never catches the pointer.
 */
export function DotBurst({ count = 12, radius = 64, delay = 0, color = 'var(--pulse)' }: { count?: number; radius?: number; delay?: number; color?: string }) {
  const reduced = useReducedMotion()
  if (reduced) return null
  return (
    <span aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 size-0">
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + 0.3
        const r = radius * (i % 2 ? 0.72 : 1)
        const size = i % 3 === 0 ? 7 : 5
        return (
          <m.span
            key={i}
            className="absolute rounded-full"
            style={{ width: size, height: size, left: -size / 2, top: -size / 2, background: i % 4 === 1 ? 'var(--ink)' : color }}
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
            animate={{ x: Math.cos(a) * r, y: Math.sin(a) * r, scale: 1, opacity: 0 }}
            transition={{ duration: 1.1, delay: delay + (i % 3) * 0.03, ease: EASE_OUT, opacity: { duration: 1.1, delay: delay + 0.35, ease: 'easeIn' } }}
          />
        )
      })}
    </span>
  )
}
