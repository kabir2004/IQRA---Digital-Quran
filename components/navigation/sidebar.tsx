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
      "flex h-full flex-col bg-card/50 backdrop-blur-sm transition-all duration-300 ease-out",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className={cn(
        "flex h-16 items-center transition-all duration-300 ease-out",
        isCollapsed ? "justify-center px-2" : "justify-between px-4"
      )}>
        {isCollapsed ? (
          // Collapsed state - clean minimal logo box
          <VercelButton
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-8 h-8 p-0 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center flex-shrink-0 transition-all duration-200 ease-out shadow-none logo-no-shadow"
          >
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </VercelButton>
        ) : (
          // Expanded state - full logo with text
          <div className="flex items-center space-x-2 transition-all duration-300 ease-out">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 shadow-none logo-no-shadow">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 transition-all duration-300 ease-out">
              <h1 className="text-lg font-semibold">IQRA</h1>
              <p className="text-xs text-muted-foreground">Digital Quran</p>
            </div>
          </div>
        )}
        {!isCollapsed && (
          <VercelButton
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0 flex-shrink-0 transition-all duration-200 ease-out hover:bg-muted/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </VercelButton>
        )}
      </div>

      {/* Quick Stats */}
      <div className={cn(
        "transition-all duration-300 ease-out overflow-hidden",
        isCollapsed ? "opacity-0 h-0 p-0" : "opacity-100 p-4 space-y-3"
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
      <ScrollArea className={cn(
        "flex-1 transition-all duration-300 ease-out",
        isCollapsed ? "px-1 py-4" : "px-2 py-4"
      )}>
        <nav className={cn(
          "transition-all duration-300 ease-out",
          isCollapsed ? "space-y-4" : "space-y-6"
        )}>
          {navigationItems.map((section) => (
            <div key={section.title}>
              <h3 className={cn(
                "px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 transition-all duration-300 ease-out overflow-hidden",
                isCollapsed ? "opacity-0 h-0" : "opacity-100"
              )}>
                {section.title}
              </h3>
              <div className={cn(
                "transition-all duration-300 ease-out",
                isCollapsed ? "space-y-2" : "space-y-1"
              )}>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <VercelButton
                        variant="ghost"
                        className={cn(
                          "w-full h-10 transition-all duration-200 ease-out",
                          isCollapsed ? "px-2 justify-center" : "px-3 justify-start",
                          // No highlight for Dashboard, Progress, and Analytics - they stay as simple ghost buttons
                          // Keep highlight for other items
                          !(item.href === '/dashboard' || item.href === '/progress' || item.href === '/achievements') && isCollapsed && active && "bg-primary text-primary-foreground",
                          !(item.href === '/dashboard' || item.href === '/progress' || item.href === '/achievements') && !isCollapsed && active && "bg-primary/10 text-primary border border-primary/20",
                          "hover:bg-muted/50"
                        )}
                      >
                        <Icon className={cn(
                          "h-4 w-4 flex-shrink-0 transition-all duration-200 ease-out",
                          !isCollapsed && "mr-3"
                        )} />
                        <div className={cn(
                          "flex-1 text-left transition-all duration-300 ease-out overflow-hidden",
                          isCollapsed ? "opacity-0 w-0" : "opacity-100"
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
      <div className={cn(
        "transition-all duration-300 ease-out",
        isCollapsed ? "p-2" : "p-4"
      )}>
        <div className={cn(
          "flex items-center transition-all duration-300 ease-out",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className={cn(
            "flex items-center space-x-2 transition-all duration-300 ease-out overflow-hidden",
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
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
