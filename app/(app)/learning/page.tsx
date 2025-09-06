'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Clock, 
  Star,
  CheckCircle,
  Play,
  Lock,
  ArrowRight,
  BookMarked,
  Users,
  Award,
  TrendingUp,
  Calendar,
  Hash,
  Layers,
  FileText,
  Sparkles,
  Brain,
  Heart,
  Shield
} from 'lucide-react'
import Link from 'next/link'

interface LearningModule {
  id: string
  title: string
  description: string
  icon: any
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  progress: number
  completed: boolean
  locked: boolean
  lessons: Lesson[]
  color: string
}

interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  completed: boolean
  locked: boolean
  type: 'reading' | 'memorization' | 'study' | 'quiz'
}

const learningModules: LearningModule[] = [
  {
    id: 'arabic-basics',
    title: 'Arabic Basics',
    description: 'Learn the fundamentals of Arabic script and pronunciation',
    icon: BookOpen,
    level: 'beginner',
    duration: '2 weeks',
    progress: 75,
    completed: false,
    locked: false,
    color: 'text-blue-500',
    lessons: [
      { id: 'alphabet', title: 'Arabic Alphabet', description: 'Learn the 28 letters', duration: '30 min', completed: true, locked: false, type: 'reading' },
      { id: 'pronunciation', title: 'Pronunciation Guide', description: 'Master correct pronunciation', duration: '45 min', completed: true, locked: false, type: 'study' },
      { id: 'basic-words', title: 'Basic Words', description: 'Common Quranic vocabulary', duration: '1 hour', completed: false, locked: false, type: 'memorization' },
      { id: 'quiz-1', title: 'Alphabet Quiz', description: 'Test your knowledge', duration: '15 min', completed: false, locked: false, type: 'quiz' }
    ]
  },
  {
    id: 'quran-reading',
    title: 'Quran Reading',
    description: 'Learn to read the Quran with proper tajweed',
    icon: BookMarked,
    level: 'beginner',
    duration: '4 weeks',
    progress: 40,
    completed: false,
    locked: false,
    color: 'text-green-500',
    lessons: [
      { id: 'tajweed-basics', title: 'Tajweed Basics', description: 'Introduction to tajweed rules', duration: '1 hour', completed: true, locked: false, type: 'study' },
      { id: 'short-surahs', title: 'Short Surahs', description: 'Practice with Al-Fatiha and short surahs', duration: '2 hours', completed: false, locked: false, type: 'reading' },
      { id: 'memorization', title: 'Memorization', description: 'Memorize key verses', duration: '3 hours', completed: false, locked: false, type: 'memorization' },
      { id: 'recitation', title: 'Recitation Practice', description: 'Practice recitation with audio', duration: '2 hours', completed: false, locked: false, type: 'reading' }
    ]
  },
  {
    id: 'translation-study',
    title: 'Translation Study',
    description: 'Deep dive into Quranic meanings and interpretations',
    icon: Brain,
    level: 'intermediate',
    duration: '6 weeks',
    progress: 20,
    completed: false,
    locked: false,
    color: 'text-purple-500',
    lessons: [
      { id: 'translation-methods', title: 'Translation Methods', description: 'Understanding different approaches', duration: '1 hour', completed: false, locked: false, type: 'study' },
      { id: 'context-study', title: 'Contextual Study', description: 'Historical and cultural context', duration: '2 hours', completed: false, locked: false, type: 'study' },
      { id: 'thematic-study', title: 'Thematic Study', description: 'Study by themes and topics', duration: '3 hours', completed: false, locked: false, type: 'study' },
      { id: 'comparative-study', title: 'Comparative Study', description: 'Compare different translations', duration: '2 hours', completed: false, locked: false, type: 'study' }
    ]
  },
  {
    id: 'memorization',
    title: 'Memorization Program',
    description: 'Systematic approach to memorizing the Quran',
    icon: Heart,
    level: 'intermediate',
    duration: '12 weeks',
    progress: 10,
    completed: false,
    locked: false,
    color: 'text-orange-500',
    lessons: [
      { id: 'memorization-techniques', title: 'Memorization Techniques', description: 'Learn effective memorization methods', duration: '1 hour', completed: false, locked: false, type: 'study' },
      { id: 'juz-1', title: 'Juz 1 - Al-Fatiha to Al-Baqarah', description: 'First part of the Quran', duration: '4 weeks', completed: false, locked: false, type: 'memorization' },
      { id: 'review-system', title: 'Review System', description: 'Spaced repetition for retention', duration: '2 hours', completed: false, locked: false, type: 'memorization' },
      { id: 'recitation-test', title: 'Recitation Test', description: 'Test your memorization', duration: '1 hour', completed: false, locked: false, type: 'quiz' }
    ]
  },
  {
    id: 'advanced-studies',
    title: 'Advanced Studies',
    description: 'Scholarly research and advanced Quranic studies',
    icon: Shield,
    level: 'advanced',
    duration: '8 weeks',
    progress: 0,
    completed: false,
    locked: true,
    color: 'text-red-500',
    lessons: [
      { id: 'tafsir-study', title: 'Tafsir Study', description: 'Classical commentary study', duration: '3 hours', completed: false, locked: true, type: 'study' },
      { id: 'linguistic-analysis', title: 'Linguistic Analysis', description: 'Deep linguistic study', duration: '4 hours', completed: false, locked: true, type: 'study' },
      { id: 'research-methods', title: 'Research Methods', description: 'Academic research techniques', duration: '2 hours', completed: false, locked: true, type: 'study' },
      { id: 'thesis-project', title: 'Thesis Project', description: 'Independent research project', duration: '6 hours', completed: false, locked: true, type: 'study' }
    ]
  }
]

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState('modules')
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null)

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reading': return BookOpen
      case 'memorization': return Heart
      case 'study': return Brain
      case 'quiz': return Trophy
      default: return BookOpen
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reading': return 'text-blue-500'
      case 'memorization': return 'text-orange-500'
      case 'study': return 'text-purple-500'
      case 'quiz': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const overallProgress = learningModules.reduce((sum, module) => sum + module.progress, 0) / learningModules.length
  const completedModules = learningModules.filter(module => module.completed).length
  const totalLessons = learningModules.reduce((sum, module) => sum + module.lessons.length, 0)
  const completedLessons = learningModules.reduce((sum, module) => 
    sum + module.lessons.filter(lesson => lesson.completed).length, 0
  )

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Learning Center</h1>
          <p className="text-muted-foreground">Structured curriculum for your Quran learning journey</p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Overall Progress</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{Math.round(overallProgress)}%</div>
              <Progress value={overallProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <CardTitle className="text-lg">Completed</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{completedModules}</div>
              <p className="text-sm text-muted-foreground">of {learningModules.length} modules</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-lg">Lessons</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{completedLessons}</div>
              <p className="text-sm text-muted-foreground">of {totalLessons} lessons</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                <CardTitle className="text-lg">Study Time</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">24h</div>
              <p className="text-sm text-muted-foreground">this month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="modules">Learning Modules</TabsTrigger>
            <TabsTrigger value="path">Learning Path</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Learning Modules */}
          <TabsContent value="modules" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {learningModules.map((module) => {
                const Icon = module.icon
                return (
                  <Card 
                    key={module.id} 
                    className={`hover:shadow-lg transition-shadow cursor-pointer ${
                      module.locked ? 'opacity-60' : ''
                    }`}
                    onClick={() => !module.locked && setSelectedModule(module)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center ${module.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {module.title}
                              {module.locked && <Lock className="w-4 h-4 text-muted-foreground" />}
                            </CardTitle>
                            <CardDescription>{module.description}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getLevelColor(module.level)}>
                          {module.level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{module.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              <span>{module.lessons.length} lessons</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            <span>{module.progress}%</span>
                          </div>
                        </div>
                        
                        <Progress value={module.progress} className="h-2" />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {module.completed ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                            )}
                            <span className="text-sm">
                              {module.completed ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={module.locked}
                          >
                            {module.locked ? 'Locked' : 'Continue'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Learning Path */}
          <TabsContent value="path" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recommended Learning Path
                </CardTitle>
                <CardDescription>Follow this structured path for optimal learning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {learningModules.map((module, index) => {
                    const Icon = module.icon
                    const isCompleted = module.completed
                    const isCurrent = index === 0 || (learningModules[index - 1]?.completed && !isCompleted)
                    
                    return (
                      <div key={module.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-green-500 text-white' : 
                            isCurrent ? 'bg-primary text-primary-foreground' : 
                            'bg-muted text-muted-foreground'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <span className="text-sm font-bold">{index + 1}</span>
                            )}
                          </div>
                          {index < learningModules.length - 1 && (
                            <div className={`w-0.5 h-8 mt-2 ${
                              isCompleted ? 'bg-green-500' : 'bg-muted'
                            }`} />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <Card className={`${
                            isCurrent ? 'border-primary bg-primary/5' : ''
                          }`}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center ${module.color}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{module.title}</CardTitle>
                                  <CardDescription>{module.description}</CardDescription>
                                </div>
                                <Badge className={getLevelColor(module.level)}>
                                  {module.level}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{module.duration}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{module.lessons.length} lessons</span>
                                  </div>
                                </div>
                                <Button 
                                  variant={isCurrent ? "default" : "outline"}
                                  size="sm"
                                  disabled={!isCurrent && !isCompleted}
                                >
                                  {isCompleted ? 'Completed' : isCurrent ? 'Start' : 'Locked'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements */}
          <TabsContent value="achievements" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">First Steps</CardTitle>
                      <CardDescription>Complete your first lesson</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Earned
                    </Badge>
                    <span className="text-sm text-muted-foreground">2 days ago</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Dedicated Learner</CardTitle>
                      <CardDescription>Study for 7 consecutive days</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      <Clock className="w-3 h-3 mr-1" />
                      In Progress
                    </Badge>
                    <span className="text-sm text-muted-foreground">5/7 days</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Memory Master</CardTitle>
                      <CardDescription>Memorize 10 verses</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                    <span className="text-sm text-muted-foreground">0/10 verses</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Module Detail Modal */}
        {selectedModule && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center ${selectedModule.color}`}>
                      <selectedModule.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle>{selectedModule.title}</CardTitle>
                      <CardDescription>{selectedModule.description}</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedModule(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {selectedModule.lessons.map((lesson, index) => {
                      const LessonIcon = getTypeIcon(lesson.type)
                      return (
                        <div key={lesson.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${getTypeColor(lesson.type)}`}>
                            <LessonIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{lesson.title}</h4>
                            <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{lesson.duration}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {lesson.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {lesson.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : lesson.locked ? (
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <Button size="sm">
                                <Play className="w-4 h-4 mr-2" />
                                Start
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
