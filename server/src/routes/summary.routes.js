import express from 'express'
import { getDailySummary, getWeeklySummary } from '../controllers/summary.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
const router = express.Router()

router.use(authMiddleware)

router.get('/daily', getDailySummary)
router.get('/weekly', getWeeklySummary)

export default router
