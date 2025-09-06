'use client'

import { cn } from '@/lib/utils'

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function LoadingSkeleton({ className, ...props }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted loading-vercel",
        className
      )}
      {...props}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="card-vercel p-6 space-y-4">
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-5/6" />
        <LoadingSkeleton className="h-4 w-4/6" />
      </div>
      <div className="flex space-x-2">
        <LoadingSkeleton className="h-8 w-20" />
        <LoadingSkeleton className="h-8 w-16" />
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <LoadingSkeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <LoadingSkeleton className="h-4 w-3/4" />
            <LoadingSkeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
