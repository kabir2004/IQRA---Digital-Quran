'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface AccessibilitySettings {
  highContrast: boolean
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  screenReader: boolean
  keyboardNavigation: boolean
  focusVisible: boolean
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSettings: (settings: Partial<AccessibilitySettings>) => void
  announceToScreenReader: (message: string) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium',
    screenReader: false,
    keyboardNavigation: false,
    focusVisible: true
  })

  const [announcements, setAnnouncements] = useState<string[]>([])

  useEffect(() => {
    // Detect system preferences
    const mediaQueryHighContrast = window.matchMedia('(prefers-contrast: high)')
    const mediaQueryReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    setSettings(prev => ({
      ...prev,
      highContrast: mediaQueryHighContrast.matches,
      reducedMotion: mediaQueryReducedMotion.matches
    }))

    // Listen for changes
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }))
    }

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }))
    }

    mediaQueryHighContrast.addEventListener('change', handleHighContrastChange)
    mediaQueryReducedMotion.addEventListener('change', handleReducedMotionChange)

    return () => {
      mediaQueryHighContrast.removeEventListener('change', handleHighContrastChange)
      mediaQueryReducedMotion.removeEventListener('change', handleReducedMotionChange)
    }
  }, [])

  useEffect(() => {
    // Apply accessibility settings to document
    const root = document.documentElement
    
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    if (settings.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }

    // Apply font size
    root.setAttribute('data-font-size', settings.fontSize)

    // Apply focus visible
    if (settings.focusVisible) {
      root.classList.add('focus-visible')
    } else {
      root.classList.remove('focus-visible')
    }
  }, [settings])

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const announceToScreenReader = (message: string) => {
    if (settings.screenReader) {
      setAnnouncements(prev => [...prev, message])
      
      // Clear announcement after a short delay
      setTimeout(() => {
        setAnnouncements(prev => prev.slice(1))
      }, 1000)
    }
  }

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, announceToScreenReader }}>
      {children}
      
      {/* Screen reader announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}
