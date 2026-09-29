import { Link } from 'react-router-dom'
import { Notice } from '@/components/ui/Notice'

export function NotFound() {
  return (
    <div className="wrap py-20">
      <Notice kind="empty" title="This page isn’t in the network." body="The link may be old, or the page moved.">
        <Link to="/" className="mt-4 text-sm font-semibold underline decoration-line-2 underline-offset-4">
          Back home
        </Link>
      </Notice>
    </div>
  )
}
