import type {
  Difficulty,
  InterviewEvaluateRequest,
  InterviewEvaluation,
  InterviewQuestion,
  InterviewReport,
  InterviewReportRequest,
  InterviewStartRequest,
  QuestionCount,
} from '../../shared/types.js'
import {
  buildInterviewEvaluatePrompt,
  buildInterviewStartPrompt,
  buildInterviewSystemPrompt,
} from './interviewPrompts.js'
import { getOpenAIModel, formatOpenAIError, requireOpenAIClient } from './aiClient.js'

const QUESTION_TEMPERATURE = 0.55
const EVAL_TEMPERATURE = 0.65

function parseJson<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
  return JSON.parse(cleaned) as T
}

async function chatJson<T>(system: string, user: string, temperature = 0.7): Promise<T> {
  const client = requireOpenAIClient()

  try {
    const response = await client.chat.completions.create({
      model: getOpenAIModel(),
      temperature,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('Empty AI response')
    return parseJson<T>(content)
  } catch (error) {
    throw new Error(formatOpenAIError(error))
  }
}

function normalizeQuestion(question: InterviewQuestion, topic: string): InterviewQuestion {
  return {
    ...question,
    topic: question.topic || topic,
    subtopic: question.subtopic?.trim() || 'Applied Concepts',
    question: question.question.trim(),
    contextualIntro: question.contextualIntro?.trim() || undefined,
  }
}

function normalizeEvaluation(e: InterviewEvaluation): InterviewEvaluation {
  return {
    ...e,
    overallScore: Math.min(10, Math.max(0, Number(e.overallScore) || 0)),
    communicationScores: {
      technicalAccuracy: clampScore(e.communicationScores?.technicalAccuracy),
      communicationClarity: clampScore(e.communicationScores?.communicationClarity),
      confidence: clampScore(e.communicationScores?.confidence),
      answerStructure: clampScore(e.communicationScores?.answerStructure),
      depthOfKnowledge: clampScore(e.communicationScores?.depthOfKnowledge),
    },
  }
}

function clampScore(n: number | undefined): number {
  return Math.min(10, Math.max(0, Number(n) || 0))
}

export async function startInterview(request: InterviewStartRequest): Promise<InterviewQuestion> {
  const { topic } = request

  const result = await chatJson<{ question: InterviewQuestion }>(
    buildInterviewSystemPrompt(topic),
    buildInterviewStartPrompt(request),
    QUESTION_TEMPERATURE,
  )
  return normalizeQuestion(result.question, topic)
}

export async function evaluateAnswer(
  request: InterviewEvaluateRequest,
): Promise<{ evaluation: InterviewEvaluation; nextQuestion: InterviewQuestion | null }> {
  const { config, questionIndex } = request
  const isLast = questionIndex + 1 >= config.questionCount

  const result = await chatJson<{
    evaluation: InterviewEvaluation
    nextQuestion: InterviewQuestion | null
  }>(
    buildInterviewSystemPrompt(config.topic),
    buildInterviewEvaluatePrompt(request, isLast),
    EVAL_TEMPERATURE,
  )

  return {
    evaluation: normalizeEvaluation(result.evaluation),
    nextQuestion: result.nextQuestion ? normalizeQuestion(result.nextQuestion, config.topic) : null,
  }
}

export async function generateInterviewReport(
  request: InterviewReportRequest,
): Promise<InterviewReport> {
  const { config, history, elapsedSeconds } = request
  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60
  const timeTaken = `${minutes}m ${seconds}s`

  const result = await chatJson<{ report: InterviewReport }>(
    'You are a hiring manager writing post-interview feedback. Respond with valid JSON only.',
    `Generate a complete interview report for ${config.fullName} who practiced ${config.topic} interviews.

${history.length} questions answered.
Time taken: ${timeTaken}

Interview history:
${history
  .map(
    (h, i) =>
      `Q${i + 1} (${h.question.subtopic}): ${h.question.question}\nScore: ${h.evaluation.overallScore}/10\nStrengths noted: ${h.evaluation.strengths.join('; ')}`,
  )
  .join('\n\n')}

Return JSON:
{
  "report": {
    "overallInterviewScore": number (0-10),
    "topicCoverage": "brief description of topics covered",
    "communicationScore": number (0-10),
    "technicalKnowledgeScore": number (0-10),
    "confidenceScore": number (0-10),
    "timeTaken": "${timeTaken}",
    "strongestAreas": ["areas"],
    "weakestAreas": ["areas"],
    "questionsAnsweredWell": ["summaries"],
    "questionsNeedingImprovement": ["summaries"],
    "recommendedLearningTopics": ["topics to study"],
    "overallSummary": "2-3 paragraph hiring manager summary"
  }
}`,
  )
  return result.report
}

export function validateInterviewStart(body: unknown): InterviewStartRequest {
  const data = body as Record<string, unknown>
  const fullName = String(data.fullName ?? '').trim()
  const topic = String(data.topic ?? '').trim()
  const difficulty = data.difficulty as Difficulty
  const questionCount = Number(data.questionCount) as QuestionCount

  if (fullName.length < 2) throw new Error('Full name is required')
  if (topic.length < 2) throw new Error('Topic is required')
  if (!['Easy', 'Intermediate', 'Advanced', 'Mixed'].includes(difficulty)) {
    throw new Error('Invalid difficulty')
  }
  if (![25, 50, 100, 150, 200].includes(questionCount)) {
    throw new Error('Question count must be 25, 50, 100, 150, or 200')
  }

  return { fullName, topic, difficulty, questionCount }
}
