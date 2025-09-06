import { useAudioStore } from '@/store/audio'

export class AudioController {
  private audio: HTMLAudioElement | null = null
  private store = useAudioStore.getState()
  
  constructor() {
    // Subscribe to store updates
    useAudioStore.subscribe((state) => {
      this.store = state
    })
  }
  
  async load(surah: number, ayah: number): Promise<void> {
    try {
      this.store.setLoading(true)
      
      // For demo, use placeholder audio files
      const audioUrl = `/audio/${surah}/${ayah}.mp3`
      
      if (this.audio) {
        this.audio.pause()
        this.audio = null
      }
      
      this.audio = new Audio(audioUrl)
      
      this.audio.addEventListener('loadedmetadata', () => {
        this.store.updateProgress(0, this.audio?.duration || 0)
      })
      
      this.audio.addEventListener('timeupdate', () => {
        if (this.audio) {
          this.store.updateProgress(this.audio.currentTime, this.audio.duration)
        }
      })
      
      this.audio.addEventListener('ended', () => {
        this.handleAudioEnded()
      })
      
      this.audio.addEventListener('error', () => {
        console.warn(`Audio not found for Surah ${surah}, Ayah ${ayah}`)
        this.store.setLoading(false)
      })
      
      await this.audio.load()
      this.store.setLoading(false)
    } catch (error) {
      console.error('Failed to load audio:', error)
      this.store.setLoading(false)
    }
  }
  
  async play(): Promise<void> {
    if (!this.audio) return
    
    try {
      await this.audio.play()
    } catch (error) {
      console.error('Failed to play audio:', error)
    }
  }
  
  pause(): void {
    this.audio?.pause()
  }
  
  stop(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
    }
    this.store.stop()
  }
  
  private handleAudioEnded(): void {
    const { repeatMode, repeatCount, nextAyah } = this.store
    
    if (repeatMode === 'infinite') {
      this.audio?.play()
      return
    }
    
    if (repeatMode > 1 && repeatCount < repeatMode - 1) {
      useAudioStore.setState({ repeatCount: repeatCount + 1 })
      this.audio?.play()
      return
    }
    
    // Move to next ayah or stop
    nextAyah()
    this.store.pause()
  }
  
  seekTo(time: number): void {
    if (this.audio) {
      this.audio.currentTime = time
    }
  }
  
  destroy(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio = null
    }
  }
}

export const audioController = new AudioController()