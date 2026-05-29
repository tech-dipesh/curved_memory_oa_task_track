import { useState } from 'react'
import { useTasks } from '../context/TaskContext'
import Timer from './Timer'

const fmtSecs = (secs) => {
  if(!secs) return '0m'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if(h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function TaskCard({ task }) {
  const { updateTask, deleteTask, refreshTask } = useTasks()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [desc, setDesc] = useState(task.description || '')
  const [status, setStatus] = useState(task.status)

  const handleSave = async () => {
    try {
      await updateTask(task.id, { title, description: desc, status })
      setEditing(false)
    } catch(err) {
      alert('failed to update')
    }
  }

  const handleDelete = async () => {
    if(!confirm('delete this task?')) return
    try {
      await deleteTask(task.id)
    } catch(err) {
      alert('could not delete')
    }
  }

  return (
<div className="card mb-3">
  {editing ? (
    <div>
      <input value={title} onChange={e => setTitle(e.target.value)} className="mb-2" />
      <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="mb-2 resize-y" placeholder="description" />
      <select value={status} onChange={e => setStatus(e.target.value)} className="mb-2.5 w-auto">
        <option value="pending">pending</option>
        <option value="in_progress">in progress</option>
        <option value="completed">completed</option>
      </select>
      <div className="flex gap-2">
        <button className="btn-primary btn-sm" onClick={handleSave}>save</button>
        <button onClick={() => setEditing(false)} className="btn-sm bg-[#e5e7eb]">cancel</button>
      </div>
    </div>
  ) : (
    <div>
      <div className="flex justify-between items-start mb-1.5">
        <div>
          <span className="font-semibold text-[15px]">{task.title}</span>
          <span className={`badge badge-${task.status} ml-2`}>{task.status.replace('_', ' ')}</span>
        </div>
        <div className="flex gap-1.5">
          <button className="btn-sm bg-[#f3f4f6]" onClick={() => setEditing(true)}>edit</button>
          <button className="btn-sm btn-danger" onClick={handleDelete}>del</button>
        </div>
      </div>
      {task.description && <p className="text-[13px] text-[#666] mb-2">{task.description}</p>}
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#888]">total: {fmtSecs(task.totalTimeSpent)}</span>
        <Timer task={task} onUpdate={() => refreshTask(task.id)} />
      </div>
    </div>
  )}
</div>
  )
}
