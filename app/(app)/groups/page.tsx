'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FadeIn, SlideIn, StaggeredList } from "@/components/transitions/page-transition"
import {
  Users,
  Plus,
  Search,
  Filter,
  MessageCircle,
  Calendar,
  Target,
  Trophy,
  Clock,
  Globe,
  Lock,
  UserPlus,
  BookOpen,
  Brain,
  Mic,
  Award,
  TrendingUp,
  Heart,
  Star,
  MapPin,
  Volume2,
  Settings,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Share
} from "lucide-react"
import Link from "next/link"
import { useStudyGroupsStore } from "@/store/study-groups"
import { useUserMetricsStore } from "@/store/user-metrics"
import type { StudyGroup, GroupActivity, GroupPrivacy } from "@/store/study-groups"

export default function StudyGroupsPage() {
  const {
    joinedGroups,
    publicGroups,
    recommendedGroups,
    searchQuery,
    selectedActivity,
    showCreateDialog,
    setActiveGroup,
    createGroup,
    joinGroup,
    leaveGroup,
    searchGroups,
    filterByActivity,
    setShowCreateDialog,
    loadRecommendedGroups
  } = useStudyGroupsStore()
  
  const { trackEvent, trackPageView } = useUserMetricsStore()

  const [activeTab, setActiveTab] = useState('discover')
  const [isClient, setIsClient] = useState(false)
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    privacy: 'public' as GroupPrivacy,
    activity: 'reading' as GroupActivity,
    maxMembers: 25,
    tags: '',
    language: 'en',
    timezone: 'UTC'
  })

  useEffect(() => {
    setIsClient(true)
    trackPageView('/groups')
    loadRecommendedGroups()
  }, [trackPageView, loadRecommendedGroups])

  const handleCreateGroup = () => {
    const groupData = {
      ...newGroupData,
      memberCount: 1,
      ownerId: 'current_user',
      ownerName: 'You',
      status: 'active' as const,
      tags: newGroupData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      goals: {
        dailyVerses: 10,
        weeklyReadingTime: 300
      }
    }
    
    createGroup(groupData)
    trackEvent('group_create', { groupName: groupData.name, activity: groupData.activity })
    
    // Reset form
    setNewGroupData({
      name: '',
      description: '',
      privacy: 'public',
      activity: 'reading',
      maxMembers: 25,
      tags: '',
      language: 'en',
      timezone: 'UTC'
    })
  }

  const handleJoinGroup = (group: StudyGroup) => {
    joinGroup(group.id)
    trackEvent('group_join', { groupId: group.id, groupName: group.name })
  }

  const handleLeaveGroup = (groupId: string) => {
    leaveGroup(groupId)
    trackEvent('group_leave', { groupId })
  }

  const handleSearch = (query: string) => {
    searchGroups(query)
    if (query) {
      trackEvent('search_query', { query, context: 'study_groups' })
    }
  }

  const getActivityIcon = (activity: GroupActivity) => {
    switch (activity) {
      case 'reading': return <BookOpen className="w-4 h-4" />
      case 'memorization': return <Brain className="w-4 h-4" />
      case 'discussion': return <MessageCircle className="w-4 h-4" />
      case 'challenge': return <Trophy className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const getActivityColor = (activity: GroupActivity) => {
    switch (activity) {
      case 'reading': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'memorization': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'discussion': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'challenge': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPrivacyIcon = (privacy: GroupPrivacy) => {
    switch (privacy) {
      case 'public': return <Globe className="w-3 h-3" />
      case 'private': return <Lock className="w-3 h-3" />
      case 'invite-only': return <UserPlus className="w-3 h-3" />
    }
  }

  const filteredPublicGroups = publicGroups.filter(group => {
    const matchesSearch = !searchQuery || 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesActivity = selectedActivity === 'all' || group.activity === selectedActivity
    
    return matchesSearch && matchesActivity
  })

  const formatMeetingTime = (group: StudyGroup) => {
    if (!group.meetingTime) return null
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const day = days[group.meetingTime.dayOfWeek]
    const hour = group.meetingTime.hour
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    
    return `${day}s at ${displayHour}:00 ${ampm}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-7xl mx-auto p-6">
        <FadeIn delay={100}>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Study Groups
                </h1>
                <p className="text-muted-foreground text-lg">Connect with fellow learners and grow together</p>
              </div>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" className="flex items-center gap-2 shadow-lg">
                    <Plus className="w-5 h-5" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Study Group</DialogTitle>
                    <DialogDescription>
                      Start a new community for Quran learning
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="group-name">Group Name</Label>
                      <Input
                        id="group-name"
                        value={newGroupData.name}
                        onChange={(e) => setNewGroupData({...newGroupData, name: e.target.value})}
                        placeholder="Enter group name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="group-description">Description</Label>
                      <Textarea
                        id="group-description"
                        value={newGroupData.description}
                        onChange={(e) => setNewGroupData({...newGroupData, description: e.target.value})}
                        placeholder="Describe your group's purpose"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Activity Type</Label>
                        <Select value={newGroupData.activity} onValueChange={(value: GroupActivity) => setNewGroupData({...newGroupData, activity: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reading">Reading</SelectItem>
                            <SelectItem value="memorization">Memorization</SelectItem>
                            <SelectItem value="discussion">Discussion</SelectItem>
                            <SelectItem value="challenge">Challenge</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Privacy</Label>
                        <Select value={newGroupData.privacy} onValueChange={(value: GroupPrivacy) => setNewGroupData({...newGroupData, privacy: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="invite-only">Invite Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="group-tags">Tags (comma-separated)</Label>
                      <Input
                        id="group-tags"
                        value={newGroupData.tags}
                        onChange={(e) => setNewGroupData({...newGroupData, tags: e.target.value})}
                        placeholder="beginner-friendly, english, daily-reading"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleCreateGroup} 
                      className="w-full"
                      disabled={!newGroupData.name.trim() || !newGroupData.description.trim()}
                    >
                      Create Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </FadeIn>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <FadeIn delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-muted/50">
                <TabsTrigger value="discover" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Discover</span>
                </TabsTrigger>
                <TabsTrigger value="my-groups" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">My Groups</span>
                  <Badge variant="secondary" className="ml-1 text-xs">{joinedGroups.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="recommended" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span className="hidden sm:inline">Recommended</span>
                </TabsTrigger>
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Live</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </FadeIn>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-8">
            {/* Search and Filters */}
            <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        placeholder="Search groups by name, description, or tags..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-12 h-12 text-base border-2 focus:border-primary/50"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <Select value={selectedActivity} onValueChange={filterByActivity}>
                      <SelectTrigger className="w-48 h-12 border-2 focus:border-primary/50">
                        <SelectValue placeholder="Filter by activity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Activities</SelectItem>
                        <SelectItem value="reading">📖 Reading</SelectItem>
                        <SelectItem value="memorization">🧠 Memorization</SelectItem>
                        <SelectItem value="discussion">💬 Discussion</SelectItem>
                        <SelectItem value="challenge">🏆 Challenge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Groups Row */}
            <div className="flex flex-row gap-6 overflow-x-auto pb-4 scrollbar-hide">
              <StaggeredList>
                {filteredPublicGroups.map((group, index) => {
                  const isJoined = joinedGroups.some(g => g.id === group.id)
                  
                  return (
                    <SlideIn key={group.id} delay={index * 100}>
                      <Card className="w-80 min-w-80 h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 group bg-card/80 backdrop-blur-sm flex-shrink-0">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-1">
                                <Badge variant="secondary" className={`${getActivityColor(group.activity)} border-0 text-xs px-1.5 py-0.5`}>
                                  {getActivityIcon(group.activity)}
                                  <span className="ml-1 capitalize font-medium">{group.activity}</span>
                                </Badge>
                                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                  {getPrivacyIcon(group.privacy)}
                                  <span className="capitalize">{group.privacy}</span>
                                </div>
                              </div>
                              <CardTitle className="text-base font-bold group-hover:text-primary transition-colors mb-1 line-clamp-1">
                                {group.name}
                              </CardTitle>
                            </div>
                            
                            <Avatar className="w-8 h-8 ring-1 ring-primary/20 flex-shrink-0">
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-xs">
                                {group.ownerName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          
                          <CardDescription className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                            {group.description}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          {/* Group Stats */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-1.5 p-1.5 rounded bg-muted/50">
                              <Users className="w-3 h-3 text-primary" />
                              <div>
                                <div className="font-semibold text-xs">{group.memberCount}/{group.maxMembers}</div>
                                <div className="text-xs text-muted-foreground">Members</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 p-1.5 rounded bg-muted/50">
                              <Clock className="w-3 h-3 text-primary" />
                              <div>
                                <div className="font-semibold text-xs">{formatMeetingTime(group) || 'Flexible'}</div>
                                <div className="text-xs text-muted-foreground">Schedule</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Current Reading Progress */}
                          {group.currentReading && (
                            <div className="space-y-1 p-2 rounded bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-xs">Surah {group.currentReading.surah}</span>
                                <span className="text-xs text-muted-foreground">{group.currentReading.completedAyahs}/{group.currentReading.targetAyahs}</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div 
                                  className="bg-gradient-to-r from-primary to-primary/80 h-1.5 rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${(group.currentReading.completedAyahs / group.currentReading.targetAyahs) * 100}%` 
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {group.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">
                                {tag}
                              </Badge>
                            ))}
                            {group.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                +{group.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-1 pt-1">
                            {isJoined ? (
                              <>
                                <Button 
                                  size="sm" 
                                  className="flex-1 h-8 text-xs"
                                  onClick={() => {
                                    setActiveGroup(group.id)
                                    trackEvent('group_view', { groupId: group.id })
                                  }}
                                >
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  Open
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-8 text-xs"
                                  onClick={() => handleLeaveGroup(group.id)}
                                >
                                  Leave
                                </Button>
                              </>
                            ) : (
                              <Button 
                                size="sm" 
                                className="flex-1 h-8 text-xs"
                                onClick={() => handleJoinGroup(group)}
                              >
                                <UserPlus className="w-3 h-3 mr-1" />
                                Join
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </SlideIn>
                  )
                })}
              </StaggeredList>
            </div>

            {filteredPublicGroups.length === 0 && (
              <Card className="text-center py-16 border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardContent>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">No groups found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Try adjusting your search criteria or be the first to create a new study group
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button size="lg" onClick={() => setShowCreateDialog(true)}>
                      <Plus className="w-5 h-5 mr-2" />
                      Create New Group
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => handleSearch('')}>
                      <Search className="w-5 h-5 mr-2" />
                      Clear Search
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Groups Tab */}
          <TabsContent value="my-groups" className="space-y-8">
            {joinedGroups.length > 0 ? (
              <div className="flex flex-row gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {joinedGroups.map((group, index) => (
                  <SlideIn key={group.id} delay={index * 100}>
                    <Card className="w-80 min-w-80 border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-200 flex-shrink-0">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {getActivityIcon(group.activity)}
                              {group.name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {group.memberCount} members • {group.activity}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Joined
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {group.description}
                        </p>
                        
                        {group.currentReading && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Current Reading</span>
                              <span>Surah {group.currentReading.surah}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ 
                                  width: `${(group.currentReading.completedAyahs / group.currentReading.targetAyahs) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setActiveGroup(group.id)
                              trackEvent('group_view', { groupId: group.id })
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Open
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleLeaveGroup(group.id)}
                          >
                            Leave
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </SlideIn>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No groups joined yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Discover and join study groups to enhance your learning
                  </p>
                  <Button onClick={() => setActiveTab('discover')}>
                    <Search className="w-4 h-4 mr-2" />
                    Discover Groups
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Recommended Tab */}
          <TabsContent value="recommended" className="space-y-6">
            <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Star className="w-5 h-5" />
                  Personalized for You
                </CardTitle>
                <CardDescription>
                  Based on your reading habits and preferences
                </CardDescription>
              </CardHeader>
            </Card>
            
            <div className="flex flex-row gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {recommendedGroups.map((group, index) => {
                const isJoined = joinedGroups.some(g => g.id === group.id)
                
                return (
                  <SlideIn key={group.id} delay={index * 100}>
                    <Card className="w-80 min-w-80 border-2 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30 flex-shrink-0">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            <Star className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
                          <Badge variant="secondary" className={getActivityColor(group.activity)}>
                            {getActivityIcon(group.activity)}
                            <span className="ml-1 capitalize">{group.activity}</span>
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription>{group.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{group.memberCount} members</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{group.language.toUpperCase()}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {group.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        {!isJoined && (
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleJoinGroup(group)}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Join Group
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </SlideIn>
                )
              })}
            </div>
          </TabsContent>

          {/* Live Sessions Tab */}
          <TabsContent value="active" className="space-y-6">
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No live sessions</h3>
                <p className="text-muted-foreground mb-4">
                  Join groups to participate in scheduled study sessions
                </p>
                <Button onClick={() => setActiveTab('discover')}>
                  <Users className="w-4 h-4 mr-2" />
                  Find Groups
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}