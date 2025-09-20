// Advanced Arabic Speech Recognition and Pronunciation Analysis
import { PronunciationAttempt, TajweedFeedback, PronunciationMistake, TajweedRule } from './voice-learning-engine'

export interface ArabicPhoneme {
  letter: string
  phonetic: string
  makhraj: string // Point of articulation
  sifat: string[] // Characteristics
  expectedDuration: number // in ms
  tajweedRules: TajweedRule[]
}

export interface SpeechAnalysisResult {
  transcription: string
  confidence: number
  phonemeAnalysis: PhonemeAnalysis[]
  tajweedAssessment: TajweedAssessment
  timingAnalysis: TimingAnalysis
  overallScore: number
  detailedFeedback: string[]
  corrections: PronunciationCorrection[]
}

export interface PhonemeAnalysis {
  expected: ArabicPhoneme
  detected: string
  accuracy: number
  makhrajCorrectness: number
  sifatCorrectness: number
  feedback: string
  needsImprovement: boolean
}

export interface TajweedAssessment {
  rulesDetected: Array<{
    rule: TajweedRule
    position: { start: number; end: number }
    executed: boolean
    accuracy: number
    feedback: string
  }>
  overallTajweedScore: number
  criticalMistakes: string[]
  suggestions: string[]
}

export interface TimingAnalysis {
  totalDuration: number
  expectedDuration: number
  paceScore: number // 0-100
  pauseAccuracy: number // 0-100
  rhythmScore: number // 0-100
  breathingPoints: Array<{
    position: number
    expected: boolean
    detected: boolean
    appropriate: boolean
  }>
}

export interface PronunciationCorrection {
  position: { start: number; end: number }
  issue: string
  severity: 'minor' | 'moderate' | 'major'
  explanation: string
  exercise: string
  audioExample?: string
}

// Arabic phoneme database
export const ARABIC_PHONEMES: Record<string, ArabicPhoneme> = {
  'ا': {
    letter: 'ا',
    phonetic: 'ā',
    makhraj: 'throat_deepest',
    sifat: ['soft', 'open'],
    expectedDuration: 150,
    tajweedRules: ['madd']
  },
  'ب': {
    letter: 'ب',
    phonetic: 'b',
    makhraj: 'lips',
    sifat: ['explosive', 'soft'],
    expectedDuration: 80,
    tajweedRules: ['qalqalah']
  },
  'ت': {
    letter: 'ت',
    phonetic: 't',
    makhraj: 'tongue_tip',
    sifat: ['explosive', 'soft'],
    expectedDuration: 70,
    tajweedRules: []
  },
  'ث': {
    letter: 'ث',
    phonetic: 'th',
    makhraj: 'tongue_tip_teeth',
    sifat: ['fricative', 'soft'],
    expectedDuration: 120,
    tajweedRules: []
  },
  'ج': {
    letter: 'ج',
    phonetic: 'j',
    makhraj: 'tongue_middle',
    sifat: ['explosive', 'soft'],
    expectedDuration: 85,
    tajweedRules: ['qalqalah']
  },
  'ح': {
    letter: 'ح',
    phonetic: 'ḥ',
    makhraj: 'throat_middle',
    sifat: ['fricative', 'soft'],
    expectedDuration: 110,
    tajweedRules: []
  },
  'خ': {
    letter: 'خ',
    phonetic: 'kh',
    makhraj: 'throat_upper',
    sifat: ['fricative', 'soft'],
    expectedDuration: 130,
    tajweedRules: []
  },
  'د': {
    letter: 'د',
    phonetic: 'd',
    makhraj: 'tongue_tip',
    sifat: ['explosive', 'soft'],
    expectedDuration: 75,
    tajweedRules: ['qalqalah']
  },
  'ذ': {
    letter: 'ذ',
    phonetic: 'dh',
    makhraj: 'tongue_tip_teeth',
    sifat: ['fricative', 'soft'],
    expectedDuration: 115,
    tajweedRules: []
  },
  'ر': {
    letter: 'ر',
    phonetic: 'r',
    makhraj: 'tongue_tip_rolled',
    sifat: ['trill', 'variable_thickness'],
    expectedDuration: 90,
    tajweedRules: ['ra_tafkheem', 'ra_tarqeeq']
  },
  'ز': {
    letter: 'ز',
    phonetic: 'z',
    makhraj: 'tongue_tip_teeth',
    sifat: ['fricative', 'soft'],
    expectedDuration: 95,
    tajweedRules: []
  },
  'س': {
    letter: 'س',
    phonetic: 's',
    makhraj: 'tongue_tip_teeth',
    sifat: ['fricative', 'soft'],
    expectedDuration: 100,
    tajweedRules: []
  },
  'ش': {
    letter: 'ش',
    phonetic: 'sh',
    makhraj: 'tongue_middle',
    sifat: ['fricative', 'soft'],
    expectedDuration: 120,
    tajweedRules: []
  },
  'ص': {
    letter: 'ص',
    phonetic: 'ṣ',
    makhraj: 'tongue_tip_teeth',
    sifat: ['fricative', 'thick'],
    expectedDuration: 110,
    tajweedRules: []
  },
  'ض': {
    letter: 'ض',
    phonetic: 'ḍ',
    makhraj: 'tongue_side',
    sifat: ['explosive', 'thick'],
    expectedDuration: 85,
    tajweedRules: []
  },
  'ط': {
    letter: 'ط',
    phonetic: 'ṭ',
    makhraj: 'tongue_tip',
    sifat: ['explosive', 'thick'],
    expectedDuration: 80,
    tajweedRules: ['qalqalah']
  },
  'ظ': {
    letter: 'ظ',
    phonetic: 'ẓ',
    makhraj: 'tongue_tip_teeth',
    sifat: ['fricative', 'thick'],
    expectedDuration: 125,
    tajweedRules: []
  },
  'ع': {
    letter: 'ع',
    phonetic: 'ʿ',
    makhraj: 'throat_middle',
    sifat: ['fricative', 'soft'],
    expectedDuration: 100,
    tajweedRules: []
  },
  'غ': {
    letter: 'غ',
    phonetic: 'gh',
    makhraj: 'throat_upper',
    sifat: ['fricative', 'soft'],
    expectedDuration: 120,
    tajweedRules: []
  },
  'ف': {
    letter: 'ف',
    phonetic: 'f',
    makhraj: 'lip_teeth',
    sifat: ['fricative', 'soft'],
    expectedDuration: 105,
    tajweedRules: []
  },
  'ق': {
    letter: 'ق',
    phonetic: 'q',
    makhraj: 'tongue_base',
    sifat: ['explosive', 'thick'],
    expectedDuration: 90,
    tajweedRules: ['qalqalah']
  },
  'ك': {
    letter: 'ك',
    phonetic: 'k',
    makhraj: 'tongue_base',
    sifat: ['explosive', 'soft'],
    expectedDuration: 75,
    tajweedRules: []
  },
  'ل': {
    letter: 'ل',
    phonetic: 'l',
    makhraj: 'tongue_tip_side',
    sifat: ['liquid', 'variable_thickness'],
    expectedDuration: 85,
    tajweedRules: ['lam_tafkheem', 'lam_tarqeeq']
  },
  'م': {
    letter: 'م',
    phonetic: 'm',
    makhraj: 'lips',
    sifat: ['nasal', 'soft'],
    expectedDuration: 90,
    tajweedRules: ['ghunnah', 'ikhfa', 'idgham']
  },
  'ن': {
    letter: 'ن',
    phonetic: 'n',
    makhraj: 'tongue_tip',
    sifat: ['nasal', 'soft'],
    expectedDuration: 85,
    tajweedRules: ['ghunnah', 'ikhfa', 'idgham', 'iqlab', 'izhar']
  },
  'ه': {
    letter: 'ه',
    phonetic: 'h',
    makhraj: 'throat_deepest',
    sifat: ['fricative', 'soft'],
    expectedDuration: 95,
    tajweedRules: []
  },
  'و': {
    letter: 'و',
    phonetic: 'w',
    makhraj: 'lips_rounded',
    sifat: ['glide', 'soft'],
    expectedDuration: 100,
    tajweedRules: ['madd']
  },
  'ي': {
    letter: 'ي',
    phonetic: 'y',
    makhraj: 'tongue_middle',
    sifat: ['glide', 'soft'],
    expectedDuration: 95,
    tajweedRules: ['madd']
  }
}

export class ArabicSpeechRecognitionEngine {
  private audioContext: AudioContext | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private isRecording = false

  // Initialize audio context and recording setup
  async initialize(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data)
      }

      console.log('Speech recognition engine initialized')
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error)
      throw error
    }
  }

  // Start recording user's recitation
  startRecording(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Speech recognition not initialized'))
        return
      }

      this.audioChunks = []
      this.isRecording = true

      this.mediaRecorder.start(100) // Capture in 100ms chunks for real-time analysis
      
      this.mediaRecorder.onstop = () => {
        this.isRecording = false
        resolve()
      }

      this.mediaRecorder.onerror = (error) => {
        this.isRecording = false
        reject(error)
      }
    })
  }

  // Stop recording and get audio blob
  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(new Blob())
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  // Analyze pronunciation against expected Arabic text
  async analyzePronunciation(
    audioBlob: Blob,
    expectedText: string,
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<SpeechAnalysisResult> {
    try {
      // Step 1: Convert speech to text (transcription)
      const transcription = await this.performSpeechToText(audioBlob)
      
      // Step 2: Analyze audio characteristics
      const audioFeatures = await this.extractAudioFeatures(audioBlob)
      
      // Step 3: Compare with expected pronunciation
      const phonemeAnalysis = this.analyzePhonemes(expectedText, transcription, audioFeatures)
      
      // Step 4: Assess Tajweed rules
      const tajweedAssessment = this.assessTajweedRules(expectedText, audioFeatures, phonemeAnalysis)
      
      // Step 5: Analyze timing and rhythm
      const timingAnalysis = this.analyzeTimingAndRhythm(audioFeatures, expectedText)
      
      // Step 6: Generate overall score and feedback
      const overallScore = this.calculateOverallScore(phonemeAnalysis, tajweedAssessment, timingAnalysis, difficultyLevel)
      
      // Step 7: Generate corrections and suggestions
      const corrections = this.generateCorrections(phonemeAnalysis, tajweedAssessment)
      
      const detailedFeedback = this.generateDetailedFeedback(
        phonemeAnalysis, 
        tajweedAssessment, 
        timingAnalysis,
        difficultyLevel
      )

      return {
        transcription,
        confidence: this.calculateConfidence(transcription, expectedText),
        phonemeAnalysis,
        tajweedAssessment,
        timingAnalysis,
        overallScore,
        detailedFeedback,
        corrections
      }
    } catch (error) {
      console.error('Speech analysis failed:', error)
      throw error
    }
  }

  // Real-time pronunciation feedback during recording
  async provideRealTimeFeedback(
    onFeedback: (feedback: {
      currentPhoneme: string
      accuracy: number
      suggestion: string
      visualCue: 'good' | 'warning' | 'error'
    }) => void
  ): Promise<void> {
    if (!this.mediaRecorder || !this.isRecording) return

    // This would analyze audio in real-time chunks
    // and provide immediate feedback to the user
    console.log('Starting real-time feedback...')
  }

  private async performSpeechToText(audioBlob: Blob): Promise<string> {
    // This would integrate with a speech recognition service
    // that's specifically trained on Arabic Quranic recitation
    
    // Options:
    // 1. Google Cloud Speech-to-Text with Arabic model
    // 2. Azure Cognitive Services Speech
    // 3. Custom-trained Whisper model for Arabic/Quranic text
    // 4. Specialized Arabic ASR service
    
    try {
      // Example using Web Speech API (limited but free)
      if ('webkitSpeechRecognition' in window) {
        return await this.useWebSpeechAPI(audioBlob)
      }
      
      // Fallback: Send to custom API endpoint
      return await this.sendToSpeechAPI(audioBlob)
    } catch (error) {
      console.error('Speech-to-text failed:', error)
      return ''
    }
  }

  private async useWebSpeechAPI(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.lang = 'ar-SA' // Arabic (Saudi Arabia)
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        resolve(transcript)
      }

      recognition.onerror = (error: any) => {
        reject(error)
      }

      // Convert blob to audio element and trigger recognition
      const audio = new Audio(URL.createObjectURL(audioBlob))
      recognition.start()
    })
  }

  private async sendToSpeechAPI(audioBlob: Blob): Promise<string> {
    // Send audio to your custom speech recognition endpoint
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')
    formData.append('language', 'ar')
    formData.append('model', 'quran')

    const response = await fetch('/api/speech-to-text', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Speech recognition API failed')
    }

    const result = await response.json()
    return result.transcription || ''
  }

  private async extractAudioFeatures(audioBlob: Blob): Promise<AudioFeatures> {
    // Extract audio features for pronunciation analysis
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer)
    
    return {
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      channelData: audioBuffer.getChannelData(0),
      // Additional features would be extracted here:
      // - Fundamental frequency (F0)
      // - Formants (F1, F2, F3)
      // - Spectral features
      // - Energy/intensity
      // - Voice quality measures
    }
  }

  private analyzePhonemes(
    expectedText: string,
    transcription: string,
    audioFeatures: AudioFeatures
  ): PhonemeAnalysis[] {
    const expectedPhonemes = this.extractPhonemes(expectedText)
    const analysis: PhonemeAnalysis[] = []

    expectedPhonemes.forEach((phoneme, index) => {
      // Compare expected vs detected phoneme characteristics
      const accuracy = this.comparePhonemeAccuracy(phoneme, audioFeatures, index)
      const makhrajCorrectness = this.assessMakhraj(phoneme, audioFeatures, index)
      const sifatCorrectness = this.assessSifat(phoneme, audioFeatures, index)

      analysis.push({
        expected: phoneme,
        detected: transcription[index] || '',
        accuracy,
        makhrajCorrectness,
        sifatCorrectness,
        feedback: this.generatePhonemesFeedback(phoneme, accuracy, makhrajCorrectness),
        needsImprovement: accuracy < 80
      })
    })

    return analysis
  }

  private assessTajweedRules(
    expectedText: string,
    audioFeatures: AudioFeatures,
    phonemeAnalysis: PhonemeAnalysis[]
  ): TajweedAssessment {
    const rulesDetected = this.detectTajweedRules(expectedText, audioFeatures)
    const overallTajweedScore = this.calculateTajweedScore(rulesDetected)
    const criticalMistakes = this.identifyCriticalMistakes(rulesDetected)
    const suggestions = this.generateTajweedSuggestions(rulesDetected, criticalMistakes)

    return {
      rulesDetected,
      overallTajweedScore,
      criticalMistakes,
      suggestions
    }
  }

  private analyzeTimingAndRhythm(
    audioFeatures: AudioFeatures,
    expectedText: string
  ): TimingAnalysis {
    const expectedDuration = this.calculateExpectedDuration(expectedText)
    const paceScore = this.calculatePaceScore(audioFeatures.duration, expectedDuration)
    const rhythmScore = this.calculateRhythmScore(audioFeatures)
    const breathingPoints = this.analyzeBreathingPoints(audioFeatures, expectedText)

    return {
      totalDuration: audioFeatures.duration,
      expectedDuration,
      paceScore,
      pauseAccuracy: this.calculatePauseAccuracy(audioFeatures, expectedText),
      rhythmScore,
      breathingPoints
    }
  }

  private calculateOverallScore(
    phonemeAnalysis: PhonemeAnalysis[],
    tajweedAssessment: TajweedAssessment,
    timingAnalysis: TimingAnalysis,
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  ): number {
    const weights = {
      beginner: { phonemes: 0.6, tajweed: 0.2, timing: 0.2 },
      intermediate: { phonemes: 0.4, tajweed: 0.4, timing: 0.2 },
      advanced: { phonemes: 0.3, tajweed: 0.5, timing: 0.2 }
    }

    const avgPhonemeScore = phonemeAnalysis.reduce((sum, p) => sum + p.accuracy, 0) / phonemeAnalysis.length
    const { phonemes, tajweed, timing } = weights[difficultyLevel]

    return Math.round(
      avgPhonemeScore * phonemes +
      tajweedAssessment.overallTajweedScore * tajweed +
      timingAnalysis.paceScore * timing
    )
  }

  private generateDetailedFeedback(
    phonemeAnalysis: PhonemeAnalysis[],
    tajweedAssessment: TajweedAssessment,
    timingAnalysis: TimingAnalysis,
    difficultyLevel: string
  ): string[] {
    const feedback: string[] = []

    // Phoneme feedback
    const poorPhonemes = phonemeAnalysis.filter(p => p.accuracy < 70)
    if (poorPhonemes.length > 0) {
      feedback.push(`Focus on improving these letters: ${poorPhonemes.map(p => p.expected.letter).join(', ')}`)
    }

    // Tajweed feedback
    if (tajweedAssessment.overallTajweedScore < 80) {
      feedback.push('Work on your Tajweed rules - ' + tajweedAssessment.suggestions[0])
    }

    // Timing feedback
    if (timingAnalysis.paceScore < 70) {
      feedback.push(timingAnalysis.totalDuration > timingAnalysis.expectedDuration ? 
        'Try to recite a bit faster' : 'Take your time - slow down slightly')
    }

    return feedback
  }

  private generateCorrections(
    phonemeAnalysis: PhonemeAnalysis[],
    tajweedAssessment: TajweedAssessment
  ): PronunciationCorrection[] {
    const corrections: PronunciationCorrection[] = []

    // Generate corrections for poor phonemes
    phonemeAnalysis
      .filter(p => p.needsImprovement)
      .forEach((phoneme, index) => {
        corrections.push({
          position: { start: index, end: index + 1 },
          issue: `Incorrect pronunciation of ${phoneme.expected.letter}`,
          severity: phoneme.accuracy < 50 ? 'major' : 'moderate',
          explanation: `This letter should be pronounced from the ${phoneme.expected.makhraj}`,
          exercise: `Practice the letter ${phoneme.expected.letter} in isolation, then in words`
        })
      })

    return corrections
  }

  // Helper methods
  private extractPhonemes(text: string): ArabicPhoneme[] {
    return text.split('').map(char => ARABIC_PHONEMES[char]).filter(Boolean)
  }

  private comparePhonemeAccuracy(phoneme: ArabicPhoneme, audioFeatures: AudioFeatures, index: number): number {
    // Complex audio analysis would happen here
    // For demo, return a random score
    return Math.floor(Math.random() * 40) + 60
  }

  private assessMakhraj(phoneme: ArabicPhoneme, audioFeatures: AudioFeatures, index: number): number {
    // Analyze if the letter was pronounced from the correct articulation point
    return Math.floor(Math.random() * 30) + 70
  }

  private assessSifat(phoneme: ArabicPhoneme, audioFeatures: AudioFeatures, index: number): number {
    // Analyze if the letter characteristics were correctly applied
    return Math.floor(Math.random() * 35) + 65
  }

  private generatePhonemesFeedback(phoneme: ArabicPhoneme, accuracy: number, makhraj: number): string {
    if (accuracy < 60) {
      return `The letter ${phoneme.letter} needs significant improvement. Focus on the ${phoneme.makhraj} articulation point.`
    } else if (accuracy < 80) {
      return `Good attempt with ${phoneme.letter}. Try to emphasize the ${phoneme.sifat.join(', ')} characteristics.`
    }
    return `Excellent pronunciation of ${phoneme.letter}!`
  }

  private detectTajweedRules(text: string, audioFeatures: AudioFeatures): TajweedAssessment['rulesDetected'] {
    // Analyze audio for Tajweed rule application
    return []
  }

  private calculateTajweedScore(rulesDetected: TajweedAssessment['rulesDetected']): number {
    return Math.floor(Math.random() * 30) + 70
  }

  private identifyCriticalMistakes(rulesDetected: TajweedAssessment['rulesDetected']): string[] {
    return []
  }

  private generateTajweedSuggestions(rulesDetected: TajweedAssessment['rulesDetected'], mistakes: string[]): string[] {
    return ['Practice Ghunnah rules with م and ن', 'Work on proper Madd elongation']
  }

  private calculateExpectedDuration(text: string): number {
    const phonemes = this.extractPhonemes(text)
    return phonemes.reduce((sum, p) => sum + p.expectedDuration, 0) / 1000 // Convert to seconds
  }

  private calculatePaceScore(actual: number, expected: number): number {
    const ratio = actual / expected
    if (ratio >= 0.8 && ratio <= 1.2) return 100
    if (ratio >= 0.6 && ratio <= 1.4) return 80
    if (ratio >= 0.5 && ratio <= 1.6) return 60
    return 40
  }

  private calculateRhythmScore(audioFeatures: AudioFeatures): number {
    // Analyze rhythm patterns in the audio
    return Math.floor(Math.random() * 25) + 75
  }

  private calculatePauseAccuracy(audioFeatures: AudioFeatures, text: string): number {
    // Analyze pause placement and duration
    return Math.floor(Math.random() * 20) + 80
  }

  private analyzeBreathingPoints(audioFeatures: AudioFeatures, text: string): TimingAnalysis['breathingPoints'] {
    // Detect and analyze breathing points
    return []
  }

  private calculateConfidence(transcription: string, expected: string): number {
    // Calculate confidence in the transcription accuracy
    const similarity = this.calculateTextSimilarity(transcription, expected)
    return Math.floor(similarity * 100)
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple similarity calculation
    const minLen = Math.min(text1.length, text2.length)
    const maxLen = Math.max(text1.length, text2.length)
    
    let matches = 0
    for (let i = 0; i < minLen; i++) {
      if (text1[i] === text2[i]) matches++
    }
    
    return matches / maxLen
  }
}

interface AudioFeatures {
  duration: number
  sampleRate: number
  channelData: Float32Array
  // Additional features would be added here
}

// React hook for speech recognition
import { useCallback, useState } from 'react'

export function useSpeechRecognition() {
  const [engine] = useState(() => new ArabicSpeechRecognitionEngine())
  const [isInitialized, setIsInitialized] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const initialize = useCallback(async () => {
    if (isInitialized) return
    
    try {
      await engine.initialize()
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error)
      throw error
    }
  }, [engine, isInitialized])

  const startRecording = useCallback(async () => {
    if (!isInitialized) await initialize()
    
    try {
      await engine.startRecording()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw error
    }
  }, [engine, initialize, isInitialized])

  const stopRecording = useCallback(async (): Promise<Blob> => {
    try {
      const audioBlob = await engine.stopRecording()
      setIsRecording(false)
      return audioBlob
    } catch (error) {
      console.error('Failed to stop recording:', error)
      setIsRecording(false)
      throw error
    }
  }, [engine])

  const analyzeRecording = useCallback(async (
    audioBlob: Blob,
    expectedText: string,
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ): Promise<SpeechAnalysisResult> => {
    setIsAnalyzing(true)
    
    try {
      const result = await engine.analyzePronunciation(audioBlob, expectedText, difficultyLevel)
      return result
    } catch (error) {
      console.error('Failed to analyze recording:', error)
      throw error
    } finally {
      setIsAnalyzing(false)
    }
  }, [engine])

  return {
    initialize,
    startRecording,
    stopRecording,
    analyzeRecording,
    isInitialized,
    isRecording,
    isAnalyzing,
    engine
  }
}