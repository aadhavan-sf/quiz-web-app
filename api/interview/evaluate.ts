import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createInterviewHandler } from '../_utils.js'
import { evaluateAnswer } from '../../server/services/interviewService.js'
import type { InterviewEvaluateRequest } from '../../shared/types.js'

export default createInterviewHandler(async (req: VercelRequest, res: VercelResponse) => {
  const body = req.body as InterviewEvaluateRequest
  const { evaluation, nextQuestion } = await evaluateAnswer(body)
  const isComplete = body.questionIndex + 1 >= body.config.questionCount

  return res.status(200).json({ evaluation, nextQuestion, isComplete })
})
