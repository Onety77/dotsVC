import { cn } from './cn'

export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-lime text-on-lime hover-device:hover:brightness-95',
  secondary: 'border border-line-2 text-ink hover-device:hover:bg-hover',
  ghost: 'text-ink-2 hover-device:hover:text-ink hover-device:hover:bg-hover',
  danger: 'bg-red text-white hover-device:hover:brightness-95',
}
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]',
}

export const buttonClass = (variant: Variant = 'secondary', size: Size = 'md', className?: string) =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,filter,color] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-40',
    variants[variant],
    sizes[size],
    className,
  )

