'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  Target, 
  Trophy, 
  Users, 
  Clock, 
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Globe,
  Sparkles,
  TrendingUp,
  Award,
  Activity,
  BarChart3
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useProgressStore } from '@/store/progress'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { currentStreak, totalVersesRead, dailyGoal } = useProgressStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const features = [
    {
      icon: BookOpen,
      title: 'Complete Quran',
      description: 'Read the entire Quran with multiple translations and transliterations',
      color: 'text-blue-500'
    },
    {
      icon: Search,
      title: 'Advanced Search',
      description: 'Find verses by topic, keyword, or reference with intelligent search',
      color: 'text-green-500'
    },
    {
      icon: Target,
      title: 'Learning Paths',
      description: 'Structured curriculum for beginners to advanced learners',
      color: 'text-purple-500'
    },
    {
      icon: Trophy,
      title: 'Achievements',
      description: 'Track your progress with gamified learning milestones',
      color: 'text-orange-500'
    },
    {
      icon: Users,
      title: 'Study Groups',
      description: 'Learn together with community features and group studies',
      color: 'text-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Detailed insights into your reading habits and progress',
      color: 'text-indigo-500'
    }
  ]

  const stats = [
    { label: 'Active Users', value: '50K+', icon: Users },
    { label: 'Verses Read', value: '2M+', icon: BookOpen },
    { label: 'Study Groups', value: '1.2K+', icon: Users },
    { label: 'Languages', value: '15+', icon: Globe }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">IQRA</h1>
              <p className="text-xs text-muted-foreground">Digital Quran</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Modern Quran Learning Platform
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Read, Learn, and
                <span className="text-primary"> Grow</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience the Holy Quran like never before with our comprehensive digital platform. 
                Read, study, and reflect with advanced features designed for modern learners.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Reading
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to learn</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to enhance your Quran learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 ${feature.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to start your journey?
          </h2>
          <p className="text-xl opacity-90">
            Join thousands of learners who are already using IQRA to deepen their understanding of the Quran.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-primary">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">IQRA</h3>
                  <p className="text-xs text-muted-foreground">Digital Quran</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Modern Quran learning platform designed for the digital age.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Read Quran</li>
                <li>Search & Study</li>
                <li>Learning Paths</li>
                <li>Progress Tracking</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Study Guides</li>
                <li>Community</li>
                <li>Blog</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>FAQ</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 IQRA Digital Quran. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
