// Revolutionary Gamified Learning System for Quranic Education
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Game mechanics types
export interface LearningQuest {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'special'
  difficulty: 1 | 2 | 3 | 4 | 5
  objectives: QuestObjective[]
  rewards: QuestReward
  timeLimit?: number // in hours
  prerequisites?: string[] // quest IDs
  isActive: boolean
  isCompleted: boolean
  progress: number // 0-100
  startDate: number
  endDate?: number
  category: 'pronunciation' | 'tajweed' | 'memorization' | 'understanding' | 'consistency'
  specialEvent?: boolean
  storyline?: string
}

export interface QuestObjective {
  id: string
  description: string
  target: number
  current: number
  type: 'score_achievement' | 'consecutive_days' | 'verse_count' | 'accuracy_rate' | 'time_spent'
  isCompleted: boolean
}

export interface QuestReward {
  xp: number
  coins: number
  badges: string[]
  unlocks: string[] // New features, Qaris, themes, etc.
  specialItems?: GameItem[]
}

export interface GameItem {
  id: string
  name: string
  description: string
  type: 'avatar_accessory' | 'theme' | 'qari_voice' | 'study_tool' | 'decoration'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  effect?: GameEffect
  imageUrl?: string
}

export interface GameEffect {
  type: 'xp_boost' | 'accuracy_hint' | 'mistake_forgiveness' | 'streak_protection'
  value: number
  duration?: number // in minutes
}

export interface PlayerLevel {
  level: number
  title: string
  requiredXP: number
  rewards: QuestReward
  description: string
  privileges: string[]
}

export interface LeaderboardEntry {
  playerId: string
  playerName: string
  score: number
  level: number
  achievements: number
  streak: number
  rank: number
  avatar?: string
  badge?: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: 'speed_reading' | 'accuracy_challenge' | 'memory_test' | 'tajweed_master' | 'community_challenge'
  participants: string[]
  startTime: number
  endTime: number
  rules: string[]
  prizes: QuestReward[]
  status: 'upcoming' | 'active' | 'completed'
  leaderboard: LeaderboardEntry[]
}

export interface StudyStreak {
  currentStreak: number
  longestStreak: number
  lastStudyDate: string
  streakRewards: Array<{
    day: number
    reward: QuestReward
    claimed: boolean
  }>
  streakMultiplier: number
}

export interface PlayerStats {
  totalXP: number
  currentLevel: number
  coins: number
  totalVersesRecited: number
  accuracyRate: number
  favoriteQari: string
  strongestSkill: string
  playTime: number // in minutes
  joinDate: number
  lastActiveDate: number
}

interface GameEngineState {
  // Player progression
  playerStats: PlayerStats
  currentQuests: LearningQuest[]
  completedQuests: LearningQuest[]
  inventory: GameItem[]
  achievements: Achievement[]
  studyStreak: StudyStreak
  
  // Leaderboards and challenges
  globalLeaderboard: LeaderboardEntry[]
  friendsLeaderboard: LeaderboardEntry[]
  activeChallenges: Challenge[]
  
  // Game settings
  selectedAvatar: string
  selectedTheme: string
  gamificationEnabled: boolean
  notificationsEnabled: boolean
  streakReminders: boolean
  
  // Actions
  initializePlayer: (playerName: string) => void
  updateProgress: (questId: string, progress: number) => void
  completeQuest: (questId: string) => QuestReward
  claimReward: (reward: QuestReward) => void
  addXP: (amount: number, source: string) => LevelUpResult
  purchaseItem: (itemId: string, cost: number) => boolean
  activateItem: (itemId: string) => void
  joinChallenge: (challengeId: string) => void
  updateLeaderboard: (entry: Partial<LeaderboardEntry>) => void
  generateDailyQuests: () => LearningQuest[]
  checkStreakStatus: () => void
  
  // Analytics
  getPlayerInsights: () => PlayerInsights
  getPredictedNextLevel: () => number
  getRecommendedChallenges: () => Challenge[]
  
  reset: () => void
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'first_steps' | 'consistency' | 'mastery' | 'community' | 'special'
  requirement: {
    type: string
    value: number
    timeframe?: string
  }
  reward: QuestReward
  unlocked: boolean
  unlockedAt?: number
  rarity: 'bronze' | 'silver' | 'gold' | 'diamond'
  showcase: boolean // Show on profile
}

interface LevelUpResult {
  leveledUp: boolean
  newLevel?: number
  newTitle?: string
  rewards?: QuestReward
  unlockedFeatures?: string[]
}

interface PlayerInsights {
  learningVelocity: number
  consistency: number
  strongAreas: string[]
  improvementAreas: string[]
  predictedGoals: string[]
  recommendedStudyTime: number
}

// Predefined level system
const PLAYER_LEVELS: PlayerLevel[] = [
  {
    level: 1,
    title: "Seeker of Knowledge",
    requiredXP: 0,
    rewards: { xp: 0, coins: 100, badges: ['newcomer'], unlocks: [] },
    description: "Beginning the blessed journey of Quranic learning",
    privileges: ['basic_features']
  },
  {
    level: 2,
    title: "Student of the Quran",
    requiredXP: 500,
    rewards: { xp: 0, coins: 200, badges: ['student'], unlocks: ['advanced_feedback'] },
    description: "Establishing foundations in Quranic recitation",
    privileges: ['basic_features', 'detailed_analytics']
  },
  {
    level: 5,
    title: "Devoted Reciter",
    requiredXP: 2000,
    rewards: { xp: 0, coins: 500, badges: ['devoted'], unlocks: ['master_qari_voices'] },
    description: "Showing dedication and consistency in learning",
    privileges: ['basic_features', 'detailed_analytics', 'premium_voices']
  },
  {
    level: 10,
    title: "Quran Guardian",
    requiredXP: 5000,
    rewards: { xp: 0, coins: 1000, badges: ['guardian'], unlocks: ['custom_challenges', 'mentoring'] },
    description: "Protecting and preserving the sacred recitation",
    privileges: ['all_features', 'mentor_tools']
  },
  {
    level: 15,
    title: "Master of Tajweed",
    requiredXP: 10000,
    rewards: { xp: 0, coins: 2000, badges: ['tajweed_master'], unlocks: ['expert_mode', 'teaching_tools'] },
    description: "Mastering the art of beautiful Quranic recitation",
    privileges: ['all_features', 'expert_tools', 'teaching_mode']
  },
  {
    level: 20,
    title: "Quranic Scholar",
    requiredXP: 20000,
    rewards: { xp: 0, coins: 5000, badges: ['scholar'], unlocks: ['research_tools', 'advanced_analytics'] },
    description: "Achieving scholarly understanding of the Quran",
    privileges: ['all_features', 'research_tools', 'advanced_metrics']
  }
]

// Achievement templates
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_recitation',
    title: 'First Steps',
    description: 'Complete your first verse recitation',
    icon: '🌟',
    category: 'first_steps',
    requirement: { type: 'verses_completed', value: 1 },
    reward: { xp: 100, coins: 50, badges: ['first_step'], unlocks: [] },
    unlocked: false,
    rarity: 'bronze',
    showcase: true
  },
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Study for 7 consecutive days',
    icon: '🔥',
    category: 'consistency',
    requirement: { type: 'study_streak', value: 7 },
    reward: { xp: 500, coins: 200, badges: ['consistent'], unlocks: ['streak_rewards'] },
    unlocked: false,
    rarity: 'silver',
    showcase: true
  },
  {
    id: 'tajweed_perfectionist',
    title: 'Tajweed Perfectionist',
    description: 'Achieve 95%+ accuracy in Tajweed for 10 verses',
    icon: '👑',
    category: 'mastery',
    requirement: { type: 'accuracy_streak', value: 10 },
    reward: { xp: 1000, coins: 500, badges: ['perfectionist'], unlocks: ['expert_feedback'] },
    unlocked: false,
    rarity: 'gold',
    showcase: true
  },
  {
    id: 'community_helper',
    title: 'Community Helper',
    description: 'Help 5 other learners in challenges',
    icon: '🤝',
    category: 'community',
    requirement: { type: 'helps_given', value: 5 },
    reward: { xp: 750, coins: 300, badges: ['helper'], unlocks: ['mentoring_tools'] },
    unlocked: false,
    rarity: 'gold',
    showcase: true
  },
  {
    id: 'ramadan_champion',
    title: 'Ramadan Champion',
    description: 'Complete special Ramadan learning challenges',
    icon: '🌙',
    category: 'special',
    requirement: { type: 'special_event', value: 1, timeframe: 'ramadan' },
    reward: { xp: 2000, coins: 1000, badges: ['ramadan_champion'], unlocks: ['special_theme'] },
    unlocked: false,
    rarity: 'diamond',
    showcase: true
  }
]

const initialState: Omit<GameEngineState, keyof ReturnType<typeof createGameActions>> = {
  playerStats: {
    totalXP: 0,
    currentLevel: 1,
    coins: 100,
    totalVersesRecited: 0,
    accuracyRate: 0,
    favoriteQari: '',
    strongestSkill: '',
    playTime: 0,
    joinDate: Date.now(),
    lastActiveDate: Date.now()
  },
  currentQuests: [],
  completedQuests: [],
  inventory: [],
  achievements: ACHIEVEMENTS,
  studyStreak: {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    streakRewards: [
      { day: 3, reward: { xp: 200, coins: 50, badges: [], unlocks: [] }, claimed: false },
      { day: 7, reward: { xp: 500, coins: 100, badges: ['week_warrior'], unlocks: [] }, claimed: false },
      { day: 30, reward: { xp: 2000, coins: 500, badges: ['month_master'], unlocks: ['special_theme'] }, claimed: false }
    ],
    streakMultiplier: 1
  },
  globalLeaderboard: [],
  friendsLeaderboard: [],
  activeChallenges: [],
  selectedAvatar: 'default',
  selectedTheme: 'default',
  gamificationEnabled: true,
  notificationsEnabled: true,
  streakReminders: true
}

const createGameActions = (set: any, get: any) => ({
  initializePlayer: (playerName: string) => {
    const dailyQuests = get().generateDailyQuests()
    
    set({
      currentQuests: dailyQuests,
      playerStats: {
        ...get().playerStats,
        lastActiveDate: Date.now()
      }
    })
  },

  updateProgress: (questId: string, progress: number) => {
    set((state: GameEngineState) => {
      const updatedQuests = state.currentQuests.map(quest => {
        if (quest.id === questId) {
          const updatedQuest = { ...quest, progress: Math.min(100, progress) }
          
          // Check if quest is completed
          if (progress >= 100 && !quest.isCompleted) {
            updatedQuest.isCompleted = true
            // Auto-claim reward
            get().claimReward(quest.rewards)
          }
          
          return updatedQuest
        }
        return quest
      })
      
      return { currentQuests: updatedQuests }
    })
  },

  completeQuest: (questId: string): QuestReward => {
    const state = get() as GameEngineState
    const quest = state.currentQuests.find(q => q.id === questId)
    
    if (!quest) throw new Error('Quest not found')
    
    // Move quest to completed
    set((state: GameEngineState) => ({
      currentQuests: state.currentQuests.filter(q => q.id !== questId),
      completedQuests: [...state.completedQuests, { ...quest, isCompleted: true }]
    }))
    
    return quest.rewards
  },

  claimReward: (reward: QuestReward) => {
    set((state: GameEngineState) => {
      const newStats = {
        ...state.playerStats,
        coins: state.playerStats.coins + reward.coins
      }
      
      // Add XP and check for level up
      const levelUpResult = get().addXP(reward.xp, 'quest_reward')
      
      // Add items to inventory
      const newInventory = reward.specialItems 
        ? [...state.inventory, ...reward.specialItems]
        : state.inventory
      
      return {
        playerStats: levelUpResult.leveledUp 
          ? { ...newStats, currentLevel: levelUpResult.newLevel! }
          : newStats,
        inventory: newInventory
      }
    })
  },

  addXP: (amount: number, source: string): LevelUpResult => {
    const state = get() as GameEngineState
    const currentXP = state.playerStats.totalXP
    const newXP = currentXP + (amount * state.studyStreak.streakMultiplier)
    
    // Find current and new level
    const currentLevel = PLAYER_LEVELS.findLast(level => level.requiredXP <= currentXP)
    const newLevel = PLAYER_LEVELS.findLast(level => level.requiredXP <= newXP)
    
    const leveledUp = newLevel && currentLevel && newLevel.level > currentLevel.level
    
    set((state: GameEngineState) => ({
      playerStats: {
        ...state.playerStats,
        totalXP: newXP,
        currentLevel: newLevel?.level || 1
      }
    }))
    
    if (leveledUp && newLevel) {
      // Give level up rewards
      get().claimReward(newLevel.rewards)
      
      return {
        leveledUp: true,
        newLevel: newLevel.level,
        newTitle: newLevel.title,
        rewards: newLevel.rewards,
        unlockedFeatures: newLevel.privileges
      }
    }
    
    return { leveledUp: false }
  },

  purchaseItem: (itemId: string, cost: number): boolean => {
    const state = get() as GameEngineState
    
    if (state.playerStats.coins < cost) return false
    
    // Deduct coins and add item (mock implementation)
    set((state: GameEngineState) => ({
      playerStats: {
        ...state.playerStats,
        coins: state.playerStats.coins - cost
      }
    }))
    
    return true
  },

  activateItem: (itemId: string) => {
    // Activate item effect (mock implementation)
    console.log(`Activated item: ${itemId}`)
  },

  joinChallenge: (challengeId: string) => {
    // Join a community challenge
    set((state: GameEngineState) => {
      const updatedChallenges = state.activeChallenges.map(challenge => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            participants: [...challenge.participants, 'current_player']
          }
        }
        return challenge
      })
      
      return { activeChallenges: updatedChallenges }
    })
  },

  updateLeaderboard: (entry: Partial<LeaderboardEntry>) => {
    // Update player's position on leaderboard
    set((state: GameEngineState) => {
      const updatedLeaderboard = [...state.globalLeaderboard]
      const playerIndex = updatedLeaderboard.findIndex(e => e.playerId === entry.playerId)
      
      if (playerIndex >= 0) {
        updatedLeaderboard[playerIndex] = { ...updatedLeaderboard[playerIndex], ...entry }
      } else {
        updatedLeaderboard.push(entry as LeaderboardEntry)
      }
      
      // Sort by score
      updatedLeaderboard.sort((a, b) => b.score - a.score)
      
      // Update ranks
      updatedLeaderboard.forEach((entry, index) => {
        entry.rank = index + 1
      })
      
      return { globalLeaderboard: updatedLeaderboard }
    })
  },

  generateDailyQuests: (): LearningQuest[] => {
    const baseQuests: LearningQuest[] = [
      {
        id: `daily_practice_${Date.now()}`,
        title: 'Daily Practice',
        description: 'Recite 5 verses with good accuracy',
        type: 'daily',
        difficulty: 2,
        objectives: [{
          id: 'verses_goal',
          description: 'Recite 5 verses',
          target: 5,
          current: 0,
          type: 'verse_count',
          isCompleted: false
        }],
        rewards: { xp: 200, coins: 50, badges: [], unlocks: [] },
        timeLimit: 24,
        isActive: true,
        isCompleted: false,
        progress: 0,
        startDate: Date.now(),
        endDate: Date.now() + (24 * 60 * 60 * 1000),
        category: 'consistency'
      },
      {
        id: `accuracy_challenge_${Date.now()}`,
        title: 'Pronunciation Master',
        description: 'Achieve 85%+ accuracy in 3 recitations',
        type: 'daily',
        difficulty: 3,
        objectives: [{
          id: 'accuracy_goal',
          description: 'Get 85%+ accuracy',
          target: 3,
          current: 0,
          type: 'accuracy_rate',
          isCompleted: false
        }],
        rewards: { xp: 300, coins: 75, badges: [], unlocks: [] },
        timeLimit: 24,
        isActive: true,
        isCompleted: false,
        progress: 0,
        startDate: Date.now(),
        endDate: Date.now() + (24 * 60 * 60 * 1000),
        category: 'pronunciation'
      }
    ]
    
    return baseQuests
  },

  checkStreakStatus: () => {
    const state = get() as GameEngineState
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    if (state.studyStreak.lastStudyDate === yesterday) {
      // Continue streak
      set((state: GameEngineState) => ({
        studyStreak: {
          ...state.studyStreak,
          currentStreak: state.studyStreak.currentStreak + 1,
          lastStudyDate: today,
          longestStreak: Math.max(state.studyStreak.longestStreak, state.studyStreak.currentStreak + 1),
          streakMultiplier: Math.min(3, 1 + (state.studyStreak.currentStreak * 0.1))
        }
      }))
    } else if (state.studyStreak.lastStudyDate !== today) {
      // Reset streak
      set((state: GameEngineState) => ({
        studyStreak: {
          ...state.studyStreak,
          currentStreak: 1,
          lastStudyDate: today,
          streakMultiplier: 1
        }
      }))
    }
  },

  getPlayerInsights: (): PlayerInsights => {
    const state = get() as GameEngineState
    
    return {
      learningVelocity: state.playerStats.totalXP / Math.max(1, state.playerStats.playTime / 60), // XP per hour
      consistency: state.studyStreak.currentStreak / 30 * 100, // % based on 30-day streak
      strongAreas: ['pronunciation'], // Would be calculated from actual performance
      improvementAreas: ['tajweed'], // Would be calculated from actual performance
      predictedGoals: ['Complete 100 verses', 'Achieve Tajweed mastery'],
      recommendedStudyTime: 30 // minutes per day
    }
  },

  getPredictedNextLevel: (): number => {
    const state = get() as GameEngineState
    const currentXP = state.playerStats.totalXP
    const nextLevel = PLAYER_LEVELS.find(level => level.requiredXP > currentXP)
    return nextLevel?.level || PLAYER_LEVELS[PLAYER_LEVELS.length - 1].level
  },

  getRecommendedChallenges: (): Challenge[] => {
    // Return personalized challenge recommendations
    return []
  },

  reset: () => {
    set(initialState)
  }
})

export const useLearningGameStore = create<GameEngineState>()(
  persist(
    (set, get) => ({
      ...initialState,
      ...createGameActions(set, get)
    }),
    {
      name: 'iqra-learning-game',
      version: 1,
      partialize: (state) => ({
        playerStats: state.playerStats,
        currentQuests: state.currentQuests.slice(-10), // Keep last 10 quests
        completedQuests: state.completedQuests.slice(-50), // Keep last 50 completed
        inventory: state.inventory,
        achievements: state.achievements,
        studyStreak: state.studyStreak,
        selectedAvatar: state.selectedAvatar,
        selectedTheme: state.selectedTheme,
        gamificationEnabled: state.gamificationEnabled
      })
    }
  )
)

// Utility functions for game mechanics
export const calculateXPForActivity = (
  activityType: string,
  performance: number,
  duration: number
): number => {
  const baseXP = {
    'verse_recitation': 50,
    'tajweed_practice': 75,
    'accuracy_improvement': 100,
    'consistency_bonus': 25
  }
  
  const base = baseXP[activityType as keyof typeof baseXP] || 25
  const performanceMultiplier = Math.max(0.5, performance / 100)
  const durationBonus = Math.min(2, duration / 600) // Max 2x for 10+ minutes
  
  return Math.round(base * performanceMultiplier * durationBonus)
}

export const getNextReward = (currentStreak: number): QuestReward | null => {
  const streakRewards = [
    { day: 3, reward: { xp: 200, coins: 50, badges: ['3_day_streak'], unlocks: [] } },
    { day: 7, reward: { xp: 500, coins: 100, badges: ['week_warrior'], unlocks: ['advanced_stats'] } },
    { day: 14, reward: { xp: 1000, coins: 200, badges: ['two_week_champion'], unlocks: [] } },
    { day: 30, reward: { xp: 2500, coins: 500, badges: ['month_master'], unlocks: ['exclusive_theme'] } },
    { day: 100, reward: { xp: 10000, coins: 2000, badges: ['hundred_day_legend'], unlocks: ['master_tools'] } }
  ]
  
  return streakRewards.find(reward => reward.day === currentStreak)?.reward || null
}