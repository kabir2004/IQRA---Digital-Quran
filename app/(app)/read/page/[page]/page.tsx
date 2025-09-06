'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  Settings2, 
  FileText,
  Languages,
  Type,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Play,
  Pause
} from "lucide-react"
import { dataAdapter } from "@/lib/data/localAdapter"
import { useSettingsStore } from "@/store/settings"
import { useBookmarksStore } from "@/store/bookmarks"
import { useAudioStore } from "@/store/audio"
import { useProgressStore } from "@/store/progress"
import { ReadingNavigation } from "@/components/reading-navigation"
import { ReadingAchievements } from "@/components/reading-achievements"
import type { Ayah, Translation, Transliteration, MushafPage } from "@/lib/data/adapter"

export default function MushafPageReadingPage() {
  const params = useParams()
  const router = useRouter()
  const pageNumber = parseInt(params.page as string)
  
  const [mushafPage, setMushafPage] = useState<MushafPage | null>(null)
  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const [translations, setTranslations] = useState<Translation[]>([])
  const [transliterations, setTransliterations] = useState<Transliteration[]>([])
  const [loading, setLoading] = useState(true)
  const [showTranslation, setShowTranslation] = useState(true)
  const [showTransliteration, setShowTransliteration] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const [readVerses, setReadVerses] = useState<Set<string>>(new Set())
  
  const { fontSize, rtl } = useSettingsStore()
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarksStore()
  const { isPlaying, currentSurah, currentAyah, play, pause } = useAudioStore()
  const { 
    startReadingSession, 
    endReadingSession, 
    updateSessionProgress,
    markVerseAsRead 
  } = useProgressStore()

  const handleVerseRead = (surah: number, ayah: number) => {
    // Track verse as read and update session progress
    markVerseAsRead(surah, ayah)
    
    // Get Juz and Hizb information from the page structure if needed
    updateSessionProgress(surah, ayah, undefined, undefined, pageNumber)
  }

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true)
        
        const pages = await dataAdapter.getMushafPages()
        const currentPage = pages.find(p => p.page === pageNumber)
        
        if (!currentPage) {
          router.push('/read')
          return
        }

        setMushafPage(currentPage)
        
        // Load ayahs, translations, and transliterations for this specific Mushaf page
        // This handles multi-surah pages automatically
        const ayahsData = await dataAdapter.getMushafPageAyahs(pageNumber)
        const translationsData = await dataAdapter.getMushafPageTranslations(pageNumber, 'en')
        const transliterationsData = await dataAdapter.getMushafPageTransliterations(pageNumber, 'en')

        setAyahs(ayahsData)
        setTranslations(translationsData)
        setTransliterations(transliterationsData)
        
        // Start reading session
        startReadingSession('mushaf')
      } catch (error) {
        console.error('Failed to load page data:', error)
        router.push('/read')
      } finally {
        setLoading(false)
      }
    }

    if (pageNumber) {
      loadPageData()
    }
    
    // Cleanup: End reading session when component unmounts
    return () => {
      endReadingSession()
    }
  }, [pageNumber, router, startReadingSession, endReadingSession])

  // Set up intersection observer to track verse reading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const verseId = entry.target.getAttribute('data-verse-id')
            if (verseId && !readVerses.has(verseId)) {
              const [surah, ayah] = verseId.split(':').map(Number)
              handleVerseRead(surah, ayah)
              setReadVerses(prev => new Set(prev).add(verseId))
            }
          }
        })
      },
      { threshold: 0.5 }
    )

    // Observe all verse elements
    const verseElements = document.querySelectorAll('[data-verse-id]')
    verseElements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [ayahs, readVerses, handleVerseRead])

  const handleBookmarkToggle = (surahNum: number, ayahNumber: number) => {
    const bookmarkId = `${surahNum}:${ayahNumber}`
    if (isBookmarked(surahNum, ayahNumber)) {
      removeBookmark(bookmarkId)
    } else {
      addBookmark(surahNum, ayahNumber)
    }
  }

  const handleAudioToggle = (surahNum: number, ayahNumber: number) => {
    if (isPlaying && currentSurah === surahNum && currentAyah === ayahNumber) {
      pause()
    } else {
      play(surahNum, ayahNumber)
    }
  }

  const navigateToPage = (direction: 'prev' | 'next') => {
    const newPage = direction === 'prev' ? pageNumber - 1 : pageNumber + 1
    if (newPage >= 1 && newPage <= 604) { // Standard Mushaf has 604 pages
      router.push(`/read/page/${newPage}`)
    }
  }

  const getFontSizeClass = () => {
    const sizes = {
      small: 'text-lg',
      medium: 'text-xl',
      large: 'text-2xl',
      'extra-large': 'text-3xl'
    }
    return sizes[fontSize] || sizes.medium
  }

  const getArabicFontSizeClass = () => {
    const sizes = {
      small: 'text-2xl',
      medium: 'text-3xl',
      large: 'text-4xl',
      'extra-large': 'text-5xl'
    }
    return sizes[fontSize] || sizes.medium
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-muted-foreground">Loading Mushaf Page...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!mushafPage) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">Mushaf page not found</p>
          <Button onClick={() => router.push('/read')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reading Options
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Navigation */}
      <ReadingNavigation currentType="mushaf" currentId={pageNumber} />
      
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/read')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowControls(!showControls)}
              >
                <Settings2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Page Info */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToPage('prev')}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FileText className="w-5 h-5 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">Mushaf Page {mushafPage.page}</h1>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>From: {mushafPage.start_surah}:{mushafPage.start_ayah}</span>
                  <span>To: {mushafPage.end_surah}:{mushafPage.end_ayah}</span>
                </div>
                <Badge variant="secondary" className="mt-2">
                  Standard Madani Mushaf Layout
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToPage('next')}
                disabled={pageNumber >= 604}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Reading Controls */}
          {showControls && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="translation"
                      checked={showTranslation}
                      onCheckedChange={setShowTranslation}
                    />
                    <Label htmlFor="translation" className="flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Translation
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="transliteration"
                      checked={showTransliteration}
                      onCheckedChange={setShowTransliteration}
                    />
                    <Label htmlFor="transliteration" className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Pronunciation
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>Font: {fontSize}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Verses */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Page Layout Indicator */}
        <div className="text-center mb-6 p-4 bg-accent/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            This page follows the traditional Mushaf Madani layout, making it easy to reference with physical copies
          </p>
        </div>

        <ScrollArea className="h-full">
          <div className="space-y-8">
            {ayahs.map((ayah) => {
              const translation = translations.find(t => t.ayah === ayah.ayah)
              const transliteration = transliterations.find(t => t.ayah === ayah.ayah)
              const bookmarked = isBookmarked(ayah.surah, ayah.ayah)
              const playingThis = isPlaying && currentSurah === ayah.surah && currentAyah === ayah.ayah

              return (
                <Card key={`${ayah.surah}-${ayah.ayah}`} className="border-2 border-border" data-verse-id={`${ayah.surah}:${ayah.ayah}`}>
                  <CardContent className="p-6">
                    {/* Verse Number and Controls */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                          {ayah.surah}:{ayah.ayah}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Page {mushafPage.page}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAudioToggle(ayah.surah, ayah.ayah)}
                        >
                          {playingThis ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmarkToggle(ayah.surah, ayah.ayah)}
                        >
                          {bookmarked ? (
                            <BookmarkCheck className="w-4 h-4 text-primary" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Arabic Text */}
                    <div className={`${rtl ? 'text-right' : 'text-center'} mb-6`}>
                      <p className={`${getArabicFontSizeClass()} leading-loose text-primary font-arabic`}>
                        {ayah.text}
                      </p>
                    </div>

                    {/* Transliteration */}
                    {showTransliteration && transliteration && (
                      <div className="mb-4">
                        <p className={`${getFontSizeClass()} text-muted-foreground italic text-center leading-relaxed`}>
                          {transliteration.text}
                        </p>
                      </div>
                    )}

                    {/* Translation */}
                    {showTranslation && translation && (
                      <>
                        {showTransliteration && transliteration && <Separator className="mb-4" />}
                        <div>
                          <p className={`${getFontSizeClass()} text-foreground leading-relaxed`}>
                            {translation.text}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Navigation Footer */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigateToPage('prev')}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Page
          </Button>

          <div className="text-sm text-muted-foreground">
            Page {pageNumber} of 604
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigateToPage('next')}
            disabled={pageNumber >= 604}
          >
            Next Page
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Reading Achievements Overlay */}
      <ReadingAchievements />
    </div>
  )
}