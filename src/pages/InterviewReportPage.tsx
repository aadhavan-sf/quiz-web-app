import { motion } from 'framer-motion'
import type { InterviewReport, InterviewSessionState } from '../types/question'

interface InterviewReportPageProps {
  session: InterviewSessionState
  report: InterviewReport
  onNewSession: () => void
}

export function InterviewReportPage({ session, report, onNewSession }: InterviewReportPageProps) {
  const { config } = session

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 py-8 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Interview Complete, {config.fullName}
          </h1>
          <p className="mt-2 text-gray-600">
            {config.topic} · {config.questionCount} questions · {report.timeTaken}
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <p className="text-5xl font-bold text-blue-600">
              {report.overallInterviewScore.toFixed(1)}
            </p>
            <p className="text-sm text-gray-500">Overall Interview Score / 10</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Communication" value={report.communicationScore} />
            <Stat label="Technical" value={report.technicalKnowledgeScore} />
            <Stat label="Confidence" value={report.confidenceScore} />
            <Stat label="Time" value={report.timeTaken} isText />
          </div>
        </div>

        <Section title="Topic Coverage">
          <p className="text-sm leading-relaxed text-gray-600">
            {report.topicCoverage}
          </p>
        </Section>

        <div className="mb-6 grid gap-6 sm:grid-cols-2">
          <Section title="Strongest Areas">
            <BulletList items={report.strongestAreas} color="green" />
          </Section>
          <Section title="Weakest Areas">
            <BulletList items={report.weakestAreas} color="amber" />
          </Section>
        </div>

        <Section title="Questions Answered Well">
          <BulletList items={report.questionsAnsweredWell} />
        </Section>

        <Section title="Questions Needing Improvement">
          <BulletList items={report.questionsNeedingImprovement} />
        </Section>

        <Section title="Recommended Learning Topics">
          <div className="flex flex-wrap gap-2">
            {report.recommendedLearningTopics.map((t) => (
              <span
                key={t}
                className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
              >
                {t}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Overall Interview Summary">
          <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
            {report.overallSummary}
          </p>
        </Section>

        <div className="mt-8 flex justify-center">
          <motion.button
            type="button"
            onClick={onNewSession}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Start New Session
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  )
}

function Stat({
  label,
  value,
  isText,
}: {
  label: string
  value: number | string
  isText?: boolean
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-3 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">
        {isText ? value : `${value}/10`}
      </p>
    </div>
  )
}

function BulletList({
  items,
  color,
}: {
  items: string[]
  color?: 'green' | 'amber'
}) {
  const dot = color === 'green' ? 'text-green-500' : color === 'amber' ? 'text-amber-500' : 'text-gray-400'
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm text-gray-600">
          <span className={dot}>•</span> {item}
        </li>
      ))}
    </ul>
  )
}
