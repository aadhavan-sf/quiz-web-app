import type { Difficulty, GenerateQuestionsRequest, Question, QuestionCount } from '../../shared/types.js'
import { formatOpenAIError, getOpenAIModel, requireOpenAIClient } from './aiClient.js'
import {
  buildBatchPrompt,
  getBatchSizes,
  parseQuestionsFromResponse,
  reindexQuestions,
  shuffleAllQuestionOptions,
} from './prompts.js'

async function generateBatch(
  topic: string,
  difficulty: Difficulty,
  batchSize: number,
  startId: number,
  coveredSubtopics: string[],
): Promise<Question[]> {
  const client = requireOpenAIClient()
  const prompt = buildBatchPrompt(topic, difficulty, batchSize, startId, coveredSubtopics)

  try {
    const response = await client.chat.completions.create({
      model: getOpenAIModel(),
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an expert technical interviewer. Always respond with valid JSON containing a "questions" array.',
        },
        {
          role: 'user',
          content: `${prompt}\n\nWrap the array in an object: { "questions": [...] }`,
        },
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('Empty response from AI')

    return parseQuestionsFromResponse(content, topic, startId)
  } catch (error) {
    throw new Error(formatOpenAIError(error))
  }
}

export async function generateQuestions(
  request: GenerateQuestionsRequest,
): Promise<Question[]> {
  const { topic, difficulty, questionCount } = request

  const batches = getBatchSizes(questionCount)
  const allQuestions: Question[] = []
  const coveredSubtopics: string[] = []
  let nextId = 1

  for (const batchSize of batches) {
    const batch = await generateBatch(
      topic.trim(),
      difficulty,
      batchSize,
      nextId,
      coveredSubtopics,
    )

    batch.forEach((q) => {
      if (!coveredSubtopics.includes(q.subtopic)) {
        coveredSubtopics.push(q.subtopic)
      }
    })

    allQuestions.push(...batch)
    nextId += batch.length
  }

  return shuffleAllQuestionOptions(reindexQuestions(allQuestions.slice(0, questionCount)))
}

export function validateGenerateRequest(body: unknown): GenerateQuestionsRequest {
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
