'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Trophy, 
  Target, 
  Flame, 
  Star, 
  TrendingUp,
  Clock,
  BookOpen,
  Zap
} from "lucide-react"
import { useProgressStore } from "@/store/progress"
import Link from "next/link"

export function ReadingAchievements() {
  const {
    currentStreak,
    dailyGoal,
    achievements,
    totalVersesRead,
    getWeeklyStats,
    getProductivityScore,
    checkAchievements
  } = useProgressStore()

  const [showNotification, setShowNotification] = useState(false)
  const [recentAchievement, setRecentAchievement] = useState<any>(null)

  const weeklyStats = getWeeklyStats()
  const todayStats = weeklyStats[weeklyStats.length - 1]
  const productivityScore = getProductivityScore()
  const unlockedAchievements = achievements.filter(a => a.unlocked)

  // Check for new achievements
  useEffect(() => {
    const interval = setInterval(() => {
      checkAchievements()
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [checkAchievements])

  // Show achievement notification
  useEffect(() => {
    const latestAchievement = unlockedAchievements
      .filter(a => a.unlockedAt && Date.now() - a.unlockedAt < 60000) // Last minute
      .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))[0]

    if (latestAchievement && latestAchievement !== recentAchievement) {
      setRecentAchievement(latestAchievement)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 5000)
    }
  }, [unlockedAchievements, recentAchievement])

  const getDailyGoalProgress = () => {
    const progress = (todayStats?.versesRead || 0) / dailyGoal
    return Math.min(progress * 100, 100)
  }

  return (
    <>
      {/* Achievement Notification */}
      {showNotification && recentAchievement && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-500">
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{recentAchievement.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Achievement Unlocked!
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {recentAchievement.title}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Action Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-40">
        <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              {/* Progress Metrics */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">{currentStreak}</span>
                  <span className="text-xs text-muted-foreground">streak</span>
                </div>

                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{todayStats?.versesRead || 0}/{dailyGoal}</span>
                  <span className="text-xs text-muted-foreground">goal</span>
                </div>

                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">{totalVersesRead.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">total</span>
                </div>

                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">{productivityScore}</span>
                  <span className="text-xs text-muted-foreground">score</span>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="flex items-center gap-2">
                {unlockedAchievements.slice(-3).map((achievement) => (
                  <Badge key={achievement.id} variant="secondary" className="text-xs">
                    {achievement.icon} {achievement.title}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <Star className="w-4 h-4 mr-1" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Daily Goal Progress */}
            <div className="mt-2">
              <div className="w-full bg-muted rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-500"
                  style={{ width: `${getDailyGoalProgress()}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}