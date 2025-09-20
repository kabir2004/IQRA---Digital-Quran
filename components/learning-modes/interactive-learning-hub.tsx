'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Brain, 
  Gamepad2, 
  Target, 
  Clock, 
  Users,
  Trophy,
  Zap,
  Star,
  PlayCircle,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  Lightbulb,
  Flame,
  Medal,
  BookOpen,
  Mic,
  Volume2,
  Timer,
  Award,
  TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"

// Import our systems
import { useLearningGameStore } from "@/lib/gamification/learning-game-engine"
import { useVoiceLearningStore } from "@/lib/ai/voice-learning-engine"
import { useQariTTS } from "@/lib/ai/elevenlabs-tts"
import { useSpeechRecognition } from "@/lib/ai/speech-recognition-engine"

interface LearningMode {
  id: string
  name: string
  description: string
  icon: any
  difficulty: 1 | 2 | 3 | 4 | 5
  estimatedTime: number // minutes
  xpReward: number
  category: 'skill_building' | 'practice' | 'challenge' | 'competition'
  prerequisites?: string[]
  isLocked?: boolean
}

const LEARNING_MODES: LearningMode[] = [
  {
    id: 'pronunciation_dojo',
    name: 'Pronunciation Dojo',
    description: 'Master individual Arabic letters with AI feedback',
    icon: Target,
    difficulty: 2,
    estimatedTime: 15,
    xpReward: 200,
    category: 'skill_building'
  },
  {
    id: 'tajweed_academy',
    name: 'Tajweed Academy',
    description: 'Learn and practice Tajweed rules systematically',
    icon: Star,
    difficulty: 3,
    estimatedTime: 25,
    xpReward: 350,
    category: 'skill_building'
  },
  {
    id: 'speed_reading',
    name: 'Speed Reading Challenge',
    description: 'Race against time while maintaining accuracy',
    icon: Zap,
    difficulty: 4,
    estimatedTime: 10,
    xpReward: 300,
    category: 'challenge'
  },
  {
    id: 'memory_master',
    name: 'Memory Master',
    description: 'Memorize and recite verses from memory',
    icon: Brain,
    difficulty: 4,
    estimatedTime: 30,
    xpReward: 500,
    category: 'skill_building'
  },
  {
    id: 'rhythm_flow',
    name: 'Rhythm & Flow',
    description: 'Perfect your recitation rhythm and natural pauses',
    icon: Volume2,
    difficulty: 3,
    estimatedTime: 20,
    xpReward: 250,
    category: 'practice'
  },
  {
    id: 'community_challenge',
    name: 'Community Challenge',
    description: 'Compete with learners worldwide in real-time',
    icon: Users,
    difficulty: 5,
    estimatedTime: 45,
    xpReward: 750,
    category: 'competition'
  }
]

export function InteractiveLearningHub() {
  const [selectedMode, setSelectedMode] = useState<LearningMode | null>(null)
  const [currentSession, setCurrentSession] = useState<any>(null)
  const [isActive, setIsActive] = useState(false)

  // Store hooks
  const {
    playerStats,
    currentQuests,
    addXP,
    updateProgress,
    checkStreakStatus,
    studyStreak
  } = useLearningGameStore()

  const {
    currentSession: voiceSession,
    startSession,
    endSession
  } = useVoiceLearningStore()

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header with player stats */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-primary" />
                Interactive Learning Hub
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Choose your adventure and level up your Quranic skills!
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{playerStats.totalXP.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{studyStreak.currentStreak}</div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{playerStats.currentLevel}</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Learning Mode Selection */}
      {!selectedMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEARNING_MODES.map((mode) => (
            <LearningModeCard
              key={mode.id}
              mode={mode}
              onSelect={() => setSelectedMode(mode)}
              playerLevel={playerStats.currentLevel}
            />
          ))}
        </div>
      )}

      {/* Active Learning Mode */}
      {selectedMode && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setSelectedMode(null)}
              >
                ← Back to Hub
              </Button>
              <div className="flex items-center gap-2">
                <selectedMode.icon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">{selectedMode.name}</h2>
                <Badge variant="secondary">
                  {['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'][selectedMode.difficulty - 1]}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {selectedMode.estimatedTime} min
              <Trophy className="w-4 h-4 ml-2" />
              {selectedMode.xpReward} XP
            </div>
          </div>

          <LearningModeRenderer
            mode={selectedMode}
            onComplete={(results) => {
              // Handle completion
              addXP(results.xpEarned, selectedMode.id)
              checkStreakStatus()
              setSelectedMode(null)
            }}
          />
        </div>
      )}
    </div>
  )
}

interface LearningModeCardProps {
  mode: LearningMode
  onSelect: () => void
  playerLevel: number
}

function LearningModeCard({ mode, onSelect, playerLevel }: LearningModeCardProps) {
  const isLocked = mode.prerequisites && mode.prerequisites.some(req => playerLevel < parseInt(req))
  
  const getDifficultyColor = (difficulty: number) => {
    const colors = ['text-green-500', 'text-yellow-500', 'text-orange-500', 'text-red-500', 'text-purple-500']
    return colors[difficulty - 1]
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn(
          "cursor-pointer border-2 transition-all duration-300",
          isLocked 
            ? "opacity-50 cursor-not-allowed border-muted" 
            : "border-transparent hover:border-primary/50 hover:shadow-lg"
        )}
        onClick={isLocked ? undefined : onSelect}
      >
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <mode.icon className="w-8 h-8 text-primary" />
          </div>
          
          <CardTitle className="flex items-center justify-center gap-2">
            {mode.name}
            {isLocked && <div className="text-lg">🔒</div>}
          </CardTitle>
          
          <p className="text-sm text-muted-foreground">{mode.description}</p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Difficulty:</span>
              <div className={cn("font-semibold", getDifficultyColor(mode.difficulty))}>
                {'★'.repeat(mode.difficulty)}{'☆'.repeat(5 - mode.difficulty)}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>Duration:</span>
              <span className="font-medium">{mode.estimatedTime} min</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>XP Reward:</span>
              <span className="font-medium text-primary">+{mode.xpReward}</span>
            </div>
            
            <Badge 
              variant="outline" 
              className="w-full justify-center"
            >
              {mode.category.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface LearningModeRendererProps {
  mode: LearningMode
  onComplete: (results: { xpEarned: number; accuracy: number; timeSpent: number }) => void
}

function LearningModeRenderer({ mode, onComplete }: LearningModeRendererProps) {
  switch (mode.id) {
    case 'pronunciation_dojo':
      return <PronunciationDojo onComplete={onComplete} />
    case 'tajweed_academy':
      return <TajweedAcademy onComplete={onComplete} />
    case 'speed_reading':
      return <SpeedReadingChallenge onComplete={onComplete} />
    case 'memory_master':
      return <MemoryMaster onComplete={onComplete} />
    case 'rhythm_flow':
      return <RhythmFlow onComplete={onComplete} />
    case 'community_challenge':
      return <CommunityChallenge onComplete={onComplete} />
    default:
      return <div>Learning mode not implemented yet</div>
  }
}

// Individual Learning Mode Components

function PronunciationDojo({ onComplete }: { onComplete: any }) {
  const [currentLetter, setCurrentLetter] = useState('ا')
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  const { generateExample } = useQariTTS()
  const { startRecording, stopRecording, analyzeRecording } = useSpeechRecognition()

  const arabicLetters = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر']

  const handlePractice = async () => {
    if (!isRecording) {
      await startRecording()
      setIsRecording(true)
      setFeedback('🎤 Pronounce the letter clearly...')
    } else {
      const audioBlob = await stopRecording()
      setIsRecording(false)
      setFeedback('🔄 Analyzing pronunciation...')
      
      // Simulate analysis
      setTimeout(() => {
        const accuracy = Math.floor(Math.random() * 40) + 60
        setScore(prev => prev + accuracy)
        setAttempts(prev => prev + 1)
        setFeedback(`Great! Accuracy: ${accuracy}%`)
        
        // Move to next letter
        setTimeout(() => {
          const currentIndex = arabicLetters.indexOf(currentLetter)
          if (currentIndex < arabicLetters.length - 1) {
            setCurrentLetter(arabicLetters[currentIndex + 1])
            setFeedback('')
          } else {
            onComplete({
              xpEarned: Math.round(score / attempts * 2),
              accuracy: score / attempts,
              timeSpent: attempts * 30
            })
          }
        }, 2000)
      }, 2000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Pronunciation Dojo</CardTitle>
        <p className="text-center text-muted-foreground">
          Master each Arabic letter with precise pronunciation
        </p>
      </CardHeader>
      
      <CardContent className="text-center space-y-6">
        <div className="space-y-4">
          <div className="text-8xl font-arabic text-primary">{currentLetter}</div>
          <div className="text-lg text-muted-foreground">
            Letter {arabicLetters.indexOf(currentLetter) + 1} of {arabicLetters.length}
          </div>
        </div>

        <Progress value={(arabicLetters.indexOf(currentLetter) + 1) / arabicLetters.length * 100} />

        <div className="space-y-4">
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => generateExample(currentLetter, 'isolated')}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Listen
            </Button>
            
            <Button
              onClick={handlePractice}
              className={isRecording ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {isRecording ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Practice
                </>
              )}
            </Button>
          </div>

          {feedback && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">{feedback}</p>
            </div>
          )}

          <div className="flex justify-center gap-6 text-sm">
            <div>Score: <span className="font-bold text-primary">{Math.round(score / Math.max(1, attempts))}</span></div>
            <div>Progress: <span className="font-bold text-blue-500">{attempts}/{arabicLetters.length}</span></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TajweedAcademy({ onComplete }: { onComplete: any }) {
  const [currentRule, setCurrentRule] = useState('ghunnah')
  const [progress, setProgress] = useState(0)

  const tajweedRules = [
    { id: 'ghunnah', name: 'Ghunnah', description: 'Nasal sound with م and ن' },
    { id: 'madd', name: 'Madd', description: 'Elongation rules' },
    { id: 'qalqalah', name: 'Qalqalah', description: 'Echo sound for certain letters' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tajweed Academy</CardTitle>
        <p className="text-muted-foreground">Master the art of beautiful recitation</p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-2">
              {tajweedRules.find(r => r.id === currentRule)?.name}
            </h3>
            <p className="text-muted-foreground">
              {tajweedRules.find(r => r.id === currentRule)?.description}
            </p>
          </div>

          <Progress value={progress} />

          <div className="text-center space-y-4">
            <div className="text-4xl font-arabic p-8 bg-muted/20 rounded-lg">
              الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            
            <div className="flex justify-center gap-4">
              <Button variant="outline">
                <Volume2 className="w-4 h-4 mr-2" />
                Example
              </Button>
              <Button>
                <Mic className="w-4 h-4 mr-2" />
                Practice
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={() => onComplete({ xpEarned: 350, accuracy: 85, timeSpent: 25 * 60 })}
            className="w-full"
          >
            Continue Learning
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SpeedReadingChallenge({ onComplete }: { onComplete: any }) {
  const [timeLeft, setTimeLeft] = useState(60)
  const [versesRead, setVersesRead] = useState(0)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      onComplete({
        xpEarned: versesRead * 50,
        accuracy: 90,
        timeSpent: 60
      })
    }
  }, [timeLeft, isActive, versesRead, onComplete])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Speed Reading Challenge
        </CardTitle>
        <p className="text-muted-foreground">Read as many verses as you can in 60 seconds!</p>
      </CardHeader>
      
      <CardContent className="text-center space-y-6">
        <div className="space-y-4">
          <div className="text-6xl font-bold text-primary">{timeLeft}s</div>
          <div className="text-xl">Verses Read: <span className="font-bold text-blue-500">{versesRead}</span></div>
        </div>

        <div className="text-3xl font-arabic p-6 bg-muted/20 rounded-lg leading-relaxed">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>

        {!isActive ? (
          <Button 
            size="lg" 
            onClick={() => setIsActive(true)}
            className="w-full"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Start Challenge
          </Button>
        ) : (
          <Button 
            size="lg" 
            onClick={() => setVersesRead(prev => prev + 1)}
            className="w-full"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Verse Complete
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function MemoryMaster({ onComplete }: { onComplete: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Master</CardTitle>
        <p className="text-muted-foreground">Memorize and recite from memory</p>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p>Memory training mode coming soon!</p>
          <Button 
            onClick={() => onComplete({ xpEarned: 500, accuracy: 95, timeSpent: 30 * 60 })}
            className="mt-4"
          >
            Complete Demo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RhythmFlow({ onComplete }: { onComplete: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rhythm & Flow</CardTitle>
        <p className="text-muted-foreground">Perfect your recitation rhythm</p>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p>Rhythm training mode coming soon!</p>
          <Button 
            onClick={() => onComplete({ xpEarned: 250, accuracy: 88, timeSpent: 20 * 60 })}
            className="mt-4"
          >
            Complete Demo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CommunityChallenge({ onComplete }: { onComplete: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Challenge</CardTitle>
        <p className="text-muted-foreground">Compete with learners worldwide</p>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p>Community challenges coming soon!</p>
          <Button 
            onClick={() => onComplete({ xpEarned: 750, accuracy: 92, timeSpent: 45 * 60 })}
            className="mt-4"
          >
            Complete Demo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}