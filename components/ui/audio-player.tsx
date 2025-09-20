'use client'

import { Play, Pause, Square, Volume2, VolumeX, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTextToSpeech } from "@/lib/audio/tts-service"
import { useEffect } from "react"

interface AudioPlayerProps {
  text: string
  className?: string
  variant?: "default" | "ghost" | "outline" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  showText?: boolean
  autoStop?: boolean
}

export function AudioPlayer({ 
  text, 
  className, 
  variant = "outline",
  size = "default",
  showText = false,
  autoStop = true
}: AudioPlayerProps) {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  const { speak, stop, pause, resume, isLoading, isPlaying, error } = useTextToSpeech(apiKey)

  // Auto-stop when component unmounts
  useEffect(() => {
    return () => {
      if (autoStop) {
        stop()
      }
    }
  }, [stop, autoStop])

  const handleClick = async () => {
    if (isLoading) return

    if (isPlaying) {
      pause()
    } else if (text) {
      // Use better voice for Arabic content
      await speak(text, { 
        voice: 'onyx', // Good for Arabic pronunciation
        speed: 0.9 // Slightly slower for clarity
      })
    }
  }

  const handleStop = () => {
    stop()
  }

  if (!apiKey) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        disabled 
        className={cn("opacity-50", className)}
        title="TTS API key not configured"
      >
        <VolumeX className="h-4 w-4" />
        {showText && <span className="ml-2">Audio Unavailable</span>}
      </Button>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isLoading || !text?.trim()}
        className={cn(
          "transition-all duration-200",
          isPlaying && "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
        title={
          isLoading ? "Generating audio..." : 
          isPlaying ? "Pause audio" : 
          "Play audio"
        }
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {showText && (
          <span className="ml-2">
            {isLoading ? "Loading..." : isPlaying ? "Playing" : "Play"}
          </span>
        )}
      </Button>

      {isPlaying && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStop}
          title="Stop audio"
        >
          <Square className="h-3 w-3" />
        </Button>
      )}

      {error && (
        <span className="text-xs text-red-500" title={error}>
          ⚠️
        </span>
      )}
    </div>
  )
}

// Simpler version that just adds play functionality to existing buttons
interface PlayButtonProps {
  text: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function PlayButton({ text, children, className, onClick }: PlayButtonProps) {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  const { speak, isLoading, isPlaying } = useTextToSpeech(apiKey)

  const handleClick = async () => {
    // Call original onClick first if provided
    if (onClick) {
      onClick()
    }

    // Then handle TTS
    if (apiKey && text?.trim() && !isLoading) {
      await speak(text, { 
        voice: 'onyx',
        speed: 0.9
      })
    }
  }

  return (
    <div className={cn("relative", className)} onClick={handleClick}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  )
}

// Hook for components that want to control audio programmatically
export function useAudioPlayer(apiKey?: string) {
  return useTextToSpeech(apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '')
}