import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ReadingProgress {
  surah: number
  ayah: number
  timestamp: number
  duration?: number // Time spent reading in seconds
}

export interface ReadingSession {
  id: string
  startTime: number
  endTime: number
  duration: number
  versesRead: number
  surahsVisited: number[]
  juzVisited: number[]
  hizbVisited: number[]
  pagesVisited: number[]
  divisionType: 'surah' | 'juz' | 'hizb' | 'mushaf'
}

export interface DailyStats {
  date: string
  readingTime: number
  versesRead: number
  sessionsCount: number
  achievement?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: number
  category: 'streak' | 'completion' | 'time' | 'consistency' | 'milestone'
}

export interface DivisionProgress {
  type: 'surah' | 'juz' | 'hizb' | 'mushaf'
  id: number
  completed: boolean
  lastRead: number
  totalTime: number // Total time spent in seconds
  progress: number // Percentage completion (0-100)
}

interface ProgressState {
  // Current reading position
  currentPosition: ReadingProgress | null
  
  // Progress for different divisions
  surahProgress: Record<number, DivisionProgress>
  juzProgress: Record<number, DivisionProgress>
  hizbProgress: Record<number, DivisionProgress>
  mushafProgress: Record<number, DivisionProgress>
  
  // Reading statistics
  totalReadingTime: number
  dailyGoal: number // verses per day
  currentStreak: number
  bestStreak: number
  totalVersesRead: number
  
  // Advanced analytics
  readingSessions: ReadingSession[]
  currentSession: ReadingSession | null
  dailyStats: Record<string, DailyStats>
  weeklyReadingTime: number[]
  monthlyReadingTime: number[]
  achievements: Achievement[]
  favoriteReadingTime: string // e.g., "morning", "evening", "night"
  averageSessionDuration: number
  totalDaysActive: number
  lastActiveDate: string
  
  // Actions
  initializeDemoData: () => void
  updateCurrentPosition: (position: ReadingProgress) => void
  updateDivisionProgress: (division: DivisionProgress) => void
  incrementReadingTime: (seconds: number) => void
  markVerseAsRead: (surah: number, ayah: number) => void
  updateDailyGoal: (goal: number) => void
  calculateStreak: () => void
  getDivisionProgress: (type: DivisionProgress['type'], id: number) => DivisionProgress | null
  getOverallProgress: () => {
    totalSurahs: number
    completedSurahs: number
    totalJuz: number
    completedJuz: number
    completionPercentage: number
  }
  
  // Session management
  startReadingSession: (divisionType: 'surah' | 'juz' | 'hizb' | 'mushaf') => void
  endReadingSession: () => void
  updateSessionProgress: (surah: number, ayah: number, juz?: number, hizb?: number, page?: number) => void
  
  // Analytics
  getWeeklyStats: () => DailyStats[]
  getMonthlyStats: () => DailyStats[]
  getReadingHabits: () => {
    favoriteTime: string
    averageSession: number
    mostReadDivision: string
    consistencyScore: number
  }
  checkAchievements: () => void
  unlockAchievement: (achievementId: string) => void
  
  // Advanced metrics
  getProductivityScore: () => number
  getLearningInsights: () => {
    strengths: string[]
    suggestions: string[]
    milestones: string[]
  }
  
  reset: () => void
  resetProgress: () => void
}

const defaultAchievements: Achievement[] = [
  { id: 'first_read', title: 'First Steps', description: 'Read your first verse', icon: '🌟', unlocked: false, category: 'milestone' },
  { id: 'daily_reader', title: 'Daily Reader', description: 'Read for 7 consecutive days', icon: '📚', unlocked: false, category: 'streak' },
  { id: 'surah_complete', title: 'Surah Master', description: 'Complete your first surah', icon: '✨', unlocked: false, category: 'completion' },
  { id: 'juz_complete', title: 'Juz Champion', description: 'Complete your first juz', icon: '🏆', unlocked: false, category: 'completion' },
  { id: 'early_bird', title: 'Early Bird', description: 'Read before 8 AM', icon: '🌅', unlocked: false, category: 'time' },
  { id: 'night_owl', title: 'Night Reader', description: 'Read after 9 PM', icon: '🌙', unlocked: false, category: 'time' },
  { id: 'focused_reader', title: 'Focused Reader', description: 'Read for 30+ minutes in one session', icon: '🎯', unlocked: false, category: 'time' },
  { id: 'consistent_reader', title: 'Consistent Reader', description: 'Read 30 days in a month', icon: '💪', unlocked: false, category: 'consistency' },
]

const initialState = {
  currentPosition: null,
  surahProgress: {},
  juzProgress: {},
  hizbProgress: {},
  mushafProgress: {},
  totalReadingTime: 0,
  dailyGoal: 5,
  currentStreak: 0, // Start with 0 to avoid hydration mismatch
  bestStreak: 0, // Start with 0 to avoid hydration mismatch
  totalVersesRead: 0, // Start with 0 to avoid hydration mismatch
  readingSessions: [],
  currentSession: null,
  dailyStats: {},
  weeklyReadingTime: [0, 0, 0, 0, 0, 0, 0],
  monthlyReadingTime: Array(30).fill(0),
  achievements: defaultAchievements,
  favoriteReadingTime: 'evening',
  averageSessionDuration: 0,
  totalDaysActive: 0, // Start with 0 to avoid hydration mismatch
  lastActiveDate: new Date().toISOString().split('T')[0],
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Initialize with demo data on client side only
      initializeDemoData: () => {
        if (typeof window !== 'undefined') {
          const state = get()
          // Only set demo data if no data exists
          if (state.currentStreak === 0 && state.totalVersesRead === 0) {
            set({
              currentStreak: 12,
              bestStreak: 25,
              totalVersesRead: 1247,
              totalDaysActive: 15,
            })
          }
        }
      },
      
      updateCurrentPosition: (position: ReadingProgress) => {
        set({ currentPosition: position })
      },
      
      updateDivisionProgress: (division: DivisionProgress) => {
        set((state) => {
          const progressKey = `${division.type}Progress` as keyof Pick<ProgressState, 'surahProgress' | 'juzProgress' | 'hizbProgress' | 'mushafProgress'>
          return {
            ...state,
            [progressKey]: {
              ...state[progressKey],
              [division.id]: division
            }
          }
        })
      },
      
      incrementReadingTime: (seconds: number) => {
        set((state) => ({
          totalReadingTime: state.totalReadingTime + seconds
        }))
      },
      
      markVerseAsRead: (surah: number, ayah: number) => {
        const state = get()
        const newPosition: ReadingProgress = {
          surah,
          ayah,
          timestamp: Date.now()
        }
        
        set((state) => ({
          currentPosition: newPosition,
          totalVersesRead: state.totalVersesRead + 1
        }))
      },
      
      updateDailyGoal: (goal: number) => {
        set({ dailyGoal: goal })
      },
      
      calculateStreak: () => {
        // Simplified streak calculation
        // In a real app, this would calculate based on daily reading history
        const state = get()
        const today = new Date()
        const lastRead = state.currentPosition?.timestamp || 0
        const daysSinceLastRead = Math.floor((Date.now() - lastRead) / (1000 * 60 * 60 * 24))
        
        if (daysSinceLastRead <= 1) {
          // Maintain or increment streak
          set((state) => ({
            currentStreak: Math.min(state.currentStreak + 1, state.bestStreak + 1),
            bestStreak: Math.max(state.bestStreak, state.currentStreak + 1)
          }))
        } else if (daysSinceLastRead > 1) {
          // Reset streak
          set({ currentStreak: 1 })
        }
      },
      
      getDivisionProgress: (type: DivisionProgress['type'], id: number): DivisionProgress | null => {
        const state = get()
        const progressKey = `${type}Progress` as keyof Pick<ProgressState, 'surahProgress' | 'juzProgress' | 'hizbProgress' | 'mushafProgress'>
        return state[progressKey][id] || null
      },
      
      getOverallProgress: () => {
        const state = get()
        const completedSurahs = Object.values(state.surahProgress).filter(p => p.completed).length
        const completedJuz = Object.values(state.juzProgress).filter(p => p.completed).length
        
        return {
          totalSurahs: 114,
          completedSurahs,
          totalJuz: 30,
          completedJuz,
          completionPercentage: Math.round((completedSurahs / 114) * 100)
        }
      },
      
      // Session management
      startReadingSession: (divisionType: 'surah' | 'juz' | 'hizb' | 'mushaf') => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newSession: ReadingSession = {
          id: sessionId,
          startTime: Date.now(),
          endTime: 0,
          duration: 0,
          versesRead: 0,
          surahsVisited: [],
          juzVisited: [],
          hizbVisited: [],
          pagesVisited: [],
          divisionType
        }
        
        set({ currentSession: newSession })
      },
      
      endReadingSession: () => {
        const state = get()
        if (!state.currentSession) return
        
        const endTime = Date.now()
        const duration = Math.floor((endTime - state.currentSession.startTime) / 1000)
        const completedSession: ReadingSession = {
          ...state.currentSession,
          endTime,
          duration
        }
        
        // Update daily stats
        const today = new Date().toISOString().split('T')[0]
        const todayStats = state.dailyStats[today] || {
          date: today,
          readingTime: 0,
          versesRead: 0,
          sessionsCount: 0
        }
        
        const updatedStats: DailyStats = {
          ...todayStats,
          readingTime: todayStats.readingTime + duration,
          versesRead: todayStats.versesRead + completedSession.versesRead,
          sessionsCount: todayStats.sessionsCount + 1
        }
        
        set((state) => ({
          currentSession: null,
          readingSessions: [...state.readingSessions, completedSession],
          dailyStats: {
            ...state.dailyStats,
            [today]: updatedStats
          },
          averageSessionDuration: state.readingSessions.length > 0 
            ? Math.round((state.readingSessions.reduce((sum, s) => sum + s.duration, 0) + duration) / (state.readingSessions.length + 1))
            : duration
        }))
        
        get().checkAchievements()
      },
      
      updateSessionProgress: (surah: number, ayah: number, juz?: number, hizb?: number, page?: number) => {
        const state = get()
        if (!state.currentSession) return
        
        const updatedSession: ReadingSession = {
          ...state.currentSession,
          versesRead: state.currentSession.versesRead + 1,
          surahsVisited: state.currentSession.surahsVisited.includes(surah) 
            ? state.currentSession.surahsVisited 
            : [...state.currentSession.surahsVisited, surah],
          juzVisited: juz && !state.currentSession.juzVisited.includes(juz)
            ? [...state.currentSession.juzVisited, juz]
            : state.currentSession.juzVisited,
          hizbVisited: hizb && !state.currentSession.hizbVisited.includes(hizb)
            ? [...state.currentSession.hizbVisited, hizb]
            : state.currentSession.hizbVisited,
          pagesVisited: page && !state.currentSession.pagesVisited.includes(page)
            ? [...state.currentSession.pagesVisited, page]
            : state.currentSession.pagesVisited
        }
        
        set({ currentSession: updatedSession })
      },
      
      // Analytics methods
      getWeeklyStats: (): DailyStats[] => {
        const state = get()
        const today = new Date()
        const weekStats: DailyStats[] = []
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(today.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          
          weekStats.push(state.dailyStats[dateStr] || {
            date: dateStr,
            readingTime: 0,
            versesRead: 0,
            sessionsCount: 0
          })
        }
        
        return weekStats
      },
      
      getMonthlyStats: (): DailyStats[] => {
        const state = get()
        const today = new Date()
        const monthStats: DailyStats[] = []
        
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(today.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          
          monthStats.push(state.dailyStats[dateStr] || {
            date: dateStr,
            readingTime: 0,
            versesRead: 0,
            sessionsCount: 0
          })
        }
        
        return monthStats
      },
      
      getReadingHabits: () => {
        const state = get()
        const sessions = state.readingSessions
        
        // Calculate favorite reading time
        const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 }
        sessions.forEach(session => {
          const hour = new Date(session.startTime).getHours()
          if (hour >= 5 && hour < 12) timeSlots.morning++
          else if (hour >= 12 && hour < 17) timeSlots.afternoon++
          else if (hour >= 17 && hour < 21) timeSlots.evening++
          else timeSlots.night++
        })
        
        const favoriteTime = Object.entries(timeSlots).reduce((a, b) => a[1] > b[1] ? a : b)[0]
        
        // Calculate most read division
        const divisionCounts = { surah: 0, juz: 0, hizb: 0, mushaf: 0 }
        sessions.forEach(session => {
          divisionCounts[session.divisionType]++
        })
        
        const mostReadDivision = Object.entries(divisionCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
        
        // Calculate consistency score (0-100)
        const weeklyStats = get().getWeeklyStats()
        const activeDays = weeklyStats.filter(day => day.readingTime > 0).length
        const consistencyScore = Math.round((activeDays / 7) * 100)
        
        return {
          favoriteTime,
          averageSession: state.averageSessionDuration,
          mostReadDivision,
          consistencyScore
        }
      },
      
      checkAchievements: () => {
        const state = get()
        let newUnlocks: string[] = []
        
        const updatedAchievements = state.achievements.map(achievement => {
          if (achievement.unlocked) return achievement
          
          let shouldUnlock = false
          
          switch (achievement.id) {
            case 'first_read':
              shouldUnlock = state.totalVersesRead > 0
              break
            case 'daily_reader':
              shouldUnlock = state.currentStreak >= 7
              break
            case 'surah_complete':
              shouldUnlock = Object.values(state.surahProgress).some(p => p.completed)
              break
            case 'juz_complete':
              shouldUnlock = Object.values(state.juzProgress).some(p => p.completed)
              break
            case 'early_bird':
              shouldUnlock = state.readingSessions.some(s => {
                const hour = new Date(s.startTime).getHours()
                return hour >= 5 && hour < 8
              })
              break
            case 'night_owl':
              shouldUnlock = state.readingSessions.some(s => {
                const hour = new Date(s.startTime).getHours()
                return hour >= 21 || hour < 5
              })
              break
            case 'focused_reader':
              shouldUnlock = state.readingSessions.some(s => s.duration >= 1800) // 30 minutes
              break
            case 'consistent_reader':
              const monthStats = get().getMonthlyStats()
              const activeDays = monthStats.filter(day => day.readingTime > 0).length
              shouldUnlock = activeDays >= 25
              break
          }
          
          if (shouldUnlock) {
            newUnlocks.push(achievement.title)
            return { ...achievement, unlocked: true, unlockedAt: Date.now() }
          }
          
          return achievement
        })
        
        if (newUnlocks.length > 0) {
          set({ achievements: updatedAchievements })
          // You could trigger notifications here
        }
      },
      
      unlockAchievement: (achievementId: string) => {
        set((state) => ({
          achievements: state.achievements.map(achievement =>
            achievement.id === achievementId
              ? { ...achievement, unlocked: true, unlockedAt: Date.now() }
              : achievement
          )
        }))
      },
      
      getProductivityScore: (): number => {
        const state = get()
        const weeklyStats = get().getWeeklyStats()
        
        // Calculate score based on multiple factors
        let score = 0
        
        // Consistency (0-40 points)
        const activeDays = weeklyStats.filter(day => day.readingTime > 0).length
        score += (activeDays / 7) * 40
        
        // Daily goal achievement (0-20 points)
        const averageVersesPerDay = weeklyStats.reduce((sum, day) => sum + day.versesRead, 0) / 7
        const goalAchievement = Math.min(averageVersesPerDay / state.dailyGoal, 1)
        score += goalAchievement * 20
        
        // Session quality (0-20 points)
        const averageSessionTime = state.averageSessionDuration
        const qualityScore = Math.min(averageSessionTime / 600, 1) // 10 minutes as good session
        score += qualityScore * 20
        
        // Streak bonus (0-20 points)
        const streakScore = Math.min(state.currentStreak / 30, 1) // 30 days max bonus
        score += streakScore * 20
        
        return Math.round(score)
      },
      
      getLearningInsights: () => {
        const state = get()
        const habits = get().getReadingHabits()
        const productivity = get().getProductivityScore()
        
        const strengths: string[] = []
        const suggestions: string[] = []
        const milestones: string[] = []
        
        // Analyze strengths
        if (habits.consistencyScore >= 80) {
          strengths.push("Excellent reading consistency")
        }
        if (state.averageSessionDuration >= 900) {
          strengths.push("Strong focus during reading sessions")
        }
        if (state.currentStreak >= 14) {
          strengths.push("Building great reading habits")
        }
        
        // Generate suggestions
        if (habits.consistencyScore < 50) {
          suggestions.push("Try reading for just 5 minutes daily to build consistency")
        }
        if (state.averageSessionDuration < 300) {
          suggestions.push("Consider longer reading sessions for better retention")
        }
        if (state.dailyStats[new Date().toISOString().split('T')[0]]?.readingTime === 0) {
          suggestions.push("Start your day with some Quran reading")
        }
        
        // Set milestones
        if (state.totalVersesRead < 100) {
          milestones.push("Read 100 verses")
        } else if (state.totalVersesRead < 500) {
          milestones.push("Read 500 verses")
        } else if (state.totalVersesRead < 1000) {
          milestones.push("Read 1000 verses")
        }
        
        const completedSurahs = Object.values(state.surahProgress).filter(p => p.completed).length
        if (completedSurahs < 5) {
          milestones.push("Complete 5 surahs")
        } else if (completedSurahs < 20) {
          milestones.push("Complete 20 surahs")
        }
        
        return { strengths, suggestions, milestones }
      },

      reset: () => {
        set(initialState)
      },
      
      resetProgress: () => {
        set(initialState)
      }
    }),
    {
      name: 'iqra-progress-storage',
      partialize: (state) => ({
        currentPosition: state.currentPosition,
        surahProgress: state.surahProgress,
        juzProgress: state.juzProgress,
        hizbProgress: state.hizbProgress,
        mushafProgress: state.mushafProgress,
        totalReadingTime: state.totalReadingTime,
        dailyGoal: state.dailyGoal,
        currentStreak: state.currentStreak,
        bestStreak: state.bestStreak,
        totalVersesRead: state.totalVersesRead,
        readingSessions: state.readingSessions,
        dailyStats: state.dailyStats,
        achievements: state.achievements,
        favoriteReadingTime: state.favoriteReadingTime,
        averageSessionDuration: state.averageSessionDuration,
        totalDaysActive: state.totalDaysActive,
        lastActiveDate: state.lastActiveDate,
      }),
    }
  )
)