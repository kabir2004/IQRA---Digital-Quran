'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts'
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  Star,
  Brain,
  Mic,
  Volume2,
  Calendar,
  Trophy,
  Flame,
  CheckCircle,
  AlertCircle,
  BookOpen,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Lightbulb,
  Medal,
  Users,
  Eye
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Import our stores
import { useVoiceLearningStore } from "@/lib/ai/voice-learning-engine"
import { useLearningGameStore } from "@/lib/gamification/learning-game-engine"
import { useProgressStore } from "@/store/progress"

interface VoiceLearningDashboardProps {
  className?: string
}

export function VoiceLearningDashboard({ className }: VoiceLearningDashboardProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week')
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'consistency' | 'improvement'>('accuracy')

  // Store data
  const {
    completedSessions,
    overallProgress,
    voiceAchievements,
    currentStreak,
    longestStreak
  } = useVoiceLearningStore()

  const {
    playerStats,
    studyStreak
  } = useLearningGameStore()

  const {
    getWeeklyStats,
    getMonthlyStats,
    getReadingHabits
  } = useProgressStore()

  // Calculate analytics
  const weeklyStats = getWeeklyStats()
  const monthlyStats = getMonthlyStats()
  const habits = getReadingHabits()

  const progressAnalytics = useMemo(() => {
    const recentSessions = completedSessions.slice(-30) // Last 30 sessions
    
    const accuracyTrend = recentSessions.map((session, index) => ({
      session: index + 1,
      accuracy: session.finalScore,
      tajweed: session.attempts[session.attempts.length - 1]?.scores.tajweed || 0,
      pronunciation: session.attempts[session.attempts.length - 1]?.scores.pronunciation || 0,
      date: new Date(session.startTime).toLocaleDateString()
    }))

    const skillBreakdown = [
      { skill: 'Pronunciation', score: overallProgress.pronunciationScore || 75, color: '#3b82f6' },
      { skill: 'Tajweed', score: overallProgress.tajweedScore || 68, color: '#10b981' },
      { skill: 'Rhythm', score: overallProgress.rhythmScore || 82, color: '#f59e0b' },
      { skill: 'Fluency', score: overallProgress.fluencyScore || 71, color: '#ef4444' },
      { skill: 'Clarity', score: overallProgress.clarityScore || 89, color: '#8b5cf6' }
    ]

    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dayStats = weeklyStats.find(stat => stat.date === date.toISOString().split('T')[0])
      
      return {
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        sessions: dayStats?.sessionsCount || 0,
        accuracy: Math.floor(Math.random() * 20) + 75, // Mock data
        practiceTime: dayStats?.readingTime || 0
      }
    })

    return {
      accuracyTrend,
      skillBreakdown,
      weeklyProgress,
      totalSessions: completedSessions.length,
      averageAccuracy: recentSessions.reduce((sum, s) => sum + s.finalScore, 0) / Math.max(1, recentSessions.length),
      improvementRate: calculateImprovementRate(recentSessions),
      consistencyScore: habits.consistencyScore
    }
  }, [completedSessions, overallProgress, weeklyStats, habits])

  const unlockedAchievements = voiceAchievements.filter(a => a.unlocked)
  const nextAchievements = voiceAchievements.filter(a => !a.unlocked).slice(0, 3)

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Overall Score"
          value={Math.round(progressAnalytics.averageAccuracy)}
          suffix="%"
          icon={Target}
          trend={progressAnalytics.improvementRate}
          color="blue"
        />
        <StatsCard
          title="Study Streak"
          value={currentStreak}
          suffix="days"
          icon={Flame}
          trend={currentStreak >= longestStreak ? 100 : 0}
          color="orange"
        />
        <StatsCard
          title="Sessions"
          value={progressAnalytics.totalSessions}
          icon={Mic}
          trend={20}
          color="green"
        />
        <StatsCard
          title="Consistency"
          value={progressAnalytics.consistencyScore}
          suffix="%"
          icon={Clock}
          trend={10}
          color="purple"
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accuracy Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Accuracy Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressAnalytics.accuracyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="session" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressAnalytics.weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {completedSessions.slice(-10).reverse().map((session, index) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-primary" />
                  Skill Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={progressAnalytics.skillBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ skill, score }) => `${skill}: ${score}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="score"
                    >
                      {progressAnalytics.skillBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skill Progress Bars */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Skill Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {progressAnalytics.skillBreakdown.map((skill) => (
                  <div key={skill.skill} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{skill.skill}</span>
                      <span className="text-sm font-semibold">{skill.score}%</span>
                    </div>
                    <Progress value={skill.score} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Needs Work</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Skill Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                AI Skill Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generateSkillRecommendations(progressAnalytics.skillBreakdown).map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", 
                        rec.priority === 'high' ? 'bg-red-500' : 
                        rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      )} />
                      <span className="font-semibold">{rec.skill}</span>
                      <Badge variant="outline" className="text-xs">
                        {rec.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                    <div className="text-xs text-blue-600">
                      Expected improvement: {rec.expectedImprovement}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {/* Learning Journey Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <LearningTimeline sessions={completedSessions.slice(-5)} />
            </CardContent>
          </Card>

          {/* Goal Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GoalCard
              title="Daily Practice"
              current={Math.floor(Math.random() * 8) + 2}
              target={10}
              unit="verses"
              icon={BookOpen}
              color="blue"
            />
            <GoalCard
              title="Weekly Sessions"
              current={5}
              target={7}
              unit="sessions"
              icon={Calendar}
              color="green"
            />
            <GoalCard
              title="Accuracy Goal"
              current={Math.round(progressAnalytics.averageAccuracy)}
              target={90}
              unit="%"
              icon={Target}
              color="purple"
            />
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unlocked Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Unlocked Achievements ({unlockedAchievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {unlockedAchievements.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} unlocked />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Next Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-gray-500" />
                  Next Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nextAchievements.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} unlocked={false} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <AIInsightsPanel 
            analytics={progressAnalytics}
            recentSessions={completedSessions.slice(-10)}
            playerStats={playerStats}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Supporting Components

interface StatsCardProps {
  title: string
  value: number
  suffix?: string
  icon: any
  trend?: number
  color: 'blue' | 'green' | 'orange' | 'purple'
}

function StatsCard({ title, value, suffix = '', icon: Icon, trend = 0, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
    green: 'text-green-600 bg-green-100 dark:bg-green-900',
    orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {value.toLocaleString()}{suffix}
            </p>
            {trend !== 0 && (
              <p className={cn("text-xs flex items-center gap-1 mt-1",
                trend > 0 ? "text-green-600" : "text-red-600"
              )}>
                <TrendingUp className="w-3 h-3" />
                {trend > 0 ? '+' : ''}{trend}%
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-full", colorClasses[color])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SessionCard({ session }: { session: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center",
          session.finalScore >= 90 ? "bg-green-100 text-green-600" :
          session.finalScore >= 80 ? "bg-blue-100 text-blue-600" :
          session.finalScore >= 70 ? "bg-yellow-100 text-yellow-600" :
          "bg-red-100 text-red-600"
        )}>
          {session.finalScore >= 80 ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        </div>
        <div>
          <p className="font-medium">Surah {session.surah}, Ayah {session.ayah}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(session.startTime).toLocaleDateString()} • {session.attempts.length} attempts
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">{session.finalScore}%</p>
        <p className="text-sm text-muted-foreground">
          {Math.round((session.endTime - session.startTime) / 1000 / 60)}m
        </p>
      </div>
    </motion.div>
  )
}

function AchievementCard({ achievement, unlocked }: { achievement: any; unlocked: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg border",
      unlocked ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20" : "bg-muted/20 opacity-60"
    )}>
      <div className="text-2xl">{unlocked ? achievement.icon : '🔒'}</div>
      <div className="flex-1">
        <p className="font-semibold">{achievement.title}</p>
        <p className="text-sm text-muted-foreground">{achievement.description}</p>
        {unlocked && achievement.unlockedAt && (
          <p className="text-xs text-green-600 mt-1">
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
      {achievement.xpReward && (
        <Badge variant="secondary">+{achievement.xpReward} XP</Badge>
      )}
    </div>
  )
}

function LearningTimeline({ sessions }: { sessions: any[] }) {
  return (
    <div className="space-y-4">
      {sessions.reverse().map((session, index) => (
        <div key={session.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center",
              session.finalScore >= 85 ? "bg-green-500" : 
              session.finalScore >= 70 ? "bg-yellow-500" : "bg-red-500"
            )}>
              <span className="text-white text-xs font-bold">{index + 1}</span>
            </div>
            {index < sessions.length - 1 && <div className="w-px h-8 bg-border mt-2" />}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Surah {session.surah}, Ayah {session.ayah}</h4>
              <Badge variant={session.finalScore >= 85 ? "default" : "secondary"}>
                {session.finalScore}%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(session.startTime).toLocaleDateString()} • 
              {session.attempts.length} attempts • 
              {Math.round((session.endTime - session.startTime) / 1000 / 60)} minutes
            </p>
            {session.aiAnalysis?.overallAssessment && (
              <p className="text-sm mt-2 p-2 bg-muted/30 rounded text-muted-foreground">
                {session.aiAnalysis.overallAssessment}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function GoalCard({ title, current, target, unit, icon: Icon, color }: any) {
  const progress = (current / target) * 100
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <span className="font-medium">{title}</span>
          </div>
          <Badge variant={progress >= 100 ? "default" : "secondary"}>
            {current}/{target} {unit}
          </Badge>
        </div>
        <Progress value={progress} className="mb-2" />
        <p className="text-sm text-muted-foreground">
          {progress >= 100 ? 'Goal achieved! 🎉' : `${Math.round(progress)}% complete`}
        </p>
      </CardContent>
    </Card>
  )
}

function AIInsightsPanel({ analytics, recentSessions, playerStats }: any) {
  const insights = generateAIInsights(analytics, recentSessions, playerStats)
  
  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Overall Assessment</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">{insights.overallAssessment}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">Strengths 💪</h4>
              {insights.strengths.map((strength: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-orange-600">Growth Areas 🎯</h4>
              {insights.improvementAreas.map((area: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-orange-500" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Personalized Study Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.recommendations.map((rec: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{rec.title}</h4>
                  <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                    {rec.priority} priority
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {rec.timeEstimate} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {rec.expectedImprovement}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Utility functions
function calculateImprovementRate(sessions: any[]): number {
  if (sessions.length < 2) return 0
  
  const firstHalf = sessions.slice(0, Math.floor(sessions.length / 2))
  const secondHalf = sessions.slice(Math.floor(sessions.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, s) => sum + s.finalScore, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, s) => sum + s.finalScore, 0) / secondHalf.length
  
  return Math.round(((secondAvg - firstAvg) / firstAvg) * 100)
}

function generateSkillRecommendations(skills: any[]) {
  return skills
    .filter(skill => skill.score < 85)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(skill => ({
      skill: skill.skill,
      priority: skill.score < 65 ? 'high' : skill.score < 75 ? 'medium' : 'low',
      recommendation: `Focus on ${skill.skill.toLowerCase()} exercises to improve accuracy and understanding`,
      expectedImprovement: `+${Math.round((85 - skill.score) * 0.3)}% in 2 weeks`
    }))
}

function generateAIInsights(analytics: any, sessions: any[], playerStats: any) {
  return {
    overallAssessment: `Your learning journey shows ${analytics.improvementRate > 0 ? 'positive' : 'steady'} progress with ${analytics.averageAccuracy.toFixed(0)}% average accuracy. Your consistency has been ${analytics.consistencyScore > 70 ? 'excellent' : 'good'}, completing ${analytics.totalSessions} practice sessions.`,
    strengths: [
      'Consistent daily practice',
      'Strong pronunciation fundamentals',
      'Good rhythm and pacing'
    ],
    improvementAreas: [
      'Tajweed rule application',
      'Letter articulation precision',
      'Emotional delivery'
    ],
    recommendations: [
      {
        title: 'Daily Tajweed Practice',
        description: 'Spend 15 minutes daily on specific Tajweed rules',
        priority: 'high',
        timeEstimate: 15,
        expectedImprovement: '+12% Tajweed accuracy'
      },
      {
        title: 'Pronunciation Drill',
        description: 'Practice difficult Arabic letters with focused exercises',
        priority: 'medium',
        timeEstimate: 10,
        expectedImprovement: '+8% pronunciation clarity'
      }
    ]
  }
}