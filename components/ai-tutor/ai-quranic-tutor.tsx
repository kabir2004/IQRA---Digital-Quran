'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Star, 
  Trophy, 
  Target,
  Brain,
  Heart,
  Lightbulb,
  Wand2,
  Sparkles,
  Medal,
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  Headphones
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Import our AI systems
import { useVoiceLearningStore } from "@/lib/ai/voice-learning-engine"
import { useQariTTS } from "@/lib/ai/elevenlabs-tts"
import { useSpeechRecognition } from "@/lib/ai/speech-recognition-engine"
import { useAIPronunciationAnalyzer } from "@/lib/ai/ai-pronunciation-analyzer"

interface AIQuranicTutorProps {
  surah: number
  ayah: number
  arabicText: string
  transliteration?: string
  translation?: string
  onProgress?: (progress: any) => void
  className?: string
}

export function AIQuranicTutor({ 
  surah, 
  ayah, 
  arabicText, 
  transliteration, 
  translation, 
  onProgress,
  className 
}: AIQuranicTutorProps) {
  // Store hooks
  const {
    currentSession,
    isRecording,
    isProcessing,
    learningLevel,
    preferredQari,
    startSession,
    endSession,
    submitPronunciation,
    getPersonalizedFeedback
  } = useVoiceLearningStore()

  // AI service hooks
  const { playRecitation, generateExample, stopPlayback, isLoading: ttsLoading, isPlaying } = useQariTTS()
  const { 
    initialize: initSpeech, 
    startRecording, 
    stopRecording, 
    analyzeRecording, 
    isInitialized, 
    isRecording: speechRecording, 
    isAnalyzing 
  } = useSpeechRecognition()
  const { analyzeRecitation, generateMotivation, explainTajweedRule, getRealTimeFeedback, isAnalyzing: aiAnalyzing, feedback } = useAIPronunciationAnalyzer()

  // Component state
  const [mode, setMode] = useState<'listen' | 'practice' | 'analyze' | 'feedback'>('listen')
  const [currentAttempt, setCurrentAttempt] = useState(0)
  const [showTajweedGuide, setShowTajweedGuide] = useState(false)
  const [realTimeFeedback, setRealTimeFeedback] = useState<string>('')
  const [highlightedText, setHighlightedText] = useState('')
  const [practiceScore, setPracticeScore] = useState(0)
  const [motivationalMessage, setMotivationalMessage] = useState('')
  const [isSessionActive, setIsSessionActive] = useState(false)
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recordingBlobRef = useRef<Blob | null>(null)

  // Initialize session when component mounts
  useEffect(() => {
    if (!isSessionActive && surah && ayah) {
      startSession(surah, ayah)
      setIsSessionActive(true)
      initSpeech()
    }

    return () => {
      if (isSessionActive) {
        endSession()
        stopPlayback()
      }
    }
  }, [surah, ayah, isSessionActive, startSession, endSession, stopPlayback, initSpeech])

  // Handle recording workflow
  const handleStartRecording = useCallback(async () => {
    try {
      if (!isInitialized) {
        await initSpeech()
      }
      
      await startRecording()
      setMode('practice')
      setRealTimeFeedback('🎤 Listening... Recite the verse clearly')
    } catch (error) {
      console.error('Failed to start recording:', error)
      setRealTimeFeedback('❌ Failed to start recording. Please check microphone permissions.')
    }
  }, [isInitialized, initSpeech, startRecording])

  const handleStopRecording = useCallback(async () => {
    try {
      const audioBlob = await stopRecording()
      recordingBlobRef.current = audioBlob
      setMode('analyze')
      setRealTimeFeedback('🔄 Analyzing your pronunciation...')
      
      // Start AI analysis
      await analyzeUserRecording(audioBlob)
    } catch (error) {
      console.error('Failed to stop recording:', error)
      setRealTimeFeedback('❌ Failed to analyze recording')
    }
  }, [stopRecording])

  // AI Analysis workflow
  const analyzeUserRecording = useCallback(async (audioBlob: Blob) => {
    try {
      const userHistory = {
        previousMistakes: [],
        strongAreas: ['pronunciation'],
        weakAreas: ['tajweed'],
        improvementRate: 0.1,
        sessionsCompleted: currentAttempt,
        averageScore: practiceScore
      }

      // Analyze with our AI system
      const result = await analyzeRecitation(
        audioBlob, 
        arabicText, 
        learningLevel, 
        userHistory,
        ['pronunciation', 'tajweed', 'rhythm']
      )
      
      // Update scores and feedback
      setPracticeScore(result.detailedAnalysis?.pronunciationAccuracy.overall || 0)
      
      // Generate motivational message
      const motivation = await generateMotivation(
        result.detailedAnalysis?.pronunciationAccuracy.overall || 0,
        result.detailedAnalysis?.rhythmAndFlow.improvements || [],
        learningLevel
      )
      setMotivationalMessage(motivation)
      
      setMode('feedback')
      setCurrentAttempt(prev => prev + 1)
      
      // Submit to voice learning store
      if (currentSession && audioBlob) {
        await submitPronunciation(audioBlob)
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      setRealTimeFeedback('❌ Analysis failed. Please try again.')
    }
  }, [analyzeRecitation, arabicText, learningLevel, currentAttempt, practiceScore, generateMotivation, currentSession, submitPronunciation])

  // Play master recitation
  const handlePlayMasterRecitation = useCallback(async () => {
    try {
      await playRecitation(arabicText, {
        qariId: preferredQari,
        emphasis: 'tajweed',
        onProgress: (progress) => {
          // Highlight text as it's being recited
          const textLength = arabicText.length
          const currentIndex = Math.floor((progress / 100) * textLength)
          setHighlightedText(arabicText.substring(0, currentIndex))
        }
      })
    } catch (error) {
      console.error('Failed to play recitation:', error)
    }
  }, [playRecitation, arabicText, preferredQari])

  // Generate pronunciation example for specific letter
  const handleLetterExample = useCallback(async (letter: string) => {
    try {
      await generateExample(letter, 'with_tajweed')
      setRealTimeFeedback(`🔊 Playing example for letter: ${letter}`)
    } catch (error) {
      console.error('Failed to generate example:', error)
    }
  }, [generateExample])

  // Reset session
  const handleReset = useCallback(() => {
    setMode('listen')
    setCurrentAttempt(0)
    setPracticeScore(0)
    setRealTimeFeedback('')
    setHighlightedText('')
    setMotivationalMessage('')
    recordingBlobRef.current = null
  }, [])

  const renderArabicTextWithHighlight = () => {
    if (!highlightedText) {
      return (
        <div className="text-4xl font-arabic leading-relaxed text-center p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border-2 border-primary/10">
          {arabicText.split('').map((char, index) => (
            <span
              key={index}
              className="cursor-pointer hover:bg-primary/20 rounded transition-colors px-1"
              onClick={() => handleLetterExample(char)}
            >
              {char}
            </span>
          ))}
        </div>
      )
    }

    return (
      <div className="text-4xl font-arabic leading-relaxed text-center p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border-2 border-primary/10">
        <span className="bg-primary text-primary-foreground rounded px-1">
          {highlightedText}
        </span>
        <span className="opacity-70">
          {arabicText.substring(highlightedText.length)}
        </span>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🌟'
    if (score >= 80) return '⭐'
    if (score >= 70) return '👍'
    if (score >= 60) return '💪'
    return '🔄'
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      {/* Header with Surah/Ayah info and controls */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <CardTitle>Surah {surah}, Ayah {ayah}</CardTitle>
                <Badge variant="outline" className="ml-2">
                  <Brain className="w-3 h-3 mr-1" />
                  AI Tutor
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Attempt: {currentAttempt}</span>
                <span>Level: {learningLevel}</span>
                {practiceScore > 0 && (
                  <span className={cn("font-semibold", getScoreColor(practiceScore))}>
                    Score: {practiceScore}% {getScoreEmoji(practiceScore)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Arabic Text Display */}
      <Card>
        <CardContent className="p-6">
          {renderArabicTextWithHighlight()}
          
          {transliteration && (
            <div className="text-center mt-4 text-lg text-muted-foreground">
              {transliteration}
            </div>
          )}
          
          {translation && (
            <div className="text-center mt-4 p-4 bg-muted/30 rounded-lg">
              <p className="text-base italic">{translation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Learning Interface */}
      <Tabs value={mode} onValueChange={(value) => setMode(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="listen" className="flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            Listen
          </TabsTrigger>
          <TabsTrigger value="practice" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Practice
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Analyze
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        {/* Listen Mode - Master Recitation */}
        <TabsContent value="listen" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-primary" />
                Master Qari Recitation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Button
                  onClick={handlePlayMasterRecitation}
                  disabled={ttsLoading || isPlaying}
                  className="w-32 h-32 rounded-full bg-primary hover:bg-primary/90"
                >
                  {isPlaying ? (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Pause className="w-8 h-8" />
                    </motion.div>
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </Button>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Listen carefully to the master recitation by {preferredQari}
                </p>
                <div className="flex items-center justify-center gap-4 text-xs">
                  <Badge variant="secondary">Tajweed Perfect</Badge>
                  <Badge variant="secondary">Slow & Clear</Badge>
                  <Badge variant="secondary">Educational</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practice Mode - Recording Interface */}
        <TabsContent value="practice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary" />
                Your Turn to Recite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <AnimatePresence mode="wait">
                  {!speechRecording ? (
                    <motion.div
                      key="start"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Button
                        onClick={handleStartRecording}
                        disabled={!isInitialized}
                        className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Mic className="w-8 h-8" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="recording"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Button
                        onClick={handleStopRecording}
                        className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 text-white relative"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          <MicOff className="w-8 h-8" />
                        </motion.div>
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-red-300"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="space-y-2">
                  <p className="text-base font-medium">
                    {speechRecording 
                      ? "🎤 Recording... Speak clearly and with confidence"
                      : "Tap the microphone to start recording your recitation"
                    }
                  </p>
                  
                  {realTimeFeedback && (
                    <Alert>
                      <AlertDescription>{realTimeFeedback}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Real-time visual feedback */}
              {speechRecording && (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <motion.div 
                      className="flex space-x-1"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 bg-red-500 rounded-full"
                          animate={{ 
                            height: [10, Math.random() * 40 + 10, 10] 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 0.5,
                            delay: i * 0.1 
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      AI is listening and analyzing in real-time...
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Mode - Processing */}
        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                AI Analysis in Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-16 h-16 mx-auto"
                >
                  <Brain className="w-16 h-16 text-primary" />
                </motion.div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Analyzing Your Recitation</h3>
                  <p className="text-muted-foreground">
                    Our AI is examining pronunciation, Tajweed rules, rhythm, and spiritual delivery...
                  </p>
                </div>
                
                <div className="space-y-3">
                  {[
                    'Analyzing pronunciation accuracy...',
                    'Checking Tajweed rule application...',
                    'Evaluating rhythm and flow...',
                    'Assessing emotional delivery...',
                    'Generating personalized feedback...'
                  ].map((step, index) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.5 }}
                      className="flex items-center gap-3 text-sm"
                    >
                      {aiAnalyzing && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          <Clock className="w-4 h-4 text-primary" />
                        </motion.div>
                      )}
                      <span>{step}</span>
                      {index < 3 && (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Mode - Results and Recommendations */}
        <TabsContent value="feedback" className="space-y-4">
          {feedback && (
            <>
              {/* Overall Score */}
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Your Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      <div className={cn("text-6xl font-bold", getScoreColor(practiceScore))}>
                        {practiceScore}%
                      </div>
                      <div className="text-2xl">
                        {getScoreEmoji(practiceScore)}
                      </div>
                    </div>
                    
                    <Progress value={practiceScore} className="w-full h-3" />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {feedback.detailedAnalysis?.pronunciationAccuracy.overall || 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">Pronunciation</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {feedback.detailedAnalysis?.tajweedMastery.overall || 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">Tajweed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {feedback.detailedAnalysis?.rhythmAndFlow.overall || 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">Rhythm</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {feedback.detailedAnalysis?.emotionalDelivery.overall || 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">Delivery</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Motivational Message */}
              {motivationalMessage && (
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-green-800 dark:text-green-200 leading-relaxed">
                        {motivationalMessage}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Detailed Analysis & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64 w-full">
                    <div className="space-y-4">
                      {/* Pronunciation Feedback */}
                      {feedback.detailedAnalysis?.pronunciationAccuracy.byLetter.map((letter, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-arabic">{letter.letter}</span>
                            <div>
                              <p className="font-medium">Accuracy: {letter.accuracy}%</p>
                              {letter.commonMistake && (
                                <p className="text-sm text-muted-foreground">{letter.commonMistake}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLetterExample(letter.letter)}
                            >
                              <Volume2 className="w-3 h-3 mr-1" />
                              Example
                            </Button>
                            <Badge variant={letter.accuracy > 80 ? "default" : "secondary"}>
                              {letter.accuracy > 80 ? "Good" : "Needs Work"}
                            </Badge>
                          </div>
                        </div>
                      ))}

                      {/* Practice Recommendations */}
                      {feedback.personalizedRecommendations?.map((recommendation, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{recommendation.title}</h4>
                            <Badge variant={
                              recommendation.priority === 'high' ? 'destructive' :
                              recommendation.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {recommendation.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {recommendation.estimatedTime} min
                            </span>
                            <span className="text-green-600">{recommendation.expectedImprovement}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setMode('practice')}
                  className="flex-1"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Practice Again
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePlayMasterRecitation}
                  className="flex-1"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Listen Again
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Additional supporting components for enhanced UX
export function QariSelector() {
  // Component for selecting preferred Qari voice
  return <div>Qari Selection Component</div>
}

export function TajweedGuide() {
  // Interactive Tajweed rules guide
  return <div>Tajweed Guide Component</div>
}

export function ProgressTracker() {
  // Visual progress tracking for voice learning
  return <div>Progress Tracker Component</div>
}