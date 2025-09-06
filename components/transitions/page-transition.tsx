'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [isInitial, setIsInitial] = useState(true)
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Skip animation on initial load
    if (isInitial) {
      setIsVisible(true)
      setIsInitial(false)
      return
    }

    // Reset state on pathname change
    setIsExiting(false)
    setIsVisible(false)
    
    // Trigger enter animation with proper timing
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 16) // One frame delay for smooth animation

    return () => clearTimeout(timer)
  }, [pathname, isInitial])

  // Enhanced transition with Vercel-style easing
  return (
    <div
      ref={containerRef}
      className={cn(
        "page-transition transition-vercel-slow",
        isVisible && !isExiting 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 translate-y-2 scale-[0.98]",
        className
      )}
      style={{
        transform: 'translateZ(0)', // Force hardware acceleration
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}

// Staggered animation component for lists
interface StaggeredListProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function StaggeredList({ children, className, delay = 0 }: StaggeredListProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      {children}
    </div>
  )
}

// Fade in component
interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function FadeIn({ children, className, delay = 0, duration = 300 }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        "transition-all ease-out",
        `duration-${duration}`,
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {children}
    </div>
  )
}

// Slide in component
interface SlideInProps {
  children: React.ReactNode
  className?: string
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  duration?: number
}

export function SlideIn({ 
  children, 
  className, 
  direction = 'up', 
  delay = 0, 
  duration = 300 
}: SlideInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const getTransform = () => {
    switch (direction) {
      case 'left':
        return isVisible ? 'translate-x-0' : '-translate-x-8'
      case 'right':
        return isVisible ? 'translate-x-0' : 'translate-x-8'
      case 'up':
        return isVisible ? 'translate-y-0' : 'translate-y-8'
      case 'down':
        return isVisible ? 'translate-y-0' : '-translate-y-8'
      default:
        return isVisible ? 'translate-y-0' : 'translate-y-8'
    }
  }

  return (
    <div
      className={cn(
        "transition-all ease-out",
        `duration-${duration}`,
        isVisible ? "opacity-100" : "opacity-0",
        getTransform(),
        className
      )}
    >
      {children}
    </div>
  )
}

// Scale in component
interface ScaleInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  scale?: number
}

export function ScaleIn({ 
  children, 
  className, 
  delay = 0, 
  duration = 300,
  scale = 0.95
}: ScaleInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        "transition-all ease-out",
        `duration-${duration}`,
        isVisible ? "opacity-100 scale-100" : "opacity-0",
        className
      )}
      style={{
        transform: isVisible ? 'scale(1)' : `scale(${scale})`
      }}
    >
      {children}
    </div>
  )
}
