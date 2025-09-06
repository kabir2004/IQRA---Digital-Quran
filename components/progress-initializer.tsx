'use client'

import { useEffect } from 'react'
import { useProgressStore } from '@/store/progress'

export function ProgressInitializer() {
  const initializeDemoData = useProgressStore((state) => state.initializeDemoData)

  useEffect(() => {
    // Initialize demo data only on client side after hydration
    initializeDemoData()
  }, [initializeDemoData])

  return null // This component doesn't render anything
}
