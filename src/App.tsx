import { AnimatePresence } from 'framer-motion'
import { useCallback, useMemo, useState } from 'react'
import questionsData from './data/questions.json'
import { useQuiz } from './hooks/useQuiz'
import { HomePage } from './pages/HomePage'
import { QuizPage } from './pages/QuizPage'
import { ResultsPage } from './pages/ResultsPage'
import type { AppScreen, Question } from './types/question'
import { calculateResults } from './utils/quizUtils'
import { getUserName, setUserName, clearQuizData } from './utils/storage'

const questions = questionsData as Question[]

function App() {
  const [screen, setScreen] = useState<AppScreen>(() => {
    const savedName = getUserName()
    if (!savedName) return 'home'
    return 'home'
  })
  const [userName, setUserNameState] = useState(() => getUserName() ?? '')

  const quiz = useQuiz(questions)

  const handleStart = useCallback(
    (name: string) => {
      setUserName(name)
      setUserNameState(name)
      quiz.startQuiz()
      setScreen('quiz')
    },
    [quiz],
  )

  const handleComplete = useCallback(() => {
    setScreen('results')
  }, [])

  const handleRestart = useCallback(() => {
    clearQuizData()
    quiz.resetQuiz()
    setScreen('home')
  }, [quiz])

  const results = useMemo(() => {
    if (!quiz.quizState) return null
    const elapsed = Math.floor((Date.now() - quiz.quizState.startedAt) / 1000)
    return calculateResults(questions, quiz.quizState.answers, elapsed)
  }, [quiz.quizState])

  return (
    <AnimatePresence mode="wait">
      {screen === 'home' && <HomePage key="home" onStart={handleStart} />}
      {screen === 'quiz' && (
        <QuizPage
          key="quiz"
          userName={userName}
          questions={questions}
          quiz={quiz}
          onComplete={handleComplete}
        />
      )}
      {screen === 'results' && results && (
        <ResultsPage key="results" userName={userName} results={results} onRestart={handleRestart} />
      )}
    </AnimatePresence>
  )
}

export default App
