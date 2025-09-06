'use client'

import { useEffect, useRef } from 'react'

interface KeyboardNavigationProps {
  children: React.ReactNode
  onEscape?: () => void
  onEnter?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onTab?: () => void
  onShiftTab?: () => void
  trapFocus?: boolean
  initialFocus?: boolean
}

export function KeyboardNavigation({
  children,
  onEscape,
  onEnter,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onTab,
  onShiftTab,
  trapFocus = false,
  initialFocus = false
}: KeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onEscape?.()
          break
        case 'Enter':
          if (event.target instanceof HTMLElement && event.target.tagName !== 'BUTTON') {
            onEnter?.()
          }
          break
        case 'ArrowUp':
          event.preventDefault()
          onArrowUp?.()
          break
        case 'ArrowDown':
          event.preventDefault()
          onArrowDown?.()
          break
        case 'ArrowLeft':
          event.preventDefault()
          onArrowLeft?.()
          break
        case 'ArrowRight':
          event.preventDefault()
          onArrowRight?.()
          break
        case 'Tab':
          if (event.shiftKey) {
            onShiftTab?.()
          } else {
            onTab?.()
          }
          break
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('keydown', handleKeyDown)
      
      // Set initial focus
      if (initialFocus) {
        const firstFocusable = container.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement
        firstFocusable?.focus()
      }

      return () => {
        container.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab, onShiftTab, initialFocus])

  useEffect(() => {
    if (!trapFocus) return

    const container = containerRef.current
    if (!container) return

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [trapFocus])

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  )
}

// Hook for keyboard shortcuts
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  dependencies: any[] = []
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, dependencies)
}

// Hook for focus management
export function useFocusManagement() {
  const focusHistory = useRef<HTMLElement[]>([])

  const saveFocus = (element: HTMLElement) => {
    focusHistory.current.push(element)
  }

  const restoreFocus = () => {
    const lastElement = focusHistory.current.pop()
    lastElement?.focus()
  }

  const clearFocusHistory = () => {
    focusHistory.current = []
  }

  return { saveFocus, restoreFocus, clearFocusHistory }
}
