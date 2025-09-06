'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Layers,
  Hash,
  FileText,
  Navigation,
  Home,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { dataAdapter } from "@/lib/data/localAdapter"
import type { Surah, Juz, Hizb, MushafPage } from "@/lib/data/adapter"

interface ReadingNavigationProps {
  currentType: 'surah' | 'juz' | 'hizb' | 'mushaf'
  currentId: number
}

export function ReadingNavigation({ currentType, currentId }: ReadingNavigationProps) {
  const router = useRouter()
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [juzList, setJuzList] = useState<Juz[]>([])
  const [hizbList, setHizbList] = useState<Hizb[]>([])
  const [mushafPages, setMushafPages] = useState<MushafPage[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [surahsData, juzData, hizbData, mushafData] = await Promise.all([
          dataAdapter.getSurahs(),
          dataAdapter.getJuz(),
          dataAdapter.getHizb(),
          dataAdapter.getMushafPages()
        ])
        
        setSurahs(surahsData)
        setJuzList(juzData)
        setHizbList(hizbData)
        setMushafPages(mushafData)
      } catch (error) {
        console.error('Failed to load navigation data:', error)
      }
    }

    loadData()
  }, [])

  const getCurrentItem = () => {
    switch (currentType) {
      case 'surah':
        return surahs.find(s => s.index === currentId)
      case 'juz':
        return juzList.find(j => j.index === currentId)
      case 'hizb':
        return hizbList.find(h => h.index === currentId)
      case 'mushaf':
        return mushafPages.find(p => p.page === currentId)
      default:
        return null
    }
  }

  const getMaxCount = () => {
    switch (currentType) {
      case 'surah': return 114
      case 'juz': return 30
      case 'hizb': return 120
      case 'mushaf': return 604
      default: return 1
    }
  }

  const getIcon = () => {
    switch (currentType) {
      case 'surah': return <BookOpen className="w-4 h-4" />
      case 'juz': return <Layers className="w-4 h-4" />
      case 'hizb': return <Hash className="w-4 h-4" />
      case 'mushaf': return <FileText className="w-4 h-4" />
      default: return <Navigation className="w-4 h-4" />
    }
  }

  const getTypeLabel = () => {
    switch (currentType) {
      case 'surah': return 'Surah'
      case 'juz': return 'Juz'
      case 'hizb': return 'Hizb'
      case 'mushaf': return 'Page'
      default: return 'Reading'
    }
  }

  const navigateToItem = (direction: 'prev' | 'next') => {
    const maxCount = getMaxCount()
    const newId = direction === 'prev' ? currentId - 1 : currentId + 1
    
    if (newId >= 1 && newId <= maxCount) {
      const basePath = currentType === 'surah' ? '/read' : `/read/${currentType}`
      const newPath = currentType === 'surah' ? `${basePath}/${newId}` : 
                     currentType === 'mushaf' ? `/read/page/${newId}` : `${basePath}/${newId}`
      router.push(newPath)
    }
  }

  const switchDivision = (newType: string) => {
    if (newType === currentType) return

    // Smart conversion between divisions based on current progress
    let targetId = 1

    // Try to find equivalent position in new division
    const currentItem = getCurrentItem()
    if (currentItem) {
      switch (newType) {
        case 'surah':
          if (currentType === 'juz' && 'start_surah' in currentItem) {
            targetId = currentItem.start_surah
          } else if (currentType === 'hizb' && 'start_surah' in currentItem) {
            targetId = currentItem.start_surah
          } else if (currentType === 'mushaf' && 'start_surah' in currentItem) {
            targetId = currentItem.start_surah
          }
          break
        case 'juz':
          // Approximate conversion from other divisions to juz
          if (currentType === 'surah') {
            const juz = juzList.find(j => 
              j.start_surah <= currentId && 
              (j.end_surah > currentId || (j.end_surah === currentId))
            )
            targetId = juz?.index || 1
          } else if (currentType === 'hizb' && 'juz' in currentItem) {
            targetId = (currentItem as any).juz as number
          }
          break
        case 'hizb':
          // Approximate conversion to hizb
          if (currentType === 'juz') {
            targetId = ((currentId - 1) * 4) + 1 // First hizb of the juz
          }
          break
        case 'mushaf':
          targetId = Math.min(currentId * 5, 604) // Rough approximation
          break
      }
    }

    // Navigate to the new division
    const basePath = newType === 'surah' ? '/read' : `/read/${newType}`
    const newPath = newType === 'surah' ? `${basePath}/${targetId}` : 
                   newType === 'mushaf' ? `/read/page/${targetId}` : `${basePath}/${targetId}`
    router.push(newPath)
  }

  const selectSpecificItem = (value: string) => {
    const id = parseInt(value)
    const basePath = currentType === 'surah' ? '/read' : `/read/${currentType}`
    const newPath = currentType === 'surah' ? `${basePath}/${id}` : 
                   currentType === 'mushaf' ? `/read/page/${id}` : `${basePath}/${id}`
    router.push(newPath)
  }

  const currentItem = getCurrentItem()

  return (
    <Card className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
      <CardContent className="p-4">
        {/* Top Row: Main Navigation */}
        <div className="flex items-center justify-between gap-4 mb-3">
          {/* Dashboard & Back Navigation */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
            
            <Link href="/read">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
          </div>

          {/* Current Item Display */}
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-medium">{getTypeLabel()} {currentId}</span>
            {currentItem && 'name_ar' in currentItem && (
              <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                {currentItem.name_ar}
              </Badge>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToItem('prev')}
              disabled={currentId <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToItem('next')}
              disabled={currentId >= getMaxCount()}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bottom Row: Division Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Switch:</span>
            <Select value={currentType} onValueChange={switchDivision}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="surah">Surah</SelectItem>
                <SelectItem value="juz">Juz</SelectItem>
                <SelectItem value="hizb">Hizb</SelectItem>
                <SelectItem value="mushaf">Page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Jump:</span>
            <Select value={currentId.toString()} onValueChange={selectSpecificItem}>
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {Array.from({ length: getMaxCount() }, (_, i) => i + 1).map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentId} of {getMaxCount()}</span>
            <span>{Math.round((currentId / getMaxCount()) * 100)}% complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1 mt-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${(currentId / getMaxCount()) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}