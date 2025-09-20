import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Voice Learning Types
export interface VoiceLearningSession {
  id: string
  verseId: string
  surah: number
  ayah: number
  startTime: number
  endTime?: number
  attempts: PronunciationAttempt[]
  finalScore: number
  aiAnalysis: AIAnalysis
  recommendations: string[]
  status: 'in_progress' | 'completed' | 'excellent'
}

export interface PronunciationAttempt {
  id: string
  timestamp: number
  audioBlob: Blob
  transcription: string
  arabicText: string
  phoneticsExpected: string
  phoneticsActual: string
  scores: {
    overall: number           // 0-100
    tajweed: number          // Tajweed rules accuracy
    pronunciation: number    // Individual letter pronunciation
    rhythm: number          // Pace and rhythm
    clarity: number         // Audio clarity
    makharijAlHuruf: number // Letter articulation points
  }
  feedback: TajweedFeedback[]
  mistakesDetected: PronunciationMistake[]
}

export interface TajweedFeedback {
  rule: TajweedRule
  position: { start: number; end: number }
  severity: 'excellent' | 'good' | 'needs_improvement' | 'incorrect'
  feedback: string
  audioExample?: string // ElevenLabs generated example
}

export interface PronunciationMistake {
  type: 'makhraj' | 'sifat' | 'ghunnah' | 'ikhfa' | 'idgham' | 'iqlab' | 'izhar'
  letter: string
  position: number
  expected: string
  actual: string
  severity: 'minor' | 'moderate' | 'major'
  explanation: string
  practiceRecommendation: string
}

export interface AIAnalysis {
  overallAssessment: string
  strengths: string[]
  areasForImprovement: string[]
  personalizedPlan: LearningPlan
  progressPrediction: string
  nextRecommendedVerse: { surah: number; ayah: number }
  difficultyAdjustment: 'easier' | 'maintain' | 'harder'
}

export interface LearningPlan {
  focus: 'basics' | 'tajweed' | 'fluency' | 'memorization'
  dailyPracticeMinutes: number
  practiceVerses: Array<{ surah: number; ayah: number; reason: string }>
  exercises: LearningExercise[]
  milestones: LearningMilestone[]
}

export interface LearningExercise {
  type: 'letter_drill' | 'tajweed_practice' | 'rhythm_training' | 'listening_comprehension'
  title: string
  description: string
  targetLetters?: string[]
  targetRules?: TajweedRule[]
  difficulty: 1 | 2 | 3 | 4 | 5
  estimatedMinutes: number
}

export interface LearningMilestone {
  id: string
  title: string
  description: string
  targetScore: number
  reward: string
  unlocked: boolean
  completedAt?: number
}

export type TajweedRule = 
  | 'ghunnah' | 'ikhfa' | 'idgham' | 'iqlab' | 'izhar' | 'madd' | 'qalqalah' 
  | 'ra_tafkheem' | 'ra_tarqeeq' | 'lam_tafkheem' | 'lam_tarqeeq'

export interface VoiceLearningState {
  // Current session
  currentSession: VoiceLearningSession | null
  isRecording: boolean
  isProcessing: boolean
  
  // Settings
  learningLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  preferredQari: string
  feedbackDetailLevel: 'basic' | 'detailed' | 'expert'
  enableTajweedGuide: boolean
  enableRhythmGuide: boolean
  autoPlayExamples: boolean
  
  // Progress tracking
  completedSessions: VoiceLearningSession[]
  overallProgress: {
    totalSessions: number
    averageScore: number
    improvementRate: number
    strongAreas: string[]
    weakAreas: string[]
    currentLevel: number
    xpPoints: number
  }
  
  // Achievements and milestones
  voiceAchievements: VoiceAchievement[]
  currentStreak: number
  longestStreak: number
  
  // Actions
  startSession: (surah: number, ayah: number) => void
  endSession: () => void
  submitPronunciation: (audioBlob: Blob) => Promise<PronunciationAttempt>
  getPersonalizedFeedback: () => AIAnalysis
  updateLearningPlan: () => void
  selectQari: (qariName: string) => void
  adjustDifficulty: (direction: 'up' | 'down') => void
  
  // AI-powered recommendations
  getRecommendedVerse: () => { surah: number; ayah: number }
  getPersonalizedExercises: () => LearningExercise[]
  generatePracticePlan: (targetMinutes: number) => LearningPlan
  
  reset: () => void
}

export interface VoiceAchievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'pronunciation' | 'tajweed' | 'consistency' | 'improvement' | 'mastery'
  requirements: {
    type: 'score' | 'streak' | 'sessions' | 'specific_rule'
    target: number
    rule?: TajweedRule
  }
  unlocked: boolean
  unlockedAt?: number
  xpReward: number
}

const initialVoiceAchievements: VoiceAchievement[] = [
  {
    id: 'first_recitation',
    title: 'First Recitation',
    description: 'Complete your first verse recitation',
    icon: '🎤',
    category: 'pronunciation',
    requirements: { type: 'sessions', target: 1 },
    unlocked: false,
    xpReward: 100
  },
  {
    id: 'perfect_fatiha',
    title: 'Perfect Al-Fatiha',
    description: 'Recite Al-Fatiha with 95%+ accuracy',
    icon: '⭐',
    category: 'mastery',
    requirements: { type: 'score', target: 95 },
    unlocked: false,
    xpReward: 500
  },
  {
    id: 'tajweed_master',
    title: 'Tajweed Master',
    description: 'Master all basic Tajweed rules',
    icon: '👑',
    category: 'tajweed',
    requirements: { type: 'score', target: 90 },
    unlocked: false,
    xpReward: 1000
  },
  {
    id: 'consistent_learner',
    title: 'Consistent Learner',
    description: 'Practice for 7 consecutive days',
    icon: '🔥',
    category: 'consistency',
    requirements: { type: 'streak', target: 7 },
    unlocked: false,
    xpReward: 300
  },
  {
    id: 'rapid_improver',
    title: 'Rapid Improver',
    description: 'Improve your score by 20+ points',
    icon: '📈',
    category: 'improvement',
    requirements: { type: 'score', target: 20 },
    unlocked: false,
    xpReward: 250
  }
]

const initialState: Omit<VoiceLearningState, keyof ReturnType<typeof createVoiceLearningActions>> = {
  currentSession: null,
  isRecording: false,
  isProcessing: false,
  learningLevel: 'beginner',
  preferredQari: 'abdul_rahman_as_sudais',
  feedbackDetailLevel: 'detailed',
  enableTajweedGuide: true,
  enableRhythmGuide: true,
  autoPlayExamples: true,
  completedSessions: [],
  overallProgress: {
    totalSessions: 0,
    averageScore: 0,
    improvementRate: 0,
    strongAreas: [],
    weakAreas: [],
    currentLevel: 1,
    xpPoints: 0
  },
  voiceAchievements: initialVoiceAchievements,
  currentStreak: 0,
  longestStreak: 0
}

const createVoiceLearningActions = (set: any, get: any) => ({
  startSession: (surah: number, ayah: number) => {
    const sessionId = `voice_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newSession: VoiceLearningSession = {
      id: sessionId,
      verseId: `${surah}:${ayah}`,
      surah,
      ayah,
      startTime: Date.now(),
      attempts: [],
      finalScore: 0,
      aiAnalysis: {
        overallAssessment: '',
        strengths: [],
        areasForImprovement: [],
        personalizedPlan: {
          focus: 'basics',
          dailyPracticeMinutes: 15,
          practiceVerses: [],
          exercises: [],
          milestones: []
        },
        progressPrediction: '',
        nextRecommendedVerse: { surah: 1, ayah: 1 },
        difficultyAdjustment: 'maintain'
      },
      recommendations: [],
      status: 'in_progress'
    }
    
    set({ currentSession: newSession, isRecording: false, isProcessing: false })
  },

  endSession: () => {
    const state = get() as VoiceLearningState
    if (!state.currentSession) return

    const completedSession = {
      ...state.currentSession,
      endTime: Date.now(),
      status: 'completed' as const
    }

    // Update overall progress
    const newTotalSessions = state.overallProgress.totalSessions + 1
    const newAverageScore = (
      (state.overallProgress.averageScore * state.overallProgress.totalSessions + completedSession.finalScore) / 
      newTotalSessions
    )

    set({
      currentSession: null,
      completedSessions: [...state.completedSessions, completedSession],
      overallProgress: {
        ...state.overallProgress,
        totalSessions: newTotalSessions,
        averageScore: newAverageScore
      }
    })

    // Check for achievements
    get().checkAchievements()
  },

  submitPronunciation: async (audioBlob: Blob): Promise<PronunciationAttempt> => {
    set({ isProcessing: true })
    
    try {
      const state = get() as VoiceLearningState
      if (!state.currentSession) throw new Error('No active session')

      // This would integrate with your speech recognition API
      const attempt: PronunciationAttempt = {
        id: `attempt_${Date.now()}`,
        timestamp: Date.now(),
        audioBlob,
        transcription: '', // Would be filled by speech recognition
        arabicText: '', // Current verse text
        phoneticsExpected: '',
        phoneticsActual: '',
        scores: {
          overall: Math.floor(Math.random() * 40) + 60, // Demo data
          tajweed: Math.floor(Math.random() * 30) + 70,
          pronunciation: Math.floor(Math.random() * 25) + 75,
          rhythm: Math.floor(Math.random() * 20) + 80,
          clarity: Math.floor(Math.random() * 30) + 70,
          makharijAlHuruf: Math.floor(Math.random() * 35) + 65
        },
        feedback: [],
        mistakesDetected: []
      }

      // Update current session with new attempt
      set((state: VoiceLearningState) => ({
        currentSession: state.currentSession ? {
          ...state.currentSession,
          attempts: [...state.currentSession.attempts, attempt],
          finalScore: attempt.scores.overall
        } : null,
        isProcessing: false
      }))

      return attempt
    } catch (error) {
      set({ isProcessing: false })
      throw error
    }
  },

  getPersonalizedFeedback: (): AIAnalysis => {
    const state = get() as VoiceLearningState
    
    // This would integrate with AI analysis
    return {
      overallAssessment: "Good progress! Focus on improving your Tajweed rules.",
      strengths: ["Clear pronunciation", "Good rhythm"],
      areasForImprovement: ["Ghunnah rules", "Letter elongation"],
      personalizedPlan: {
        focus: 'tajweed',
        dailyPracticeMinutes: 20,
        practiceVerses: [
          { surah: 1, ayah: 2, reason: "Practice Ghunnah with 'Rahman'" },
          { surah: 1, ayah: 4, reason: "Work on Madd rules" }
        ],
        exercises: [],
        milestones: []
      },
      progressPrediction: "With consistent practice, you'll master basic Tajweed in 2-3 weeks",
      nextRecommendedVerse: { surah: 1, ayah: 2 },
      difficultyAdjustment: 'maintain'
    }
  },

  updateLearningPlan: () => {
    // AI-powered learning plan updates based on performance
    const state = get() as VoiceLearningState
    const recentSessions = state.completedSessions.slice(-5)
    
    // Analyze trends and update recommendations
    console.log('Updating learning plan based on recent performance...')
  },

  selectQari: (qariName: string) => {
    set({ preferredQari: qariName })
  },

  adjustDifficulty: (direction: 'up' | 'down') => {
    const state = get() as VoiceLearningState
    const levels = ['beginner', 'intermediate', 'advanced', 'expert'] as const
    const currentIndex = levels.indexOf(state.learningLevel)
    
    if (direction === 'up' && currentIndex < levels.length - 1) {
      set({ learningLevel: levels[currentIndex + 1] })
    } else if (direction === 'down' && currentIndex > 0) {
      set({ learningLevel: levels[currentIndex - 1] })
    }
  },

  getRecommendedVerse: () => {
    const state = get() as VoiceLearningState
    // AI logic to recommend next verse based on progress
    return { surah: 1, ayah: 1 }
  },

  getPersonalizedExercises: (): LearningExercise[] => {
    const state = get() as VoiceLearningState
    
    return [
      {
        type: 'letter_drill',
        title: 'Arabic Letter Pronunciation',
        description: 'Practice individual letter sounds',
        targetLetters: ['ر', 'غ', 'خ'],
        difficulty: 2,
        estimatedMinutes: 10
      },
      {
        type: 'tajweed_practice',
        title: 'Ghunnah Rules',
        description: 'Master nasal sounds in Quran',
        targetRules: ['ghunnah', 'ikhfa'],
        difficulty: 3,
        estimatedMinutes: 15
      }
    ]
  },

  generatePracticePlan: (targetMinutes: number): LearningPlan => {
    return {
      focus: 'tajweed',
      dailyPracticeMinutes: targetMinutes,
      practiceVerses: [
        { surah: 1, ayah: 1, reason: "Foundation practice" }
      ],
      exercises: [],
      milestones: []
    }
  },

  checkAchievements: () => {
    const state = get() as VoiceLearningState
    // Check and unlock achievements based on progress
    console.log('Checking achievements...')
  },

  reset: () => {
    set(initialState)
  }
})

export const useVoiceLearningStore = create<VoiceLearningState>()(
  persist(
    (set, get) => ({
      ...initialState,
      ...createVoiceLearningActions(set, get)
    }),
    {
      name: 'iqra-voice-learning',
      version: 1,
      partialize: (state) => ({
        learningLevel: state.learningLevel,
        preferredQari: state.preferredQari,
        feedbackDetailLevel: state.feedbackDetailLevel,
        enableTajweedGuide: state.enableTajweedGuide,
        enableRhythmGuide: state.enableRhythmGuide,
        autoPlayExamples: state.autoPlayExamples,
        completedSessions: state.completedSessions.slice(-50), // Keep last 50 sessions
        overallProgress: state.overallProgress,
        voiceAchievements: state.voiceAchievements,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak
      })
    }
  )
)