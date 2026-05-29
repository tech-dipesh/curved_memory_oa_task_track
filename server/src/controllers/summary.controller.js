import  prisma  from "../lib/prisma.js";

const getDailySummary = async (req, res) => {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      include: {
        timeLogs: {
          where: {
            startTime: { gte: todayStart, lte: todayEnd }
          }
        }
      }
    })

    const workedTasks = tasks.filter(t => t.timeLogs.length > 0)
    const totalSecs = workedTasks.reduce((acc, t) => {
      return acc + t.timeLogs.reduce((a, l) => a + (l.duration || 0), 0)
    }, 0)

    const completed = tasks.filter(t => t.status === 'completed').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const pending = tasks.filter(t => t.status === 'pending').length

    res.json({
      date: todayStart,
      workedOn: workedTasks.length,
      totalTimeTracked: totalSecs,
      completed,
      inProgress,
      pending,
      tasks: workedTasks.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        timeToday: t.timeLogs.reduce((a, l) => a + (l.duration || 0), 0)
      }))
    })
  } catch(err) {
    console.error(err)
    res.status(500).json({ message: 'server error' })
  }
}

const getWeeklySummary = async (req, res) => {
  try {
    const now = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(now.getDate() - 6)
    weekAgo.setHours(0, 0, 0, 0)

    const logs = await prisma.timeLog.findMany({
      where: {
        task: { userId: req.userId },
        startTime: { gte: weekAgo },
        endTime: { not: null }
      },
      include: { task: { select: { title: true, status: true } } }
    })

    const days = []
    for(let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      d.setHours(0, 0, 0, 0)

      const dayEnd = new Date(d)
      dayEnd.setHours(23, 59, 59, 999)

      const dayLogs = logs.filter(l => {
        const st = new Date(l.startTime)
        return st >= d && st <= dayEnd
      })

      const totalSecs = dayLogs.reduce((acc, l) => acc + (l.duration || 0), 0)

      days.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        totalSeconds: totalSecs,
        totalMinutes: Math.round(totalSecs / 60),
        logCount: dayLogs.length
      })
    }

    const taskMap = {}
    logs.forEach(l => {
      if(!taskMap[l.taskId]) {
        taskMap[l.taskId] = { title: l.task.title, status: l.task.status, total: 0 }
      }
      taskMap[l.taskId].total += l.duration || 0
    })

    const topTasks = Object.entries(taskMap)
      .map(([id, val]) => ({ taskId: parseInt(id), ...val }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    res.json({ days, topTasks })
  } catch(err) {
    console.error(err)
    res.status(500).json({ message: 'server error' })
  }
}

export { getDailySummary, getWeeklySummary }
