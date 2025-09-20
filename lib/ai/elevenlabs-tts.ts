// ElevenLabs TTS Integration for Master Qari Voices
export interface QariVoice {
  id: string
  name: string
  displayName: string
  description: string
  specialty: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  country: string
  style: 'traditional' | 'modern' | 'melodic' | 'educational'
  sample_url?: string
}

export const AVAILABLE_QARIS: QariVoice[] = [
  {
    id: 'abdul_rahman_as_sudais',
    name: 'AbdulRahman As-Sudais',
    displayName: 'الشيخ عبد الرحمن السديس',
    description: 'Imam of Masjid al-Haram, known for beautiful and clear recitation',
    specialty: ['slow_clear', 'educational', 'beginners'],
    difficulty: 'beginner',
    country: 'Saudi Arabia',
    style: 'traditional'
  },
  {
    id: 'mishary_rashid_alafasy',
    name: 'Mishary Rashid Alafasy',
    displayName: 'مشاري بن راشد العفاسي',
    description: 'Popular Kuwaiti reciter with melodic style',
    specialty: ['melodic', 'emotional', 'popular'],
    difficulty: 'intermediate',
    country: 'Kuwait',
    style: 'melodic'
  },
  {
    id: 'saad_al_ghamdi',
    name: "Sa'd Al-Ghamdi",
    displayName: 'سعد الغامدي',
    description: 'Precise pronunciation ideal for learning',
    specialty: ['precise', 'educational', 'tajweed'],
    difficulty: 'intermediate',
    country: 'Saudi Arabia',
    style: 'educational'
  },
  {
    id: 'maher_al_muaiqly',
    name: 'Maher Al-Muaiqly',
    displayName: 'ماهر المعيقلي',
    description: 'Emotional and powerful recitation style',
    specialty: ['powerful', 'emotional', 'advanced'],
    difficulty: 'advanced',
    country: 'Saudi Arabia',
    style: 'traditional'
  },
  {
    id: 'omar_al_kazabri',
    name: 'Omar Al-Kazabri',
    displayName: 'عمر القزابري',
    description: 'Modern teaching style, perfect for children',
    specialty: ['children', 'slow', 'educational'],
    difficulty: 'beginner',
    country: 'Morocco',
    style: 'educational'
  }
]

export interface TTSRequest {
  text: string
  voice_id: string
  model_id?: string
  voice_settings?: {
    stability: number
    similarity_boost: number
    style?: number
    use_speaker_boost?: boolean
  }
  pronunciation_dictionary_locators?: Array<{
    pronunciation_dictionary_id: string
    version_id: string
  }>
}

export interface TTSResponse {
  audio_base64?: string
  alignment?: {
    characters: string[]
    character_start_times_seconds: number[]
    character_end_times_seconds: number[]
  }
}

export class ElevenLabsTTSService {
  private apiKey: string
  private baseUrl = 'https://api.elevenlabs.io/v1'
  private voiceCache = new Map<string, string>()

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  // Convert Arabic text to speech using selected Qari voice
  async generateRecitation(
    arabicText: string, 
    qariId: string,
    options?: {
      speed?: number
      emphasis?: 'normal' | 'tajweed' | 'slow_learning'
      includeAlignment?: boolean
    }
  ): Promise<{
    audioUrl: string
    alignment?: TTSResponse['alignment']
    phonetics?: string
  }> {
    try {
      const qari = AVAILABLE_QARIS.find(q => q.id === qariId)
      if (!qari) throw new Error(`Qari ${qariId} not found`)

      // Get or create ElevenLabs voice for this Qari
      const voiceId = await this.getOrCreateQariVoice(qari)

      const request: TTSRequest = {
        text: this.preprocessArabicText(arabicText, options?.emphasis),
        voice_id: voiceId,
        model_id: 'eleven_multilingual_v2', // Best for Arabic
        voice_settings: {
          stability: 0.8,
          similarity_boost: 0.8,
          style: options?.speed === 0.5 ? 0.3 : 0.7, // Slower for learning
          use_speaker_boost: true
        }
      }

      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.statusText}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // If alignment requested, make separate call
      let alignment
      if (options?.includeAlignment) {
        alignment = await this.getTextAlignment(arabicText, voiceId)
      }

      return {
        audioUrl,
        alignment,
        phonetics: this.generatePhonetics(arabicText)
      }
    } catch (error) {
      console.error('TTS generation failed:', error)
      throw error
    }
  }

  // Generate pronunciation examples for specific letters/words
  async generatePronunciationExample(
    letter: string,
    context: 'isolated' | 'in_word' | 'with_tajweed',
    qariId: string
  ): Promise<string> {
    const examples = {
      isolated: `${letter} - ${letter} - ${letter}`,
      in_word: this.getLetterInWordExample(letter),
      with_tajweed: this.getLetterWithTajweedExample(letter)
    }

    const result = await this.generateRecitation(
      examples[context], 
      qariId, 
      { speed: 0.7, emphasis: 'tajweed' }
    )

    return result.audioUrl
  }

  // Generate correction audio for specific mistakes
  async generateCorrectionExample(
    originalText: string,
    mistakeType: string,
    mistakePosition: number,
    qariId: string
  ): Promise<{
    correctAudio: string
    slowAudio: string
    explanation: string
  }> {
    // Extract the problematic part
    const words = originalText.split(' ')
    const contextBefore = words.slice(Math.max(0, mistakePosition - 1), mistakePosition).join(' ')
    const problematicWord = words[mistakePosition]
    const contextAfter = words.slice(mistakePosition + 1, mistakePosition + 2).join(' ')

    const correctionText = `${contextBefore} ${problematicWord} ${contextAfter}`
    
    // Generate both normal and slow versions
    const [correctAudio, slowAudio] = await Promise.all([
      this.generateRecitation(correctionText, qariId, { emphasis: 'normal' }),
      this.generateRecitation(correctionText, qariId, { speed: 0.5, emphasis: 'slow_learning' })
    ])

    return {
      correctAudio: correctAudio.audioUrl,
      slowAudio: slowAudio.audioUrl,
      explanation: this.generateMistakeExplanation(mistakeType, problematicWord)
    }
  }

  // Get available voices for the user to choose from
  async getAvailableVoices(): Promise<QariVoice[]> {
    return AVAILABLE_QARIS
  }

  // Clone a voice from audio samples (for custom Qaris)
  async cloneQariVoice(
    qariName: string,
    audioSamples: File[],
    description?: string
  ): Promise<string> {
    const formData = new FormData()
    formData.append('name', qariName)
    if (description) formData.append('description', description)
    
    audioSamples.forEach((file, index) => {
      formData.append('files', file, `sample_${index}.mp3`)
    })

    const response = await fetch(`${this.baseUrl}/voices/add`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Voice cloning failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.voice_id
  }

  private async getOrCreateQariVoice(qari: QariVoice): Promise<string> {
    // Check cache first
    if (this.voiceCache.has(qari.id)) {
      return this.voiceCache.get(qari.id)!
    }

    // In a real implementation, you would:
    // 1. Check if voice already exists in ElevenLabs
    // 2. If not, clone it from high-quality samples
    // 3. Store the voice_id mapping
    
    // For demo, using a placeholder voice ID
    const voiceId = `voice_${qari.id}`
    this.voiceCache.set(qari.id, voiceId)
    
    return voiceId
  }

  private preprocessArabicText(text: string, emphasis?: string): string {
    // Add proper pauses and emphasis for better recitation
    let processedText = text

    if (emphasis === 'tajweed') {
      // Add subtle pauses for Tajweed rules
      processedText = processedText
        .replace(/([نم])([بمف])/g, '$1 $2') // Ikhfa pauses
        .replace(/(الله)/g, 'ٱللَّٰه') // Proper Allah pronunciation
    }

    if (emphasis === 'slow_learning') {
      // Add more pauses for learning
      processedText = processedText.replace(/(\s)/g, '، ')
    }

    return processedText
  }

  private async getTextAlignment(text: string, voiceId: string): Promise<TTSResponse['alignment']> {
    // This would make a separate API call to get character-level timing
    // Useful for highlighting text as it's being spoken
    return {
      characters: text.split(''),
      character_start_times_seconds: [],
      character_end_times_seconds: []
    }
  }

  private generatePhonetics(arabicText: string): string {
    // Convert Arabic to IPA or simplified phonetic representation
    const phoneticMap: Record<string, string> = {
      'ا': 'ā',
      'ب': 'b',
      'ت': 't',
      'ث': 'th',
      'ج': 'j',
      'ح': 'ḥ',
      'خ': 'kh',
      'د': 'd',
      'ذ': 'dh',
      'ر': 'r',
      'ز': 'z',
      'س': 's',
      'ش': 'sh',
      'ص': 'ṣ',
      'ض': 'ḍ',
      'ط': 'ṭ',
      'ظ': 'ẓ',
      'ع': 'ʿ',
      'غ': 'gh',
      'ف': 'f',
      'ق': 'q',
      'ك': 'k',
      'ل': 'l',
      'م': 'm',
      'ن': 'n',
      'ه': 'h',
      'و': 'w',
      'ي': 'y'
    }

    return arabicText
      .split('')
      .map(char => phoneticMap[char] || char)
      .join('')
  }

  private getLetterInWordExample(letter: string): string {
    const examples: Record<string, string> = {
      'ر': 'رَحْمَن', // Rahman
      'غ': 'غَفُور', // Ghafur
      'ق': 'قُرْآن', // Quran
      'ح': 'حَمْد', // Hamd
      'ع': 'عَلِيم', // Alim
    }
    
    return examples[letter] || letter
  }

  private getLetterWithTajweedExample(letter: string): string {
    // Examples that demonstrate Tajweed rules
    const tajweedExamples: Record<string, string> = {
      'ن': 'مِن بَعْد', // Ikhfa example
      'م': 'هُم بِهِ', // Ikhfa example  
      'ل': 'اللَّه', // Tafkheem/Tarqeeq
      'ر': 'الرَّحْمَن' // Ra rules
    }
    
    return tajweedExamples[letter] || letter
  }

  private generateMistakeExplanation(mistakeType: string, word: string): string {
    const explanations: Record<string, string> = {
      'makhraj': `The letter requires proper articulation from its specific point of origin (Makhraj)`,
      'ghunnah': `This requires a nasal sound (Ghunnah) held for 2 counts`,
      'madd': `This requires elongation (Madd) - stretch the sound`,
      'qalqalah': `This letter requires a slight echo/bounce (Qalqalah)`,
      'ra_rules': `The 'Ra' should be pronounced with thickness (Tafkheem) in this context`
    }
    
    return explanations[mistakeType] || 'Practice this pronunciation carefully'
  }
}

// React hook for TTS integration
import { useCallback, useState } from 'react'
import { useSettingsStore } from '@/store/settings'

export function useQariTTS() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const { preferredQari } = useSettingsStore()

  // Initialize TTS service (you'd get API key from environment)
  const ttsService = new ElevenLabsTTSService(process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '')

  const playRecitation = useCallback(async (
    text: string, 
    options?: { 
      qariId?: string
      speed?: number
      emphasis?: 'normal' | 'tajweed' | 'slow_learning'
      onProgress?: (progress: number) => void
    }
  ) => {
    setIsLoading(true)
    
    try {
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }

      const result = await ttsService.generateRecitation(
        text,
        options?.qariId || preferredQari || 'abdul_rahman_as_sudais',
        {
          speed: options?.speed,
          emphasis: options?.emphasis,
          includeAlignment: !!options?.onProgress
        }
      )

      const audio = new Audio(result.audioUrl)
      setCurrentAudio(audio)

      // Handle progress callback if alignment data available
      if (result.alignment && options?.onProgress) {
        audio.addEventListener('timeupdate', () => {
          const progress = (audio.currentTime / audio.duration) * 100
          options.onProgress!(progress)
        })
      }

      await audio.play()
      
      return {
        audio,
        phonetics: result.phonetics,
        alignment: result.alignment
      }
    } catch (error) {
      console.error('Playback failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [currentAudio, preferredQari])

  const generateExample = useCallback(async (
    letter: string,
    context: 'isolated' | 'in_word' | 'with_tajweed'
  ) => {
    const audioUrl = await ttsService.generatePronunciationExample(
      letter,
      context,
      preferredQari || 'abdul_rahman_as_sudais'
    )
    
    const audio = new Audio(audioUrl)
    await audio.play()
    
    return audio
  }, [preferredQari])

  const stopPlayback = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
    }
  }, [currentAudio])

  return {
    playRecitation,
    generateExample,
    stopPlayback,
    isLoading,
    isPlaying: currentAudio && !currentAudio.paused,
    availableQaris: AVAILABLE_QARIS
  }
}