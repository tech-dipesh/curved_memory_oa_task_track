import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import api from "../api/axios";

ChartJS.register(ArcElement, Tooltip, Legend);

const fmtSecs = (secs) => {
  if (!secs) return "0m";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export default function Summary() {
  const [daily, setDaily] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dailyRes, logsRes] = await Promise.all([
          api.get("/summary/daily"),
          api.get("/timelogs"),
        ]);
        setDaily(dailyRes.data);
        setLogs(logsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const donutData = daily
    ? {
        labels: ["completed", "in progress", "pending"],
        datasets: [
          {
            data: [daily.completed, daily.inProgress, daily.pending],
            backgroundColor: ["#22c55e", "#6366f1", "#e5e7eb"],
            borderWidth: 0,
          },
        ],
      }
    : null;

  if (loading) return <p style={{ color: "#888" }}>loading...</p>;

  return (
    <div>
      <h2 className="mb-5 text-[20px]">daily summary</h2>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="card">
          <h3 className="mb-3.5 text-[15px]">task status breakdown</h3>
          {daily && daily.completed + daily.inProgress + daily.pending > 0 ? (
            <div className="max-w-55 mx-auto">
              <Doughnut
                data={donutData}
                options={{ plugins: { legend: { position: "bottom" } } }}
              />
            </div>
          ) : (
            <p className="text-[#aaa] text-[13px]">no tasks yet</p>
          )}
        </div>

        <div className="card">
          <h3 className="mb-3.5 text-[15px]">today at a glance</h3>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between">
              <span className="text-[13px] text-[#666]">
                total time tracked
              </span>
              <span className="text-[13px] font-semibold text-indigo-500">
                {fmtSecs(daily?.totalTimeTracked)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-[#666]">tasks worked on</span>
              <span className="text-[13px] font-semibold">
                {daily?.workedOn}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-[#666]">completed</span>
              <span className="text-[13px] font-semibold text-emerald-500">
                {daily?.completed}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-[#666]">still in progress</span>
              <span className="text-[13px] font-semibold text-amber-500">
                {daily?.inProgress}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-[#666]">pending</span>
              <span className="text-[13px] font-semibold text-slate-400">
                {daily?.pending}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-3.5 text-[15px]">all time logs</h3>
        {logs.length === 0 ? (
          <p className="text-[#aaa] text-[13px]">
            no logs yet, start a timer on any task
          </p>
        ) : (
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-1.5 color-[#888] font-medium">task</th>
                <th className="py-1.5 color-[#888] font-medium">start</th>
                <th className="py-1.5 color-[#888] font-medium">duration</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-[#f1f5f9]">
                  <td className="py-1.75">{log.task?.title || "-"}</td>
                  <td className="py-1.75 text-[#666]">
                    {new Date(log.startTime).toLocaleString()}
                  </td>
                  <td
                    className={`py-1.75 ${log.duration ? "text-indigo-500 font-semibold" : "text-gray-200 font-normal"}`}
                  >
                    {log.duration ? fmtSecs(log.duration) : "running..."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
