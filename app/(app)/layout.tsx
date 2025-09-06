'use client'

import { Sidebar } from '@/components/navigation/sidebar'
import { Header } from '@/components/navigation/header'
import { PageTransition } from '@/components/transitions/page-transition'
import { ProgressInitializer } from '@/components/progress-initializer'
import { useSidebarStore } from '@/store/sidebar'
import { cn } from '@/lib/utils'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isCollapsed, isMobileOpen, setMobileSidebarOpen } = useSidebarStore()

  return (
    <div className="flex h-screen bg-background">
      <ProgressInitializer />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col transition-all duration-300 ease-in-out">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
            onClick={() => setMobileSidebarOpen(false)} 
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={cn(
        "flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out",
        isCollapsed ? "md:ml-0" : "md:ml-0"
      )}>
        <Header />
        <main className="flex-1 overflow-y-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
