'use client'

import { useState, useCallback } from 'react'

interface PronunciationResult {
  score: number
  feedback: string[]
  mistakes: Array<{
    word: string
    issue: string
    suggestion: string
  }>
  overallFeedback: string
}

interface AnalysisRequest {
  audioBlob: Blob
  originalText: string
  language?: string
}

export class ArabicPronunciationAnalyzer {
  private openaiApiKey: string

  constructor(apiKey: string) {
    this.openaiApiKey = apiKey
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Convert audio to the format OpenAI expects
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')
      formData.append('model', 'whisper-1')
      formData.append('language', 'ar') // Arabic language code
      formData.append('response_format', 'text')

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`OpenAI Whisper API error: ${response.statusText}`)
      }

      return await response.text()
    } catch (error) {
      console.error('Audio transcription failed:', error)
      throw new Error('Failed to transcribe audio. Please try speaking more clearly.')
    }
  }

  async analyzePronunciation(transcribedText: string, originalText: string): Promise<PronunciationResult> {
    try {
      const analysisPrompt = `
You are an expert Arabic pronunciation teacher and Quran recitation instructor. 

ORIGINAL ARABIC TEXT (what should be recited):
"${originalText}"

STUDENT'S TRANSCRIBED PRONUNCIATION (what they actually said):
"${transcribedText}"

Please analyze the student's Arabic pronunciation accuracy and provide:

1. ACCURACY SCORE (0-100%): Based on phonetic accuracy, proper Arabic pronunciation rules (Tajweed), and text matching
2. SPECIFIC MISTAKES: Identify mispronounced words, missing words, or incorrect pronunciation patterns
3. CONSTRUCTIVE FEEDBACK: Provide helpful suggestions for improvement in Islamic teaching style
4. OVERALL ASSESSMENT: Brief encouraging feedback with areas to focus on

Consider:
- Arabic phonetic accuracy (proper makhraj/articulation points)
- Quranic pronunciation rules (Tajweed basics)
- Missing or added words
- Pronunciation clarity and flow
- Common Arabic pronunciation challenges for learners

Format your response as JSON:
{
  "score": 85,
  "feedback": ["Excellent articulation of long vowels", "Good rhythm and flow"],
  "mistakes": [
    {
      "word": "الرحمن",
      "issue": "The 'ح' sound was not pronounced from the correct makhraj",
      "suggestion": "Practice the 'ح' sound from the middle of the throat, distinct from 'ه'"
    }
  ],
  "overallFeedback": "MashaAllah! Your recitation shows good effort. Focus on the throat letters (حروف الحلق) for clearer pronunciation."
}

Be encouraging but accurate in your assessment. Help the student improve while maintaining Islamic etiquette in feedback.`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert Arabic pronunciation teacher specializing in Quranic recitation. Provide detailed, helpful, and encouraging feedback following Islamic teaching principles.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI analysis error: ${response.statusText}`)
      }

      const data = await response.json()
      const analysisText = data.choices[0]?.message?.content

      if (!analysisText) {
        throw new Error('No analysis received from AI')
      }

      // Parse the JSON response
      try {
        const analysisResult = JSON.parse(analysisText)
        
        // Validate and sanitize the result
        return {
          score: Math.max(0, Math.min(100, analysisResult.score || 0)),
          feedback: Array.isArray(analysisResult.feedback) ? analysisResult.feedback : ['Analysis completed'],
          mistakes: Array.isArray(analysisResult.mistakes) ? analysisResult.mistakes.slice(0, 5) : [],
          overallFeedback: analysisResult.overallFeedback || 'Keep practicing! Your effort in learning Quranic recitation is appreciated.'
        }
      } catch (parseError) {
        console.error('Failed to parse AI analysis:', parseError)
        
        // Fallback analysis based on simple text comparison
        return this.fallbackAnalysis(transcribedText, originalText)
      }
    } catch (error) {
      console.error('Pronunciation analysis failed:', error)
      throw new Error('Failed to analyze pronunciation. Please try again.')
    }
  }

  private fallbackAnalysis(transcribed: string, original: string): PronunciationResult {
    // Simple fallback scoring based on character similarity
    const similarity = this.calculateSimilarity(transcribed.trim(), original.trim())
    const score = Math.round(similarity * 100)

    return {
      score,
      feedback: score > 70 ? ['Good effort!'] : ['Keep practicing'],
      mistakes: [],
      overallFeedback: score > 80 
        ? 'Excellent pronunciation! Keep up the great work.' 
        : score > 60
        ? 'Good effort. With more practice, your pronunciation will improve significantly.'
        : 'Keep practicing regularly. Focus on listening carefully to the correct pronunciation.'
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance-based similarity
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }
}

// React hook for pronunciation analysis
export function usePronunciationAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Using OpenAI for Whisper transcription and GPT-4 analysis
  const analyzer = new ArabicPronunciationAnalyzer(
    process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  )

  const analyzeArabicPronunciation = useCallback(async (
    audioBlob: Blob, 
    originalText: string
  ): Promise<PronunciationResult> => {
    setIsAnalyzing(true)
    setError(null)

    try {
      console.log('Starting pronunciation analysis for:', originalText.substring(0, 50) + '...')
      
      // Step 1: Transcribe the audio using Whisper
      console.log('Transcribing audio...')
      const transcribedText = await analyzer.transcribeAudio(audioBlob)
      console.log('Transcription result:', transcribedText)

      // Step 2: Analyze pronunciation accuracy
      console.log('Analyzing pronunciation accuracy...')
      const result = await analyzer.analyzePronunciation(transcribedText, originalText)
      console.log('Analysis result:', result)

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
      console.error('Pronunciation analysis error:', err)
      setError(errorMessage)
      
      // Return a fallback result
      return {
        score: 0,
        feedback: ['Analysis failed - please try again'],
        mistakes: [],
        overallFeedback: errorMessage
      }
    } finally {
      setIsAnalyzing(false)
    }
  }, [analyzer])

  return {
    analyzeArabicPronunciation,
    isAnalyzing,
    error,
  }
}

// Utility function for quick pronunciation scoring
export function quickPronunciationScore(
  userAudio: Blob, 
  originalText: string
): Promise<number> {
  const analyzer = new ArabicPronunciationAnalyzer(
    process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  )
  
  return analyzer.transcribeAudio(userAudio)
    .then(transcribed => analyzer.analyzePronunciation(transcribed, originalText))
    .then(result => result.score)
    .catch(() => 0)
}