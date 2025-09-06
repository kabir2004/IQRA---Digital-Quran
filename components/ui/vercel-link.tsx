'use client'

import { forwardRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface VercelLinkProps extends React.ComponentProps<typeof Link> {
  children: React.ReactNode
}

export const VercelLink = forwardRef<HTMLAnchorElement, VercelLinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        className={cn(
          "link-vercel",
          className
        )}
        {...props}
      >
        {children}
      </Link>
    )
  }
)
VercelLink.displayName = "VercelLink"
