import { AnimatePresence } from 'framer-motion'
import { useCallback, useMemo, useState } from 'react'
import { GeneratingSkeleton } from './components/GeneratingSkeleton'
import { ThemeToggle } from './components/ThemeToggle'
import { ThemeProvider } from './hooks/useTheme'
import { useInterviewSession } from './hooks/useInterviewSession'
import { useQuiz } from './hooks/useQuiz'
import { HomePage } from './pages/HomePage'
import { InterviewPage } from './pages/InterviewPage'
import { InterviewReportPage } from './pages/InterviewReportPage'
import { ModeSelectionPage } from './pages/ModeSelectionPage'
import { QuizPage } from './pages/QuizPage'
import { ResultsPage } from './pages/ResultsPage'
import type {
  AppScreen,
  GenerateQuestionsRequest,
  InterviewReport,
  InterviewSessionState,
  PracticeMode,
  QuizState,
} from './types/question'
import { fetchInterviewReport, fetchQuestions, startInterview } from './utils/api'
import { clearInterviewData } from './utils/interviewStorage'
import { calculateResults } from './utils/quizUtils'
import { clearQuizData, setUserName } from './utils/storage'

function AppContent() {
  const [screen, setScreen] = useState<AppScreen>('mode-select')
  const [practiceMode, setPracticeMode] = useState<PracticeMode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generatingCount, setGeneratingCount] = useState(50)
  const [interviewReport, setInterviewReport] = useState<InterviewReport | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)

  const quiz = useQuiz()
  const interview = useInterviewSession()

  const handleSelectMode = useCallback((mode: PracticeMode) => {
    setPracticeMode(mode)
    setError(null)
    setScreen('config')
  }, [])

  const handleBackToModes = useCallback(() => {
    setPracticeMode(null)
    setError(null)
    setScreen('mode-select')
  }, [])

  const handleGenerate = useCallback(
    async (request: GenerateQuestionsRequest) => {
      setError(null)
      setGeneratingCount(request.questionCount)
      setUserName(request.fullName)
      setScreen('generating')

      try {
        if (request.mode === 'interview') {
          const response = await startInterview(request)
          const state: InterviewSessionState = {
            config: {
              fullName: request.fullName,
              topic: request.topic,
              difficulty: request.difficulty,
              questionCount: request.questionCount,
              mode: 'interview',
            },
            currentQuestionIndex: 0,
            startedAt: Date.now(),
            history: [],
            currentQuestion: response.question,
            phase: 'answering',
          }
          interview.initSession(state)
          setScreen('interview')
        } else {
          const response = await fetchQuestions(request)
          const state: QuizState = {
            config: {
              fullName: request.fullName,
              topic: request.topic,
              difficulty: request.difficulty,
              questionCount: request.questionCount,
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
      setInterviewReport(report)
      setScreen('interview-report')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
      setScreen('interview')
    } finally {
      setLoadingReport(false)
    }
  }, [interview.session])

  const handleQuizComplete = useCallback(() => setScreen('results'), [])

  const handleNewSession = useCallback(() => {
    clearQuizData()
    clearInterviewData()
    quiz.resetQuiz()
    interview.resetSession()
    setInterviewReport(null)
    setPracticeMode(null)
    setScreen('mode-select')
  }, [quiz, interview])

  const handleQuizLeave = useCallback(() => {
    const answered = Object.keys(quiz.quizState?.answers ?? {}).length
    if (answered > 0) {
      setScreen('results')
    } else {
      handleNewSession()
    }
  }, [quiz.quizState, handleNewSession])

  const handleInterviewLeave = useCallback(() => {
    const completed = interview.session?.history.length ?? 0
    if (completed > 0) {
      handleInterviewComplete()
    } else {
      handleNewSession()
    }
  }, [interview.session, handleInterviewComplete, handleNewSession])

  const handleRestart = useCallback(() => {
    if (!quiz.quizState) return
    quiz.initQuiz({
      ...quiz.quizState,
      answers: {},
      currentQuestionIndex: 0,
      startedAt: Date.now(),
    })
    setScreen('quiz')
  }, [quiz])

  const mcqResults = useMemo(() => {
    if (!quiz.quizState) return null
    const elapsed = Math.floor((Date.now() - quiz.quizState.startedAt) / 1000)
    return calculateResults(quiz.quizState.questions, quiz.quizState.answers, elapsed)
  }, [quiz.quizState])

  const showError = error && (screen === 'config' || screen === 'interview')

  return (
    <>
      <ThemeToggle />

      {showError && (
        <div className="fixed left-1/2 top-20 z-50 w-full max-w-md -translate-x-1/2 px-4">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
            {error?.toLowerCase().includes('openai') && error?.toLowerCase().includes('quota') && (
              <p className="mt-2 border-t border-red-200 pt-2 dark:border-red-800">
                Use the free Groq key instead: add{' '}
                <code className="rounded bg-red-100 px-1 dark:bg-red-900">GROQ_API_KEY</code> to{' '}
                <code className="rounded bg-red-100 px-1 dark:bg-red-900">.env</code> from{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  console.groq.com/keys
                </a>
                , then restart <code className="rounded bg-red-100 px-1 dark:bg-red-900">npm run dev</code>.
              </p>
            )}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {screen === 'mode-select' && (
          <ModeSelectionPage key="mode-select" onSelect={handleSelectMode} />
        )}
        {screen === 'config' && practiceMode && (
          <HomePage
            key="config"
            mode={practiceMode}
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
          <QuizPage key="quiz" quiz={quiz} onComplete={handleQuizComplete} onLeave={handleQuizLeave} />
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

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
