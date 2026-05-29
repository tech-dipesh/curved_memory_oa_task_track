import  prisma  from "../lib/prisma.js";
import { createTaskSchema, updateTaskSchema }from '../validations/task.validation.js'

const getAllTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      include: {
        timeLogs: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const tasksWithTotal = tasks.map(t => {
      const totalSecs = t.timeLogs.reduce((acc, log) => acc + (log.duration || 0), 0)
      return { ...t, totalTimeSpent: totalSecs }
    })

    res.json(tasksWithTotal)
  } catch(err) {
    console.error(err)
    res.status(500).json({ message: 'server error' })
  }
}

const createTask = async (req, res) => {
  const result = createTaskSchema.safeParse(req.body)
  if(!result.success) {
    return res.status(400).json({ message: result.error.errors[0].message })
  }

  try {
    const task = await prisma.task.create({
      data: {
        ...result.data,
        userId: req.userId
      }
    })
    res.status(201).json(task)
  } catch(err) {
    console.error(err)
    res.status(500).json({ message: 'server error' })
  }
}

const updateTask = async (req, res) => {
  const taskId = parseInt(req.params.id)
  const result = updateTaskSchema.safeParse(req.body)
  if(!result.success) {
    return res.status(400).json({ message: result.error.errors[0].message })
  }

  try {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId: req.userId } })
    if(!task) return res.status(404).json({ message: 'task not found' })

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: result.data
    })
    res.json(updated)
  } catch(err) {
    console.error(err)
    res.status(500).json({ message: 'server error' })
  }
}

const deleteTask = async (req, res) => {
  const taskId = parseInt(req.params.id)

  try {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId: req.userId } })
    if(!task) return res.status(404).json({ message: 'task not found' })

    await prisma.task.delete({ where: { id: taskId } })
    res.json({ message: 'task deleted' })
  } catch(err) {
    console.error(err)
    res.status(500).json({ message: 'server error' })
  }
}

const getSingleTask = async (req, res) => {
  const taskId = parseInt(req.params.id)
  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: req.userId },
      include: { timeLogs: { orderBy: { createdAt: 'desc' } } }
    })
    if(!task) return res.status(404).json({ message: 'not found' })
    res.json(task)
  } catch(err) {
    res.status(500).json({ message: 'server error' })
  }
}

export { getAllTasks, createTask, updateTask, deleteTask, getSingleTask }
