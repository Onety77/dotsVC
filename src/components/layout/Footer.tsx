import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { docsUrl } from './nav'

const legal = '© 2026 DOTS. Not affiliated with Pump.fun. Meme coins are volatile; nothing here is investment advice.'

const cols = [
  { head: 'Network', links: [['Explore companies', '/network'], ['Receivership', '/receivership'], ['Launch a company', '/launch']] },
  // CONTENT: real URLs for docs, program addresses, audits and socials.
  { head: 'Protocol', links: [['Docs', docsUrl], ['Program addresses', docsUrl], ['Audits', docsUrl]] },
  { head: 'Community', links: [['X', docsUrl], ['Telegram', docsUrl], ['Brand kit', docsUrl]] },
]

/**
 * The full footer closes the home page only. App pages (network, company,
 * receivership, launch) end with one quiet row so their own content is the last thing seen.
 */
export function Footer({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <footer className="border-t border-line">
        <div className="wrap flex flex-col gap-3 py-6 text-[12px] text-ink-3 md:flex-row md:items-center md:justify-between">
          <p>{legal}</p>
          <a href={docsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-ink-2 hover-device:hover:text-ink">
            Docs <ArrowUpRight className="size-3" />
          </a>
        </div>
      </footer>
    )
  }
  return (
    <footer className="border-t border-line">
      <div className="wrap grid gap-12 py-16 lg:grid-cols-12 [&>*]:min-w-0">
        <div className="lg:col-span-5">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-ink-3">Meme coins run like companies, and made to earn their survival.</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
          {cols.map((c) => (
            <div key={c.head}>
              <p className="label">{c.head}</p>
              <ul className="mt-4 grid gap-3">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith('/') ? (
                      <Link to={href} className="text-sm text-ink-2 hover-device:hover:text-ink">
                        {label}
                      </Link>
                    ) : (
                      <a href={href} target="_blank" rel="noreferrer" className="text-sm text-ink-2 hover-device:hover:text-ink">
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="wrap">
        <p className="border-t border-line py-6 text-[12px] text-ink-3">{legal}</p>
      </div>
    </footer>
  )
}
