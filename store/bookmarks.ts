import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Bookmark {
  id: string
  surah: number
  ayah: number
  note?: string
  createdAt: number
  lastRead?: number
}

interface BookmarksState {
  bookmarks: Bookmark[]
  lastRead: { surah: number; ayah: number } | null
  
  addBookmark: (surah: number, ayah: number, note?: string) => void
  removeBookmark: (id: string) => void
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void
  getBookmark: (surah: number, ayah: number) => Bookmark | undefined
  isBookmarked: (surah: number, ayah: number) => boolean
  setLastRead: (surah: number, ayah: number) => void
  clearBookmarks: () => void
}

export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      lastRead: null,
      
      addBookmark: (surah, ayah, note) => {
        const id = `${surah}:${ayah}`
        const existingBookmark = get().bookmarks.find(b => b.id === id)
        
        if (existingBookmark) {
          // Update existing bookmark
          set((state) => ({
            bookmarks: state.bookmarks.map(b =>
              b.id === id 
                ? { ...b, note, lastRead: Date.now() }
                : b
            )
          }))
        } else {
          // Add new bookmark
          const bookmark: Bookmark = {
            id,
            surah,
            ayah,
            note,
            createdAt: Date.now(),
            lastRead: Date.now()
          }
          set((state) => ({
            bookmarks: [...state.bookmarks, bookmark]
          }))
        }
      },
      
      removeBookmark: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter(b => b.id !== id)
        }))
      },
      
      updateBookmark: (id, updates) => {
        set((state) => ({
          bookmarks: state.bookmarks.map(b =>
            b.id === id ? { ...b, ...updates } : b
          )
        }))
      },
      
      getBookmark: (surah, ayah) => {
        const id = `${surah}:${ayah}`
        return get().bookmarks.find(b => b.id === id)
      },
      
      isBookmarked: (surah, ayah) => {
        const id = `${surah}:${ayah}`
        return get().bookmarks.some(b => b.id === id)
      },
      
      setLastRead: (surah, ayah) => {
        set({ lastRead: { surah, ayah } })
        
        // Also update bookmark if exists
        const bookmark = get().getBookmark(surah, ayah)
        if (bookmark) {
          get().updateBookmark(bookmark.id, { lastRead: Date.now() })
        }
      },
      
      clearBookmarks: () => set({ bookmarks: [], lastRead: null }),
    }),
    {
      name: 'iqra-bookmarks',
      version: 1,
    }
  )
)