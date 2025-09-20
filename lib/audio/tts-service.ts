// Simple TTS Service for existing IQRA interface
export interface TTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  speed?: number // 0.25 to 4.0
  format?: 'mp3' | 'opus' | 'aac' | 'flac'
}

export class SimpleTTSService {
  private apiKey: string
  private audioCache = new Map<string, string>()

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async textToSpeech(text: string, options: TTSOptions = {}): Promise<string> {
    const cacheKey = `${text}-${JSON.stringify(options)}`
    
    // Check cache first
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!
    }

    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: options.voice || 'alloy',
          speed: options.speed || 1.0,
          response_format: options.format || 'mp3'
        }),
      })

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      // Cache the result
      this.audioCache.set(cacheKey, audioUrl)
      
      return audioUrl
    } catch (error) {
      console.error('TTS generation failed:', error)
      throw error
    }
  }

  // Arabic-specific text preprocessing
  preprocessArabicText(text: string): string {
    // Remove diacritics for better pronunciation if needed
    // Add pauses for better speech flow
    return text
      .replace(/([،])/g, '$1 ') // Add pause after commas
      .replace(/([۔])/g, '$1 ') // Add pause after periods
      .trim()
  }

  // Clean up cached audio URLs
  clearCache(): void {
    this.audioCache.forEach((url) => {
      URL.revokeObjectURL(url)
    })
    this.audioCache.clear()
  }
}

// React hook for easy integration
import { useState, useCallback, useRef } from 'react'

export function useTextToSpeech(apiKey: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ttsService = useRef<SimpleTTSService | null>(null)

  // Initialize service
  if (!ttsService.current && apiKey) {
    ttsService.current = new SimpleTTSService(apiKey)
  }

  const speak = useCallback(async (text: string, options: TTSOptions = {}) => {
    if (!ttsService.current) {
      setError('TTS service not initialized. Please provide API key.')
      return
    }

    if (!text?.trim()) {
      setError('No text provided')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // Preprocess Arabic text for better pronunciation
      const processedText = ttsService.current.preprocessArabicText(text)
      
      // Generate speech
      const audioUrl = await ttsService.current.textToSpeech(processedText, options)
      
      // Create and play audio
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onloadstart = () => setIsLoading(true)
      audio.oncanplay = () => setIsLoading(false)
      audio.onplay = () => setIsPlaying(true)
      audio.onpause = () => setIsPlaying(false)
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => {
        setError('Audio playback failed')
        setIsLoading(false)
        setIsPlaying(false)
      }

      await audio.play()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speech generation failed')
      setIsLoading(false)
      setIsPlaying(false)
    }
  }, [apiKey])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
    }
  }, [isPlaying])

  const resume = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play()
    }
  }, [isPlaying])

  // Cleanup
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (ttsService.current) {
      ttsService.current.clearCache()
    }
  }, [])

  return {
    speak,
    stop,
    pause,
    resume,
    cleanup,
    isLoading,
    isPlaying,
    error
  }
}