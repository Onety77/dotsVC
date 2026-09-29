/**
 * Motion tokens. One personality: alive, precise, a little physical.
 * The rule behind every loop on the site: only living things move.
 * Active companies breathe, paused ones hold still, cut-off ones fade.
 */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const // entrances (expo-out)
export const EASE_UI = [0.25, 1, 0.5, 1] as const // UI state (quart-out)
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const // things that travel
export const EASE_PULL = [0.55, 0, 0.8, 0.3] as const // pulled in by the holdco: slow start, fast arrival
export const SPRING_UI = { type: 'spring', stiffness: 500, damping: 40 } as const
export const SPRING_SOFT = { type: 'spring', stiffness: 260, damping: 28 } as const
/** a dot landing: quick, with one small bounce */
export const SPRING_POP = { type: 'spring', stiffness: 520, damping: 17, mass: 0.8 } as const
export const VIEWPORT = { once: true, margin: '0px 0px -10% 0px' } as const

/** SVG elements scale and rotate around their own centre. */
export const svgOrigin = { transformBox: 'fill-box', transformOrigin: 'center' } as const
