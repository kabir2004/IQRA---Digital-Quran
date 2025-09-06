'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from './button'

export const VercelButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "btn-vercel",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
VercelButton.displayName = "VercelButton"
