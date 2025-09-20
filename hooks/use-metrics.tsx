'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useUserMetricsStore } from '@/store/user-metrics'

export function useMetrics() {
  const pathname = usePathname()
  const [searchParams, setSearchParams] = useState('')
  const [mounted, setMounted] = useState(false)
  
  // Client-side mounting check
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      setSearchParams(window.location.search)
    }
  }, [pathname])
  const { 
    currentSession,
    startSession, 
    endSession, 
    trackEvent, 
    trackPageView, 
    trackError, 
    trackPerformance,
    isTrackingEnabled 
  } = useUserMetricsStore()
  
  const sessionStarted = useRef(false)
  const pageLoadStart = useRef(0)
  const lastPathname = useRef('')

  // Start session on mount
  useEffect(() => {
    if (!mounted || !isTrackingEnabled || sessionStarted.current) return
    
    startSession()
    sessionStarted.current = true
    pageLoadStart.current = Date.now()
    
    // Track initial page view
    const fullPath = pathname + (searchParams ? searchParams : '')
    trackPageView(fullPath, typeof document !== 'undefined' ? document.referrer : '')
    
    // End session on page unload
    const handleBeforeUnload = () => {
      endSession()
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
      if (sessionStarted.current) {
        endSession()
      }
    }
  }, [mounted, isTrackingEnabled, startSession, endSession, trackPageView, pathname, searchParams])

  // Track page changes
  useEffect(() => {
    if (!isTrackingEnabled) return
    
    const fullPath = pathname + (searchParams ? searchParams : '')
    
    // Only track if path actually changed
    if (lastPathname.current && lastPathname.current !== fullPath) {
      trackPageView(fullPath, lastPathname.current)
      
      // Track page load performance
      if (pageLoadStart.current > 0) {
        const loadTime = Date.now() - pageLoadStart.current
        trackPerformance(pathname, loadTime)
      }
    }
    
    lastPathname.current = fullPath
    pageLoadStart.current = Date.now()
  }, [pathname, searchParams, trackPageView, trackPerformance, isTrackingEnabled])

  // Track user interactions
  const track = useCallback((action: Parameters<typeof trackEvent>[0], metadata?: any, duration?: number) => {
    if (!isTrackingEnabled) return
    trackEvent(action, metadata, duration)
  }, [trackEvent, isTrackingEnabled])

  // Track button clicks
  const trackClick = useCallback((buttonName: string, context?: string, metadata?: any) => {
    track('button_click', { buttonName, context, ...metadata })
  }, [track])

  // Track navigation events
  const trackNavigation = useCallback((from: string, to: string, method: 'click' | 'keyboard' | 'swipe' = 'click') => {
    track('navigation', { from, to, method })
  }, [track])

  // Track reading sessions
  const trackReadingStart = useCallback((surah: number, ayah?: number, mode?: string) => {
    track('reading_start', { surah, ayah, mode })
  }, [track])

  const trackReadingEnd = useCallback((surah: number, ayah?: number, duration?: number, versesRead?: number) => {
    track('reading_end', { surah, ayah, versesRead }, duration)
  }, [track])

  // Track audio interactions
  const trackAudioPlay = useCallback((source: 'tts' | 'pronunciation' | 'recitation', content?: string) => {
    track('audio_play', { source, content })
  }, [track])

  const trackAudioPause = useCallback((source: 'tts' | 'pronunciation' | 'recitation', duration?: number) => {
    track('audio_pause', { source }, duration)
  }, [track])

  // Track bookmarks
  const trackBookmarkAdd = useCallback((surah: number, ayah: number) => {
    track('bookmark_add', { surah, ayah })
  }, [track])

  const trackBookmarkRemove = useCallback((surah: number, ayah: number) => {
    track('bookmark_remove', { surah, ayah })
  }, [track])

  // Track search
  const trackSearch = useCallback((query: string, results?: number, context?: string) => {
    track('search_query', { query, results, context })
  }, [track])

  // Track settings changes
  const trackSettingsChange = useCallback((setting: string, oldValue: any, newValue: any) => {
    track('settings_change', { setting, oldValue, newValue })
  }, [track])

  // Track achievements
  const trackAchievement = useCallback((achievementId: string, achievementName: string) => {
    track('achievement_unlock', { achievementId, achievementName })
  }, [track])

  // Track pronunciation practice
  const trackPronunciation = useCallback((surah: number, ayah: number, score?: number, attempts?: number) => {
    track('pronunciation_practice', { surah, ayah, score, attempts })
  }, [track])

  // Track errors
  const trackErrorEvent = useCallback((error: string, context?: any) => {
    trackError(error, context)
  }, [trackError])

  // Track feature toggles
  const trackFeatureToggle = useCallback((feature: string, enabled: boolean, context?: string) => {
    track('feature_toggle', { feature, enabled, context })
  }, [track])

  // Track group interactions
  const trackGroupJoin = useCallback((groupId: string, groupName: string) => {
    track('group_join', { groupId, groupName })
  }, [track])

  const trackGroupLeave = useCallback((groupId: string) => {
    track('group_leave', { groupId })
  }, [track])

  const trackGroupMessage = useCallback((groupId: string, messageType: string) => {
    track('message_send', { groupId, messageType })
  }, [track])

  const trackGroupChallenge = useCallback((challengeId: string, action: 'join' | 'complete' | 'view') => {
    track('challenge_' + action, { challengeId })
  }, [track])

  // Get session info
  const getSessionInfo = useCallback(() => {
    return {
      sessionId: currentSession?.id,
      isActive: currentSession?.isActive,
      duration: currentSession ? Date.now() - currentSession.startTime : 0,
      pageViews: currentSession?.pageViews || 0,
      interactions: currentSession?.interactions || 0
    }
  }, [currentSession])

  return {
    // Basic tracking
    track,
    trackClick,
    trackNavigation,
    trackError: trackErrorEvent,
    
    // Reading specific
    trackReadingStart,
    trackReadingEnd,
    
    // Audio specific
    trackAudioPlay,
    trackAudioPause,
    
    // Features
    trackBookmarkAdd,
    trackBookmarkRemove,
    trackSearch,
    trackSettingsChange,
    trackAchievement,
    trackPronunciation,
    trackFeatureToggle,
    
    // Groups
    trackGroupJoin,
    trackGroupLeave,
    trackGroupMessage,
    trackGroupChallenge,
    
    // Session info
    getSessionInfo,
    isTrackingEnabled
  }
}

// Higher-order component to add metrics to any component
export function withMetrics<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  componentName: string
) {
  const MetricsWrapper = (props: T) => {
    const { track } = useMetrics()
    
    useEffect(() => {
      track('component_mount', { componentName })
      
      return () => {
        track('component_unmount', { componentName })
      }
    }, [track])
    
    return <WrappedComponent {...props} />
  }
  
  MetricsWrapper.displayName = `withMetrics(${componentName})`
  return MetricsWrapper
}

// Hook for tracking component visibility
export function useVisibilityTracking(elementRef: React.RefObject<HTMLElement>, componentName: string) {
  const { track } = useMetrics()
  
  useEffect(() => {
    if (!elementRef.current) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            track('component_visible', { componentName })
          }
        })
      },
      { threshold: 0.5 }
    )
    
    observer.observe(elementRef.current)
    
    return () => {
      observer.disconnect()
    }
  }, [elementRef, track, componentName])
}

// Hook for tracking user engagement time
export function useEngagementTracking(elementRef: React.RefObject<HTMLElement>, componentName: string) {
  const { track } = useMetrics()
  const startTime = useRef<number>(0)
  const isEngaged = useRef(false)
  
  useEffect(() => {
    if (!elementRef.current) return
    
    const element = elementRef.current
    
    const handleMouseEnter = () => {
      if (!isEngaged.current) {
        startTime.current = Date.now()
        isEngaged.current = true
      }
    }
    
    const handleMouseLeave = () => {
      if (isEngaged.current) {
        const duration = Date.now() - startTime.current
        track('engagement_time', { componentName }, duration)
        isEngaged.current = false
      }
    }
    
    const handleFocus = () => {
      if (!isEngaged.current) {
        startTime.current = Date.now()
        isEngaged.current = true
      }
    }
    
    const handleBlur = () => {
      if (isEngaged.current) {
        const duration = Date.now() - startTime.current
        track('engagement_time', { componentName }, duration)
        isEngaged.current = false
      }
    }
    
    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)
    element.addEventListener('focus', handleFocus)
    element.addEventListener('blur', handleBlur)
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
      element.removeEventListener('focus', handleFocus)
      element.removeEventListener('blur', handleBlur)
      
      if (isEngaged.current) {
        const duration = Date.now() - startTime.current
        track('engagement_time', { componentName }, duration)
      }
    }
  }, [elementRef, track, componentName])
}