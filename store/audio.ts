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
  
  play: (surah: number, ayah: number) => void
  pause: () => void
  stop: () => void
  setRepeatMode: (mode: RepeatMode) => void
  updateProgress: (currentTime: number, duration: number) => void
  setLoading: (loading: boolean) => void
  nextAyah: () => void
  previousAyah: () => void
  reset: () => void
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isPlaying: false,
  isLoading: false,
  currentSurah: null,
  currentAyah: null,
  repeatMode: 1,
  repeatCount: 0,
  duration: 0,
  currentTime: 0,
  
  play: (surah, ayah) => {
    const state = get()
    if (state.currentSurah === surah && state.currentAyah === ayah) {
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
  
  pause: () => set({ isPlaying: false }),
  
  stop: () => set({
    isPlaying: false,
    currentSurah: null,
    currentAyah: null,
    currentTime: 0,
    repeatCount: 0
  }),
  
  setRepeatMode: (repeatMode) => set({ repeatMode, repeatCount: 0 }),
  
  updateProgress: (currentTime, duration) => set({ currentTime, duration }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
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
    currentTime: 0
  })
}))