import type {
  Difficulty,
  InterviewEvaluateRequest,
  InterviewHistoryEntry,
  InterviewStartRequest,
} from '../../shared/types.js'

const FORBIDDEN_QUESTION_PATTERNS = `
FORBIDDEN — never ask these generic patterns:
- "What is {topic} and why is it important?"
- "Explain {topic} in simple terms"
- "What are the benefits of {topic}?"
- "Describe a challenging {topic} problem" (without a specific scenario, constraint, or tool)
- Any question that would apply unchanged to a completely different topic
- Vague questions with no specific concept, tool, technique, or trade-off named
`.trim()

const QUALITY_RULES = `
Every question MUST:
1. Name at least one specific concept, tool, pattern, or technique that belongs to the topic
2. Be answerable only by someone who studied THIS topic (not generic soft skills)
3. Reflect what senior interviewers actually ask for this subject in 2024–2026
4. Include a concrete scenario, constraint, or decision when difficulty is Intermediate or Advanced
5. Test understanding, trade-offs, or application — not memorized definitions alone

GOOD example (Power BI): "Your Import-mode report with 50M rows is slow to refresh. Walk me through how you would diagnose whether the bottleneck is in Power Query, the data model, or DAX measures, and what you would check first."
BAD example (Power BI): "What is Power BI and why is it useful for businesses?"
`.trim()

function difficultyGuidance(difficulty: Difficulty, questionIndex: number, total: number): string {
  const progress = total > 1 ? questionIndex / (total - 1) : 0

  if (difficulty === 'Easy') {
    return 'Ask about foundational but SPECIFIC concepts — name the exact feature, component, or syntax. Avoid textbook "what is" questions.'
  }
  if (difficulty === 'Intermediate') {
    return 'Ask scenario-based questions with a realistic workplace situation. Require the candidate to explain approach, trade-offs, or debugging steps.'
  }
  if (difficulty === 'Advanced') {
    return 'Ask deep questions: architecture decisions, performance under scale, edge cases, failure modes, or comparing two specific approaches within the topic.'
  }

  // Mixed — ramp difficulty across the session
  if (progress < 0.3) {
    return 'Mixed session (early): ask a specific foundational question naming a concrete concept or tool in this topic.'
  }
  if (progress < 0.7) {
    return 'Mixed session (middle): ask a scenario-based question requiring trade-off analysis or practical troubleshooting.'
  }
  return 'Mixed session (late): ask an advanced question about architecture, optimization, edge cases, or expert-level decision-making.'
}

export function getCoveredSubtopics(history: InterviewHistoryEntry[]): string[] {
  const seen = new Set<string>()
  for (const entry of history) {
    if (entry.question.subtopic) seen.add(entry.question.subtopic)
  }
  return [...seen]
}

export function getAskedQuestionsSummary(history: InterviewHistoryEntry[]): string {
  if (history.length === 0) return 'No questions asked yet.'
  return history
    .map(
      (h, i) =>
        `${i + 1}. [${h.question.subtopic}] ${h.question.question}`,
    )
    .join('\n')
}

export function buildInterviewSystemPrompt(topic: string): string {
  return `You are a senior hiring manager and subject-matter expert who has conducted hundreds of real interviews for "${topic}" roles.

Before writing any question, you MUST mentally research the topic:
- Core concepts, terminology, and ecosystem specific to ${topic}
- Tools, frameworks, languages, or platforms professionals use daily
- Common interview themes from job descriptions and industry practice
- Typical failure modes, trade-offs, and "gotcha" questions interviewers ask
- Subtopics a strong candidate is expected to know at each level

Your questions must sound like they come from someone who has actually worked in ${topic} — not a generic career coach.

${QUALITY_RULES}

${FORBIDDEN_QUESTION_PATTERNS}

Respond with valid JSON only. No markdown.`
}

export function buildInterviewStartPrompt(request: InterviewStartRequest): string {
  const { topic, difficulty, questionCount } = request

  return `Generate the FIRST question for a typed-answer interview practice session.

SESSION CONFIG (use exactly as provided):
- Topic: "${topic}" — generate questions ONLY about this topic, not generic interview questions
- Difficulty: ${difficulty}
- Total questions in session: ${questionCount}

TASK — do this research mentally before generating the question:
1. List 15–25 specific interview areas for "${topic}" (e.g. for Power BI: star schema, DAX CALCULATE, row-level security, DirectQuery vs Import — NOT generic labels like "Core Concepts")
2. Identify which areas are most commonly tested at ${difficulty} level
3. Select ONE opening question from a high-value, specific area

${difficultyGuidance(difficulty, 0, questionCount)}

The "subtopic" field must be a precise area within ${topic} (e.g. "DAX Context Transition", "React useEffect cleanup", "SQL window functions") — never use vague labels like "Core Concepts", "Fundamentals", or "Best Practices" alone.

Return JSON:
{
  "question": {
    "id": 1,
    "topic": "${topic}",
    "subtopic": "specific subtopic name",
    "difficulty": "Easy" | "Intermediate" | "Advanced",
    "question": "open-ended interview question — specific, scenario-rich where appropriate",
    "contextualIntro": null
  }
}`
}

export function buildInterviewEvaluatePrompt(
  request: InterviewEvaluateRequest,
  isLast: boolean,
): string {
  const { config, question, userAnswer, history, questionIndex } = request
  const nextIndex = questionIndex + 1
  const covered = getCoveredSubtopics(history)
  const asked = getAskedQuestionsSummary(history)

  const nextQuestionBlock = isLast
    ? '"nextQuestion": null'
    : `"nextQuestion": {
    "id": ${nextIndex + 1},
    "topic": "${config.topic}",
    "subtopic": "specific subtopic — must NOT repeat: ${covered.length > 0 ? covered.join(', ') : 'none yet'}",
    "difficulty": "Easy" | "Intermediate" | "Advanced",
    "question": "next specific open-ended question",
    "contextualIntro": "optional brief bridge referencing prior answer, or null"
  }`

  return `Evaluate this typed interview answer, then ${isLast ? 'finish the session' : 'generate the NEXT question'}.

SESSION CONFIG:
- Topic: "${config.topic}" (all questions must be about this topic)
- Difficulty: ${config.difficulty}
- Question ${questionIndex + 1} of ${config.questionCount}
- Subtopic asked: ${question.subtopic}

Question:
${question.contextualIntro ? question.contextualIntro + '\n' : ''}${question.question}

Candidate's typed answer:
${userAnswer}

Previously asked questions (DO NOT repeat these topics or concepts):
${asked}

Subtopics already covered: ${covered.length > 0 ? covered.join(', ') : 'none'}

Prior scores:
${history.length > 0 ? history.map((h, i) => `Q${i + 1} (${h.question.subtopic}): ${h.evaluation.overallScore}/10`).join('\n') : 'First question.'}

--- EVALUATION ---
Evaluate like a real hiring manager: technical correctness, completeness, clarity, depth, real-world applicability.
Point out specific mistakes or gaps in the candidate's answer in areasToImprove.
The idealAnswer must be a polished 150–300 word model answer specific to THIS question and topic that the candidate can compare against their response.

--- NEXT QUESTION (if not last) ---
${isLast ? 'This was the final question. Set nextQuestion to null.' : `Generate question ${nextIndex + 1} of ${config.questionCount}.

Before writing the next question, mentally identify remaining high-value interview areas for "${config.topic}" not yet covered.

${difficultyGuidance(config.difficulty, nextIndex, config.questionCount)}

Requirements for next question:
- Must test a DIFFERENT specific subtopic/concept than all prior questions
- Must name concrete tools, techniques, or scenarios from ${config.topic}
- ${FORBIDDEN_QUESTION_PATTERNS}
- contextualIntro may briefly reference the candidate's prior answer when natural

"subtopic" must be precise (e.g. "DAX Row Context vs Filter Context") — never vague.`}

Return JSON:
{
  "evaluation": {
    "overallScore": number (0-10, one decimal),
    "interviewerFeedback": "paragraph — how this answer would land in a real interview",
    "strengths": ["specific strengths"],
    "areasToImprove": ["specific improvements"],
    "idealAnswer": "150-300 word model answer for THIS exact question",
    "followUpQuestions": ["2-3 topic-specific follow-ups"],
    "communicationScores": {
      "technicalAccuracy": number (0-10),
      "communicationClarity": number (0-10),
      "confidence": number (0-10),
      "answerStructure": number (0-10),
      "depthOfKnowledge": number (0-10)
    }
  },
  ${nextQuestionBlock}
}`
}
