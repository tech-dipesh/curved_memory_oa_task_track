import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'

const fmtTime = (secs) => {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export default function Timer({ task, onUpdate }) {
  const [activeLog, setActiveLog] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    const checkActive = async () => {
      try {
        const res = await api.get(`/timelogs/${task.id}/active`)
        if(res.data) {
          setActiveLog(res.data)
          const diff = Math.floor((Date.now() - new Date(res.data.startTime)) / 1000)
          setElapsed(diff)
        }
      } catch(err) {
        console.error(err)
      }
    }
    checkActive()
  }, [task.id])

  useEffect(() => {
    if(activeLog) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [activeLog])

  const handleStart = async () => {
    setLoading(true)
    try {
      const res = await api.post(`/timelogs/${task.id}/start`)
      setActiveLog(res.data)
      setElapsed(0)
      if(onUpdate) onUpdate()
    } catch(err) {
      alert(err.response?.data?.message || 'could not start timer')
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async () => {
    setLoading(true)
    try {
      await api.post(`/timelogs/${task.id}/stop`)
      setActiveLog(null)
      setElapsed(0)
      if(onUpdate) onUpdate()
    } catch(err) {
      alert(err.response?.data?.message || 'could not stop timer')
    } finally {
      setLoading(false)
    }
  }

  return (
    
<div className="flex items-center gap-2">
  {activeLog && (
    <span className="font-mono text-[14px] text-indigo-500 min-w-18">
      {fmtTime(elapsed)}
    </span>
  )}
  {activeLog ? (
    <button onClick={handleStop} className="btn-sm btn-danger" disabled={loading}>
      stop
    </button>
  ) : (
    <button onClick={handleStart} className="btn-sm btn-primary" disabled={loading || task.status === 'completed'}>
      start
    </button>
  )}
</div>
  )
}
