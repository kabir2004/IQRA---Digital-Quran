'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VercelCard, VercelCardContent, VercelCardDescription, VercelCardHeader, VercelCardTitle } from "@/components/ui/vercel-card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn, SlideIn, StaggeredList } from "@/components/transitions/page-transition"
import { 
  Trophy, 
  Target, 
  Clock, 
  BookOpen, 
  TrendingUp,
  Star,
  Award,
  Flame,
  Activity,
  Bookmark,
  Search,
  Settings
} from "lucide-react"
import Link from "next/link"
import { useProgressStore } from "@/store/progress"

export default function Dashboard() {
  const {
    totalReadingTime,
    totalVersesRead,
    currentStreak,
    bestStreak,
    dailyGoal,
    achievements,
    getOverallProgress,
    getWeeklyStats,
    getReadingHabits,
    getProductivityScore,
    getLearningInsights
  } = useProgressStore()

  const [activeTab, setActiveTab] = useState('home')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const overallProgress = getOverallProgress()
  const weeklyStats = getWeeklyStats()
  const habits = getReadingHabits()
  const productivityScore = getProductivityScore()
  const insights = getLearningInsights()

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const todayStats = weeklyStats[weeklyStats.length - 1]
  const weeklyReadingTime = weeklyStats.reduce((sum, day) => sum + day.readingTime, 0)
  const weeklyVersesRead = weeklyStats.reduce((sum, day) => sum + day.versesRead, 0)

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <FadeIn delay={100}>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
                  <p className="text-muted-foreground">Continue your Quran learning journey</p>
                </div>
                
                <TabsList className="grid w-auto grid-cols-4">
                  <TabsTrigger value="home">Overview</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>
              </div>
            </div>
          </FadeIn>

          {/* Main Dashboard Tab */}
          <TabsContent value="home" className="space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/read">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer border border-border h-full">
                  <CardHeader className="text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <CardTitle>Read Quran</CardTitle>
                    <CardDescription>Continue your reading journey</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/search">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer border border-border h-full">
                  <CardHeader className="text-center">
                    <Search className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <CardTitle>Search</CardTitle>
                    <CardDescription>Find verses and topics</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/bookmarks">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer border border-border h-full">
                  <CardHeader className="text-center">
                    <Bookmark className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <CardTitle>Bookmarks</CardTitle>
                    <CardDescription>Your saved verses</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/settings">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer border border-border h-full">
                  <CardHeader className="text-center">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Customize experience</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">{isClient ? currentStreak : 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Best: {isClient ? bestStreak : 0} days
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verses Read</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">{isClient ? totalVersesRead.toLocaleString() : '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    {isClient ? ((totalVersesRead / 6236) * 100).toFixed(1) : '0.0'}% of Quran
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reading Time</CardTitle>
                  <Clock className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{isClient ? formatTime(totalReadingTime) : '0m'}</div>
                  <p className="text-xs text-muted-foreground">
                    This week: {isClient ? formatTime(weeklyReadingTime) : '0m'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Learning Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-500">
                    {isClient ? productivityScore : 0}
                  </div>
                  <Progress value={isClient ? productivityScore : 0} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Today's Progress and Weekly Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Today's Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Daily Goal</span>
                      <span>{todayStats?.versesRead || 0}/{dailyGoal} verses</span>
                    </div>
                    <Progress value={((todayStats?.versesRead || 0) / dailyGoal) * 100} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Reading Time</span>
                    <Badge variant="secondary">{formatTime(todayStats?.readingTime || 0)}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Sessions</span>
                    <Badge variant="outline">{todayStats?.sessionsCount || 0}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Weekly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end space-x-1 h-20">
                    {weeklyStats.map((day, index) => {
                      const maxTime = Math.max(...weeklyStats.map(d => d.readingTime))
                      const height = maxTime > 0 ? Math.max((day.readingTime / maxTime) * 100, 8) : 8
                      const dayName = new Date(day.date).toLocaleDateString('en', { weekday: 'short' })
                      
                      return (
                        <div key={day.date} className="flex flex-col items-center space-y-1">
                          <div 
                            className={`w-8 rounded transition-colors ${
                              day.readingTime > 0 ? 'bg-primary' : 'bg-muted'
                            }`}
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{dayName}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {weeklyVersesRead} verses • {formatTime(weeklyReadingTime)} this week
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            {unlockedAchievements.length > 0 && (
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Recent Achievements
                  </CardTitle>
                  <CardDescription>Your latest accomplishments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {unlockedAchievements.slice(-5).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-2 px-3 py-2 bg-accent/50 rounded-lg">
                        <span className="text-lg">{achievement.icon}</span>
                        <span className="text-sm font-medium">{achievement.title}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
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
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-primary">{overallProgress.completedSurahs}</p>
                      <p className="text-xs text-muted-foreground">of 114 Surahs</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-primary">{overallProgress.completedJuz}</p>
                      <p className="text-xs text-muted-foreground">of 30 Juz</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-primary">{isClient ? Math.floor(totalReadingTime / 3600) : 0}</p>
                      <p className="text-xs text-muted-foreground">Hours Read</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-primary">{isClient ? totalVersesRead.toLocaleString() : '0'}</p>
                      <p className="text-xs text-muted-foreground">Verses Read</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Reading Habits</CardTitle>
                <CardDescription>Understanding your reading patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Favorite Reading Time</span>
                  <Badge variant="secondary" className="capitalize">{habits.favoriteTime}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Average Session</span>
                  <Badge variant="secondary">{formatTime(habits.averageSession)}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Most Read Division</span>
                  <Badge variant="secondary" className="capitalize">{habits.mostReadDivision}</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Consistency Score</span>
                    <span>{habits.consistencyScore}%</span>
                  </div>
                  <Progress value={habits.consistencyScore} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Unlocked ({unlockedAchievements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {unlockedAchievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    Upcoming ({achievements.filter(a => !a.unlocked).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.filter(a => !a.unlocked).map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3 p-3 rounded-lg border border-dashed border-muted-foreground/30">
                        <div className="text-2xl grayscale opacity-50">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-muted-foreground">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Star className="h-5 w-5" />
                    Your Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.strengths.length > 0 ? (
                      insights.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <p className="text-sm">{strength}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Keep reading to discover your strengths!</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Target className="h-5 w-5" />
                    Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.suggestions.length > 0 ? (
                      insights.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <p className="text-sm">{suggestion}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Great job! Keep up your excellent reading habits.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-600">
                    <Trophy className="h-5 w-5" />
                    Next Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.milestones.length > 0 ? (
                      insights.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          <p className="text-sm">{milestone}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Excellent progress! You're achieving great milestones.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Learning Score Breakdown</CardTitle>
                <CardDescription>How your score of {productivityScore}/100 is calculated</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Reading Consistency (40pts)</span>
                      <span>{Math.round((weeklyStats.filter(day => day.readingTime > 0).length / 7) * 40)}/40</span>
                    </div>
                    <Progress value={(weeklyStats.filter(day => day.readingTime > 0).length / 7) * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Daily Goal Achievement (20pts)</span>
                      <span>{Math.round(Math.min((weeklyStats.reduce((sum, day) => sum + day.versesRead, 0) / 7) / dailyGoal, 1) * 20)}/20</span>
                    </div>
                    <Progress value={Math.min((weeklyStats.reduce((sum, day) => sum + day.versesRead, 0) / 7) / dailyGoal, 1) * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Session Quality (20pts)</span>
                      <span>{Math.round(Math.min(habits.averageSession / 600, 1) * 20)}/20</span>
                    </div>
                    <Progress value={Math.min(habits.averageSession / 600, 1) * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Streak Bonus (20pts)</span>
                      <span>{isClient ? Math.round(Math.min(currentStreak / 30, 1) * 20) : 0}/20</span>
                    </div>
                    <Progress value={isClient ? Math.min(currentStreak / 30, 1) * 100 : 0} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

