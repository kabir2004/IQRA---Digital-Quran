'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  Clock, 
  Target, 
  Trophy, 
  Calendar,
  BarChart3,
  Activity,
  Award,
  Star,
  Flame,
  Users,
  BookMarked,
  Hash,
  Layers,
  FileText,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle
} from 'lucide-react'
import { useProgressStore } from '@/store/progress'

const weeklyData = [
  { day: 'Mon', verses: 45, time: 30, sessions: 3 },
  { day: 'Tue', verses: 52, time: 35, sessions: 4 },
  { day: 'Wed', verses: 38, time: 25, sessions: 2 },
  { day: 'Thu', verses: 67, time: 45, sessions: 5 },
  { day: 'Fri', verses: 41, time: 28, sessions: 3 },
  { day: 'Sat', verses: 58, time: 40, sessions: 4 },
  { day: 'Sun', verses: 72, time: 50, sessions: 6 }
]

const monthlyData = [
  { month: 'Jan', verses: 1200, time: 800, surahs: 8 },
  { month: 'Feb', verses: 1350, time: 900, surahs: 10 },
  { month: 'Mar', verses: 1100, time: 750, surahs: 7 },
  { month: 'Apr', verses: 1600, time: 1000, surahs: 12 },
  { month: 'May', verses: 1400, time: 850, surahs: 9 },
  { month: 'Jun', verses: 1800, time: 1200, surahs: 15 }
]

const surahProgress = [
  { name: 'Al-Fatiha', completed: 100, verses: 7, color: '#8884d8' },
  { name: 'Al-Baqarah', completed: 75, verses: 286, color: '#82ca9d' },
  { name: 'Ali Imran', completed: 60, verses: 200, color: '#ffc658' },
  { name: 'An-Nisa', completed: 45, verses: 176, color: '#ff7300' },
  { name: 'Al-Maidah', completed: 30, verses: 120, color: '#00ff00' }
]

const readingHabits = [
  { time: 'Early Morning', verses: 25, percentage: 15 },
  { time: 'Morning', verses: 45, percentage: 28 },
  { time: 'Afternoon', verses: 35, percentage: 22 },
  { time: 'Evening', verses: 55, percentage: 35 }
]

const achievements = [
  { id: 1, title: 'First Steps', description: 'Complete your first lesson', icon: Star, earned: true, date: '2024-01-10' },
  { id: 2, title: 'Dedicated Learner', description: 'Study for 7 consecutive days', icon: Flame, earned: true, date: '2024-01-15' },
  { id: 3, title: 'Memory Master', description: 'Memorize 10 verses', icon: BookMarked, earned: false, date: null },
  { id: 4, title: 'Speed Reader', description: 'Read 100 verses in one session', icon: BookOpen, earned: false, date: null },
  { id: 5, title: 'Consistent Scholar', description: 'Study for 30 consecutive days', icon: Trophy, earned: false, date: null }
]

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('week')
  const { 
    totalReadingTime, 
    totalVersesRead, 
    currentStreak, 
    bestStreak, 
    dailyGoal,
    getOverallProgress,
    getWeeklyStats,
    getReadingHabits,
    getProductivityScore
  } = useProgressStore()

  const overallProgress = getOverallProgress()
  const weeklyStats = getWeeklyStats()
  const habits = getReadingHabits()
  const productivityScore = getProductivityScore()

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="w-4 h-4 text-green-500" />
    if (current < previous) return <ArrowDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-500'
    if (current < previous) return 'text-red-500'
    return 'text-gray-500'
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00']

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Progress & Analytics</h1>
              <p className="text-muted-foreground">Track your learning journey and insights</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                    <Flame className="h-4 w-4 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">{currentStreak}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getTrendIcon(currentStreak, bestStreak)}
                    <span className={getTrendColor(currentStreak, bestStreak)}>
                      Best: {bestStreak} days
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Verses Read</CardTitle>
                    <BookOpen className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">{totalVersesRead.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getTrendIcon(totalVersesRead, totalVersesRead - 100)}
                    <span className={getTrendColor(totalVersesRead, totalVersesRead - 100)}>
                      {((totalVersesRead / 6236) * 100).toFixed(1)}% of Quran
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Reading Time</CardTitle>
                    <Clock className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{formatTime(totalReadingTime)}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getTrendIcon(totalReadingTime, totalReadingTime - 3600)}
                    <span className={getTrendColor(totalReadingTime, totalReadingTime - 3600)}>
                      This week: {formatTime(weeklyStats.reduce((sum, day) => sum + day.readingTime, 0))}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Learning Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-500">{productivityScore}</div>
                  <Progress value={productivityScore} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Overall Progress
                  </CardTitle>
                  <CardDescription>Your journey through the Holy Quran</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Quran Completion</span>
                        <span>{overallProgress.completionPercentage}%</span>
                      </div>
                      <Progress value={overallProgress.completionPercentage} className="h-3" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-3xl font-bold text-primary">{overallProgress.completedSurahs}</p>
                        <p className="text-xs text-muted-foreground">of 114 Surahs</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-primary">{overallProgress.completedJuz}</p>
                        <p className="text-xs text-muted-foreground">of 30 Juz</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    This Week's Activity
                  </CardTitle>
                  <CardDescription>Your daily reading patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="verses" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Recent Achievements
                </CardTitle>
                <CardDescription>Your latest accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.filter(a => a.earned).slice(0, 3).map((achievement) => {
                    const Icon = achievement.icon
                    return (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Earned {achievement.date}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reading Trends</CardTitle>
                  <CardDescription>Your reading activity over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="verses" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="time" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Surah Progress</CardTitle>
                  <CardDescription>Completion status by surah</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={surahProgress}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, completed }) => `${name}: ${completed}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="completed"
                      >
                        {surahProgress.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Breakdown</CardTitle>
                  <CardDescription>Daily reading statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="verses" fill="#8884d8" />
                      <Bar dataKey="time" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reading Habits</CardTitle>
                  <CardDescription>When you prefer to read</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {readingHabits.map((habit, index) => (
                      <div key={habit.time} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{habit.time}</span>
                          <span>{habit.verses} verses ({habit.percentage}%)</span>
                        </div>
                        <Progress value={habit.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Habits Tab */}
          <TabsContent value="habits" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Reading Habits Analysis
                </CardTitle>
                <CardDescription>Understanding your reading patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">Favorite Time</h3>
                    <p className="text-sm text-muted-foreground capitalize">{habits.favoriteTime}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">Average Session</h3>
                    <p className="text-sm text-muted-foreground">{formatTime(habits.averageSession)}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">Consistency</h3>
                    <p className="text-sm text-muted-foreground">{habits.consistencyScore}%</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Consistency Score</span>
                      <span>{habits.consistencyScore}%</span>
                    </div>
                    <Progress value={habits.consistencyScore} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Most Read Division</span>
                      <Badge variant="secondary" className="capitalize">{habits.mostReadDivision}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Earned Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements.filter(a => a.earned).map((achievement) => {
                      const Icon = achievement.icon
                      return (
                        <div key={achievement.id} className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                          <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Earned {achievement.date}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Earned
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-muted-foreground" />
                    Upcoming Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements.filter(a => !a.earned).map((achievement) => {
                      const Icon = achievement.icon
                      return (
                        <div key={achievement.id} className="flex items-center gap-3 p-3 border border-dashed border-muted-foreground/30 rounded-lg">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-muted-foreground">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
