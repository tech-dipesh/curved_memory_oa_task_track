import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const fmtSecs = (secs) => {
  if(!secs) return '0m'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if(h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function Dashboard() {
  const { user } = useAuth()
  const [daily, setDaily] = useState(null)
  const [weekly, setWeekly] = useState(null)
  const [loadingDaily, setLoadingDaily] = useState(true)
  const [loadingWeekly, setLoadingWeekly] = useState(true)

  useEffect(() => {
    api.get('/summary/daily').then(r => setDaily(r.data)).catch(console.error).finally(() => setLoadingDaily(false))
    api.get('/summary/weekly').then(r => setWeekly(r.data)).catch(console.error).finally(() => setLoadingWeekly(false))
  }, [])

  const chartData = weekly ? {
    labels: weekly?.days.map(d => d.label),
    datasets: [{
      label: 'minutes tracked',
      data: weekly.days.map(d => d.totalMinutes),
      backgroundColor: '#818cf8',
      borderRadius: 6
    }]
  } : null

  return (
    <div>
      <h2 className="mb-5 text-[20px]">hey {user?.name} </h2>
      {loadingDaily ? (
        <p className="text-[#888]">loading...</p>
      ) : daily && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 mb-7">
            <div className="card text-center">
              <div className="text-[28px] font-bold text-indigo-500">{daily.workedOn}</div>
              <div className="text-[12px] text-[#888] mt-1">tasks worked on today</div>
            </div>
            <div className="card text-center">
              <div className="text-[28px] font-bold text-indigo-500">{fmtSecs(daily.totalTimeTracked)}</div>
              <div className="text-[12px] text-[#888] mt-1">time tracked today</div>
            </div>
            <div className="card text-center">
              <div className="text-[28px] font-bold text-emerald-500">{daily.completed}</div>
              <div className="text-[12px] text-[#888] mt-1">completed</div>
            </div>
            <div className="card text-center">
              <div className="text-[28px] font-bold text-amber-500">{daily.inProgress}</div>
              <div className="text-[12px] text-[#888] mt-1">in progress</div>
            </div>
            <div className="card text-center">
              <div className="text-[28px] font-bold text-slate-400">{daily.pending}</div>
              <div className="text-[12px] text-[#888] mt-1">pending</div>
            </div>
          </div>
        )}

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <h3 className="mb-4 text-[15px]">last 7 days activity</h3>
          {loadingWeekly ? (
            <p className="text-[#888] text-[13px]">loading chart...</p>
          ) : chartData ? (
              <Bar data={chartData} options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 10 } } }
              }} />
            ) : (
                <p className="text-[#888] text-[13px]">no data yet</p>
              )}
        </div>

        <div className="card">
          <h3 className="mb-3.5 text-[15px]">top tasks this week</h3>
          {loadingWeekly ? (
            <p className="text-[#888] text-[13px]">loading...</p>
          ) : weekly?.topTasks?.length > 0 ? (
              weekly.topTasks.map((t, i) => (
                <div key={t.taskId} className={`flex justify-between py-2 ${i < weekly.topTasks.length - 1 ? 'border-b border-[#f1f5f9]' : 'border-none'}`}>
                  <span className="text-[13px]">{t.title}</span>
                  <span className="text-[13px] text-indigo-500 font-semibold">{fmtSecs(t.total)}</span>
                </div>
              ))
            ) : (
                <p className="text-[#888] text-[13px]">no activity this week</p>
              )}
        </div>
      </div>

      {daily?.tasks?.length > 0 && (
        <div className="card mt-4">
          <h3 className="mb-3 text-[15px]">today's worked tasks</h3>
          {daily.tasks.map(t => (
            <div key={t.id} className="flex justify-between items-center py-[7px] border-b border-[#f1f5f9]">
              <div>
                <span className="text-[13px] font-medium">{t.title}</span>
                <span className={`badge badge-${t.status} ml-2`}>{t.status.replace('_', ' ')}</span>
              </div>
              <span className="text-[13px] text-indigo-500">{fmtSecs(t.timeToday)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
