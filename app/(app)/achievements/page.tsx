'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Star, 
  Flame, 
  BookOpen, 
  BookMarked, 
  Clock, 
  Target, 
  Award, 
  CheckCircle, 
  Lock, 
  Calendar,
  TrendingUp,
  Users,
  Heart,
  Shield,
  Brain,
  Zap,
  Crown,
  Gem,
  Sparkles
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  category: 'reading' | 'memorization' | 'consistency' | 'milestone' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  progress: number
  maxProgress: number
  completed: boolean
  locked: boolean
  earnedDate?: string
  requirements: string[]
}

const achievements: Achievement[] = [
  // Reading Achievements
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: Star,
    category: 'reading',
    rarity: 'common',
    points: 10,
    progress: 1,
    maxProgress: 1,
    completed: true,
    locked: false,
    earnedDate: '2024-01-10',
    requirements: ['Complete 1 lesson']
  },
  {
    id: 'dedicated-learner',
    title: 'Dedicated Learner',
    description: 'Study for 7 consecutive days',
    icon: Flame,
    category: 'consistency',
    rarity: 'rare',
    points: 50,
    progress: 5,
    maxProgress: 7,
    completed: false,
    locked: false,
    requirements: ['Study for 7 consecutive days']
  },
  {
    id: 'speed-reader',
    title: 'Speed Reader',
    description: 'Read 100 verses in one session',
    icon: BookOpen,
    category: 'reading',
    rarity: 'epic',
    points: 100,
    progress: 0,
    maxProgress: 100,
    completed: false,
    locked: false,
    requirements: ['Read 100 verses in a single session']
  },
  {
    id: 'memory-master',
    title: 'Memory Master',
    description: 'Memorize 10 verses',
    icon: BookMarked,
    category: 'memorization',
    rarity: 'rare',
    points: 75,
    progress: 0,
    maxProgress: 10,
    completed: false,
    locked: false,
    requirements: ['Memorize 10 verses']
  },
  {
    id: 'consistent-scholar',
    title: 'Consistent Scholar',
    description: 'Study for 30 consecutive days',
    icon: Target,
    category: 'consistency',
    rarity: 'epic',
    points: 200,
    progress: 0,
    maxProgress: 30,
    completed: false,
    locked: false,
    requirements: ['Study for 30 consecutive days']
  },
  {
    id: 'quran-complete',
    title: 'Quran Complete',
    description: 'Read the entire Quran',
    icon: Crown,
    category: 'milestone',
    rarity: 'legendary',
    points: 1000,
    progress: 0,
    maxProgress: 6236,
    completed: false,
    locked: false,
    requirements: ['Read all 6236 verses of the Quran']
  },
  {
    id: 'hafiz',
    title: 'Hafiz',
    description: 'Memorize the entire Quran',
    icon: Gem,
    category: 'memorization',
    rarity: 'legendary',
    points: 5000,
    progress: 0,
    maxProgress: 6236,
    completed: false,
    locked: true,
    requirements: ['Memorize all 6236 verses of the Quran']
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Read 50 verses before 6 AM',
    icon: Clock,
    category: 'reading',
    rarity: 'common',
    points: 25,
    progress: 0,
    maxProgress: 50,
    completed: false,
    locked: false,
    requirements: ['Read 50 verses before 6 AM']
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Read 50 verses after 10 PM',
    icon: Clock,
    category: 'reading',
    rarity: 'common',
    points: 25,
    progress: 0,
    maxProgress: 50,
    completed: false,
    locked: false,
    requirements: ['Read 50 verses after 10 PM']
  },
  {
    id: 'weekend-warrior',
    title: 'Weekend Warrior',
    description: 'Read 200 verses on weekends',
    icon: Calendar,
    category: 'reading',
    rarity: 'rare',
    points: 60,
    progress: 0,
    maxProgress: 200,
    completed: false,
    locked: false,
    requirements: ['Read 200 verses on weekends']
  },
  {
    id: 'social-learner',
    title: 'Social Learner',
    description: 'Join 3 study groups',
    icon: Users,
    category: 'special',
    rarity: 'epic',
    points: 150,
    progress: 0,
    maxProgress: 3,
    completed: false,
    locked: true,
    requirements: ['Join 3 study groups']
  },
  {
    id: 'teacher',
    title: 'Teacher',
    description: 'Help 5 other learners',
    icon: Heart,
    category: 'special',
    rarity: 'epic',
    points: 200,
    progress: 0,
    maxProgress: 5,
    completed: false,
    locked: true,
    requirements: ['Help 5 other learners']
  }
]

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    case 'rare': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'epic': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'legendary': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'reading': return BookOpen
    case 'memorization': return BookMarked
    case 'consistency': return Target
    case 'milestone': return Trophy
    case 'special': return Sparkles
    default: return Award
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'reading': return 'text-blue-500'
    case 'memorization': return 'text-orange-500'
    case 'consistency': return 'text-green-500'
    case 'milestone': return 'text-purple-500'
    case 'special': return 'text-pink-500'
    default: return 'text-gray-500'
  }
}

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === 'earned') return achievement.completed
    if (activeTab === 'locked') return achievement.locked
    if (selectedCategory !== 'all') return achievement.category === selectedCategory
    return true
  })

  const totalPoints = achievements.filter(a => a.completed).reduce((sum, a) => sum + a.points, 0)
  const totalAchievements = achievements.length
  const earnedAchievements = achievements.filter(a => a.completed).length
  const lockedAchievements = achievements.filter(a => a.locked).length

  const categories = [
    { id: 'all', name: 'All', count: achievements.length },
    { id: 'reading', name: 'Reading', count: achievements.filter(a => a.category === 'reading').length },
    { id: 'memorization', name: 'Memorization', count: achievements.filter(a => a.category === 'memorization').length },
    { id: 'consistency', name: 'Consistency', count: achievements.filter(a => a.category === 'consistency').length },
    { id: 'milestone', name: 'Milestone', count: achievements.filter(a => a.category === 'milestone').length },
    { id: 'special', name: 'Special', count: achievements.filter(a => a.category === 'special').length }
  ]

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Achievements</h1>
          <p className="text-muted-foreground">Track your learning milestones and accomplishments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <CardTitle className="text-lg">Total Points</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{totalPoints}</div>
              <p className="text-sm text-muted-foreground">Points earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-lg">Earned</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{earnedAchievements}</div>
              <p className="text-sm text-muted-foreground">of {totalAchievements} achievements</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-500" />
                <CardTitle className="text-lg">Locked</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-500">{lockedAchievements}</div>
              <p className="text-sm text-muted-foreground">Not yet available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <CardTitle className="text-lg">Progress</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {Math.round((earnedAchievements / totalAchievements) * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">Completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.id)
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {category.name} ({category.count})
              </Button>
            )
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Achievements</TabsTrigger>
            <TabsTrigger value="earned">Earned ({earnedAchievements})</TabsTrigger>
            <TabsTrigger value="locked">Locked ({lockedAchievements})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => {
                const Icon = achievement.icon
                const CategoryIcon = getCategoryIcon(achievement.category)
                const progressPercentage = (achievement.progress / achievement.maxProgress) * 100

                return (
                  <Card 
                    key={achievement.id} 
                    className={`hover:shadow-lg transition-shadow ${
                      achievement.completed ? 'ring-2 ring-yellow-500' : 
                      achievement.locked ? 'opacity-60' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            achievement.completed ? 'bg-yellow-100 dark:bg-yellow-900' : 
                            achievement.locked ? 'bg-muted' : 'bg-primary/10'
                          }`}>
                            <Icon className={`w-6 h-6 ${
                              achievement.completed ? 'text-yellow-600' : 
                              achievement.locked ? 'text-muted-foreground' : 
                              getCategoryColor(achievement.category)
                            }`} />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {achievement.title}
                              {achievement.locked && <Lock className="w-4 h-4 text-muted-foreground" />}
                            </CardTitle>
                            <CardDescription>{achievement.description}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className={`w-4 h-4 ${getCategoryColor(achievement.category)}`} />
                            <span className="capitalize">{achievement.category}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span>{achievement.points} pts</span>
                          </div>
                        </div>

                        {!achievement.completed && !achievement.locked && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                          </div>
                        )}

                        {achievement.completed && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Earned {achievement.earnedDate}</span>
                          </div>
                        )}

                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Requirements:</p>
                          {achievement.requirements.map((req, index) => (
                            <p key={index} className="text-xs text-muted-foreground">• {req}</p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="earned" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.filter(a => a.completed).map((achievement) => {
                const Icon = achievement.icon
                const CategoryIcon = getCategoryIcon(achievement.category)

                return (
                  <Card key={achievement.id} className="ring-2 ring-yellow-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {achievement.title}
                              <Sparkles className="w-4 h-4 text-yellow-500" />
                            </CardTitle>
                            <CardDescription>{achievement.description}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className={`w-4 h-4 ${getCategoryColor(achievement.category)}`} />
                            <span className="capitalize">{achievement.category}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span>{achievement.points} pts</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Earned {achievement.earnedDate}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="locked" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.filter(a => a.locked).map((achievement) => {
                const Icon = achievement.icon
                const CategoryIcon = getCategoryIcon(achievement.category)

                return (
                  <Card key={achievement.id} className="opacity-60">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Icon className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2 text-muted-foreground">
                              {achievement.title}
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                              {achievement.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="w-4 h-4" />
                            <span className="capitalize">{achievement.category}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            <span>{achievement.points} pts</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock className="w-4 h-4" />
                          <span>Not yet available</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
