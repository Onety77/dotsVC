import { useSearchParams } from 'react-router-dom'
import type { ViewState } from '@/types'

/**
 * Preview any data state with ?state=loading|empty|error.
 * NORA: replace with your query status when wiring.
 */
export function useDemoState(): ViewState {
  const [params] = useSearchParams()
  const s = params.get('state')
  return s === 'loading' || s === 'empty' || s === 'error' ? s : 'ready'
}
