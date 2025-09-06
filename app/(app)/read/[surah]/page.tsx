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
  Type,
  Languages,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Play,
  Pause,
  Volume2
} from "lucide-react"
import { dataAdapter } from "@/lib/data/localAdapter"
import { useSettingsStore } from "@/store/settings"
import { useBookmarksStore } from "@/store/bookmarks"
import { useAudioStore } from "@/store/audio"
import { ReadingNavigation } from "@/components/reading-navigation"
import { ReadingAchievements } from "@/components/reading-achievements"
import type { Ayah, Translation, Transliteration, Surah } from "@/lib/data/adapter"

export default function SurahReadingPage() {
  const params = useParams()
  const router = useRouter()
  const surahNumber = parseInt(params.surah as string)
  
  const [surah, setSurah] = useState<Surah | null>(null)
  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const [translations, setTranslations] = useState<Translation[]>([])
  const [transliterations, setTransliterations] = useState<Transliteration[]>([])
  const [loading, setLoading] = useState(true)
  const [showTranslation, setShowTranslation] = useState(true)
  const [showTransliteration, setShowTransliteration] = useState(true)
  const [showControls, setShowControls] = useState(false)
  
  const { fontSize, showTranslation: globalShowTranslation, rtl } = useSettingsStore()
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarksStore()
  const { isPlaying, currentSurah, currentAyah, play, pause } = useAudioStore()

  useEffect(() => {
    const loadSurahData = async () => {
      try {
        setLoading(true)
        
        // Add validation for surah number
        if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
          router.push('/read')
          return
        }
        
        const [surahsData, ayahsData, translationsData, transliterationsData] = await Promise.all([
          dataAdapter.getSurahs(),
          dataAdapter.getAyahs(surahNumber),
          dataAdapter.getTranslations(surahNumber, 'en'),
          dataAdapter.getTransliterations(surahNumber, 'en')
        ])

        const currentSurah = surahsData.find(s => s.index === surahNumber)
        if (!currentSurah) {
          router.push('/read')
          return
        }

        setSurah(currentSurah)
        setAyahs(ayahsData)
        setTranslations(translationsData)
        setTransliterations(transliterationsData)
      } catch (error) {
        console.error('Failed to load surah data:', error)
        router.push('/read')
      } finally {
        setLoading(false)
      }
    }

    if (surahNumber) {
      loadSurahData()
    }
  }, [surahNumber, router])

  const handleBookmarkToggle = (ayahNumber: number) => {
    const bookmarkId = `${surahNumber}:${ayahNumber}`
    if (isBookmarked(surahNumber, ayahNumber)) {
      removeBookmark(bookmarkId)
    } else {
      addBookmark(surahNumber, ayahNumber)
    }
  }

  const handleAudioToggle = (ayahNumber: number) => {
    if (isPlaying && currentSurah === surahNumber && currentAyah === ayahNumber) {
      pause()
    } else {
      play(surahNumber, ayahNumber)
    }
  }

  const navigateToSurah = (direction: 'prev' | 'next') => {
    const newSurah = direction === 'prev' ? surahNumber - 1 : surahNumber + 1
    if (newSurah >= 1 && newSurah <= 114) {
      router.push(`/read/${newSurah}`)
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading surah...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!surah) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">Surah not found</p>
          <Button onClick={() => router.push('/read')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Surahs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Navigation */}
      <ReadingNavigation currentType="surah" currentId={surahNumber} />
      
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/read')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Reading
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

          {/* Surah Info */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToSurah('prev')}
                disabled={surahNumber <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground">{surah.name_en}</h1>
                <p className="text-3xl text-primary font-arabic mt-1">{surah.name_ar}</p>
                <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Surah {surah.index}</span>
                  <Badge variant="secondary">{surah.revelation_place}</Badge>
                  <span>{surah.verses} verses</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToSurah('next')}
                disabled={surahNumber >= 114}
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
              const bookmarked = isBookmarked(surah.index, ayah.ayah)
              const playingThis = isPlaying && currentSurah === surah.index && currentAyah === ayah.ayah

              return (
                <Card key={ayah.ayah} className="border-2 border-border">
                  <CardContent className="p-6">
                    {/* Verse Number and Controls */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                          {ayah.ayah}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAudioToggle(ayah.ayah)}
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
                          onClick={() => handleBookmarkToggle(ayah.ayah)}
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
            onClick={() => navigateToSurah('prev')}
            disabled={surahNumber <= 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Surah
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigateToSurah('next')}
            disabled={surahNumber >= 114}
          >
            Next Surah
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Reading Achievements Overlay */}
      <ReadingAchievements />
    </div>
  )
}