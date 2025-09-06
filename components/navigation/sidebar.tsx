'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { VercelButton } from '@/components/ui/vercel-button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  BarChart3,
  Search,
  Bookmark,
  Settings,
  Home,
  Target,
  Trophy,
  Users,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  Layers,
  FileText,
  Hash,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useProgressStore } from '@/store/progress'
import { useSidebarStore } from '@/store/sidebar'

interface SidebarProps {
  className?: string
}

const navigationItems = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        description: 'Your learning overview'
      },
      {
        title: 'Progress',
        href: '/progress',
        icon: BarChart3,
        description: 'Track your journey'
      }
    ]
  },
  {
    title: 'Reading',
    items: [
      {
        title: 'Surahs',
        href: '/read?tab=surahs',
        icon: BookMarked,
        description: 'Browse by chapters'
      },
      {
        title: 'Juz/Para',
        href: '/read?tab=juz',
        icon: Layers,
        description: '30-day divisions'
      },
      {
        title: 'Hizb/Rub',
        href: '/read?tab=hizb',
        icon: Hash,
        description: 'Quarter sections'
      },
      {
        title: 'Mushaf Pages',
        href: '/read?tab=mushaf',
        icon: FileText,
        description: 'Page-by-page reading'
      }
    ]
  },
  {
    title: 'Learning',
    items: [
      {
        title: 'Search',
        href: '/search',
        icon: Search,
        description: 'Find verses and topics'
      },
      {
        title: 'Bookmarks',
        href: '/bookmarks',
        icon: Bookmark,
        description: 'Your saved verses'
      },
      {
        title: 'Learning Path',
        href: '/learning',
        icon: Target,
        description: 'Structured curriculum'
      },
      {
        title: 'Achievements',
        href: '/achievements',
        icon: Trophy,
        description: 'Your accomplishments'
      }
    ]
  },
  {
    title: 'Community',
    items: [
      {
        title: 'Study Groups',
        href: '/groups',
        icon: Users,
        description: 'Learn together'
      },
      {
        title: 'Help Center',
        href: '/help',
        icon: HelpCircle,
        description: 'Get support'
      }
    ]
  }
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { currentStreak, totalVersesRead, dailyGoal } = useProgressStore()
  const { isCollapsed, toggleSidebar } = useSidebarStore()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href.startsWith('/read?tab=')) {
      // Only highlight if the exact tab matches
      const url = new URL(href, 'http://localhost:3000')
      const tab = url.searchParams.get('tab')
      const currentUrl = new URL(pathname, 'http://localhost:3000')
      const currentTab = currentUrl.searchParams.get('tab')
      return tab === currentTab
    }
    return pathname === href
  }

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-card/50 backdrop-blur-sm transition-smooth",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {isCollapsed ? (
          // Collapsed state - clean minimal logo box
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
        ) : (
          // Expanded state - full logo with text
          <div className="flex items-center space-x-2 transition-smooth">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold">IQRA</h1>
              <p className="text-xs text-muted-foreground">Digital Quran</p>
            </div>
          </div>
        )}
        <VercelButton
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </VercelButton>
      </div>

      {/* Quick Stats */}
      <div className={cn(
        "p-4 space-y-3 border-b transition-smooth",
        isCollapsed ? "opacity-0 h-0 p-0 overflow-hidden" : "opacity-100"
      )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Streak</span>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              {isClient ? currentStreak : 0} days
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Verses</span>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {isClient ? totalVersesRead.toLocaleString() : '0'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {Math.floor(Math.random() * dailyGoal)}/{dailyGoal}
            </Badge>
          </div>
        </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-6">
          {navigationItems.map((section) => (
            <div key={section.title}>
              <h3 className={cn(
                "px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 transition-smooth",
                isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
              )}>
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <VercelButton
                        variant={active ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-10 px-2",
                          isCollapsed && "px-2",
                          active && "bg-primary/10 text-primary border border-primary/20"
                        )}
                      >
                        <Icon className={cn("h-4 w-4 flex-shrink-0", !isCollapsed && "mr-3")} />
                        <div className={cn(
                          "flex-1 text-left transition-smooth",
                          isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                        )}>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                      </VercelButton>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center space-x-2 transition-smooth",
            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium">U</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">User</p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
