import  prisma  from "../lib/prisma.js";

const startTimer = async (req, res) => {
  const taskId = parseInt(req.params.taskId)

  try {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId: req.userId } })
    if(!task) return res.status(404).json({ message: 'task not found' })

    const activeLog = await prisma.timeLog.findFirst({
      where: { taskId, endTime: null }
    })
    if(activeLog) return res.status(400).json({ message: 'timer already running for this task' })

    const log = await prisma.timeLog.create({
      data: { taskId, startTime: new Date() }
    })

    if(task.status === 'pending') {
      await prisma.task.update({ where: { id: taskId }, data: { status: 'in_progress' } })
    }

    res.status(201).json(log)
  } catch(err) {
    console.error(err)
    res.status(500).json({ message: 'server error' })
  }
}

const stopTimer = async (req, res) => {
  const taskId = parseInt(req.params.taskId)

  try {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId: req.userId } })
    if(!task) return res.status(404).json({ message: 'task not found' })

    const activeLog = await prisma.timeLog.findFirst({
      where: { taskId, endTime: null }
    })
    if(!activeLog) return res.status(400).json({ message: 'no active timer found' })

    const endTime = new Date()
    const duration = Math.floor((endTime - new Date(activeLog.startTime)) / 1000)

    const updated = await prisma.timeLog.update({
      where: { id: activeLog.id },
      data: { endTime, duration }
    })

    res.json(updated)
  } catch(err) {
    console.error(err)
    res.status(500).json({ message: 'server error' })
  }
}

const getActiveTimer = async (req, res) => {
  const taskId = parseInt(req.params.taskId)

  try {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId: req.userId } })
    if(!task) return res.status(404).json({ message: 'task not found' })

    const activeLog = await prisma.timeLog.findFirst({
      where: { taskId, endTime: null }
    })
    res.json(activeLog || null)
  } catch(err) {
    res.status(500).json({ message: 'server error' })
  }
}

const getAllTimelogs = async (req, res) => {
  try {
    const logs = await prisma.timeLog.findMany({
      where: { task: { userId: req.userId } },
      include: { task: { select: { title: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(logs)
  } catch(err) {
    res.status(500).json({ message: 'server error' })
  }
}

export { startTimer, stopTimer, getActiveTimer, getAllTimelogs }
