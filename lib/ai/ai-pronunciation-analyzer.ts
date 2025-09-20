// Advanced AI-Powered Pronunciation Analysis System
import { OpenAI } from 'openai'
import { SpeechAnalysisResult, TajweedRule, PronunciationMistake } from './speech-recognition-engine'

export interface AIAnalysisRequest {
  audioBlob: Blob
  expectedText: string
  userLevel: 'beginner' | 'intermediate' | 'advanced'
  learningHistory: UserLearningHistory
  targetSkills: string[]
}

export interface UserLearningHistory {
  previousMistakes: PronunciationMistake[]
  strongAreas: string[]
  weakAreas: string[]
  improvementRate: number
  sessionsCompleted: number
  averageScore: number
}

export interface AIFeedbackResponse {
  overallAssessment: string
  detailedAnalysis: DetailedAnalysis
  personalizedRecommendations: PersonalizedRecommendation[]
  nextSteps: LearningStep[]
  encouragement: string
  estimatedPracticeTime: number
}

export interface DetailedAnalysis {
  pronunciationAccuracy: {
    overall: number
    byLetter: Array<{
      letter: string
      accuracy: number
      commonMistake?: string
      improvement?: string
    }>
  }
  tajweedMastery: {
    overall: number
    byRule: Array<{
      rule: TajweedRule
      mastery: number
      explanation: string
      examples: string[]
    }>
  }
  rhythmAndFlow: {
    overall: number
    pacing: number
    pauses: number
    naturalness: number
    improvements: string[]
  }
  emotionalDelivery: {
    overall: number
    reverence: number
    clarity: number
    confidence: number
    suggestions: string[]
  }
}

export interface PersonalizedRecommendation {
  type: 'immediate_practice' | 'weekly_goal' | 'long_term_development'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  exercises: Exercise[]
  estimatedTime: number
  expectedImprovement: string
}

export interface Exercise {
  type: 'letter_drill' | 'word_practice' | 'verse_recitation' | 'listening_exercise' | 'breathing_exercise'
  content: string
  instructions: string[]
  targetSkill: string
  difficulty: 1 | 2 | 3 | 4 | 5
  audioExample?: string
  visualAid?: string
}

export interface LearningStep {
  stepNumber: number
  title: string
  objective: string
  activities: string[]
  successCriteria: string
  estimatedDuration: string
}

export class AIPronunciationAnalyzer {
  private openai: OpenAI
  private modelVersion = 'gpt-4-turbo'
  private systemPrompt = `
    You are an expert Quranic recitation instructor and Tajweed master with decades of experience teaching students of all levels. Your role is to provide compassionate, detailed, and actionable feedback on Arabic pronunciation and Quranic recitation.

    Key responsibilities:
    1. Analyze pronunciation accuracy with specific focus on Makhraj (articulation points) and Sifat (letter characteristics)
    2. Evaluate Tajweed rule application and provide gentle corrections
    3. Assess rhythm, flow, and spiritual delivery
    4. Create personalized learning plans based on individual needs
    5. Provide encouragement while maintaining high standards
    6. Suggest specific exercises and practice routines

    Always remember:
    - This is a sacred text, so maintain reverence and respect
    - Every student is on their own journey - meet them where they are
    - Focus on progress, not perfection
    - Provide hope and encouragement alongside constructive feedback
    - Use Islamic etiquettes and expressions appropriately
  `

  constructor(openaiApiKey: string) {
    this.openai = new OpenAI({ apiKey: openaiApiKey })
  }

  async analyzeWithAI(request: AIAnalysisRequest): Promise<AIFeedbackResponse> {
    try {
      // Step 1: Convert audio to text and extract features
      const audioAnalysis = await this.extractAudioFeatures(request.audioBlob)
      
      // Step 2: Create comprehensive analysis prompt
      const analysisPrompt = this.buildAnalysisPrompt(
        request.expectedText,
        audioAnalysis,
        request.userLevel,
        request.learningHistory,
        request.targetSkills
      )
      
      // Step 3: Get AI analysis
      const aiResponse = await this.openai.chat.completions.create({
        model: this.modelVersion,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      // Step 4: Parse and structure the response
      const feedback = this.parseAIResponse(aiResponse.choices[0].message.content || '')
      
      // Step 5: Generate personalized exercises
      const exercises = await this.generatePersonalizedExercises(
        feedback,
        request.userLevel,
        request.learningHistory
      )
      
      return {
        ...feedback,
        personalizedRecommendations: exercises.recommendations,
        nextSteps: exercises.nextSteps,
        estimatedPracticeTime: this.calculatePracticeTime(exercises.recommendations)
      }
    } catch (error) {
      console.error('AI analysis failed:', error)
      throw new Error('Failed to analyze pronunciation with AI')
    }
  }

  async generateMotivationalFeedback(
    score: number,
    improvements: string[],
    userLevel: string,
    userName?: string
  ): Promise<string> {
    const motivationPrompt = `
      Generate encouraging and motivational feedback for a ${userLevel} level student who scored ${score}/100 in their Quranic recitation practice.
      
      Areas of improvement identified: ${improvements.join(', ')}
      
      Provide:
      1. Sincere encouragement and Islamic motivation
      2. Specific praise for effort and dedication
      3. Gentle reminder of the spiritual significance of Quran recitation
      4. Optimistic outlook for continued improvement
      
      Keep it warm, respectful, and inspiring. Use appropriate Islamic expressions.
      ${userName ? `Address the student as ${userName}` : ''}
    `

    const response = await this.openai.chat.completions.create({
      model: this.modelVersion,
      messages: [
        { role: 'system', content: 'You are a compassionate Quranic teacher who provides encouragement and spiritual guidance.' },
        { role: 'user', content: motivationPrompt }
      ],
      temperature: 0.8,
      max_tokens: 300
    })

    return response.choices[0].message.content || 'Keep practicing with sincerity and dedication, may Allah bless your efforts!'
  }

  async generateCustomLearningPlan(
    currentLevel: string,
    weakAreas: string[],
    strongAreas: string[],
    availableTimePerDay: number,
    learningGoals: string[]
  ): Promise<{
    weeklyPlan: WeeklyPlan
    monthlyGoals: MonthlyGoal[]
    yearlyVision: string
  }> {
    const planPrompt = `
      Create a comprehensive Quranic recitation learning plan for a ${currentLevel} level student with:
      
      Weak areas: ${weakAreas.join(', ')}
      Strong areas: ${strongAreas.join(', ')}
      Daily practice time available: ${availableTimePerDay} minutes
      Learning goals: ${learningGoals.join(', ')}
      
      Provide:
      1. Detailed 7-day weekly practice schedule
      2. Monthly progression milestones (next 6 months)
      3. One-year vision with major achievements
      
      Focus on gradual, sustainable improvement with Islamic principles of seeking knowledge.
    `

    const response = await this.openai.chat.completions.create({
      model: this.modelVersion,
      messages: [
        { role: 'system', content: 'You are an expert curriculum designer for Islamic studies and Quranic recitation.' },
        { role: 'user', content: planPrompt }
      ],
      temperature: 0.6,
      max_tokens: 1500
    })

    return this.parseLearningPlan(response.choices[0].message.content || '')
  }

  async generateTajweedExplanation(
    rule: TajweedRule,
    userLevel: string,
    specificExample: string
  ): Promise<{
    explanation: string
    examples: string[]
    commonMistakes: string[]
    practiceSteps: string[]
    audioVisualization?: string
  }> {
    const explanationPrompt = `
      Provide a comprehensive explanation of the Tajweed rule "${rule}" for a ${userLevel} level student.
      
      Context example: "${specificExample}"
      
      Include:
      1. Clear, level-appropriate explanation of the rule
      2. Multiple examples from the Quran
      3. Common mistakes students make
      4. Step-by-step practice instructions
      5. Tips for remembering and applying the rule
      
      Make it educational but not overwhelming.
    `

    const response = await this.openai.chat.completions.create({
      model: this.modelVersion,
      messages: [
        { role: 'system', content: 'You are a Tajweed master who excels at making complex rules simple and memorable.' },
        { role: 'user', content: explanationPrompt }
      ],
      temperature: 0.5,
      max_tokens: 800
    })

    return this.parseTajweedExplanation(response.choices[0].message.content || '')
  }

  // Real-time feedback generation during practice
  async generateRealTimeFeedback(
    currentPhoneme: string,
    detectedError: string,
    userLevel: string
  ): Promise<{
    immediateCorrection: string
    encouragement: string
    quickTip: string
  }> {
    const realtimePrompt = `
      Provide immediate, supportive feedback for a student who just pronounced the Arabic letter "${currentPhoneme}" with this error: "${detectedError}"
      
      Student level: ${userLevel}
      
      Give:
      1. Brief correction (one sentence)
      2. Quick encouragement
      3. Simple tip to improve immediately
      
      Keep it concise and supportive.
    `

    const response = await this.openai.chat.completions.create({
      model: this.modelVersion,
      messages: [
        { role: 'system', content: 'You are providing real-time coaching during Quranic recitation practice.' },
        { role: 'user', content: realtimePrompt }
      ],
      temperature: 0.7,
      max_tokens: 150
    })

    return this.parseRealTimeFeedback(response.choices[0].message.content || '')
  }

  private async extractAudioFeatures(audioBlob: Blob): Promise<AudioFeatures> {
    // This would extract detailed audio features for AI analysis
    // Including spectrograms, formant analysis, pitch tracking, etc.
    return {
      duration: 0,
      averagePitch: 0,
      pitchVariation: 0,
      energyPattern: [],
      silenceDetection: [],
      spectralFeatures: {},
      qualityMetrics: {}
    }
  }

  private buildAnalysisPrompt(
    expectedText: string,
    audioAnalysis: AudioFeatures,
    userLevel: string,
    history: UserLearningHistory,
    targetSkills: string[]
  ): string {
    return `
      Analyze this Quranic recitation attempt:
      
      Expected text (Arabic): ${expectedText}
      Student level: ${userLevel}
      Target skills: ${targetSkills.join(', ')}
      
      Audio characteristics:
      - Duration: ${audioAnalysis.duration}s
      - Average pitch: ${audioAnalysis.averagePitch}Hz
      - Pitch variation: ${audioAnalysis.pitchVariation}
      
      Student's learning history:
      - Sessions completed: ${history.sessionsCompleted}
      - Average score: ${history.averageScore}
      - Known weak areas: ${history.weakAreas.join(', ')}
      - Strong areas: ${history.strongAreas.join(', ')}
      - Previous common mistakes: ${history.previousMistakes.map(m => m.type).join(', ')}
      
      Provide detailed analysis focusing on:
      1. Pronunciation accuracy for each letter
      2. Tajweed rule application
      3. Rhythm and flow
      4. Emotional/spiritual delivery
      5. Overall progress assessment
      6. Specific recommendations for improvement
      
      Format as a structured JSON response.
    `
  }

  private parseAIResponse(content: string): Partial<AIFeedbackResponse> {
    try {
      // In a real implementation, this would parse structured JSON response
      // For now, returning a structured format
      return {
        overallAssessment: 'Good progress with room for improvement in specific areas',
        detailedAnalysis: {
          pronunciationAccuracy: {
            overall: 75,
            byLetter: []
          },
          tajweedMastery: {
            overall: 70,
            byRule: []
          },
          rhythmAndFlow: {
            overall: 80,
            pacing: 78,
            pauses: 82,
            naturalness: 75,
            improvements: ['Work on natural breathing points']
          },
          emotionalDelivery: {
            overall: 85,
            reverence: 90,
            clarity: 80,
            confidence: 80,
            suggestions: ['Continue with confident delivery']
          }
        },
        encouragement: 'Your dedication to learning is admirable. Keep practicing with patience and consistency.'
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      throw error
    }
  }

  private async generatePersonalizedExercises(
    feedback: Partial<AIFeedbackResponse>,
    userLevel: string,
    history: UserLearningHistory
  ): Promise<{
    recommendations: PersonalizedRecommendation[]
    nextSteps: LearningStep[]
  }> {
    // Generate specific exercises based on the analysis
    const recommendations: PersonalizedRecommendation[] = [
      {
        type: 'immediate_practice',
        priority: 'high',
        title: 'Letter Pronunciation Drill',
        description: 'Focus on improving specific letter articulation',
        exercises: [
          {
            type: 'letter_drill',
            content: 'Practice ر (ra) with different vowels',
            instructions: [
              'Place tongue tip lightly touching the roof of mouth',
              'Create gentle trill sound',
              'Practice with fatah, kasrah, dammah'
            ],
            targetSkill: 'makhraj_accuracy',
            difficulty: 2
          }
        ],
        estimatedTime: 15,
        expectedImprovement: 'Improved ر pronunciation within 1 week'
      }
    ]

    const nextSteps: LearningStep[] = [
      {
        stepNumber: 1,
        title: 'Master Basic Letters',
        objective: 'Achieve 90% accuracy on all Arabic letters',
        activities: [
          'Daily letter pronunciation practice',
          'Record and compare with master recitation',
          'Focus on weak letters identified'
        ],
        successCriteria: '90% accuracy score for 3 consecutive sessions',
        estimatedDuration: '2-3 weeks'
      }
    ]

    return { recommendations, nextSteps }
  }

  private calculatePracticeTime(recommendations: PersonalizedRecommendation[]): number {
    return recommendations.reduce((total, rec) => total + rec.estimatedTime, 0)
  }

  private parseLearningPlan(content: string): {
    weeklyPlan: WeeklyPlan
    monthlyGoals: MonthlyGoal[]
    yearlyVision: string
  } {
    // Parse the AI-generated learning plan
    return {
      weeklyPlan: {
        days: [],
        totalMinutes: 0,
        focusAreas: []
      },
      monthlyGoals: [],
      yearlyVision: 'Achieve fluent, beautiful Quranic recitation with proper Tajweed'
    }
  }

  private parseTajweedExplanation(content: string) {
    return {
      explanation: content,
      examples: [],
      commonMistakes: [],
      practiceSteps: []
    }
  }

  private parseRealTimeFeedback(content: string) {
    const lines = content.split('\n').filter(line => line.trim())
    return {
      immediateCorrection: lines[0] || 'Good effort, try again',
      encouragement: lines[1] || 'Keep practicing!',
      quickTip: lines[2] || 'Focus on the articulation point'
    }
  }
}

// Additional interfaces
interface AudioFeatures {
  duration: number
  averagePitch: number
  pitchVariation: number
  energyPattern: number[]
  silenceDetection: Array<{ start: number; end: number }>
  spectralFeatures: Record<string, number>
  qualityMetrics: Record<string, number>
}

interface WeeklyPlan {
  days: Array<{
    dayName: string
    activities: string[]
    duration: number
    focus: string
  }>
  totalMinutes: number
  focusAreas: string[]
}

interface MonthlyGoal {
  month: number
  title: string
  objectives: string[]
  milestones: string[]
  assessmentCriteria: string
}

// React hook for AI pronunciation analysis
import { useCallback, useState } from 'react'

export function useAIPronunciationAnalyzer() {
  const [analyzer] = useState(() => 
    new AIPronunciationAnalyzer(process.env.NEXT_PUBLIC_OPENAI_API_KEY || '')
  )
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [feedback, setFeedback] = useState<AIFeedbackResponse | null>(null)

  const analyzeRecitation = useCallback(async (
    audioBlob: Blob,
    expectedText: string,
    userLevel: 'beginner' | 'intermediate' | 'advanced',
    learningHistory: UserLearningHistory,
    targetSkills: string[] = []
  ) => {
    setIsAnalyzing(true)
    
    try {
      const request: AIAnalysisRequest = {
        audioBlob,
        expectedText,
        userLevel,
        learningHistory,
        targetSkills
      }
      
      const result = await analyzer.analyzeWithAI(request)
      setFeedback(result)
      return result
    } catch (error) {
      console.error('AI analysis failed:', error)
      throw error
    } finally {
      setIsAnalyzing(false)
    }
  }, [analyzer])

  const generateMotivation = useCallback(async (
    score: number,
    improvements: string[],
    userLevel: string,
    userName?: string
  ) => {
    return await analyzer.generateMotivationalFeedback(score, improvements, userLevel, userName)
  }, [analyzer])

  const explainTajweedRule = useCallback(async (
    rule: TajweedRule,
    userLevel: string,
    example: string
  ) => {
    return await analyzer.generateTajweedExplanation(rule, userLevel, example)
  }, [analyzer])

  const getRealTimeFeedback = useCallback(async (
    phoneme: string,
    error: string,
    level: string
  ) => {
    return await analyzer.generateRealTimeFeedback(phoneme, error, level)
  }, [analyzer])

  return {
    analyzeRecitation,
    generateMotivation,
    explainTajweedRule,
    getRealTimeFeedback,
    isAnalyzing,
    feedback,
    clearFeedback: () => setFeedback(null)
  }
}