import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ArabicScript = 'uthmani' | 'indopak'
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large'
export type Theme = 'light' | 'dark' | 'system'

interface SettingsState {
  theme: Theme
  arabicScript: ArabicScript
  fontSize: FontSize
  showTranslation: boolean
  translationLanguage: string
  showWordByWord: boolean
  rtl: boolean
  audioEnabled: boolean
  autoPlay: boolean
  notifications: boolean
  
  setTheme: (theme: Theme) => void
  setArabicScript: (script: ArabicScript) => void
  setFontSize: (size: FontSize) => void
  setShowTranslation: (show: boolean) => void
  setTranslationLanguage: (language: string) => void
  setShowWordByWord: (show: boolean) => void
  setRTL: (rtl: boolean) => void
  setAudioEnabled: (enabled: boolean) => void
  setAutoPlay: (autoPlay: boolean) => void
  setNotifications: (notifications: boolean) => void
  reset: () => void
}

const initialState = {
  theme: 'system' as Theme,
  arabicScript: 'uthmani' as ArabicScript,
  fontSize: 'medium' as FontSize,
  showTranslation: true,
  translationLanguage: 'en',
  showWordByWord: false,
  rtl: false,
  audioEnabled: true,
  autoPlay: false,
  notifications: true,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setTheme: (theme) => set({ theme }),
      setArabicScript: (arabicScript) => set({ arabicScript }),
      setFontSize: (fontSize) => set({ fontSize }),
      setShowTranslation: (showTranslation) => set({ showTranslation }),
      setTranslationLanguage: (translationLanguage) => set({ translationLanguage }),
      setShowWordByWord: (showWordByWord) => set({ showWordByWord }),
      setRTL: (rtl) => set({ rtl }),
      setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
      setAutoPlay: (autoPlay) => set({ autoPlay }),
      setNotifications: (notifications) => set({ notifications }),
      reset: () => set(initialState),
    }),
    {
      name: 'iqra-settings',
      version: 1,
    }
  )
)