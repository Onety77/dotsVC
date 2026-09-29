import { useSearchParams } from 'react-router-dom'
import type { ViewState } from '@/types'

/**
 * Preview any data state with ?state=loading|empty|error.
 */
export function useDemoState(): ViewState {
  const [params] = useSearchParams()
  const s = params.get('state')
  return s === 'loading' || s === 'empty' || s === 'error' ? s : 'ready'
}
