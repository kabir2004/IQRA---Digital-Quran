'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useUserMetricsStore } from '@/store/user-metrics'

interface MetricsContextType {
  trackEvent: (action: string, metadata?: any, duration?: number) => void
  isTrackingEnabled: boolean
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined)

interface MetricsProviderProps {
  children: ReactNode
}

export function MetricsProvider({ children }: MetricsProviderProps) {
  const { 
    trackEvent, 
    isTrackingEnabled, 
    startSession, 
    endSession,
    setTrackingEnabled 
  } = useUserMetricsStore()

  useEffect(() => {
    // Check for user consent (could be from localStorage or cookie banner)
    const hasConsent = localStorage.getItem('metrics-consent') !== 'false'
    setTrackingEnabled(hasConsent)

    if (hasConsent) {
      // Track app initialization
      trackEvent('app_init', {
        userAgent: navigator.userAgent,
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      })

      // Track performance metrics
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          trackEvent('app_performance', {
            loadTime: navigation.loadEventEnd - navigation.fetchStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
          })
        }
      }

      // Track errors globally
      const handleError = (event: ErrorEvent) => {
        trackEvent('javascript_error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        })
      }

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        trackEvent('promise_rejection', {
          reason: event.reason?.toString() || 'Unknown reason'
        })
      }

      window.addEventListener('error', handleError)
      window.addEventListener('unhandledrejection', handleUnhandledRejection)

      return () => {
        window.removeEventListener('error', handleError)
        window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      }
    }
  }, [trackEvent, setTrackingEnabled])

  return (
    <MetricsContext.Provider value={{ trackEvent, isTrackingEnabled }}>
      {children}
    </MetricsContext.Provider>
  )
}

export function useMetricsContext() {
  const context = useContext(MetricsContext)
  if (context === undefined) {
    throw new Error('useMetricsContext must be used within a MetricsProvider')
  }
  return context
}