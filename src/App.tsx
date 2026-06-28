import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthLoadingScreen } from './components/AuthLoadingScreen'
import { GeneratingSkeleton } from './components/GeneratingSkeleton'
import { useAuth } from './context/AuthContext'
import { useInterviewSession } from './hooks/useInterviewSession'
import { useQuiz } from './hooks/useQuiz'
import { persistCompletedInterview, persistCompletedQuiz } from './hooks/useSessionSync'
import { CompletedTestReview, ProfilePage } from './pages/ProfilePage'
import { HomePage } from './pages/HomePage'
import { InterviewPage } from './pages/InterviewPage'
import { InterviewReportPage } from './pages/InterviewReportPage'
import { LoginPage } from './pages/LoginPage'
import { ModeSelectionPage } from './pages/ModeSelectionPage'
import { QuizPage } from './pages/QuizPage'
import { QuizReviewPage } from './pages/QuizReviewPage'
import { ResultsPage } from './pages/ResultsPage'
import type {
  AppScreen,
  ConfigureSessionRequest,
  GenerateQuestionsRequest,
  InterviewReport,
  InterviewSessionState,
  PracticeMode,
  QuizState,
  StoredPracticeSession,
} from './types/question'
import { fetchInterviewReport, fetchQuestions, startInterview } from './utils/api'
import { clearInterviewData } from './utils/interviewStorage'
import { calculateResults } from './utils/quizUtils'
import { clearQuizData, getUserName, setUserName } from './utils/storage'
import { isSupabaseConfigured } from './lib/supabase'

const PROTECTED_SCREENS: AppScreen[] = [
  'mode-select',
  'config',
  'profile',
  'generating',
  'quiz',
  'review',
  'results',
  'interview',
  'interview-report',
]

function AppContent() {
  const { user, displayName, loading: authLoading, isConfigured } = useAuth()
  const [screen, setScreen] = useState<AppScreen>(() =>
    isSupabaseConfigured ? 'login' : 'mode-select',
  )
  const [practiceMode, setPracticeMode] = useState<PracticeMode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generatingCount, setGeneratingCount] = useState(50)
  const [interviewReport, setInterviewReport] = useState<InterviewReport | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [profileReviewSession, setProfileReviewSession] = useState<StoredPracticeSession | null>(
    null,
  )
  const [savedResults, setSavedResults] = useState<ReturnType<typeof calculateResults> | null>(
    null,
  )

  const quiz = useQuiz()
  const interview = useInterviewSession()

  useEffect(() => {
    if (authLoading) return

    // Local dev without Supabase — skip login and go straight to mode selection
    if (!isConfigured && screen === 'login') {
      setScreen('mode-select')
      return
    }

    if (!user && isConfigured && PROTECTED_SCREENS.includes(screen)) {
      setScreen('login')
      setPracticeMode(null)
      return
    }

    if (user && screen === 'login') {
      setScreen('mode-select')
    }
  }, [authLoading, user, screen, isConfigured])

  const sessionUserName = displayName || getUserName() || 'Guest'

  const handleSelectMode = useCallback(
    (mode: PracticeMode) => {
      if (!user && isConfigured) {
        setScreen('login')
        return
      }
      setPracticeMode(mode)
      setError(null)
      setScreen('config')
    },
    [user, isConfigured],
  )

  const handleBackToModes = useCallback(() => {
    setPracticeMode(null)
    setError(null)
    setProfileReviewSession(null)
    setScreen('mode-select')
  }, [])

  const handleGenerate = useCallback(
    async (request: ConfigureSessionRequest) => {
      if (isConfigured && (!user || !displayName)) return

      setError(null)
      setGeneratingCount(request.questionCount)
      const name = sessionUserName
      setUserName(name)
      setScreen('generating')

      const apiRequest: GenerateQuestionsRequest = { ...request, fullName: name }

      try {
        if (request.mode === 'interview') {
          const response = await startInterview(apiRequest)
          const state: InterviewSessionState = {
            config: {
              fullName: name,
              topic: request.topic,
              difficulty: request.difficulty,
              questionCount: request.questionCount,
              mode: 'interview',
              timeLimitMinutes: request.timeLimitMinutes ?? null,
            },
            currentQuestionIndex: 0,
            startedAt: Date.now(),
            history: [],
            currentQuestion: response.question,
            phase: 'answering',
            skippedQuestionIndices: [],
            questionBank: { 0: response.question },
          }
          interview.initSession(state)
          setScreen('interview')
        } else {
          const response = await fetchQuestions(apiRequest)
          const state: QuizState = {
            config: {
              fullName: name,
              topic: request.topic,
              difficulty: request.difficulty,
              questionCount: request.questionCount,
              timeLimitMinutes: request.timeLimitMinutes ?? null,
            },
            questions: response.questions,
            answers: {},
            currentQuestionIndex: 0,
            startedAt: Date.now(),
          }
          quiz.initQuiz(state)
          setScreen('quiz')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate session')
        setScreen('config')
      }
    },
    [quiz, interview, user, displayName, isConfigured, sessionUserName],
  )

  const handleResumeSession = useCallback(
    (stored: StoredPracticeSession) => {
      if (stored.mode === 'mcq') {
        quiz.initQuiz(stored.state as QuizState)
        setPracticeMode('mcq')
        setScreen('quiz')
      } else {
        interview.initSession(stored.state as InterviewSessionState)
        setPracticeMode('interview')
        setScreen('interview')
      }
    },
    [quiz, interview],
  )

  const handleInterviewUpdate = useCallback(
    (session: InterviewSessionState) => {
      interview.initSession(session)
    },
    [interview],
  )

  const handleInterviewComplete = useCallback(async () => {
    if (!interview.session) return
    setLoadingReport(true)
    setScreen('generating')

    try {
      const elapsed = Math.floor((Date.now() - interview.session.startedAt) / 1000)
      const { report } = await fetchInterviewReport({
        config: interview.session.config,
        history: interview.session.history,
        elapsedSeconds: elapsed,
      })
      if (user && interview.session.sessionId) {
        await persistCompletedInterview(interview.session, report).catch(() => {})
      }
      setInterviewReport(report)
      setScreen('interview-report')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
      setScreen('interview')
    } finally {
      setLoadingReport(false)
    }
  }, [interview.session, user])

  const handleQuizSubmit = useCallback(() => setScreen('review'), [])

  const handleViewResults = useCallback(async () => {
    if (!quiz.quizState) return
    const elapsed = Math.floor((Date.now() - quiz.quizState.startedAt) / 1000)
    const results = calculateResults(quiz.quizState.questions, quiz.quizState.answers, elapsed)
    setSavedResults(results)
    if (user && quiz.quizState.sessionId) {
      await persistCompletedQuiz(quiz.quizState, results).catch(() => {})
    }
    setScreen('results')
  }, [quiz.quizState, user])

  const handleNewSession = useCallback(() => {
    clearQuizData()
    clearInterviewData()
    quiz.resetQuiz()
    interview.resetSession()
    setInterviewReport(null)
    setSavedResults(null)
    setProfileReviewSession(null)
    setPracticeMode(null)
    setScreen(user || !isConfigured ? 'mode-select' : 'login')
  }, [quiz, interview, user, isConfigured])

  const handleQuizLeave = useCallback(() => {
    handleNewSession()
  }, [handleNewSession])

  const handleInterviewLeave = useCallback(() => {
    handleNewSession()
  }, [handleNewSession])

  const handleRestart = useCallback(() => {
    if (!quiz.quizState) return
    quiz.initQuiz({
      ...quiz.quizState,
      answers: {},
      currentQuestionIndex: 0,
      startedAt: Date.now(),
      sessionId: undefined,
    })
    setSavedResults(null)
    setScreen('quiz')
  }, [quiz])

  const mcqResults = useMemo(() => {
    if (savedResults) return savedResults
    if (!quiz.quizState) return null
    const elapsed = Math.floor((Date.now() - quiz.quizState.startedAt) / 1000)
    return calculateResults(quiz.quizState.questions, quiz.quizState.answers, elapsed)
  }, [quiz.quizState, savedResults])

  const showError = error && (screen === 'config' || screen === 'interview')

  if (authLoading) {
    return <AuthLoadingScreen />
  }

  return (
    <>
      {showError && (
        <div className="fixed left-1/2 top-20 z-50 w-full max-w-md -translate-x-1/2 px-4">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {screen === 'mode-select' && (user || !isConfigured) && (
          <ModeSelectionPage
            key="mode-select"
            onSelect={handleSelectMode}
            onProfile={() => setScreen('profile')}
            onResume={handleResumeSession}
          />
        )}
        {screen === 'login' && isConfigured && (
          <LoginPage
            key="login"
            isGate
            onBack={() => setScreen('mode-select')}
            onSuccess={() => setScreen('mode-select')}
          />
        )}
        {screen === 'profile' && !profileReviewSession && (
          <ProfilePage
            key="profile"
            onBack={handleBackToModes}
            onViewCompletedTest={(session) => setProfileReviewSession(session)}
          />
        )}
        {screen === 'profile' && profileReviewSession && (
          <CompletedTestReview
            key="profile-review"
            session={profileReviewSession}
            onBack={() => setProfileReviewSession(null)}
          />
        )}
        {screen === 'config' && practiceMode && (user || !isConfigured) && (
          <HomePage
            key="config"
            mode={practiceMode}
            userName={sessionUserName}
            onBack={handleBackToModes}
            onGenerate={handleGenerate}
          />
        )}
        {screen === 'generating' && (
          <GeneratingSkeleton
            key="generating"
            count={generatingCount}
            mode={practiceMode ?? 'mcq'}
            loadingReport={loadingReport}
          />
        )}
        {screen === 'quiz' && quiz.quizState && (
          <QuizPage key="quiz" quiz={quiz} onSubmit={handleQuizSubmit} onLeave={handleQuizLeave} />
        )}
        {screen === 'review' && quiz.quizState && (
          <QuizReviewPage key="review" quizState={quiz.quizState} onViewResults={handleViewResults} />
        )}
        {screen === 'results' && mcqResults && quiz.quizState && (
          <ResultsPage
            key="results"
            userName={quiz.quizState.config.fullName}
            topic={quiz.quizState.config.topic}
            results={mcqResults}
            onRestart={handleRestart}
            onNewQuiz={handleNewSession}
          />
        )}
        {screen === 'interview' && interview.session && (
          <InterviewPage
            key="interview"
            session={interview.session}
            onUpdate={handleInterviewUpdate}
            onComplete={handleInterviewComplete}
            onLeave={handleInterviewLeave}
          />
        )}
        {screen === 'interview-report' && interview.session && interviewReport && (
          <InterviewReportPage
            key="interview-report"
            session={interview.session}
            report={interviewReport}
            onNewSession={handleNewSession}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default AppContent
