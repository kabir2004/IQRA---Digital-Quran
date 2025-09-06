'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

interface VercelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const VercelCard = forwardRef<HTMLDivElement, VercelCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "card-vercel",
          className
        )}
        {...props}
      >
        {children}
      </Card>
    )
  }
)
VercelCard.displayName = "VercelCard"

export const VercelCardHeader = CardHeader
export const VercelCardFooter = CardFooter
export const VercelCardTitle = CardTitle
export const VercelCardDescription = CardDescription
export const VercelCardContent = CardContent
