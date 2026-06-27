import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createInterviewHandler } from '../_utils.js'
import { generateInterviewReport } from '../../server/services/interviewService.js'
import type { InterviewReportRequest } from '../../shared/types.js'

export default createInterviewHandler(async (req: VercelRequest, res: VercelResponse) => {
  const body = req.body as InterviewReportRequest
  const report = await generateInterviewReport(body)
  return res.status(200).json({ report })
})
