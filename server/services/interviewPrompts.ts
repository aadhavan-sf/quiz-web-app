import type {
  Difficulty,
  InterviewEvaluateRequest,
  InterviewHistoryEntry,
  InterviewStartRequest,
} from '../../shared/types.js'

const INTERVIEWER_MINDSET = `
You are a senior practitioner and hiring manager with 10+ years of hands-on experience in the candidate's topic.
You have conducted hundreds of real interviews and you think like someone who has built, shipped, debugged, and led work in this domain.

Before every question, mentally do deep research on the topic:
- Map the full landscape: fundamentals, advanced patterns, tooling, workflows, trade-offs, failure modes, and how teams actually work day to day
- Recall what strong vs weak candidates typically reveal in real interviews
- Plan which areas to probe across the session so coverage is broad and non-overlapping
`.trim()

const QUESTION_STYLE = `
HOW TO PHRASE QUESTIONS (critical):
- Ask open-ended, slightly broad prompts — the kind a senior interviewer uses to see how a candidate thinks
- Questions should sound generic or high-level on the surface, but only someone with real depth in THIS topic can answer them well
- Prefer: "How would you approach…", "Walk me through your thinking when…", "What matters most when…", "How do you decide between…"
- Do NOT ask trivia, syntax quizzes, or "What is X?" definition questions
- Do NOT name every specific tool in the question — let the candidate bring up the right concepts from their experience
- One clear question per turn; 1–3 sentences max. No multi-part laundry lists
- Each question must feel fresh — vary the angle, scenario, and phrasing every time

GOOD (Figma): "When design and engineering disagree on feasibility, how do you usually work through that?"
GOOD (Power BI): "Tell me how you would approach making a report trustworthy for executives who make decisions from it."
BAD: "What is Figma and why is it important?"
BAD: "Explain the CALCULATE function in DAX." (too narrow / textbook)
BAD: Reusing the same question structure or scenario type as a prior question in this session
`.trim()

const ANTI_REPETITION = `
ZERO REPETITION RULE:
- Never repeat a question, paraphrase a prior question, or ask about the same underlying concept twice in one session
- Compare against the full list of previously asked questions before generating a new one
- If a subtopic was already covered, move to a different area of the topic entirely
- Vary question openings — do not start consecutive questions with the same words or pattern
`.trim()

function difficultyGuidance(difficulty: Difficulty, questionIndex: number, total: number): string {
  const progress = total > 1 ? questionIndex / (total - 1) : 0

  if (difficulty === 'Easy') {
    return 'Ease the candidate in with a broad question about foundational judgment or everyday practice in this topic — still open-ended, not a definition quiz.'
  }
  if (difficulty === 'Intermediate') {
    return 'Ask about real-world situations: trade-offs, collaboration, prioritization, or how they handle common professional challenges in this domain.'
  }
  if (difficulty === 'Advanced') {
    return 'Ask questions that reveal senior judgment: ambiguity, scale, risk, quality under constraints, mentoring others, or decisions with long-term impact.'
  }

  if (progress < 0.3) {
    return 'Mixed session (early): broad foundational question — how they think about core work in this topic.'
  }
  if (progress < 0.7) {
    return 'Mixed session (middle): situational question about handling complexity, conflict, or trade-offs.'
  }
  return 'Mixed session (late): senior-level question about judgment, strategy, or depth under pressure.'
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
    .map((h, i) => `${i + 1}. [${h.question.subtopic}] ${h.question.question}`)
    .join('\n')
}

export function buildInterviewSystemPrompt(topic: string): string {
  return `${INTERVIEWER_MINDSET}

You are interviewing for roles related to: "${topic}".

Your internal knowledge must be deep and current. Your spoken questions stay open, natural, and slightly generic — like a seasoned interviewer who already knows the field and is listening for depth, not memorization.

${QUESTION_STYLE}

${ANTI_REPETITION}

Respond with valid JSON only. No markdown.`
}

export function buildInterviewStartPrompt(request: InterviewStartRequest): string {
  const { topic, difficulty, questionCount } = request

  return `Generate the FIRST question for a typed-answer interview practice session.

SESSION CONFIG:
- Topic: "${topic}"
- Difficulty: ${difficulty}
- Total questions: ${questionCount}

RESEARCH STEP (do this mentally before writing):
1. Build a mental map of 20+ distinct interview areas for "${topic}" — from basics through senior-level concerns
2. Note how an experienced hiring manager in this field would open a conversation
3. Pick ONE opening angle that is broad on the surface but reveals whether the candidate truly knows this topic

${difficultyGuidance(difficulty, 0, questionCount)}

The "subtopic" field is for your tracking (internal label of the area being probed) — e.g. "Design-dev collaboration", "Data trust & validation", "Performance trade-offs". Keep it short.

Return JSON:
{
  "question": {
    "id": 1,
    "topic": "${topic}",
    "subtopic": "short label for the area being tested",
    "difficulty": "Easy" | "Intermediate" | "Advanced",
    "question": "open-ended, slightly generic interview question that requires real topic depth to answer well",
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
    "subtopic": "new area — must differ from: ${covered.length > 0 ? covered.join(', ') : 'none yet'}",
    "difficulty": "Easy" | "Intermediate" | "Advanced",
    "question": "next open-ended question — new angle, not a repeat",
    "contextualIntro": "optional brief bridge from prior answer, or null"
  }`

  return `Evaluate this typed interview answer, then ${isLast ? 'finish the session' : 'generate the NEXT question'}.

SESSION CONFIG:
- Topic: "${config.topic}"
- Difficulty: ${config.difficulty}
- Question ${questionIndex + 1} of ${config.questionCount}
- Area probed: ${question.subtopic}

Question asked:
${question.contextualIntro ? question.contextualIntro + '\n' : ''}${question.question}

Candidate's answer:
${userAnswer}

ALL previously asked questions (do NOT repeat or closely paraphrase any of these):
${asked}

Areas already covered: ${covered.length > 0 ? covered.join(', ') : 'none'}

Prior scores:
${history.length > 0 ? history.map((h, i) => `Q${i + 1} (${h.question.subtopic}): ${h.evaluation.overallScore}/10`).join('\n') : 'First question.'}

--- EVALUATION ---
Evaluate as an experienced interviewer who knows "${config.topic}" deeply.
- Reward depth, practical judgment, and clear thinking — not buzzwords
- idealAnswer: a strong 150–300 word model response showing what an experienced candidate might say (conversational, not textbook)
- areasToImprove: specific gaps in their answer

--- NEXT QUESTION (if not last) ---
${isLast ? 'Final question — set nextQuestion to null.' : `Generate question ${nextIndex + 1} of ${config.questionCount}.

Before writing, review the mental map of "${config.topic}" and pick an area NOT yet covered.

${difficultyGuidance(config.difficulty, nextIndex, config.questionCount)}

${QUESTION_STYLE}
${ANTI_REPETITION}
- Must probe a genuinely different area than all prior questions
- contextualIntro may briefly reference the candidate's prior answer when natural`}

Return JSON:
{
  "evaluation": {
    "overallScore": number (0-10, one decimal),
    "interviewerFeedback": "paragraph — how this answer would land with a senior interviewer",
    "strengths": ["specific strengths"],
    "areasToImprove": ["specific improvements"],
    "idealAnswer": "150-300 word model answer",
    "followUpQuestions": ["2-3 natural follow-ups a senior interviewer might ask"],
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
