'use client'

import { useEffect, useRef } from 'react'
import { useMetrics } from '@/hooks/use-metrics'

interface ActivityTrackerProps {
  children: React.ReactNode
}

export function ActivityTracker({ children }: ActivityTrackerProps) {
  const { track, isTrackingEnabled } = useMetrics()
  const inactivityTimer = useRef<NodeJS.Timeout>()
  const sessionStartTime = useRef<number>(Date.now())
  const isActive = useRef(true)

  const INACTIVITY_THRESHOLD = 30000 // 30 seconds

  const resetInactivityTimer = () => {
    if (!isTrackingEnabled) return

    // Clear existing timer
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current)
    }

    // If user was inactive, track return to activity
    if (!isActive.current) {
      isActive.current = true
      track('user_active_return', {
        inactiveDuration: Date.now() - sessionStartTime.current
      })
    }

    // Set new timer
    inactivityTimer.current = setTimeout(() => {
      if (isActive.current) {
        isActive.current = false
        track('user_inactive', {
          activeDuration: Date.now() - sessionStartTime.current
        })
      }
    }, INACTIVITY_THRESHOLD)
  }

  useEffect(() => {
    if (!isTrackingEnabled) return

    // Track various user activities
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    const throttle = (func: Function, delay: number) => {
      let timeoutId: NodeJS.Timeout
      let lastExecTime = 0
      return function (...args: any[]) {
        const currentTime = Date.now()
        
        if (currentTime - lastExecTime > delay) {
          func(...args)
          lastExecTime = currentTime
        } else {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            func(...args)
            lastExecTime = Date.now()
          }, delay - (currentTime - lastExecTime))
        }
      }
    }

    // Throttled version to avoid too many events
    const throttledResetTimer = throttle(resetInactivityTimer, 1000)

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, throttledResetTimer, true)
    })

    // Initial timer
    resetInactivityTimer()

    // Track window focus/blur
    const handleFocus = () => {
      track('window_focus', { timestamp: Date.now() })
      resetInactivityTimer()
    }

    const handleBlur = () => {
      track('window_blur', { 
        timestamp: Date.now(),
        sessionDuration: Date.now() - sessionStartTime.current
      })
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        track('page_hidden', { timestamp: Date.now() })
      } else {
        track('page_visible', { timestamp: Date.now() })
        resetInactivityTimer()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current)
      }
      
      events.forEach(event => {
        document.removeEventListener(event, throttledResetTimer, true)
      })
      
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [track, isTrackingEnabled])

  return <>{children}</>
}

// Component to track specific interactions
interface InteractionTrackerProps {
  action: string
  metadata?: any
  children: React.ReactNode
  trackOnMount?: boolean
  trackOnUnmount?: boolean
}

export function InteractionTracker({ 
  action, 
  metadata = {}, 
  children, 
  trackOnMount = false,
  trackOnUnmount = false 
}: InteractionTrackerProps) {
  const { track } = useMetrics()
  const mountTime = useRef(Date.now())

  useEffect(() => {
    if (trackOnMount) {
      track(`${action}_mount`, metadata)
    }

    return () => {
      if (trackOnUnmount) {
        const duration = Date.now() - mountTime.current
        track(`${action}_unmount`, { ...metadata, duration })
      }
    }
  }, [track, action, metadata, trackOnMount, trackOnUnmount])

  return <>{children}</>
}

// Hook to track form interactions
export function useFormTracking(formName: string) {
  const { track } = useMetrics()

  const trackFormStart = () => {
    track('form_start', { formName })
  }

  const trackFormSubmit = (success: boolean, errors?: any) => {
    track('form_submit', { formName, success, errors })
  }

  const trackFormAbandon = (fieldName?: string) => {
    track('form_abandon', { formName, fieldName })
  }

  const trackFieldFocus = (fieldName: string) => {
    track('form_field_focus', { formName, fieldName })
  }

  const trackFieldBlur = (fieldName: string, value?: any) => {
    track('form_field_blur', { formName, fieldName, hasValue: !!value })
  }

  const trackFieldError = (fieldName: string, error: string) => {
    track('form_field_error', { formName, fieldName, error })
  }

  return {
    trackFormStart,
    trackFormSubmit,
    trackFormAbandon,
    trackFieldFocus,
    trackFieldBlur,
    trackFieldError
  }
}

// Component to track reading behavior
interface ReadingTrackerProps {
  surah: number
  ayah?: number
  children: React.ReactNode
}

export function ReadingTracker({ surah, ayah, children }: ReadingTrackerProps) {
  const { trackReadingStart, trackReadingEnd } = useMetrics()
  const startTime = useRef<number>()
  const versesRead = useRef(0)

  useEffect(() => {
    startTime.current = Date.now()
    trackReadingStart(surah, ayah, 'web')

    return () => {
      if (startTime.current) {
        const duration = Date.now() - startTime.current
        trackReadingEnd(surah, ayah, duration, versesRead.current)
      }
    }
  }, [surah, ayah, trackReadingStart, trackReadingEnd])

  // Track verse reading progress
  useEffect(() => {
    if (ayah) {
      versesRead.current = versesRead.current + 1
    }
  }, [ayah])

  return <>{children}</>
}