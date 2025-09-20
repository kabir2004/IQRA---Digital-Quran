import { create } from 'zustand'

export type RepeatMode = 1 | 3 | 'infinite'

export interface AudioState {
  isPlaying: boolean
  isLoading: boolean
  currentSurah: number | null
  currentAyah: number | null
  repeatMode: RepeatMode
  repeatCount: number
  duration: number
  currentTime: number
  error: string | null
  currentText: string | null
  
  play: (surah: number, ayah: number) => void
  pause: () => void
  stop: () => void
  setRepeatMode: (mode: RepeatMode) => void
  updateProgress: (currentTime: number, duration: number) => void
  setLoading: (loading: boolean) => void
  nextAyah: () => void
  previousAyah: () => void
  reset: () => void
  
  // TTS functionality
  playText: (text: string, options?: { voice?: string; speed?: number }) => Promise<void>
  setError: (error: string | null) => void
}

// Global audio element and TTS cache
let globalAudio: HTMLAudioElement | null = null
let ttsCache = new Map<string, string>()

export const useAudioStore = create<AudioState>((set, get) => ({
  isPlaying: false,
  isLoading: false,
  currentSurah: null,
  currentAyah: null,
  repeatMode: 1,
  repeatCount: 0,
  duration: 0,
  currentTime: 0,
  error: null,
  currentText: null,
  
  playText: async (text: string, options = {}) => {
    console.log('playText called with:', { text: text.substring(0, 50) + '...', options })
    
    if (!text?.trim()) {
      set({ error: 'No text provided' })
      return
    }

    const cacheKey = `${text}-${JSON.stringify(options)}`
    
    set({ isLoading: true, error: null })

    try {
      // Stop current audio
      if (globalAudio) {
        globalAudio.pause()
        globalAudio.currentTime = 0
      }

      let audioUrl = ttsCache.get(cacheKey)
      
      // Generate new audio if not cached
      if (!audioUrl) {
        console.log('Making ElevenLabs API call for text:', text.substring(0, 100))
        
        // Limit text length to conserve credits (max ~100 characters for testing)
        const truncatedText = text.length > 100 ? text.substring(0, 100) + '...' : text
        
        const requestBody = {
          text: truncatedText,
          model_id: 'eleven_multilingual_v2',
          output_format: 'mp3_44100_128',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }
        
        console.log('Request body:', requestBody)
        
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb', {
          method: 'POST',
          headers: {
            'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })
        
        console.log('Response status:', response.status, response.statusText)

        if (!response.ok) {
          let errorText = ''
          try {
            errorText = await response.text()
          } catch (e) {
            errorText = 'Unable to read error response'
          }
          
          const errorDetails = {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            url: response.url,
            headers: Object.fromEntries(response.headers.entries())
          }
          
          console.error('ElevenLabs API Error Details:', errorDetails)
          throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`)
        }

        const audioBlob = await response.blob()
        audioUrl = URL.createObjectURL(audioBlob)
        console.log('TTS audio generated successfully, blob size:', audioBlob.size)
        
        // Cache the result
        ttsCache.set(cacheKey, audioUrl)
      }
      
      // Create and play audio
      const audio = new Audio(audioUrl)
      globalAudio = audio
      
      audio.onloadstart = () => set({ isLoading: true })
      audio.oncanplay = () => set({ isLoading: false })
      audio.onplay = () => set({ isPlaying: true, currentText: text })
      audio.onpause = () => set({ isPlaying: false })
      audio.onended = () => set({ isPlaying: false, currentText: null })
      audio.ontimeupdate = () => {
        set({ currentTime: audio.currentTime, duration: audio.duration })
      }
      audio.onerror = () => {
        set({ 
          error: 'Audio playback failed',
          isLoading: false,
          isPlaying: false 
        })
      }

      await audio.play()
      
    } catch (err) {
      console.error('TTS Error:', err)
      set({ 
        error: err instanceof Error ? err.message : 'Speech generation failed',
        isLoading: false,
        isPlaying: false 
      })
    }
  },
  
  play: (surah, ayah) => {
    const state = get()
    if (state.currentSurah === surah && state.currentAyah === ayah) {
      if (globalAudio && globalAudio.paused) {
        globalAudio.play()
      }
      set({ isPlaying: true })
    } else {
      set({
        currentSurah: surah,
        currentAyah: ayah,
        isPlaying: true,
        repeatCount: 0,
        currentTime: 0
      })
    }
  },
  
  pause: () => {
    if (globalAudio && !globalAudio.paused) {
      globalAudio.pause()
    }
    set({ isPlaying: false })
  },
  
  stop: () => {
    if (globalAudio) {
      globalAudio.pause()
      globalAudio.currentTime = 0
    }
    set({
      isPlaying: false,
      currentSurah: null,
      currentAyah: null,
      currentTime: 0,
      repeatCount: 0,
      currentText: null
    })
  },
  
  setRepeatMode: (repeatMode) => set({ repeatMode, repeatCount: 0 }),
  
  updateProgress: (currentTime, duration) => set({ currentTime, duration }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  nextAyah: () => {
    const state = get()
    if (!state.currentSurah || !state.currentAyah) return
    
    set({
      currentAyah: state.currentAyah + 1,
      currentTime: 0,
      repeatCount: 0
    })
  },
  
  previousAyah: () => {
    const state = get()
    if (!state.currentSurah || !state.currentAyah || state.currentAyah <= 1) return
    
    set({
      currentAyah: state.currentAyah - 1,
      currentTime: 0,
      repeatCount: 0
    })
  },
  
  reset: () => set({
    isPlaying: false,
    isLoading: false,
    currentSurah: null,
    currentAyah: null,
    repeatMode: 1,
    repeatCount: 0,
    duration: 0,
    currentTime: 0,
    error: null,
    currentText: null
  })
}))