'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn, SlideIn, StaggeredList } from "@/components/transitions/page-transition"
import { LoadingSkeleton, CardSkeleton } from "@/components/ui/loading-skeleton"
import { 
  Search, 
  BookOpen, 
  Layers, 
  BookMarked, 
  FileText,
  ChevronRight,
  Hash,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { dataAdapter } from "@/lib/data/localAdapter"
import type { Surah, Juz, Hizb, MushafPage } from "@/lib/data/adapter"

type ReadingDivision = 'surahs' | 'juz' | 'hizb' | 'mushaf'

function ReadPageContent() {
  const searchParams = useSearchParams()
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [juzList, setJuzList] = useState<Juz[]>([])
  const [hizbList, setHizbList] = useState<Hizb[]>([])
  const [mushafPages, setMushafPages] = useState<MushafPage[]>([])
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ReadingDivision>('surahs')

  // Handle URL parameters to set active tab
  useEffect(() => {
    const tab = searchParams.get('tab') as ReadingDivision
    if (tab && ['surahs', 'juz', 'hizb', 'mushaf'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

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
        setFilteredSurahs(surahsData)
        setJuzList(juzData)
        setHizbList(hizbData)
        setMushafPages(mushafData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSurahs(surahs)
      return
    }

    const filtered = surahs.filter(surah =>
      surah.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.name_ar.includes(searchQuery) ||
      surah.index.toString().includes(searchQuery)
    )
    setFilteredSurahs(filtered)
  }, [searchQuery, surahs])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn delay={100}>
            <div className="mb-8">
              <div className="text-center">
                <LoadingSkeleton className="h-8 w-48 mx-auto mb-2" />
                <LoadingSkeleton className="h-4 w-64 mx-auto" />
              </div>
            </div>
          </FadeIn>
          <div className="stagger-vercel">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Read Quran</h1>
            <p className="text-muted-foreground">Choose your preferred reading division</p>
          </div>
        </div>

        {/* Tabs for Different Reading Divisions */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReadingDivision)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="surahs" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Surahs
            </TabsTrigger>
            <TabsTrigger value="juz" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Juz/Para
            </TabsTrigger>
            <TabsTrigger value="hizb" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Hizb/Rub
            </TabsTrigger>
            <TabsTrigger value="mushaf" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Mushaf Pages
            </TabsTrigger>
          </TabsList>

          {/* Surahs Tab */}
          <TabsContent value="surahs" className="mt-0">
            <div className="mb-6">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search surahs by name or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSurahs.map((surah) => (
                <Link href={`/read/${surah.index}`} key={surah.index}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-2 border-border h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span className="text-primary font-bold">{surah.index}</span>
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                          </CardTitle>
                          <div className="mt-2">
                            <h3 className="font-semibold text-foreground">{surah.name_en}</h3>
                            <p className="text-right text-lg text-primary mt-1 font-arabic">
                              {surah.name_ar}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="secondary" className="text-xs">
                          {surah.revelation_place}
                        </Badge>
                        <span className="text-muted-foreground">
                          {surah.verses} verses
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {filteredSurahs.length === 0 && searchQuery && (
              <div className="text-center mt-12">
                <p className="text-muted-foreground">No surahs found matching "{searchQuery}"</p>
              </div>
            )}
          </TabsContent>

          {/* Juz Tab */}
          <TabsContent value="juz" className="mt-0">
            <div className="mb-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">30 Parts (Juz/Para/Sipara)</h3>
              <p className="text-muted-foreground">Traditional 30-day reading divisions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {juzList.map((juz) => (
                <Link href={`/read/juz/${juz.index}`} key={juz.index}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-2 border-border h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-5 h-5 text-primary" />
                          <span>Juz {juz.index}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </CardTitle>
                      <CardDescription className="font-arabic text-right text-lg">
                        {juz.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        <p>From: Surah {juz.start_surah}:{juz.start_ayah}</p>
                        <p>To: Surah {juz.end_surah}:{juz.end_ayah}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Hizb Tab */}
          <TabsContent value="hizb" className="mt-0">
            <div className="mb-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Hizb & Rub Divisions</h3>
              <p className="text-muted-foreground">Quarter and half sections for detailed study</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hizbList.map((hizb) => (
                <Link href={`/read/hizb/${hizb.index}`} key={hizb.index}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-2 border-border h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash className="w-5 h-5 text-primary" />
                          <span>Hizb {hizb.index}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Quarter {hizb.quarter}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {hizb.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        <p className="flex items-center gap-1">
                          <BookMarked className="w-3 h-3" />
                          Juz {hizb.juz} - Quarter {hizb.quarter}
                        </p>
                        <p>From: Surah {hizb.start_surah}:{hizb.start_ayah}</p>
                        <p>To: Surah {hizb.end_surah}:{hizb.end_ayah}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Mushaf Pages Tab */}
          <TabsContent value="mushaf" className="mt-0">
            <div className="mb-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Mushaf Madani Pages</h3>
              <p className="text-muted-foreground">Standard Madani Mushaf page layout (604 pages)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {mushafPages.slice(0, 20).map((page) => (
                <Link href={`/read/page/${page.page}`} key={page.page}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-2 border-border h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4 text-primary" />
                          <span>Page {page.page}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs text-muted-foreground">
                        <p>From: {page.start_surah}:{page.start_ayah}</p>
                        <p>To: {page.end_surah}:{page.end_ayah}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-6">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Load More Pages
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ReadPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReadPageContent />
    </Suspense>
  )
}