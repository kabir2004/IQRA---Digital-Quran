'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  HelpCircle,
  BookOpen,
  Target,
  Trophy,
  BarChart3,
  Menu
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useProgressStore } from '@/store/progress'
import { useSidebarStore } from '@/store/sidebar'

interface HeaderProps {
  // No props needed
}

export function Header({}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const { currentStreak, totalVersesRead, dailyGoal } = useProgressStore()
  const { toggleSidebar } = useSidebarStore()

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard'
    if (pathname.startsWith('/read')) return 'Read Quran'
    if (pathname.startsWith('/search')) return 'Search'
    if (pathname.startsWith('/bookmarks')) return 'Bookmarks'
    if (pathname.startsWith('/settings')) return 'Settings'
    if (pathname.startsWith('/progress')) return 'Progress'
    if (pathname.startsWith('/achievements')) return 'Achievements'
    return 'IQRA - Digital Quran'
  }

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ label: 'Home', href: '/dashboard' }]
    
    if (segments.includes('read')) {
      breadcrumbs.push({ label: 'Reading', href: '/read' })
    }
    if (segments.includes('search')) {
      breadcrumbs.push({ label: 'Search', href: '/search' })
    }
    if (segments.includes('bookmarks')) {
      breadcrumbs.push({ label: 'Bookmarks', href: '/bookmarks' })
    }
    if (segments.includes('settings')) {
      breadcrumbs.push({ label: 'Settings', href: '/settings' })
    }
    
    return breadcrumbs
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {getBreadcrumbs().map((crumb, index) => (
                  <span key={crumb.href}>
                    {index > 0 && ' / '}
                    {crumb.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search verses, topics, or surahs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">{Math.floor(Math.random() * dailyGoal)}/{dailyGoal}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{currentStreak}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{totalVersesRead.toLocaleString()}</span>
            </div>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">User Name</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Progress</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
