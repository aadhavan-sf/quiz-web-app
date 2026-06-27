import { motion } from 'framer-motion'
import type { InterviewEvaluation } from '../types/question'

interface InterviewFeedbackCardProps {
  evaluation: InterviewEvaluation
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">{score}/10</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
    </div>
  )
}

export function InterviewFeedbackCard({ evaluation }: InterviewFeedbackCardProps) {
  const { communicationScores } = evaluation

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Evaluation Result</h3>
        <div className="rounded-xl bg-blue-50 px-4 py-2 text-center dark:bg-blue-950">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Overall Score</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {evaluation.overallScore.toFixed(1)} / 10
          </p>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
          Interviewer&apos;s Feedback
        </h4>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {evaluation.interviewerFeedback}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-green-700 dark:text-green-400">Strengths</h4>
          <ul className="space-y-1.5">
            {evaluation.strengths.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
            Areas to Improve
          </h4>
          <ul className="space-y-1.5">
            {evaluation.areasToImprove.map((a) => (
              <li key={a} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-amber-500">•</span> {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
          Ideal Interview Answer
        </h4>
        <p className="rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {evaluation.idealAnswer}
        </p>
      </div>

      {evaluation.followUpQuestions.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
            Follow-up Questions
          </h4>
          <ul className="space-y-2">
            {evaluation.followUpQuestions.map((q) => (
              <li
                key={q}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400"
              >
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Communication Feedback
        </h4>
        <div className="space-y-3">
          <ScoreBar label="Technical Accuracy" score={communicationScores.technicalAccuracy} />
          <ScoreBar label="Communication Clarity" score={communicationScores.communicationClarity} />
          <ScoreBar label="Confidence" score={communicationScores.confidence} />
          <ScoreBar label="Answer Structure" score={communicationScores.answerStructure} />
          <ScoreBar label="Depth of Knowledge" score={communicationScores.depthOfKnowledge} />
        </div>
      </div>
    </motion.div>
  )
}
