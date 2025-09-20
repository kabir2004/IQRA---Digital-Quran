import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GroupPrivacy = 'public' | 'private' | 'invite-only'
export type GroupActivity = 'reading' | 'memorization' | 'discussion' | 'challenge'
export type MemberRole = 'owner' | 'admin' | 'moderator' | 'member'
export type GroupStatus = 'active' | 'paused' | 'completed'

export interface StudyGroup {
  id: string
  name: string
  description: string
  privacy: GroupPrivacy
  activity: GroupActivity
  status: GroupStatus
  memberCount: number
  maxMembers: number
  createdAt: number
  updatedAt: number
  ownerId: string
  ownerName: string
  tags: string[]
  currentReading?: {
    surah: number
    targetAyahs: number
    completedAyahs: number
    deadline?: number
  }
  goals: {
    dailyVerses: number
    weeklyReadingTime: number
    completionTarget?: number
  }
  avatar?: string
  coverImage?: string
  language: string
  timezone: string
  meetingTime?: {
    dayOfWeek: number // 0-6, Sunday = 0
    hour: number // 0-23
    duration: number // in minutes
  }
}

export interface GroupMember {
  userId: string
  groupId: string
  username: string
  avatar?: string
  role: MemberRole
  joinedAt: number
  lastActive: number
  progress: {
    versesRead: number
    readingTime: number
    attendance: number // percentage
    contributions: number
  }
  preferences: {
    notifications: boolean
    emailUpdates: boolean
  }
}

export interface GroupMessage {
  id: string
  groupId: string
  userId: string
  username: string
  avatar?: string
  content: string
  type: 'text' | 'verse' | 'audio' | 'image' | 'achievement'
  timestamp: number
  replyTo?: string
  reactions: Record<string, string[]> // emoji -> userIds
  metadata?: {
    verseRef?: { surah: number; ayah: number }
    audioUrl?: string
    imageUrl?: string
    achievement?: { id: string; title: string; icon: string }
  }
}

export interface GroupChallenge {
  id: string
  groupId: string
  title: string
  description: string
  type: 'reading' | 'memorization' | 'consistency' | 'knowledge'
  startDate: number
  endDate: number
  participants: string[] // userIds
  leaderboard: Array<{
    userId: string
    username: string
    score: number
    progress: number
  }>
  prize?: string
  rules: string[]
  isActive: boolean
}

export interface StudySession {
  id: string
  groupId: string
  title: string
  scheduledAt: number
  duration: number // minutes
  participants: string[]
  agenda: string[]
  recording?: string
  notes?: string
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  hostId: string
}

interface StudyGroupsState {
  // Current user's groups
  joinedGroups: StudyGroup[]
  ownedGroups: StudyGroup[]
  
  // Discovered groups
  publicGroups: StudyGroup[]
  recommendedGroups: StudyGroup[]
  
  // Current group context
  activeGroupId: string | null
  activeGroup: StudyGroup | null
  groupMembers: Record<string, GroupMember[]>
  groupMessages: Record<string, GroupMessage[]>
  groupChallenges: Record<string, GroupChallenge[]>
  groupSessions: Record<string, StudySession[]>
  
  // UI state
  isLoading: boolean
  searchQuery: string
  selectedActivity: GroupActivity | 'all'
  showCreateDialog: boolean
  showJoinDialog: boolean
  
  // Actions
  setActiveGroup: (groupId: string | null) => void
  createGroup: (group: Omit<StudyGroup, 'id' | 'createdAt' | 'updatedAt'>) => void
  joinGroup: (groupId: string) => void
  leaveGroup: (groupId: string) => void
  updateGroup: (groupId: string, updates: Partial<StudyGroup>) => void
  deleteGroup: (groupId: string) => void
  
  // Messages
  sendMessage: (groupId: string, content: string, type?: GroupMessage['type'], metadata?: GroupMessage['metadata']) => void
  addReaction: (messageId: string, emoji: string) => void
  removeReaction: (messageId: string, emoji: string) => void
  
  // Members
  inviteMember: (groupId: string, userId: string) => void
  removeMember: (groupId: string, userId: string) => void
  updateMemberRole: (groupId: string, userId: string, role: MemberRole) => void
  
  // Challenges
  createChallenge: (groupId: string, challenge: Omit<GroupChallenge, 'id' | 'groupId'>) => void
  joinChallenge: (challengeId: string) => void
  updateChallengeProgress: (challengeId: string, score: number, progress: number) => void
  
  // Sessions
  scheduleSession: (groupId: string, session: Omit<StudySession, 'id' | 'groupId'>) => void
  startSession: (sessionId: string) => void
  endSession: (sessionId: string) => void
  
  // Discovery
  searchGroups: (query: string) => void
  filterByActivity: (activity: GroupActivity | 'all') => void
  loadRecommendedGroups: () => void
  
  // UI actions
  setShowCreateDialog: (show: boolean) => void
  setShowJoinDialog: (show: boolean) => void
  
  reset: () => void
}

// Mock data for demonstration
const mockPublicGroups: StudyGroup[] = [
  {
    id: 'group_1',
    name: 'Quran Study Circle',
    description: 'Daily Quran reading and reflection with fellow learners from around the world.',
    privacy: 'public',
    activity: 'reading',
    status: 'active',
    memberCount: 24,
    maxMembers: 50,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 60 * 60 * 1000,
    ownerId: 'user_123',
    ownerName: 'Ahmad Ibn Ali',
    tags: ['beginner-friendly', 'daily-reading', 'english'],
    currentReading: {
      surah: 2,
      targetAyahs: 286,
      completedAyahs: 142,
      deadline: Date.now() + 15 * 24 * 60 * 60 * 1000
    },
    goals: {
      dailyVerses: 10,
      weeklyReadingTime: 300,
      completionTarget: Date.now() + 30 * 24 * 60 * 60 * 1000
    },
    language: 'en',
    timezone: 'UTC',
    meetingTime: {
      dayOfWeek: 5, // Friday
      hour: 20, // 8 PM
      duration: 60
    }
  },
  {
    id: 'group_2',
    name: 'Tajweed Masters',
    description: 'Advanced group focused on perfecting Quranic recitation and Tajweed rules.',
    privacy: 'public',
    activity: 'reading',
    status: 'active',
    memberCount: 12,
    maxMembers: 20,
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 60 * 60 * 1000,
    ownerId: 'user_456',
    ownerName: 'Fatima Al-Zahra',
    tags: ['advanced', 'tajweed', 'recitation', 'arabic'],
    goals: {
      dailyVerses: 5,
      weeklyReadingTime: 420
    },
    language: 'ar',
    timezone: 'Asia/Riyadh',
    meetingTime: {
      dayOfWeek: 6, // Saturday
      hour: 19, // 7 PM
      duration: 90
    }
  },
  {
    id: 'group_3',
    name: 'Memorization Journey',
    description: 'Supporting each other in memorizing the Holy Quran, one Surah at a time.',
    privacy: 'public',
    activity: 'memorization',
    status: 'active',
    memberCount: 18,
    maxMembers: 30,
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 30 * 60 * 1000,
    ownerId: 'user_789',
    ownerName: 'Yusuf Abdullah',
    tags: ['memorization', 'hifz', 'supportive', 'multilingual'],
    currentReading: {
      surah: 78,
      targetAyahs: 40,
      completedAyahs: 25
    },
    goals: {
      dailyVerses: 3,
      weeklyReadingTime: 240
    },
    language: 'en',
    timezone: 'America/New_York'
  }
]

const mockMessages: Record<string, GroupMessage[]> = {
  'group_1': [
    {
      id: 'msg_1',
      groupId: 'group_1',
      userId: 'user_123',
      username: 'Ahmad Ibn Ali',
      content: 'Assalamu alaikum everyone! Ready for today\'s reading session?',
      type: 'text',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      reactions: { '🤝': ['user_456', 'user_789'], '📚': ['user_101'] }
    },
    {
      id: 'msg_2',
      groupId: 'group_1',
      userId: 'user_456',
      username: 'Fatima Al-Zahra',
      content: 'Beautiful verse about patience and perseverance',
      type: 'verse',
      timestamp: Date.now() - 1 * 60 * 60 * 1000,
      metadata: {
        verseRef: { surah: 2, ayah: 155 }
      },
      reactions: { '❤️': ['user_123', 'user_789', 'user_101'], '🤲': ['user_123'] }
    },
    {
      id: 'msg_3',
      groupId: 'group_1',
      userId: 'user_789',
      username: 'Yusuf Abdullah',
      content: 'Completed today\'s reading goal! Alhamdulillah 🎉',
      type: 'achievement',
      timestamp: Date.now() - 30 * 60 * 1000,
      metadata: {
        achievement: { id: 'daily_goal', title: 'Daily Goal Complete', icon: '🎯' }
      },
      reactions: { '🎉': ['user_123', 'user_456'], '🤲': ['user_123', 'user_456'] }
    }
  ]
}

const initialState = {
  joinedGroups: [],
  ownedGroups: [],
  publicGroups: mockPublicGroups,
  recommendedGroups: mockPublicGroups.slice(0, 2),
  activeGroupId: null,
  activeGroup: null,
  groupMembers: {},
  groupMessages: mockMessages,
  groupChallenges: {},
  groupSessions: {},
  isLoading: false,
  searchQuery: '',
  selectedActivity: 'all' as const,
  showCreateDialog: false,
  showJoinDialog: false
}

export const useStudyGroupsStore = create<StudyGroupsState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setActiveGroup: (groupId) => {
        const state = get()
        const group = [...state.joinedGroups, ...state.publicGroups].find(g => g.id === groupId)
        set({ activeGroupId: groupId, activeGroup: group || null })
      },
      
      createGroup: (groupData) => {
        const newGroup: StudyGroup = {
          ...groupData,
          id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        
        set(state => ({
          ownedGroups: [newGroup, ...state.ownedGroups],
          joinedGroups: [newGroup, ...state.joinedGroups],
          showCreateDialog: false
        }))
      },
      
      joinGroup: (groupId) => {
        const state = get()
        const group = state.publicGroups.find(g => g.id === groupId)
        
        if (group && !state.joinedGroups.find(g => g.id === groupId)) {
          const updatedGroup = { ...group, memberCount: group.memberCount + 1 }
          
          set(state => ({
            joinedGroups: [updatedGroup, ...state.joinedGroups],
            publicGroups: state.publicGroups.map(g => 
              g.id === groupId ? updatedGroup : g
            ),
            showJoinDialog: false
          }))
        }
      },
      
      leaveGroup: (groupId) => {
        set(state => ({
          joinedGroups: state.joinedGroups.filter(g => g.id !== groupId),
          activeGroupId: state.activeGroupId === groupId ? null : state.activeGroupId,
          activeGroup: state.activeGroupId === groupId ? null : state.activeGroup
        }))
      },
      
      updateGroup: (groupId, updates) => {
        set(state => ({
          joinedGroups: state.joinedGroups.map(g => 
            g.id === groupId ? { ...g, ...updates, updatedAt: Date.now() } : g
          ),
          ownedGroups: state.ownedGroups.map(g => 
            g.id === groupId ? { ...g, ...updates, updatedAt: Date.now() } : g
          ),
          publicGroups: state.publicGroups.map(g => 
            g.id === groupId ? { ...g, ...updates, updatedAt: Date.now() } : g
          )
        }))
      },
      
      deleteGroup: (groupId) => {
        set(state => ({
          joinedGroups: state.joinedGroups.filter(g => g.id !== groupId),
          ownedGroups: state.ownedGroups.filter(g => g.id !== groupId),
          publicGroups: state.publicGroups.filter(g => g.id !== groupId),
          activeGroupId: state.activeGroupId === groupId ? null : state.activeGroupId,
          activeGroup: state.activeGroupId === groupId ? null : state.activeGroup
        }))
      },
      
      sendMessage: (groupId, content, type = 'text', metadata) => {
        const newMessage: GroupMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          groupId,
          userId: 'current_user',
          username: 'You',
          content,
          type,
          timestamp: Date.now(),
          reactions: {},
          metadata
        }
        
        set(state => ({
          groupMessages: {
            ...state.groupMessages,
            [groupId]: [...(state.groupMessages[groupId] || []), newMessage]
          }
        }))
      },
      
      addReaction: (messageId, emoji) => {
        const state = get()
        const userId = 'current_user'
        
        set({
          groupMessages: Object.fromEntries(
            Object.entries(state.groupMessages).map(([groupId, messages]) => [
              groupId,
              messages.map(msg => {
                if (msg.id === messageId) {
                  const reactions = { ...msg.reactions }
                  if (!reactions[emoji]) reactions[emoji] = []
                  if (!reactions[emoji].includes(userId)) {
                    reactions[emoji].push(userId)
                  }
                  return { ...msg, reactions }
                }
                return msg
              })
            ])
          )
        })
      },
      
      removeReaction: (messageId, emoji) => {
        const state = get()
        const userId = 'current_user'
        
        set({
          groupMessages: Object.fromEntries(
            Object.entries(state.groupMessages).map(([groupId, messages]) => [
              groupId,
              messages.map(msg => {
                if (msg.id === messageId) {
                  const reactions = { ...msg.reactions }
                  if (reactions[emoji]) {
                    reactions[emoji] = reactions[emoji].filter(id => id !== userId)
                    if (reactions[emoji].length === 0) {
                      delete reactions[emoji]
                    }
                  }
                  return { ...msg, reactions }
                }
                return msg
              })
            ])
          )
        })
      },
      
      inviteMember: (groupId, userId) => {
        // Implementation for inviting members
        console.log('Inviting member:', userId, 'to group:', groupId)
      },
      
      removeMember: (groupId, userId) => {
        // Implementation for removing members
        console.log('Removing member:', userId, 'from group:', groupId)
      },
      
      updateMemberRole: (groupId, userId, role) => {
        // Implementation for updating member roles
        console.log('Updating role for:', userId, 'in group:', groupId, 'to:', role)
      },
      
      createChallenge: (groupId, challengeData) => {
        const newChallenge: GroupChallenge = {
          ...challengeData,
          id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          groupId,
          participants: [],
          leaderboard: [],
          isActive: true
        }
        
        set(state => ({
          groupChallenges: {
            ...state.groupChallenges,
            [groupId]: [...(state.groupChallenges[groupId] || []), newChallenge]
          }
        }))
      },
      
      joinChallenge: (challengeId) => {
        // Implementation for joining challenges
        console.log('Joining challenge:', challengeId)
      },
      
      updateChallengeProgress: (challengeId, score, progress) => {
        // Implementation for updating challenge progress
        console.log('Updating challenge progress:', challengeId, score, progress)
      },
      
      scheduleSession: (groupId, sessionData) => {
        const newSession: StudySession = {
          ...sessionData,
          id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          groupId,
          participants: [],
          status: 'scheduled'
        }
        
        set(state => ({
          groupSessions: {
            ...state.groupSessions,
            [groupId]: [...(state.groupSessions[groupId] || []), newSession]
          }
        }))
      },
      
      startSession: (sessionId) => {
        // Implementation for starting sessions
        console.log('Starting session:', sessionId)
      },
      
      endSession: (sessionId) => {
        // Implementation for ending sessions
        console.log('Ending session:', sessionId)
      },
      
      searchGroups: (query) => {
        set({ searchQuery: query })
      },
      
      filterByActivity: (activity) => {
        set({ selectedActivity: activity })
      },
      
      loadRecommendedGroups: () => {
        // Load AI-recommended groups based on user preferences
        set({ recommendedGroups: mockPublicGroups.slice(0, 3) })
      },
      
      setShowCreateDialog: (show) => {
        set({ showCreateDialog: show })
      },
      
      setShowJoinDialog: (show) => {
        set({ showJoinDialog: show })
      },
      
      reset: () => {
        set(initialState)
      }
    }),
    {
      name: 'iqra-study-groups',
      version: 1,
      partialize: (state) => ({
        joinedGroups: state.joinedGroups,
        ownedGroups: state.ownedGroups,
        groupMessages: state.groupMessages,
        groupChallenges: state.groupChallenges,
        groupSessions: state.groupSessions
      }),
      migrate: (persistedState: any, version: number) => {
        // If version is 0 (no version), migrate to version 1
        if (version === 0) {
          return {
            ...initialState,
            joinedGroups: persistedState.joinedGroups || [],
            ownedGroups: persistedState.ownedGroups || [],
            groupMessages: persistedState.groupMessages || {},
            groupChallenges: persistedState.groupChallenges || {},
            groupSessions: persistedState.groupSessions || {}
          }
        }
        return persistedState
      },
      // Add fallback to handle migration errors
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Study groups store rehydration failed, using default state:', error)
          // Clear the corrupted storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('iqra-study-groups')
          }
        }
      }
    }
  )
)