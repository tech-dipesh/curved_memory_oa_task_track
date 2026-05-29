import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

const TaskContext = createContext(null)

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/tasks')
      setTasks(res.data)
    } catch(err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createTask = async (data) => {
    const res = await api.post('/tasks', data)
    setTasks(prev => [res.data, ...prev])
    return res.data
  }

  const updateTask = async (id, data) => {
    const res = await api.put(`/tasks/${id}`, data)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...res.data } : t))
    return res.data
  }

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const refreshTask = async (id) => {
    const res = await api.get(`/tasks/${id}`)
    setTasks(prev => prev.map(t => t.id === id ? res.data : t))
  }

  return (
    <TaskContext.Provider value={{ tasks, loading, fetchTasks, createTask, updateTask, deleteTask, refreshTask }}>
      {children}
    </TaskContext.Provider>
  )
}

export const useTasks = () => useContext(TaskContext)
