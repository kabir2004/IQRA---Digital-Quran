import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserAction = 
  | 'page_view'
  | 'button_click'
  | 'navigation'
  | 'reading_start'
  | 'reading_end'
  | 'audio_play'
  | 'audio_pause'
  | 'bookmark_add'
  | 'bookmark_remove'
  | 'search_query'
  | 'settings_change'
  | 'group_join'
  | 'group_leave'
  | 'group_create'
  | 'group_view'
  | 'message_send'
  | 'challenge_join'
  | 'challenge_complete'
  | 'challenge_view'
  | 'achievement_unlock'
  | 'pronunciation_practice'
  | 'translation_toggle'
  | 'theme_change'
  | 'font_size_change'
  | 'feature_toggle'
  | 'component_mount'
  | 'component_unmount'
  | 'component_visible'
  | 'engagement_time'
  | 'user_active_return'
  | 'user_inactive'
  | 'window_focus'
  | 'window_blur'
  | 'page_hidden'
  | 'page_visible'
  | 'app_init'
  | 'app_performance'
  | 'javascript_error'
  | 'promise_rejection'
  | 'error'
  | 'performance'
  | 'form_start'
  | 'form_submit'
  | 'form_abandon'
  | 'form_field_focus'
  | 'form_field_blur'
  | 'form_field_error'

export interface UserEvent {
  id: string
  action: UserAction
  timestamp: number
  sessionId: string
  userId: string
  metadata: Record<string, any>
  page: string
  userAgent: string
  deviceType: 'desktop' | 'tablet' | 'mobile'
  referrer?: string
  duration?: number // for events with duration like reading sessions
}

export interface SessionData {
  id: string
  userId: string
  startTime: number
  endTime?: number
  duration?: number
  pageViews: number
  interactions: number
  pages: string[]
  deviceType: 'desktop' | 'tablet' | 'mobile'
  isActive: boolean
  lastActivity: number
}

export interface UserMetrics {
  // Session metrics
  totalSessions: number
  averageSessionDuration: number
  totalTimeSpent: number
  pagesPerSession: number
  bounceRate: number
  
  // Engagement metrics
  dailyActiveUse: number
  weeklyActiveUse: number
  monthlyActiveUse: number
  retentionRate: number
  
  // Feature usage
  featureUsage: Record<string, {
    count: number
    lastUsed: number
    averageDuration?: number
  }>
  
  // Reading metrics
  readingMetrics: {
    totalReadingSessions: number
    totalReadingTime: number
    averageReadingSessionLength: number
    versesRead: number
    favoriteSurahs: Array<{ surah: number; count: number }>
    readingPattern: Record<string, number> // hour of day -> session count
  }
  
  // Interaction patterns
  interactionPatterns: {
    mostUsedFeatures: Array<{ feature: string; usage: number }>
    navigationPatterns: Array<{ from: string; to: string; count: number }>
    errorEncounters: Array<{ error: string; count: number; lastOccurred: number }>
    performanceMetrics: {
      averagePageLoadTime: number
      slowestPages: Array<{ page: string; loadTime: number }>
    }
  }
  
  // Personalization data
  preferences: {
    preferredReadingMode: string
    preferredFontSize: string
    preferredTheme: string
    mostAccessedFeatures: string[]
    timeOfDayPreference: string
  }
}

export interface UserMetricsState {
  // Current session
  currentSession: SessionData | null
  isTrackingEnabled: boolean
  
  // Events and sessions
  events: UserEvent[]
  sessions: SessionData[]
  
  // Computed metrics
  metrics: UserMetrics
  
  // Settings
  maxEventsToStore: number
  maxSessionsToStore: number
  enablePerformanceTracking: boolean
  enableErrorTracking: boolean
  
  // Actions
  startSession: () => void
  endSession: () => void
  trackEvent: (action: UserAction, metadata?: Record<string, any>, duration?: number) => void
  trackPageView: (page: string, referrer?: string) => void
  trackError: (error: string, context?: Record<string, any>) => void
  trackPerformance: (page: string, loadTime: number) => void
  
  // Analytics
  getMetrics: () => UserMetrics
  getSessionAnalytics: (timeframe: 'day' | 'week' | 'month') => any
  getUserBehaviorInsights: () => string[]
  getPersonalizationSuggestions: () => string[]
  
  // Privacy and data management
  exportData: () => string
  clearData: () => void
  setTrackingEnabled: (enabled: boolean) => void
  
  reset: () => void
}

const getDeviceType = (): 'desktop' | 'tablet' | 'mobile' => {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

const generateEventId = (): string => {
  return `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

const initialMetrics: UserMetrics = {
  totalSessions: 0,
  averageSessionDuration: 0,
  totalTimeSpent: 0,
  pagesPerSession: 0,
  bounceRate: 0,
  dailyActiveUse: 0,
  weeklyActiveUse: 0,
  monthlyActiveUse: 0,
  retentionRate: 0,
  featureUsage: {},
  readingMetrics: {
    totalReadingSessions: 0,
    totalReadingTime: 0,
    averageReadingSessionLength: 0,
    versesRead: 0,
    favoriteSurahs: [],
    readingPattern: {}
  },
  interactionPatterns: {
    mostUsedFeatures: [],
    navigationPatterns: [],
    errorEncounters: [],
    performanceMetrics: {
      averagePageLoadTime: 0,
      slowestPages: []
    }
  },
  preferences: {
    preferredReadingMode: 'surah',
    preferredFontSize: 'medium',
    preferredTheme: 'system',
    mostAccessedFeatures: [],
    timeOfDayPreference: 'evening'
  }
}

const calculateMetrics = (events: UserEvent[], sessions: SessionData[]): UserMetrics => {
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const weekMs = 7 * dayMs
  const monthMs = 30 * dayMs
  
  // Session metrics
  const completedSessions = sessions.filter(s => s.endTime)
  const totalSessions = completedSessions.length
  const totalTimeSpent = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
  const averageSessionDuration = totalSessions > 0 ? totalTimeSpent / totalSessions : 0
  const pagesPerSession = totalSessions > 0 ? 
    completedSessions.reduce((sum, s) => sum + s.pageViews, 0) / totalSessions : 0
  
  // Activity metrics
  const recentDay = events.filter(e => now - e.timestamp < dayMs)
  const recentWeek = events.filter(e => now - e.timestamp < weekMs)
  const recentMonth = events.filter(e => now - e.timestamp < monthMs)
  
  // Feature usage
  const featureUsage: Record<string, { count: number; lastUsed: number; averageDuration?: number }> = {}
  events.forEach(event => {
    if (!featureUsage[event.action]) {
      featureUsage[event.action] = { count: 0, lastUsed: 0 }
    }
    featureUsage[event.action].count++
    featureUsage[event.action].lastUsed = Math.max(featureUsage[event.action].lastUsed, event.timestamp)
    
    if (event.duration) {
      const current = featureUsage[event.action].averageDuration || 0
      const count = featureUsage[event.action].count
      featureUsage[event.action].averageDuration = (current * (count - 1) + event.duration) / count
    }
  })
  
  // Reading metrics
  const readingEvents = events.filter(e => e.action === 'reading_start' || e.action === 'reading_end')
  const readingSessions = readingEvents.filter(e => e.action === 'reading_start').length
  const totalReadingTime = readingEvents
    .filter(e => e.action === 'reading_end' && e.duration)
    .reduce((sum, e) => sum + (e.duration || 0), 0)
  
  const surahCounts: Record<number, number> = {}
  events.filter(e => e.metadata?.surah).forEach(e => {
    const surah = e.metadata.surah
    surahCounts[surah] = (surahCounts[surah] || 0) + 1
  })
  
  const favoriteSurahs = Object.entries(surahCounts)
    .map(([surah, count]) => ({ surah: parseInt(surah), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  // Reading patterns by hour
  const readingPattern: Record<string, number> = {}
  readingEvents.forEach(e => {
    const hour = new Date(e.timestamp).getHours()
    readingPattern[hour] = (readingPattern[hour] || 0) + 1
  })
  
  // Most used features
  const mostUsedFeatures = Object.entries(featureUsage)
    .map(([feature, data]) => ({ feature, usage: data.count }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 10)
  
  // Navigation patterns
  const navigationMap: Record<string, Record<string, number>> = {}
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1]
    const current = events[i]
    
    if (prev.action === 'page_view' && current.action === 'page_view') {
      const key = `${prev.page}->${current.page}`
      if (!navigationMap[prev.page]) navigationMap[prev.page] = {}
      navigationMap[prev.page][current.page] = (navigationMap[prev.page][current.page] || 0) + 1
    }
  }
  
  const navigationPatterns = Object.entries(navigationMap)
    .flatMap(([from, targets]) => 
      Object.entries(targets).map(([to, count]) => ({ from, to, count }))
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  
  // Performance metrics
  const performanceEvents = events.filter(e => e.metadata?.loadTime)
  const averagePageLoadTime = performanceEvents.length > 0 ?
    performanceEvents.reduce((sum, e) => sum + e.metadata.loadTime, 0) / performanceEvents.length : 0
  
  const pageLoadTimes: Record<string, number[]> = {}
  performanceEvents.forEach(e => {
    if (!pageLoadTimes[e.page]) pageLoadTimes[e.page] = []
    pageLoadTimes[e.page].push(e.metadata.loadTime)
  })
  
  const slowestPages = Object.entries(pageLoadTimes)
    .map(([page, times]) => ({
      page,
      loadTime: times.reduce((sum, time) => sum + time, 0) / times.length
    }))
    .sort((a, b) => b.loadTime - a.loadTime)
    .slice(0, 5)
  
  // Preferences based on usage patterns
  const pageViewEvents = events.filter(e => e.action === 'page_view')
  const mostAccessedFeatures = [...new Set(pageViewEvents.map(e => e.page))]
    .map(page => ({
      page,
      count: pageViewEvents.filter(e => e.page === page).length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(item => item.page)
  
  // Time preference based on reading activity
  const readingHours = readingEvents.map(e => new Date(e.timestamp).getHours())
  const hourCounts: Record<number, number> = {}
  readingHours.forEach(hour => {
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  
  const preferredHour = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0]
  
  let timeOfDayPreference = 'evening'
  if (preferredHour) {
    const hour = parseInt(preferredHour)
    if (hour >= 5 && hour < 12) timeOfDayPreference = 'morning'
    else if (hour >= 12 && hour < 17) timeOfDayPreference = 'afternoon'
    else if (hour >= 17 && hour < 21) timeOfDayPreference = 'evening'
    else timeOfDayPreference = 'night'
  }
  
  return {
    totalSessions,
    averageSessionDuration,
    totalTimeSpent,
    pagesPerSession,
    bounceRate: totalSessions > 0 ? (sessions.filter(s => s.pageViews <= 1).length / totalSessions) * 100 : 0,
    dailyActiveUse: recentDay.length,
    weeklyActiveUse: recentWeek.length,
    monthlyActiveUse: recentMonth.length,
    retentionRate: 0, // Would need more complex calculation
    featureUsage,
    readingMetrics: {
      totalReadingSessions: readingSessions,
      totalReadingTime,
      averageReadingSessionLength: readingSessions > 0 ? totalReadingTime / readingSessions : 0,
      versesRead: events.filter(e => e.metadata?.versesRead).reduce((sum, e) => sum + (e.metadata.versesRead || 0), 0),
      favoriteSurahs,
      readingPattern
    },
    interactionPatterns: {
      mostUsedFeatures,
      navigationPatterns,
      errorEncounters: [], // Would track errors separately
      performanceMetrics: {
        averagePageLoadTime,
        slowestPages
      }
    },
    preferences: {
      preferredReadingMode: 'surah', // Could be calculated from usage
      preferredFontSize: 'medium', // Could be tracked from settings changes
      preferredTheme: 'system', // Could be tracked from settings changes
      mostAccessedFeatures,
      timeOfDayPreference
    }
  }
}

const initialState = {
  currentSession: null,
  isTrackingEnabled: true,
  events: [],
  sessions: [],
  metrics: initialMetrics,
  maxEventsToStore: 10000,
  maxSessionsToStore: 1000,
  enablePerformanceTracking: true,
  enableErrorTracking: true
}

export const useUserMetricsStore = create<UserMetricsState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      startSession: () => {
        const sessionId = generateSessionId()
        const session: SessionData = {
          id: sessionId,
          userId: 'current_user', // Would come from auth
          startTime: Date.now(),
          pageViews: 0,
          interactions: 0,
          pages: [],
          deviceType: getDeviceType(),
          isActive: true,
          lastActivity: Date.now()
        }
        
        set(state => ({
          currentSession: session,
          sessions: [session, ...state.sessions].slice(0, state.maxSessionsToStore)
        }))
      },
      
      endSession: () => {
        const state = get()
        if (!state.currentSession) return
        
        const endTime = Date.now()
        const duration = endTime - state.currentSession.startTime
        const completedSession = {
          ...state.currentSession,
          endTime,
          duration,
          isActive: false
        }
        
        set(state => ({
          currentSession: null,
          sessions: state.sessions.map(s => 
            s.id === completedSession.id ? completedSession : s
          ),
          metrics: calculateMetrics(state.events, state.sessions)
        }))
      },
      
      trackEvent: (action, metadata = {}, duration) => {
        const state = get()
        if (!state.isTrackingEnabled) return
        
        const event: UserEvent = {
          id: generateEventId(),
          action,
          timestamp: Date.now(),
          sessionId: state.currentSession?.id || '',
          userId: 'current_user',
          metadata,
          page: typeof window !== 'undefined' ? window.location.pathname : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          deviceType: getDeviceType(),
          duration
        }
        
        // Update current session
        let updatedSession = state.currentSession
        if (updatedSession) {
          updatedSession = {
            ...updatedSession,
            interactions: updatedSession.interactions + 1,
            lastActivity: Date.now()
          }
        }
        
        set(state => ({
          events: [event, ...state.events].slice(0, state.maxEventsToStore),
          currentSession: updatedSession,
          sessions: updatedSession ? 
            state.sessions.map(s => s.id === updatedSession.id ? updatedSession : s) : 
            state.sessions
        }))
      },
      
      trackPageView: (page, referrer) => {
        const state = get()
        get().trackEvent('page_view', { page, referrer })
        
        // Update session page views
        if (state.currentSession) {
          const updatedSession = {
            ...state.currentSession,
            pageViews: state.currentSession.pageViews + 1,
            pages: [...new Set([...state.currentSession.pages, page])],
            lastActivity: Date.now()
          }
          
          set(state => ({
            currentSession: updatedSession,
            sessions: state.sessions.map(s => 
              s.id === updatedSession.id ? updatedSession : s
            )
          }))
        }
      },
      
      trackError: (error, context) => {
        get().trackEvent('error', { error, context })
      },
      
      trackPerformance: (page, loadTime) => {
        if (get().enablePerformanceTracking) {
          get().trackEvent('performance', { page, loadTime })
        }
      },
      
      getMetrics: () => {
        const state = get()
        return calculateMetrics(state.events, state.sessions)
      },
      
      getSessionAnalytics: (timeframe) => {
        const state = get()
        const now = Date.now()
        let startTime = now
        
        switch (timeframe) {
          case 'day':
            startTime = now - 24 * 60 * 60 * 1000
            break
          case 'week':
            startTime = now - 7 * 24 * 60 * 60 * 1000
            break
          case 'month':
            startTime = now - 30 * 24 * 60 * 60 * 1000
            break
        }
        
        const relevantEvents = state.events.filter(e => e.timestamp >= startTime)
        const relevantSessions = state.sessions.filter(s => s.startTime >= startTime)
        
        return {
          events: relevantEvents.length,
          sessions: relevantSessions.length,
          avgSessionLength: relevantSessions.length > 0 ? 
            relevantSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / relevantSessions.length : 0,
          topActions: relevantEvents.reduce((acc, e) => {
            acc[e.action] = (acc[e.action] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        }
      },
      
      getUserBehaviorInsights: () => {
        const metrics = get().getMetrics()
        const insights: string[] = []
        
        if (metrics.readingMetrics.totalReadingSessions > 0) {
          insights.push(`You've completed ${metrics.readingMetrics.totalReadingSessions} reading sessions`)
        }
        
        if (metrics.preferences.timeOfDayPreference) {
          insights.push(`You prefer reading in the ${metrics.preferences.timeOfDayPreference}`)
        }
        
        if (metrics.readingMetrics.favoriteSurahs.length > 0) {
          const topSurah = metrics.readingMetrics.favoriteSurahs[0]
          insights.push(`Surah ${topSurah.surah} is your most frequently read`)
        }
        
        if (metrics.averageSessionDuration > 0) {
          const avgMinutes = Math.round(metrics.averageSessionDuration / 60000)
          insights.push(`Your average session lasts ${avgMinutes} minutes`)
        }
        
        return insights
      },
      
      getPersonalizationSuggestions: () => {
        const metrics = get().getMetrics()
        const suggestions: string[] = []
        
        if (metrics.preferences.timeOfDayPreference === 'morning') {
          suggestions.push('Consider setting morning reading reminders')
        }
        
        if (metrics.readingMetrics.averageReadingSessionLength < 300000) { // less than 5 minutes
          suggestions.push('Try extending your reading sessions for deeper reflection')
        }
        
        if (metrics.interactionPatterns.mostUsedFeatures.some(f => f.feature === 'audio_play')) {
          suggestions.push('You might enjoy more audio-focused features')
        }
        
        return suggestions
      },
      
      exportData: () => {
        const state = get()
        return JSON.stringify({
          events: state.events,
          sessions: state.sessions,
          metrics: state.metrics,
          exportedAt: Date.now()
        }, null, 2)
      },
      
      clearData: () => {
        set(initialState)
      },
      
      setTrackingEnabled: (enabled) => {
        set({ isTrackingEnabled: enabled })
      },
      
      reset: () => {
        set(initialState)
      }
    }),
    {
      name: 'iqra-user-metrics',
      version: 1,
      partialize: (state) => ({
        events: state.events.slice(0, 5000), // Store last 5000 events
        sessions: state.sessions.slice(0, 500), // Store last 500 sessions
        isTrackingEnabled: state.isTrackingEnabled,
        enablePerformanceTracking: state.enablePerformanceTracking,
        enableErrorTracking: state.enableErrorTracking
      }),
      migrate: (persistedState: any, version: number) => {
        // If version is 0 (no version), migrate to version 1
        if (version === 0) {
          return {
            ...initialState,
            events: persistedState.events || [],
            sessions: persistedState.sessions || [],
            isTrackingEnabled: persistedState.isTrackingEnabled ?? true,
            enablePerformanceTracking: persistedState.enablePerformanceTracking ?? true,
            enableErrorTracking: persistedState.enableErrorTracking ?? true
          }
        }
        return persistedState
      },
      // Add fallback to handle migration errors
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('User metrics store rehydration failed, using default state:', error)
          // Clear the corrupted storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('iqra-user-metrics')
          }
        }
      }
    }
  )
)