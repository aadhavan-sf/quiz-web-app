import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createInterviewHandler } from '../_utils.js'
import { startInterview, validateInterviewStart } from '../server/services/interviewService.js'

export default createInterviewHandler(async (req: VercelRequest, res: VercelResponse) => {
  const request = validateInterviewStart(req.body)
  const question = await startInterview(request)
  return res.status(200).json({ question, totalQuestions: request.questionCount })
})
