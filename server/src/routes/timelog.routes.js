import express from 'express'
import { startTimer, stopTimer, getActiveTimer, getAllTimelogs } from '../controllers/timelog.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
const router = express.Router()

router.use(authMiddleware)

router.get('/', getAllTimelogs)
router.post('/:taskId/start', startTimer)
router.post('/:taskId/stop', stopTimer)
router.get('/:taskId/active', getActiveTimer)

export default router
