'use client'

import { type ReactNode, type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  href?: string
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  href,
  loading,
  fullWidth,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = clsx(
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-250',
    'focus-ring',
    {
      'btn-primary': variant === 'primary',
      'btn-secondary': variant === 'secondary',
      'btn-ghost': variant === 'ghost',
      'btn-sm text-sm px-4 py-2': size === 'sm',
      'text-[0.9375rem] px-7 py-3': size === 'md',
      'btn-lg': size === 'lg',
      'w-full': fullWidth,
      'opacity-50 pointer-events-none': loading || disabled,
    },
    className,
  )

  const content = (
    <>
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : icon ? (
        <span className="w-4 h-4 shrink-0">{icon}</span>
      ) : null}
      {children}
    </>
  )

  if (href) {
    return (
      <a href={href} className={base}>
        {content}
      </a>
    )
  }

  return (
    <button className={base} disabled={disabled || loading} {...props}>
      {content}
    </button>
  )
}
