'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Filter, 
  BookOpen, 
  Bookmark, 
  Play, 
  Pause,
  Volume2,
  Star,
  Clock,
  Hash,
  Layers,
  FileText,
  ArrowRight,
  X,
  CheckCircle,
  Target,
  TrendingUp
} from 'lucide-react'
import { dataAdapter } from '@/lib/data/localAdapter'
import { useBookmarksStore } from '@/store/bookmarks'
import { useAudioStore } from '@/store/audio'
import type { Ayah, Translation, Surah } from '@/lib/data/adapter'

interface SearchResult {
  surah: Surah
  ayah: Ayah
  translation?: Translation
  relevanceScore: number
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('verses')
  const [selectedSurah, setSelectedSurah] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'relevance' | 'surah' | 'ayah'>('relevance')
  const [showFilters, setShowFilters] = useState(false)

  const { isBookmarked, addBookmark, removeBookmark } = useBookmarksStore()
  const { isPlaying, currentSurah, currentAyah, play, pause } = useAudioStore()

  useEffect(() => {
    const loadSurahs = async () => {
      try {
        const surahsData = await dataAdapter.getSurahs()
        setSurahs(surahsData)
      } catch (error) {
        console.error('Failed to load surahs:', error)
      }
    }
    loadSurahs()
  }, [])

  const searchVerses = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      // This would typically be handled by a search service
      // For now, we'll simulate search results
      const results: SearchResult[] = []
      
      // Simulate search through first few surahs
      for (let surahIndex = 1; surahIndex <= 5; surahIndex++) {
        try {
          const [ayahs, translations] = await Promise.all([
            dataAdapter.getAyahs(surahIndex),
            dataAdapter.getTranslations(surahIndex, 'en')
          ])

          const surah = surahs.find(s => s.index === surahIndex)
          if (!surah) continue

          ayahs.forEach((ayah, index) => {
            const translation = translations[index]
            const relevanceScore = calculateRelevance(query, ayah.text, translation?.text || '')
            
            if (relevanceScore > 0) {
              results.push({
                surah,
                ayah,
                translation,
                relevanceScore
              })
            }
          })
        } catch (error) {
          console.error(`Failed to search surah ${surahIndex}:`, error)
        }
      }

      // Sort results
      results.sort((a, b) => {
        if (sortBy === 'relevance') return b.relevanceScore - a.relevanceScore
        if (sortBy === 'surah') return a.surah.index - b.surah.index
        if (sortBy === 'ayah') return a.ayah.ayah - b.ayah.ayah
        return 0
      })

      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRelevance = (query: string, arabicText: string, translationText: string): number => {
    const queryLower = query.toLowerCase()
    let score = 0

    // Check Arabic text
    if (arabicText.includes(query)) score += 10
    if (arabicText.toLowerCase().includes(queryLower)) score += 5

    // Check translation
    if (translationText.toLowerCase().includes(queryLower)) score += 8

    // Check for word matches
    const queryWords = queryLower.split(' ').filter(word => word.length > 2)
    queryWords.forEach(word => {
      if (translationText.toLowerCase().includes(word)) score += 2
    })

    return score
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchVerses(searchQuery)
  }

  const handleBookmarkToggle = (surahIndex: number, ayahNumber: number) => {
    const bookmarkId = `${surahIndex}:${ayahNumber}`
    if (isBookmarked(surahIndex, ayahNumber)) {
      removeBookmark(bookmarkId)
    } else {
      addBookmark(surahIndex, ayahNumber)
    }
  }

  const handleAudioToggle = (surahIndex: number, ayahNumber: number) => {
    if (isPlaying && currentSurah === surahIndex && currentAyah === ayahNumber) {
      pause()
    } else {
      play(surahIndex, ayahNumber)
    }
  }

  const filteredResults = useMemo(() => {
    if (selectedSurah === 'all') return searchResults
    return searchResults.filter(result => result.surah.index === parseInt(selectedSurah))
  }, [searchResults, selectedSurah])

  const recentSearches = [
    { query: 'Allah', count: 2854 },
    { query: 'prayer', count: 1234 },
    { query: 'patience', count: 567 },
    { query: 'guidance', count: 890 },
    { query: 'mercy', count: 1456 }
  ]

  const popularTopics = [
    { topic: 'Faith & Belief', icon: Star, count: 234 },
    { topic: 'Prayer & Worship', icon: Target, count: 189 },
    { topic: 'Patience & Perseverance', icon: Clock, count: 156 },
    { topic: 'Guidance & Wisdom', icon: TrendingUp, count: 203 },
    { topic: 'Mercy & Forgiveness', icon: CheckCircle, count: 178 }
  ]

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Search the Quran</h1>
          <p className="text-muted-foreground">Find verses, topics, and meanings across the entire Quran</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search for verses, topics, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20 h-12 text-lg"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <Button type="submit" size="sm">
                Search
              </Button>
            </div>
          </div>
        </form>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            
            {showFilters && (
              <div className="flex items-center gap-4">
                <Select value={selectedSurah} onValueChange={setSelectedSurah}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Surah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Surahs</SelectItem>
                    {surahs.map((surah) => (
                      <SelectItem key={surah.index} value={surah.index.toString()}>
                        {surah.index}. {surah.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="surah">Surah Order</SelectItem>
                    <SelectItem value="ayah">Ayah Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {loading ? 'Searching...' : `${filteredResults.length} results found`}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verses">Verses</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          {/* Search Results */}
          <TabsContent value="verses" className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Searching...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredResults.map((result, index) => {
                    const bookmarked = isBookmarked(result.surah.index, result.ayah.ayah)
                    const playingThis = isPlaying && currentSurah === result.surah.index && currentAyah === result.ayah.ayah

                    return (
                      <Card key={`${result.surah.index}-${result.ayah.ayah}`} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-sm">
                                {result.surah.index}:{result.ayah.ayah}
                              </Badge>
                              <div>
                                <h3 className="font-semibold">{result.surah.name_en}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Surah {result.surah.index} • {result.surah.name_ar}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAudioToggle(result.surah.index, result.ayah.ayah)}
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
                                onClick={() => handleBookmarkToggle(result.surah.index, result.ayah.ayah)}
                              >
                                {bookmarked ? (
                                  <Bookmark className="w-4 h-4 text-primary fill-current" />
                                ) : (
                                  <Bookmark className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="space-y-4">
                            {/* Arabic Text */}
                            <div className="text-right">
                              <p className="text-2xl text-primary font-arabic leading-loose">
                                {result.ayah.text}
                              </p>
                            </div>
                            
                            {/* Translation */}
                            {result.translation && (
                              <div>
                                <p className="text-foreground leading-relaxed">
                                  {result.translation.text}
                                </p>
                              </div>
                            )}
                            
                            {/* Relevance Score */}
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                <span>Relevance: {Math.round(result.relevanceScore)}%</span>
                              </div>
                              <Button variant="ghost" size="sm" className="text-primary">
                                Read Full Surah
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">Try different keywords or check your spelling</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start searching</h3>
                <p className="text-muted-foreground">Enter a keyword or phrase to search the Quran</p>
              </div>
            )}
          </TabsContent>

          {/* Topics */}
          <TabsContent value="topics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularTopics.map((topic) => {
                const Icon = topic.icon
                return (
                  <Card key={topic.topic} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{topic.topic}</h3>
                          <p className="text-sm text-muted-foreground">{topic.count} verses</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button variant="ghost" size="sm" className="w-full">
                        Explore Topic
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Recent Searches */}
          <TabsContent value="recent" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Recent Searches</h3>
              {recentSearches.map((search) => (
                <Card key={search.query} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{search.query}</span>
                        <Badge variant="secondary" className="text-xs">
                          {search.count} results
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
