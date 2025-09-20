'use client'

import { Play, Pause, Loader2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAudioStore } from "@/store/audio"
import { useEffect } from "react"

interface SimplePlayButtonProps {
  text: string
  className?: string
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  title?: string
}

export function SimplePlayButton({ 
  text, 
  className, 
  variant = "outline",
  size = "icon",
  disabled = false,
  title
}: SimplePlayButtonProps) {
  const { playText, pause, isLoading, isPlaying, error, currentText } = useAudioStore()

  // Check if this button's text is currently playing
  const isThisPlaying = isPlaying && currentText === text

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isLoading) return

    if (isThisPlaying) {
      pause()
    } else if (text?.trim()) {
      await playText(text)
    }
  }

  // ElevenLabs API is configured directly in the store
  const hasApiKey = true

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isLoading || !text?.trim()}
      className={cn(
        "transition-all duration-200 relative",
        isThisPlaying && "bg-primary text-primary-foreground hover:bg-primary/90",
        error && "border-red-300 text-red-600",
        className
      )}
      title={
        error ? `Error: ${error}` :
        title || (isLoading ? "Generating audio..." : 
        isThisPlaying ? "Pause audio" : 
        "Play audio")
      }
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isThisPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      
      {/* Error indicator */}
      {error && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
      )}
    </Button>
  )
}

// Hook for components that want direct control
export function useSimpleTTS() {
  const { playText, pause, stop, isLoading, isPlaying, error } = useAudioStore()

  const speak = async (text: string) => {
    if (!text?.trim()) return
    await playText(text)
  }

  return {
    speak,
    pause,
    stop,
    isLoading,
    isPlaying,
    error,
    hasApiKey: true
  }
}