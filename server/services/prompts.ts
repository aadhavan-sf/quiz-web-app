import type { Difficulty, Question, QuestionCount } from '../../shared/types.js'

const BATCH_SIZE = 25

export function buildKnowledgeMapPrompt(topic: string, questionCount: QuestionCount): string {
  return `You are a senior interviewer and subject-matter expert in "${topic}".

First, mentally map every important interview area for this topic — core concepts, subtopics, practical scenarios, best practices, common misconceptions, and real interview patterns.

Then generate interview questions that maximize coverage across that knowledge map.

Requirements:
- Return exactly ${questionCount} unique questions as a JSON array
- Do NOT repeat questions or test the same concept twice
- Mix conceptual, scenario-based, and practical questions
- For ${questionCount} questions, cover the most important concepts proportionally (more questions = broader coverage)
- Each question must have exactly 4 distinct options with one clearly correct answer
- Explanations must be 2-4 sentences explaining why the correct answer is right

Return ONLY valid JSON — no markdown, no code fences, no extra text.

JSON schema for each item:
{
  "id": number,
  "topic": string,
  "subtopic": string,
  "difficulty": "Easy" | "Intermediate" | "Advanced",
  "question": string,
  "options": [string, string, string, string],
  "correctAnswer": 0 | 1 | 2 | 3,
  "explanation": string
}`
}

export function buildBatchPrompt(
  topic: string,
  difficulty: Difficulty,
  batchSize: number,
  startId: number,
  coveredSubtopics: string[],
): string {
  const difficultyInstruction =
    difficulty === 'Mixed'
      ? 'Use approximately 30% Easy, 40% Intermediate, and 30% Advanced questions in this batch.'
      : `All questions in this batch must be "${difficulty}" difficulty.`

  const coverageNote =
    coveredSubtopics.length > 0
      ? `Avoid repeating these subtopics already covered: ${coveredSubtopics.join(', ')}.`
      : 'Cover the most foundational and commonly asked interview areas first.'

  return `You are a senior interviewer with extensive experience hiring professionals for the topic: "${topic}".

SESSION CONFIG (use exactly as provided):
- Topic: "${topic}" — every question must test knowledge specific to this topic
- Difficulty: ${difficulty}
- Questions to generate in this batch: ${batchSize}

${difficultyInstruction}
${coverageNote}

Generate exactly ${batchSize} unique, high-quality multiple-choice interview questions about "${topic}".
Each question must include: id, topic, subtopic, difficulty, question, 4 options, correctAnswer (0-3), explanation.
Every question must reference specific concepts, tools, or scenarios from ${topic} — no generic placeholder questions.

Return ONLY a valid JSON array. No markdown. No extra text.
Number ids starting from ${startId}. Set topic to "${topic}" for every question.`
}

export function getBatchSizes(total: QuestionCount): number[] {
  const batches: number[] = []
  let remaining = total
  while (remaining > 0) {
    const size = Math.min(BATCH_SIZE, remaining)
    batches.push(size)
    remaining -= size
  }
  return batches
}

export function parseQuestionsFromResponse(raw: string, topic: string, startId: number): Question[] {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')

  const parsed = JSON.parse(cleaned) as unknown
  const items = Array.isArray(parsed) ? parsed : (parsed as { questions: unknown[] }).questions

  if (!Array.isArray(items)) {
    throw new Error('AI response did not contain a questions array')
  }

  return items.map((item, index) => normalizeQuestion(item, topic, startId + index))
}

function normalizeQuestion(item: unknown, topic: string, fallbackId: number): Question {
  const q = item as Record<string, unknown>
  const options = q.options as string[]

  if (!Array.isArray(options) || options.length !== 4) {
    throw new Error('Each question must have exactly 4 options')
  }

  const correctAnswer = Number(q.correctAnswer)
  if (correctAnswer < 0 || correctAnswer > 3) {
    throw new Error('correctAnswer must be 0, 1, 2, or 3')
  }

  const difficulty = String(q.difficulty)
  if (!['Easy', 'Intermediate', 'Advanced'].includes(difficulty)) {
    throw new Error(`Invalid difficulty: ${difficulty}`)
  }

  return {
    id: Number(q.id) || fallbackId,
    topic: String(q.topic || topic),
    subtopic: String(q.subtopic || 'General'),
    difficulty: difficulty as Question['difficulty'],
    question: String(q.question),
    options: [options[0], options[1], options[2], options[3]],
    correctAnswer: correctAnswer as 0 | 1 | 2 | 3,
    explanation: String(q.explanation),
  }
}

export function reindexQuestions(questions: Question[]): Question[] {
  return questions.map((q, index) => ({ ...q, id: index + 1 }))
}
