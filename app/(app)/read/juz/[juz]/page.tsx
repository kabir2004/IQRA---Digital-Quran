'use client'

import { useState, useEffect } from 'react'
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
  Layers,
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
import { ReadingNavigation } from "@/components/reading-navigation"
import { ReadingAchievements } from "@/components/reading-achievements"
import type { Ayah, Translation, Transliteration, Surah, Juz } from "@/lib/data/adapter"

export default function JuzReadingPage() {
  const params = useParams()
  const router = useRouter()
  const juzNumber = parseInt(params.juz as string)
  
  const [juz, setJuz] = useState<Juz | null>(null)
  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const [translations, setTranslations] = useState<Translation[]>([])
  const [transliterations, setTransliterations] = useState<Transliteration[]>([])
  const [loading, setLoading] = useState(true)
  const [showTranslation, setShowTranslation] = useState(true)
  const [showTransliteration, setShowTransliteration] = useState(true)
  const [showControls, setShowControls] = useState(false)
  
  const { fontSize, rtl } = useSettingsStore()
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarksStore()
  const { isPlaying, currentSurah, currentAyah, play, pause } = useAudioStore()

  useEffect(() => {
    const loadJuzData = async () => {
      try {
        setLoading(true)
        
        // Get Juz information
        const juzList = await dataAdapter.getJuz()
        const currentJuz = juzList.find(j => j.index === juzNumber)
        
        if (!currentJuz) {
          router.push('/read')
          return
        }

        setJuz(currentJuz)
        
        // Load ayahs for the range covered by this Juz (across multiple surahs if needed)
        const ayahsData = await dataAdapter.getJuzAyahs(juzNumber)
        const translationsData = await dataAdapter.getJuzTranslations(juzNumber, 'en')
        const transliterationsData = await dataAdapter.getJuzTransliterations(juzNumber, 'en')

        setAyahs(ayahsData)
        setTranslations(translationsData)
        setTransliterations(transliterationsData)
      } catch (error) {
        console.error('Failed to load juz data:', error)
        router.push('/read')
      } finally {
        setLoading(false)
      }
    }

    if (juzNumber) {
      loadJuzData()
    }
  }, [juzNumber, router])

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

  const navigateToJuz = (direction: 'prev' | 'next') => {
    const newJuz = direction === 'prev' ? juzNumber - 1 : juzNumber + 1
    if (newJuz >= 1 && newJuz <= 30) {
      router.push(`/read/juz/${newJuz}`)
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
            <p className="text-muted-foreground">Loading Juz...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!juz) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">Juz not found</p>
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
      <ReadingNavigation currentType="juz" currentId={juzNumber} />
      
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

          {/* Juz Info */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToJuz('prev')}
                disabled={juzNumber <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Layers className="w-5 h-5 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">Juz {juz.index}</h1>
                </div>
                <p className="text-3xl text-primary font-arabic mt-1">{juz.name}</p>
                <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>From: {juz.start_surah}:{juz.start_ayah}</span>
                  <span>To: {juz.end_surah}:{juz.end_ayah}</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToJuz('next')}
                disabled={juzNumber >= 30}
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
        <ScrollArea className="h-full">
          <div className="space-y-8">
            {ayahs.map((ayah) => {
              const translation = translations.find(t => t.ayah === ayah.ayah)
              const transliteration = transliterations.find(t => t.ayah === ayah.ayah)
              const bookmarked = isBookmarked(ayah.surah, ayah.ayah)
              const playingThis = isPlaying && currentSurah === ayah.surah && currentAyah === ayah.ayah

              return (
                <Card key={`${ayah.surah}-${ayah.ayah}`} className="border-2 border-border">
                  <CardContent className="p-6">
                    {/* Verse Number and Controls */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                          {ayah.surah}:{ayah.ayah}
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
        <div className="max-w-4xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigateToJuz('prev')}
            disabled={juzNumber <= 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Juz
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigateToJuz('next')}
            disabled={juzNumber >= 30}
          >
            Next Juz
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Reading Achievements Overlay */}
      <ReadingAchievements />
    </div>
  )
}