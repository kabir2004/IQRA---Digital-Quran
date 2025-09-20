'use client'

import { useState, useRef, useCallback } from 'react'
import { Mic, MicOff, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { usePronunciationAnalysis } from "@/lib/audio/pronunciation-analyzer"
import { useMetrics } from "@/hooks/use-metrics"

interface PronunciationResult {
  score: number
  feedback: string[]
  mistakes: Array<{
    word: string
    issue: string
    suggestion: string
  }>
  overallFeedback: string
}

interface PronunciationButtonProps {
  originalText: string
  className?: string
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  title?: string
  onScoreUpdate?: (score: number, result: PronunciationResult) => void
}

type PronunciationStatus = 'idle' | 'recording' | 'analyzing' | 'success' | 'needs_practice'

export function PronunciationButton({ 
  originalText, 
  className, 
  variant = "outline",
  size = "icon",
  disabled = false,
  title,
  onScoreUpdate
}: PronunciationButtonProps) {
  const [status, setStatus] = useState<PronunciationStatus>('idle')
  const [lastResult, setLastResult] = useState<PronunciationResult | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const { analyzeArabicPronunciation } = usePronunciationAnalysis()
  const { toast } = useToast()
  const { trackPronunciation } = useMetrics()

  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      })
      setHasPermission(true)
      return stream
    } catch (error) {
      console.error('Microphone permission denied:', error)
      setHasPermission(false)
      
      toast({
        title: (
          <div className="flex items-center gap-2">
            <span className="text-lg">🎤</span>
            <span className="font-semibold">Microphone Access Required</span>
          </div>
        ),
        description: (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-2">
              Please allow microphone access to practice pronunciation and receive feedback on your recitation.
            </p>
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
              💡 Click the microphone icon in your browser's address bar to allow access
            </div>
          </div>
        ),
        variant: "default",
        className: "bg-gradient-to-r from-yellow-50/80 to-amber-50/80 dark:from-yellow-950/80 dark:to-amber-950/80 backdrop-blur-sm border-2 border-yellow-200 dark:border-yellow-800",
        duration: 8000,
      })
      
      return null
    }
  }, [toast])

  const showResultToast = useCallback((result: PronunciationResult) => {
    const isCorrect = result.score >= 70
    
    toast({
      title: (
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? '✓' : '✗'}
          </span>
          <span className="text-sm">
            {isCorrect ? 'Correct' : 'Try again'}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            {result.score}%
          </span>
        </div>
      ),
      variant: "default",
      className: `border-l-2 ${isCorrect ? 'border-l-green-500 bg-green-50/30 dark:bg-green-950/10' : 'border-l-red-500 bg-red-50/30 dark:bg-red-950/10'}`,
      duration: 2000,
    })
  }, [toast])

  const showDetailedFeedback = useCallback((result: PronunciationResult, retryFunction: () => void) => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <span className="font-semibold">Detailed Analysis</span>
          <span className="ml-auto text-lg font-bold text-primary">{result.score}%</span>
        </div>
      ),
      description: (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            {result.overallFeedback}
          </p>
          
          {result.mistakes.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Areas for Improvement
              </h4>
              <div className="space-y-1">
                {result.mistakes.slice(0, 3).map((mistake, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <div>
                      <span className="font-medium text-foreground">{mistake.word}:</span>
                      <span className="text-muted-foreground ml-1">{mistake.suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-2">
            <ToastAction 
              altText="Try Again"
              onClick={retryFunction}
              className="text-xs px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-md"
            >
              Practice Again
            </ToastAction>
          </div>
        </div>
      ),
      variant: "default",
      className: "bg-gradient-to-r from-slate-50/80 to-gray-50/80 dark:from-slate-900/80 dark:to-gray-900/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700",
      duration: 10000,
    })
  }, [toast])

  const startRecording = useCallback(async () => {
    const stream = await requestMicrophonePermission()
    if (!stream) return

    audioChunksRef.current = []
    setStatus('recording')
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    })
    
    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      stream.getTracks().forEach(track => track.stop())
      
      setStatus('analyzing')
      
      toast({
        title: (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm">Analyzing...</span>
          </div>
        ),
        className: "border-l-2 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/10",
        duration: 5000,
      })

      try {
        const analysisResult = await analyzeArabicPronunciation(audioBlob, originalText)
        setLastResult(analysisResult)
        
        // Set status based on score for visual feedback - keep indicators until next attempt
        if (analysisResult.score >= 70) {
          setStatus('success') // Green mic with checkmark for correct pronunciation
        } else {
          setStatus('needs_practice') // Green mic with red X for incorrect pronunciation
        }
        
        if (onScoreUpdate) {
          onScoreUpdate(analysisResult.score, analysisResult)
        }
        
        // Track pronunciation attempt with metrics
        trackPronunciation(0, 0, analysisResult.score, 1)
        
        // Show result toast
        showResultToast(analysisResult)
        
      } catch (error) {
        console.error('Pronunciation analysis failed:', error)
        setStatus('idle')
        
        toast({
          title: (
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span className="font-semibold">Analysis Failed</span>
            </div>
          ),
          description: (
            <div className="mt-2 space-y-3">
              <p className="text-sm text-muted-foreground">
                Unable to analyze your pronunciation. Please check your microphone and try again.
              </p>
              <div className="flex justify-end">
                <ToastAction 
                  altText="Try Again" 
                  onClick={() => startRecording()}
                  className="text-xs px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors rounded-md"
                >
                  Try Again
                </ToastAction>
              </div>
            </div>
          ),
          variant: "destructive",
          className: "bg-gradient-to-r from-red-50/80 to-pink-50/80 dark:from-red-950/80 dark:to-pink-950/80 backdrop-blur-sm border-2 border-red-200 dark:border-red-800",
          duration: 8000,
        })
      }
    }

    // Show minimalistic recording toast
    toast({
      title: (
        <div className="flex items-center gap-2">
          <span className="text-sm text-red-500 animate-pulse">🎙️</span>
          <span className="text-sm">Recording...</span>
        </div>
      ),
      className: "border-l-2 border-l-red-500 bg-red-50/30 dark:bg-red-950/10",
      duration: 2000,
    })

    mediaRecorder.start()
  }, [originalText, analyzeArabicPronunciation, requestMicrophonePermission, onScoreUpdate, showResultToast, toast])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [status])

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (status === 'recording') {
      stopRecording()
    } else if (status === 'analyzing') {
      // Do nothing while analyzing
      return
    } else {
      // Reset status and start new recording attempt
      setStatus('idle')
      setLastResult(null)
      await startRecording()
    }
  }, [status, startRecording, stopRecording])

  const getButtonAppearance = () => {
    switch (status) {
      case 'recording':
        return {
          className: "bg-red-500 text-white hover:bg-red-600 animate-pulse",
          icon: <MicOff className="h-4 w-4" />,
          title: "Recording... Click to stop"
        }
      case 'analyzing':
        return {
          className: "bg-blue-500 text-white",
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          title: "Analyzing pronunciation..."
        }
      case 'success':
        return {
          className: "bg-green-500 text-white hover:bg-green-600",
          icon: <CheckCircle className="h-4 w-4" />,
          title: "Correct pronunciation!"
        }
      case 'needs_practice':
        return {
          className: "bg-red-500 text-white hover:bg-red-600",
          icon: <XCircle className="h-4 w-4" />,
          title: "Try again"
        }
      default:
        return {
          className: "hover:bg-muted/50 transition-all duration-200",
          icon: <Mic className="h-4 w-4" />,
          title: title || "Click to practice pronunciation"
        }
    }
  }

  // Check if microphone is not supported
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        disabled={true}
        className={cn("opacity-50", className)}
        title="Microphone not supported in this browser"
      >
        <MicOff className="h-4 w-4" />
      </Button>
    )
  }

  // Permission denied state
  if (hasPermission === false) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        disabled={true}
        className={cn("opacity-50", className)}
        title="Microphone permission denied"
      >
        <MicOff className="h-4 w-4 text-red-500" />
      </Button>
    )
  }

  const appearance = getButtonAppearance()

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "transition-all duration-300 relative",
          appearance.className,
          className
        )}
        title={appearance.title}
      >
        {appearance.icon}
      </Button>
      
    </div>
  )
}

// Hook for components that want direct control
export function usePronunciationPractice() {
  const [status, setStatus] = useState<PronunciationStatus>('idle')
  const { analyzeArabicPronunciation } = usePronunciationAnalysis()

  const startPractice = useCallback(async (originalText: string) => {
    setStatus('recording')
    // Implementation here - similar to the button logic
  }, [])

  return {
    status,
    startPractice,
  }
}