import type { InterviewEvaluation } from '../types/question'
import { ExpandableCard } from './ExpandableCard'

interface InterviewFeedbackSectionsProps {
  evaluation: InterviewEvaluation
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{score}/10</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
    </div>
  )
}

export function InterviewFeedbackSections({ evaluation }: InterviewFeedbackSectionsProps) {
  const { communicationScores } = evaluation
  const avgCommunication = (
    (communicationScores.communicationClarity +
      communicationScores.confidence +
      communicationScores.answerStructure) /
    3
  ).toFixed(1)

  return (
    <div className="space-y-3" role="region" aria-label="Interview feedback">
      <ExpandableCard
        title="Overall Interview Score"
        summary={`${evaluation.overallScore.toFixed(1)} / 10`}
        defaultOpen
      >
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50">
            <span className="text-3xl font-bold text-blue-700">
              {evaluation.overallScore.toFixed(1)}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Out of 10</p>
            <p className="mt-1 text-base leading-relaxed text-gray-700">
              {evaluation.interviewerFeedback}
            </p>
          </div>
        </div>
      </ExpandableCard>

      <ExpandableCard
        title="Technical Accuracy"
        summary={`${communicationScores.technicalAccuracy}/10`}
      >
        <ScoreBar label="Technical Accuracy" score={communicationScores.technicalAccuracy} />
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Depth of knowledge: {communicationScores.depthOfKnowledge}/10
        </p>
      </ExpandableCard>

      <ExpandableCard title="Communication Quality" summary={`${avgCommunication} / 10 avg`}>
        <div className="space-y-4">
          <ScoreBar label="Communication Clarity" score={communicationScores.communicationClarity} />
          <ScoreBar label="Confidence" score={communicationScores.confidence} />
          <ScoreBar label="Answer Structure" score={communicationScores.answerStructure} />
        </div>
      </ExpandableCard>

      <ExpandableCard title="Strengths" summary={`${evaluation.strengths.length} noted`}>
        <ul className="space-y-2">
          {evaluation.strengths.map((item) => (
            <li key={item} className="flex gap-2 text-base leading-relaxed text-gray-700">
              <span className="text-green-500" aria-hidden>
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </ExpandableCard>

      <ExpandableCard title="Areas for Improvement" summary={`${evaluation.areasToImprove.length} noted`}>
        <ul className="space-y-2">
          {evaluation.areasToImprove.map((item) => (
            <li key={item} className="flex gap-2 text-base leading-relaxed text-gray-700">
              <span className="text-amber-500" aria-hidden>
                →
              </span>
              {item}
            </li>
          ))}
        </ul>
      </ExpandableCard>

      <ExpandableCard title="Ideal Interview Answer" summary="Tap to read model answer">
        <p className="text-base leading-relaxed text-gray-700">{evaluation.idealAnswer}</p>
      </ExpandableCard>

      {evaluation.followUpQuestions.length > 0 && (
        <ExpandableCard
          title="Suggested Follow-up Questions"
          summary={`${evaluation.followUpQuestions.length} questions`}
        >
          <ul className="space-y-2">
            {evaluation.followUpQuestions.map((question) => (
              <li
                key={question}
                className="rounded-xl border border-gray-200 px-4 py-3 text-base leading-relaxed text-gray-700"
              >
                {question}
              </li>
            ))}
          </ul>
        </ExpandableCard>
      )}
    </div>
  )
}
