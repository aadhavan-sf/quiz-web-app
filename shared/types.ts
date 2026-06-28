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
  /** Session time limit in minutes; null = no limit (max 180) */
  timeLimitMinutes?: number | null
}

export interface GenerateQuestionsRequest {
  fullName: string
  topic: string
  difficulty: Difficulty
  questionCount: QuestionCount
  mode?: PracticeMode
  timeLimitMinutes?: number | null
}

/** Session setup from the configure screen — name comes from the signed-in profile. */
export type ConfigureSessionRequest = Omit<GenerateQuestionsRequest, 'fullName'>

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
  timeLimitMinutes?: number | null
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
  /** Active time spent in session (seconds) — persisted so resume keeps the timer */
  elapsedSeconds?: number
  /** Question IDs marked "skip for now" — revisit via tracker */
  skippedQuestionIds?: number[]
  /** Cloud session id when logged in */
  sessionId?: string
}

export type AppScreen =
  | 'mode-select'
  | 'login'
  | 'profile'
  | 'config'
  | 'generating'
  | 'quiz'
  | 'review'
  | 'results'
  | 'interview'
  | 'interview-report'

export type SessionStatus = 'in_progress' | 'completed'

export interface StoredPracticeSession {
  id: string
  user_id: string
  mode: PracticeMode
  status: SessionStatus
  config: SessionConfig | QuizConfig
  state: QuizState | InterviewSessionState
  results: QuizResults | InterviewReport | null
  started_at: string
  updated_at: string
  completed_at: string | null
}

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
  questionIndex: number
  question: InterviewQuestion
  userAnswer: string
  evaluation: InterviewEvaluation
}

export interface InterviewSessionState {
  config: SessionConfig
  currentQuestionIndex: number
  startedAt: number
  /** Active time spent in session (seconds) — persisted so resume keeps the timer */
  elapsedSeconds?: number
  history: InterviewHistoryEntry[]
  currentQuestion: InterviewQuestion | null
  phase: 'answering' | 'feedback' | 'evaluating'
  /** Slot indices the user chose to skip — revisit via tracker */
  skippedQuestionIndices?: number[]
  /** Questions assigned to each slot (for skip / revisit) */
  questionBank?: Record<number, InterviewQuestion>
  /** Cloud session id when logged in */
  sessionId?: string
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

export interface InterviewSkipRequest {
  config: SessionConfig
  history: InterviewHistoryEntry[]
  questionIndex: number
  skippedQuestions: InterviewQuestion[]
}

export interface InterviewSkipResponse {
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

export const MAX_TIME_LIMIT_MINUTES = 180

export interface TimeLimitOption {
  label: string
  minutes: number | null
}

export const TIME_LIMIT_OPTIONS: TimeLimitOption[] = [
  { label: 'No time limit', minutes: null },
  { label: '15 minutes', minutes: 15 },
  { label: '30 minutes', minutes: 30 },
  { label: '45 minutes', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '1 hour 30 min', minutes: 90 },
  { label: '2 hours', minutes: 120 },
  { label: '2 hours 30 min', minutes: 150 },
  { label: '3 hours', minutes: MAX_TIME_LIMIT_MINUTES },
]
