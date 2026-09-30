type Kind = 'glyph' | 'name'

/**
 * Marks an element that can travel between pages. Only the company being opened gets a
 * View Transition name (set at the moment of the tap), so nothing else on the page ghosts.
 * `fixed` is for the one place a company always lives: its own page header.
 */
export function travel(kind: Kind, id: string, fixed = false) {
  return {
    'data-travel': kind,
    'data-travel-id': id,
    'data-travel-fixed': fixed || undefined,
    style: fixed ? { viewTransitionName: `travel-${kind}` } : undefined,
  }
}
