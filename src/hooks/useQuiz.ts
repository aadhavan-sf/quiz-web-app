import { useCallback, useMemo } from 'react'
import type { AnswerRecord, QuizState } from '../types/question'
import { getQuizStateKey } from '../utils/storage'
import { useLocalStorage } from './useLocalStorage'

function skippedIds(state: QuizState | null): number[] {
  return state?.skippedQuestionIds ?? []
}

function findNextIndex(state: QuizState, afterIndex: number, preferUnvisited: boolean): number | null {
  const skipped = skippedIds(state)

  const isOpen = (index: number) => {
    const q = state.questions[index]
    if (!q) return false
    return !state.answers[q.id]
  }

  if (preferUnvisited) {
    for (let i = afterIndex + 1; i < state.questions.length; i++) {
      const q = state.questions[i]!
      if (!state.answers[q.id] && !skipped.includes(q.id)) return i
    }
    for (let i = 0; i <= afterIndex; i++) {
      const q = state.questions[i]!
      if (!state.answers[q.id] && !skipped.includes(q.id)) return i
    }
  }

  for (let i = afterIndex + 1; i < state.questions.length; i++) {
    if (isOpen(i)) return i
  }
  for (let i = 0; i <= afterIndex; i++) {
    if (isOpen(i)) return i
  }

  return null
}

export function canNavigateToQuizIndex(state: QuizState, index: number): boolean {
  if (index < 0 || index >= state.questions.length) return false
  if (index === state.currentQuestionIndex) return true
  const question = state.questions[index]
  if (!question) return false
  if (state.answers[question.id]) return true
  if (skippedIds(state).includes(question.id)) return true
  return false
}

export function useQuiz() {
  const [quizState, setQuizState, clearQuizState] = useLocalStorage<QuizState | null>(
    getQuizStateKey(),
    null,
  )

  const questions = quizState?.questions ?? []

  const initQuiz = useCallback(
    (state: QuizState) => {
      setQuizState({ ...state, skippedQuestionIds: state.skippedQuestionIds ?? [] })
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

      const nextSkipped = skippedIds(quizState).filter((id) => id !== questionId)

      setQuizState({
        ...quizState,
        answers: { ...quizState.answers, [questionId]: record },
        skippedQuestionIds: nextSkipped,
      })
    },
    [quizState, setQuizState],
  )

  const goToQuestion = useCallback(
    (index: number) => {
      if (!quizState) return
      if (index < 0 || index >= quizState.questions.length) return
      if (!canNavigateToQuizIndex(quizState, index)) return
      setQuizState({ ...quizState, currentQuestionIndex: index })
    },
    [quizState, setQuizState],
  )

  const skipCurrentQuestion = useCallback(() => {
    if (!quizState || !currentQuestion) return
    if (quizState.answers[currentQuestion.id]) return

    const skipped = skippedIds(quizState)
    const nextSkipped = skipped.includes(currentQuestion.id)
      ? skipped
      : [...skipped, currentQuestion.id]

    const nextIndex = findNextIndex(
      { ...quizState, skippedQuestionIds: nextSkipped },
      quizState.currentQuestionIndex,
      true,
    )

    if (nextIndex === null || nextIndex === quizState.currentQuestionIndex) return

    setQuizState({
      ...quizState,
      skippedQuestionIds: nextSkipped,
      currentQuestionIndex: nextIndex,
    })
  }, [quizState, currentQuestion, setQuizState])

  const goToNextQuestion = useCallback(() => {
    if (!quizState || !currentQuestion) return
    if (!quizState.answers[currentQuestion.id]) return

    const nextIndex = findNextIndex(quizState, quizState.currentQuestionIndex, false)
    if (nextIndex === null || nextIndex === quizState.currentQuestionIndex) return

    setQuizState({ ...quizState, currentQuestionIndex: nextIndex })
  }, [quizState, currentQuestion, setQuizState])

  const stats = useMemo(() => {
    if (!quizState) return { correct: 0, wrong: 0, answered: 0, remaining: 0, skipped: 0 }
    const values = Object.values(quizState.answers)
    const answered = values.length
    const skipped = skippedIds(quizState).filter((id) => !quizState.answers[id]).length
    return {
      correct: values.filter((a) => a.isCorrect).length,
      wrong: values.filter((a) => !a.isCorrect).length,
      answered,
      remaining: quizState.questions.length - answered,
      skipped,
    }
  }, [quizState])

  const isComplete = useMemo(() => {
    if (!quizState) return false
    return Object.keys(quizState.answers).length === quizState.questions.length
  }, [quizState])

  const hasSkippedUnanswered = useMemo(() => {
    if (!quizState) return false
    return skippedIds(quizState).some((id) => !quizState.answers[id])
  }, [quizState])

  const progress = useMemo(() => {
    if (!quizState || quizState.questions.length === 0) return 0
    return Math.round((Object.keys(quizState.answers).length / quizState.questions.length) * 100)
  }, [quizState])

  const attachSessionId = useCallback(
    (sessionId: string) => {
      if (!quizState) return
      if (quizState.sessionId === sessionId) return
      setQuizState({ ...quizState, sessionId })
    },
    [quizState, setQuizState],
  )

  const syncElapsedSeconds = useCallback(
    (seconds: number) => {
      if (!quizState) return
      if (quizState.elapsedSeconds === seconds) return
      setQuizState({ ...quizState, elapsedSeconds: seconds })
    },
    [quizState, setQuizState],
  )

  return {
    quizState,
    questions,
    currentQuestion,
    currentAnswer,
    currentIndex: quizState?.currentQuestionIndex ?? 0,
    skippedQuestionIds: skippedIds(quizState),
    submitAnswer,
    goToQuestion,
    skipCurrentQuestion,
    goToNextQuestion,
    canNavigateToIndex: (index: number) =>
      quizState ? canNavigateToQuizIndex(quizState, index) : false,
    initQuiz,
    resetQuiz,
    attachSessionId,
    syncElapsedSeconds,
    stats,
    isComplete,
    hasSkippedUnanswered,
    progress,
  }
}
