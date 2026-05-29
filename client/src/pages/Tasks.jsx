import { useEffect, useState } from "react";
import { useTasks } from "../context/TaskContext";
import TaskCard from "../components/TaskCard";

export default function Tasks() {
  const { tasks, loading, fetchTasks, createTask } = useTasks();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [filter, setFilter] = useState("all");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      await createTask({
        title: title.trim(),
        description: desc.trim() || undefined,
      });
      setTitle("");
      setDesc("");
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || "failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const filtered = tasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[20px]">tasks</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "cancel" : "+ new task"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-5">
          <form onSubmit={handleCreate}>
            <div className="mb-2.5">
              <input
                placeholder="task title e.g. follow up with designer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <textarea
                placeholder="description (optional)"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={2}
                className="resize-y"
              />
            </div>
            <button
              type="submit"
              className="btn-primary btn-sm"
              disabled={creating}
            >
              {creating ? "adding..." : "add task"}
            </button>
          </form>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {["all", "pending", "in_progress", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.25 text-[12px] rounded-md ${filter === f ? "bg-indigo-500 text-white" : "bg-[#e5e7eb] text-[#333]"}`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
        <span className="ml-auto text-[13px] text-[#888] self-center">
          {filtered.length} task{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <p className="text-[#888]">loading tasks...</p>
      ) : filtered.length === 0 ? (
        <p className="text-[#aaa] text-[14px]">no tasks here</p>
      ) : (
        filtered.map((task) => <TaskCard key={task.id} task={task} />)
      )}
    </div>
  );
}
