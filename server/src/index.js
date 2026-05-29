import express from "express";
import cors  from 'cors';
import "dotenv/config"

import authRoutes from './routes/auth.routes.js'
import taskRoutes from './routes/task.routes.js'
import timelogRoutes from './routes/timelog.routes.js'
import summaryRoutes from './routes/summary.routes.js'
const app = express()

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/timelogs', timelogRoutes)
app.use('/api/summary', summaryRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'something went wrong' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`server running on port ${PORT}`))
