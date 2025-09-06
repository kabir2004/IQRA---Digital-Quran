'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bookmark, 
  BookmarkCheck, 
  Search, 
  Play, 
  Pause,
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Clock,
  Star,
  ArrowRight,
  X,
  BookOpen,
  Hash,
  Layers,
  FileText
} from 'lucide-react'
import { useBookmarksStore } from '@/store/bookmarks'
import { useAudioStore } from '@/store/audio'
import { dataAdapter } from '@/lib/data/localAdapter'
import type { Ayah, Translation, Surah } from '@/lib/data/adapter'

interface BookmarkWithData {
  id: string
  surahIndex: number
  ayahNumber: number
  surah: Surah
  ayah: Ayah
  translation?: Translation
  createdAt: Date
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkWithData[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkWithData[]>([])
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSurah, setSelectedSurah] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'surah' | 'ayah'>('recent')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [activeTab, setActiveTab] = useState('all')

  const { bookmarks: bookmarkIds, removeBookmark } = useBookmarksStore()
  const { isPlaying, currentSurah, currentAyah, play, pause } = useAudioStore()

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        setLoading(true)
        
        // Load surahs first
        const surahsData = await dataAdapter.getSurahs()
        setSurahs(surahsData)

        // Load bookmark data
        const bookmarkData: BookmarkWithData[] = []
        
        for (const bookmark of bookmarkIds) {
          const [surahIndex, ayahNumber] = bookmark.id.split(':').map(Number)
          const surah = surahsData.find(s => s.index === surahIndex)
          
          if (surah) {
            try {
              const [ayahs, translations] = await Promise.all([
                dataAdapter.getAyahs(surahIndex),
                dataAdapter.getTranslations(surahIndex, 'en')
              ])
              
              const ayah = ayahs.find(a => a.ayah === ayahNumber)
              const translation = translations.find(t => t.ayah === ayahNumber)
              
              if (ayah) {
                bookmarkData.push({
                  id: bookmark.id,
                  surahIndex,
                  ayahNumber,
                  surah,
                  ayah,
                  translation,
                  createdAt: new Date() // In a real app, this would come from storage
                })
              }
            } catch (error) {
              console.error(`Failed to load bookmark ${bookmark.id}:`, error)
            }
          }
        }

        setBookmarks(bookmarkData)
      } catch (error) {
        console.error('Failed to load bookmarks:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBookmarks()
  }, [bookmarkIds])

  useEffect(() => {
    let filtered = [...bookmarks]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(bookmark =>
        bookmark.surah.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.surah.name_ar.includes(searchQuery) ||
        bookmark.translation?.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.ayah.text.includes(searchQuery)
      )
    }

    // Filter by surah
    if (selectedSurah !== 'all') {
      filtered = filtered.filter(bookmark => bookmark.surahIndex === parseInt(selectedSurah))
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      
      if (sortBy === 'recent') {
        comparison = a.createdAt.getTime() - b.createdAt.getTime()
      } else if (sortBy === 'surah') {
        comparison = a.surahIndex - b.surahIndex
      } else if (sortBy === 'ayah') {
        comparison = a.ayahNumber - b.ayahNumber
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredBookmarks(filtered)
  }, [bookmarks, searchQuery, selectedSurah, sortBy, sortOrder])

  const handleRemoveBookmark = (bookmarkId: string) => {
    removeBookmark(bookmarkId)
  }

  const handleAudioToggle = (surahIndex: number, ayahNumber: number) => {
    if (isPlaying && currentSurah === surahIndex && currentAyah === ayahNumber) {
      pause()
    } else {
      play(surahIndex, ayahNumber)
    }
  }

  const getBookmarkStats = () => {
    const totalBookmarks = bookmarks.length
    const surahsWithBookmarks = new Set(bookmarks.map(b => b.surahIndex)).size
    const recentBookmarks = bookmarks.filter(b => {
      const daysSinceCreated = (Date.now() - b.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceCreated <= 7
    }).length

    return { totalBookmarks, surahsWithBookmarks, recentBookmarks }
  }

  const stats = getBookmarkStats()

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading bookmarks...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Bookmarks</h1>
          <p className="text-muted-foreground">Save and organize your favorite verses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Total Bookmarks</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalBookmarks}</div>
              <p className="text-sm text-muted-foreground">Saved verses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-lg">Surahs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{stats.surahsWithBookmarks}</div>
              <p className="text-sm text-muted-foreground">Different surahs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                <CardTitle className="text-lg">This Week</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.recentBookmarks}</div>
              <p className="text-sm text-muted-foreground">Recently added</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedSurah} onValueChange={setSelectedSurah}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Surahs" />
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
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="surah">Surah</SelectItem>
                <SelectItem value="ayah">Ayah</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({stats.totalBookmarks})</TabsTrigger>
            <TabsTrigger value="recent">Recent ({stats.recentBookmarks})</TabsTrigger>
            <TabsTrigger value="favorites">Favorites (0)</TabsTrigger>
            <TabsTrigger value="studied">Studied (0)</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {filteredBookmarks.length > 0 ? (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredBookmarks.map((bookmark) => {
                    const playingThis = isPlaying && currentSurah === bookmark.surahIndex && currentAyah === bookmark.ayahNumber

                    return (
                      <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-sm">
                                {bookmark.surahIndex}:{bookmark.ayahNumber}
                              </Badge>
                              <div>
                                <h3 className="font-semibold">{bookmark.surah.name_en}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Surah {bookmark.surahIndex} • {bookmark.surah.name_ar}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAudioToggle(bookmark.surahIndex, bookmark.ayahNumber)}
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
                                onClick={() => handleRemoveBookmark(bookmark.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="space-y-4">
                            {/* Arabic Text */}
                            <div className="text-right">
                              <p className="text-2xl text-primary font-arabic leading-loose">
                                {bookmark.ayah.text}
                              </p>
                            </div>
                            
                            {/* Translation */}
                            {bookmark.translation && (
                              <div>
                                <p className="text-foreground leading-relaxed">
                                  {bookmark.translation.text}
                                </p>
                              </div>
                            )}
                            
                            {/* Actions */}
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Added {bookmark.createdAt.toLocaleDateString()}</span>
                                </div>
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
            ) : (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start bookmarking verses as you read to save them for later
                </p>
                <Button>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Start Reading
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Recent Bookmarks</h3>
              <p className="text-muted-foreground">Your recently bookmarked verses will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Favorite Verses</h3>
              <p className="text-muted-foreground">Mark verses as favorites to organize them better</p>
            </div>
          </TabsContent>

          <TabsContent value="studied" className="mt-6">
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Studied Verses</h3>
              <p className="text-muted-foreground">Verses you've marked as studied will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
