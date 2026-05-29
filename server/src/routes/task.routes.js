import express from 'express'
import { getAllTasks, createTask, updateTask, deleteTask, getSingleTask } from '../controllers/task.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
const router = express.Router()

router.use(authMiddleware)

router.get('/', getAllTasks)
router.post('/', createTask)
router.get('/:id', getSingleTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router
