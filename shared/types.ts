export type Difficulty = 'Easy' | 'Intermediate' | 'Advanced' | 'Mixed'

export type QuestionCount = 25 | 50 | 100 | 150 | 200

export type PracticeMode = 'mcq' | 'interview'

export interface Question {
  id: number
  topic: string
  subtopic: string
  difficulty: 'Easy' | 'Intermediate' | 'Advanced'
  question: string
  options: [string, string, string, string]
  correctAnswer: 0 | 1 | 2 | 3
  explanation: string
}

export interface SessionConfig {
  fullName: string
  topic: string
  difficulty: Difficulty
  questionCount: QuestionCount
  mode: PracticeMode
}

export interface GenerateQuestionsRequest {
  fullName: string
  topic: string
  difficulty: Difficulty
  questionCount: QuestionCount
  mode?: PracticeMode
}

export interface GenerateQuestionsResponse {
  questions: Question[]
  topic: string
  difficulty: Difficulty
  questionCount: QuestionCount
}

export interface QuizConfig {
  fullName: string
  topic: string
  difficulty: Difficulty
  questionCount: QuestionCount
}

export interface AnswerRecord {
  selectedAnswer: number
  isCorrect: boolean
}

export interface QuizState {
  config: QuizConfig
  questions: Question[]
  answers: Record<number, AnswerRecord>
  currentQuestionIndex: number
  startedAt: number
}

export type AppScreen =
  | 'mode-select'
  | 'config'
  | 'generating'
  | 'quiz'
  | 'results'
  | 'interview'
  | 'interview-report'

export type PerformanceLevel = 'Excellent' | 'Good' | 'Average' | 'Needs Improvement'

export interface QuizResults {
  totalQuestions: number
  correctCount: number
  wrongCount: number
  percentage: number
  performance: PerformanceLevel
  incorrectQuestions: Array<{
    question: Question
    selectedAnswer: number
  }>
  elapsedSeconds: number
}

// --- Interview Practice ---

export interface InterviewQuestion {
  id: number
  topic: string
  subtopic: string
  difficulty: 'Easy' | 'Intermediate' | 'Advanced'
  question: string
  contextualIntro?: string
}

export interface CommunicationScores {
  technicalAccuracy: number
  communicationClarity: number
  confidence: number
  answerStructure: number
  depthOfKnowledge: number
}

export interface InterviewEvaluation {
  overallScore: number
  interviewerFeedback: string
  strengths: string[]
  areasToImprove: string[]
  idealAnswer: string
  followUpQuestions: string[]
  communicationScores: CommunicationScores
}

export interface InterviewHistoryEntry {
  question: InterviewQuestion
  userAnswer: string
  evaluation: InterviewEvaluation
}

export interface InterviewSessionState {
  config: SessionConfig
  currentQuestionIndex: number
  startedAt: number
  history: InterviewHistoryEntry[]
  currentQuestion: InterviewQuestion | null
  phase: 'answering' | 'feedback' | 'evaluating'
}

export interface InterviewStartRequest {
  fullName: string
  topic: string
  difficulty: Difficulty
  questionCount: QuestionCount
}

export interface InterviewStartResponse {
  question: InterviewQuestion
  totalQuestions: number
}

export interface InterviewEvaluateRequest {
  config: SessionConfig
  question: InterviewQuestion
  userAnswer: string
  history: InterviewHistoryEntry[]
  questionIndex: number
}

export interface InterviewEvaluateResponse {
  evaluation: InterviewEvaluation
  nextQuestion: InterviewQuestion | null
  isComplete: boolean
}

export interface InterviewReportRequest {
  config: SessionConfig
  history: InterviewHistoryEntry[]
  elapsedSeconds: number
}

export interface InterviewReport {
  overallInterviewScore: number
  topicCoverage: string
  communicationScore: number
  technicalKnowledgeScore: number
  confidenceScore: number
  timeTaken: string
  strongestAreas: string[]
  weakestAreas: string[]
  questionsAnsweredWell: string[]
  questionsNeedingImprovement: string[]
  recommendedLearningTopics: string[]
  overallSummary: string
}

export const QUESTION_COUNT_OPTIONS: QuestionCount[] = [25, 50, 100, 150, 200]

export const DIFFICULTY_OPTIONS: Difficulty[] = ['Easy', 'Intermediate', 'Advanced', 'Mixed']
