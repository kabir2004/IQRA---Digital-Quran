'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  User, 
  Bell, 
  Eye, 
  Volume2, 
  Type, 
  Languages, 
  Moon, 
  Sun, 
  Monitor,
  Download,
  Upload,
  Trash2,
  Shield,
  HelpCircle,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useSettingsStore } from '@/store/settings'
import { useProgressStore } from '@/store/progress'

export default function SettingsPage() {
  const {
    fontSize,
    showTranslation,
    rtl,
    theme,
    audioEnabled,
    autoPlay,
    notifications,
    setFontSize,
    setShowTranslation,
    setRTL: setRtl,
    setTheme,
    setAudioEnabled,
    setAutoPlay,
    setNotifications
  } = useSettingsStore()

  const { resetProgress } = useProgressStore()

  const [activeTab, setActiveTab] = useState('general')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      // Export user data
      const userData = {
        settings: {
          fontSize,
          showTranslation,
          rtl,
          theme,
          audioEnabled,
          autoPlay,
          notifications
        },
        progress: useProgressStore.getState(),
        timestamp: new Date().toISOString()
      }

      const dataStr = JSON.stringify(userData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `iqra-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const text = await file.text()
      const userData = JSON.parse(text)
      
      // Import settings
      if (userData.settings) {
        const { settings } = userData
        if (settings.fontSize) setFontSize(settings.fontSize)
        if (settings.showTranslation !== undefined) setShowTranslation(settings.showTranslation)
        if (settings.rtl !== undefined) setRtl(settings.rtl)
        if (settings.theme) setTheme(settings.theme)
        if (settings.audioEnabled !== undefined) setAudioEnabled(settings.audioEnabled)
        if (settings.autoPlay !== undefined) setAutoPlay(settings.autoPlay)
        if (settings.notifications !== undefined) setNotifications(settings.notifications)
      }

      // Import progress
      if (userData.progress) {
        // This would typically update the progress store
        console.log('Progress imported:', userData.progress)
      }
    } catch (error) {
      console.error('Import failed:', error)
    } finally {
      setIsImporting(false)
    }
  }

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      resetProgress()
      // Reset settings to defaults
      setFontSize('medium')
      setShowTranslation(true)
      setRtl(false)
      setTheme('system')
      setAudioEnabled(true)
      setAutoPlay(false)
      setNotifications(true)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your Quran learning experience</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="reading">Reading</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile
                </CardTitle>
                <CardDescription>Manage your account and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" placeholder="Enter your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter your email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="ur">اردو</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders and updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Reading Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded to read daily
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Achievement Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified of new achievements
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reading Settings */}
          <TabsContent value="reading" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Text Display
                </CardTitle>
                <CardDescription>Customize how text is displayed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="extra-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Translation</Label>
                    <p className="text-sm text-muted-foreground">
                      Display English translation by default
                    </p>
                  </div>
                  <Switch
                    checked={showTranslation}
                    onCheckedChange={setShowTranslation}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Right-to-Left Layout</Label>
                    <p className="text-sm text-muted-foreground">
                      Use RTL layout for Arabic text
                    </p>
                  </div>
                  <Switch
                    checked={rtl}
                    onCheckedChange={setRtl}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Translation Preferences
                </CardTitle>
                <CardDescription>Choose your preferred translations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Translation</Label>
                  <Select defaultValue="sahih">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sahih">Sahih International</SelectItem>
                      <SelectItem value="pickthall">Pickthall</SelectItem>
                      <SelectItem value="yusufali">Yusuf Ali</SelectItem>
                      <SelectItem value="shakir">Shakir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Translation</Label>
                  <Select defaultValue="none">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="pickthall">Pickthall</SelectItem>
                      <SelectItem value="yusufali">Yusuf Ali</SelectItem>
                      <SelectItem value="shakir">Shakir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audio Settings */}
          <TabsContent value="audio" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Audio Preferences
                </CardTitle>
                <CardDescription>Configure audio playback settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Audio</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow audio playback for recitation
                    </p>
                  </div>
                  <Switch
                    checked={audioEnabled}
                    onCheckedChange={setAudioEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-play</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically play audio when opening verses
                    </p>
                  </div>
                  <Switch
                    checked={autoPlay}
                    onCheckedChange={setAutoPlay}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Volume</Label>
                  <Slider
                    defaultValue={[70]}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reciter</Label>
                  <Select defaultValue="abdul-basit">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abdul-basit">Abdul Basit</SelectItem>
                      <SelectItem value="mishary">Mishary Rashid</SelectItem>
                      <SelectItem value="sudais">Sheikh Sudais</SelectItem>
                      <SelectItem value="shuraim">Sheikh Shuraim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>Manage your privacy and data security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the app by sharing usage data
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Crash Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically send crash reports
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Data Retention</Label>
                  <Select defaultValue="1year">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">30 days</SelectItem>
                      <SelectItem value="6months">6 months</SelectItem>
                      <SelectItem value="1year">1 year</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Data Management
                </CardTitle>
                <CardDescription>Export, import, or reset your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Export Data</Label>
                    <Button 
                      onClick={handleExportData} 
                      disabled={isExporting}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isExporting ? 'Exporting...' : 'Export All Data'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Download your settings, progress, and bookmarks
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Import Data</Label>
                    <div className="relative">
                      <Input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        disabled={isImporting}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={isImporting}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isImporting ? 'Importing...' : 'Import Data'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Restore from a previous backup
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <Label className="text-destructive">Danger Zone</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="destructive" 
                      onClick={handleResetData}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Reset All Data
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      This will permanently delete all your progress, bookmarks, and settings
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Version</p>
                    <p className="font-medium">1.0.0</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Build</p>
                    <p className="font-medium">2024.01.15</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help & Support
                  </Button>
                  <Button variant="outline" className="w-full">
                    Privacy Policy
                  </Button>
                  <Button variant="outline" className="w-full">
                    Terms of Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
