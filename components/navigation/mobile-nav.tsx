'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { VercelButton } from '@/components/ui/vercel-button'
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
  Menu,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { useProgressStore } from '@/store/progress'

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Your learning overview'
  },
  {
    title: 'Read',
    href: '/read',
    icon: BookOpen,
    description: 'Start reading'
  },
  {
    title: 'Search',
    href: '/search',
    icon: Search,
    description: 'Find verses'
  },
  {
    title: 'Bookmarks',
    href: '/bookmarks',
    icon: Bookmark,
    description: 'Saved verses'
  },
  {
    title: 'Learning',
    href: '/learning',
    icon: Target,
    description: 'Study modules'
  },
  {
    title: 'Progress',
    href: '/progress',
    icon: BarChart3,
    description: 'Track progress'
  },
  {
    title: 'Achievements',
    href: '/achievements',
    icon: Trophy,
    description: 'Your accomplishments'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Preferences'
  }
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { currentStreak, totalVersesRead, dailyGoal } = useProgressStore()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href.startsWith('/read')) return pathname.startsWith('/read')
    return pathname === href
  }

  const mainItems = navigationItems.slice(0, 4)
  const moreItems = navigationItems.slice(4)

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t z-50 transition-smooth">
        <div className="grid grid-cols-4 h-16">
          {mainItems.map((item, index) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link key={item.href} href={item.href}>
                <VercelButton
                  variant="ghost"
                  className={cn(
                    "h-full flex flex-col items-center justify-center p-2 text-xs",
                    active && "text-primary bg-primary/10"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="truncate">{item.title}</span>
                </VercelButton>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 w-10 p-0 bg-background/95 backdrop-blur-sm"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-16 left-4 right-4 bg-background border rounded-lg shadow-lg">
            <div className="p-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-500">{currentStreak}</div>
                  <div className="text-xs text-muted-foreground">Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-500">{totalVersesRead.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Verses</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-500">{Math.floor(Math.random() * dailyGoal)}/{dailyGoal}</div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                      <Button
                        variant={active ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-12",
                          active && "bg-primary/10 text-primary"
                        )}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Content Padding */}
      <div className="md:hidden pb-16" />
    </>
  )
}
