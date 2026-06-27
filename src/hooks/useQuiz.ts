import { useCallback, useMemo } from 'react'
import type { AnswerRecord, QuizState } from '../types/question'
import { getQuizStateKey } from '../utils/storage'
import { useLocalStorage } from './useLocalStorage'

export function useQuiz() {
  const [quizState, setQuizState, clearQuizState] = useLocalStorage<QuizState | null>(
    getQuizStateKey(),
    null,
  )

  const questions = quizState?.questions ?? []

  const initQuiz = useCallback(
    (state: QuizState) => {
      setQuizState(state)
    },
    [setQuizState],
  )

  const resetQuiz = useCallback(() => {
    clearQuizState()
  }, [clearQuizState])

  const currentQuestion = useMemo(() => {
    if (!quizState) return null
    return quizState.questions[quizState.currentQuestionIndex] ?? null
  }, [quizState])

  const currentAnswer = useMemo(() => {
    if (!quizState || !currentQuestion) return null
    return quizState.answers[currentQuestion.id] ?? null
  }, [quizState, currentQuestion])

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
      if (index < 0 || index >= quizState.questions.length) return
      setQuizState({ ...quizState, currentQuestionIndex: index })
    },
    [quizState, setQuizState],
  )

  const goToNextQuestion = useCallback(() => {
    if (!quizState || !currentQuestion) return
    if (!quizState.answers[currentQuestion.id]) return

    const nextIndex = quizState.currentQuestionIndex + 1
    if (nextIndex >= quizState.questions.length) return

    setQuizState({ ...quizState, currentQuestionIndex: nextIndex })
  }, [quizState, currentQuestion, setQuizState])

  const stats = useMemo(() => {
    if (!quizState) return { correct: 0, wrong: 0, answered: 0, remaining: 0 }
    const values = Object.values(quizState.answers)
    const answered = values.length
    return {
      correct: values.filter((a) => a.isCorrect).length,
      wrong: values.filter((a) => !a.isCorrect).length,
      answered,
      remaining: quizState.questions.length - answered,
    }
  }, [quizState])

  const isComplete = useMemo(() => {
    if (!quizState) return false
    return Object.keys(quizState.answers).length === quizState.questions.length
  }, [quizState])

  const progress = useMemo(() => {
    if (!quizState || quizState.questions.length === 0) return 0
    return Math.round(((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100)
  }, [quizState])

  return {
    quizState,
    questions,
    currentQuestion,
    currentAnswer,
    currentIndex: quizState?.currentQuestionIndex ?? 0,
    submitAnswer,
    goToQuestion,
    goToNextQuestion,
    initQuiz,
    resetQuiz,
    stats,
    isComplete,
    progress,
  }
}
