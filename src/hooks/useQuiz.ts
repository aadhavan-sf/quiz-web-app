import { useCallback, useMemo } from 'react'
import type { AnswerRecord, Question, QuizState } from '../types/question'
import { getQuizStateKey } from '../utils/storage'
import { useLocalStorage } from './useLocalStorage'

const initialQuizState: QuizState = {
  answers: {},
  currentQuestionIndex: 0,
  startedAt: Date.now(),
}

export function useQuiz(questions: Question[]) {
  const [quizState, setQuizState, clearQuizState] = useLocalStorage<QuizState | null>(
    getQuizStateKey(),
    null,
  )

  const startQuiz = useCallback(() => {
    setQuizState({
      answers: {},
      currentQuestionIndex: 0,
      startedAt: Date.now(),
    })
  }, [setQuizState])

  const resetQuiz = useCallback(() => {
    clearQuizState()
  }, [clearQuizState])

  const currentQuestion = useMemo(() => {
    if (!quizState) return null
    return questions[quizState.currentQuestionIndex] ?? null
  }, [quizState, questions])

  const currentAnswer = useMemo(() => {
    if (!quizState || !currentQuestion) return null
    return quizState.answers[currentQuestion.id] ?? null
  }, [quizState, currentQuestion])

  const isQuestionAnswered = useCallback(
    (questionId: number) => {
      return quizState?.answers[questionId] !== undefined
    },
    [quizState],
  )

  const submitAnswer = useCallback(
    (questionId: number, selectedAnswer: number, correctAnswer: number) => {
      if (!quizState) return

      const record: AnswerRecord = {
        selectedAnswer,
        isCorrect: selectedAnswer === correctAnswer,
      }

      setQuizState({
        ...quizState,
        answers: { ...quizState.answers, [questionId]: record },
      })
    },
    [quizState, setQuizState],
  )

  const goToQuestion = useCallback(
    (index: number) => {
      if (!quizState) return
      if (index > quizState.currentQuestionIndex) return
      if (index < 0 || index >= questions.length) return

      setQuizState({ ...quizState, currentQuestionIndex: index })
    },
    [quizState, questions.length, setQuizState],
  )

  const goToNextQuestion = useCallback(() => {
    if (!quizState || !currentQuestion) return
    if (!quizState.answers[currentQuestion.id]) return

    const nextIndex = quizState.currentQuestionIndex + 1
    if (nextIndex >= questions.length) return

    setQuizState({ ...quizState, currentQuestionIndex: nextIndex })
  }, [quizState, currentQuestion, questions.length, setQuizState])

  const stats = useMemo(() => {
    if (!quizState) return { correct: 0, wrong: 0 }
    const values = Object.values(quizState.answers)
    return {
      correct: values.filter((a) => a.isCorrect).length,
      wrong: values.filter((a) => !a.isCorrect).length,
    }
  }, [quizState])

  const isComplete = useMemo(() => {
    if (!quizState) return false
    return Object.keys(quizState.answers).length === questions.length
  }, [quizState, questions.length])

  const progress = useMemo(() => {
    if (!quizState) return 0
    return Math.round(((quizState.currentQuestionIndex + 1) / questions.length) * 100)
  }, [quizState, questions.length])

  return {
    quizState: quizState ?? initialQuizState,
    hasStarted: quizState !== null,
    currentQuestion,
    currentAnswer,
    currentIndex: quizState?.currentQuestionIndex ?? 0,
    isQuestionAnswered,
    submitAnswer,
    goToQuestion,
    goToNextQuestion,
    startQuiz,
    resetQuiz,
    stats,
    isComplete,
    progress,
  }
}
