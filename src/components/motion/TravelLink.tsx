import type { ComponentProps, MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'

type Transition = { finished: Promise<void> }
type Doc = Document & { startViewTransition?: (cb: () => void) => Transition }
const name = (root: ParentNode, selector: string) =>
  root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    el.style.viewTransitionName = `travel-${el.dataset.travel}`
  })

/**
 * A link whose page change runs inside a View Transition: the company's glyph and name fly
 * from where you tapped them into its page header (and back), while the old page fades out.
 * New tabs, modified clicks, unsupported browsers and reduced motion get a plain navigation.
 */
export function TravelLink({ to, travelId, onClick, ...rest }: ComponentProps<typeof Link> & { to: string; travelId?: string }) {
  const navigate = useNavigate()
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    const doc = document as Doc
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (!doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    e.preventDefault()
    const html = document.documentElement
    name(e.currentTarget, '[data-travel]')
    html.dataset.vt = 'travel'
    const t = doc.startViewTransition(() => {
      flushSync(() => navigate(to))
      // on the way back, the same company's row on the list page receives the glyph
      if (travelId) name(document, `[data-travel-id="${travelId}"]:not([data-travel-fixed])`)
    })
    t.finished.finally(() => {
      delete html.dataset.vt
      document.querySelectorAll<HTMLElement>('[data-travel]:not([data-travel-fixed])').forEach((el) => {
        el.style.viewTransitionName = ''
      })
    })
  }
  return <Link to={to} onClick={go} {...rest} />
}
