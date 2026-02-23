import { useState, useEffect } from "react";

const CATEGORIES = ["Fix", "Content", "Systems", "Outreach", "Design", "Other"];
const CAT_COLORS = {
  "Fix": "#ef4444",
  "Content": "#f59e0b",
  "Systems": "#3b82f6",
  "Outreach": "#10b981",
  "Design": "#a855f7",
  "Other": "#666"
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [newTask, setNewTask] = useState("");
  const [newCat, setNewCat] = useState("Fix");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("outright-tasks-v2");
        if (result?.value) setTasks(JSON.parse(result.value));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set("outright-tasks-v2", JSON.stringify(tasks)).catch(() => {});
  }, [tasks, loaded]);

  const toggle = (id) => setTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const deleteTask = (id) => setTasks(t => t.filter(x => x.id !== id));
  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(t => [...t, { id: Date.now(), category: newCat, text: newTask.trim(), done: false }]);
    setNewTask("");
  };

  const allCats = ["All", ...CATEGORIES];
  const filtered = filter === "All" ? tasks : tasks.filter(t => t.category === filter);
  const done = tasks.filter(t => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", color: "#e0e0e0", fontFamily: "'DM Mono', monospace", padding: "40px 24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select { background: #111 !important; color: #e0e0e0 !important; border: 1px solid #222 !important; outline: none; font-family: 'DM Mono', monospace; }
        input:focus, select:focus { border-color: #444 !important; }
        .row:hover { background: #131313 !important; }
        .pill { cursor: pointer; transition: all 0.12s; }
        .pill:hover { opacity: 0.75; }
        .del { opacity: 0; transition: opacity 0.12s; cursor: pointer; }
        .row:hover .del { opacity: 1; }
        .addbtn { cursor: pointer; transition: all 0.12s; }
        .addbtn:hover { background: #e0e0e0 !important; color: #0c0c0c !important; }
      `}</style>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Outright Outreach</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#fff" }}>Project Board</h1>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff" }}>{pct}%</span>
          </div>
          <div style={{ marginTop: 12, height: 2, background: "#1c1c1c", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "#10b981", borderRadius: 2, transition: "width 0.3s" }} />
          </div>
          <div style={{ fontSize: 11, color: "#444", marginTop: 6 }}>{done} of {tasks.length} done</div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          {allCats.map(c => (
            <div key={c} className="pill" onClick={() => setFilter(c)} style={{
              padding: "4px 10px", borderRadius: 4, fontSize: 10, letterSpacing: 1, textTransform: "uppercase",
              background: filter === c ? "#e0e0e0" : "#111",
              color: filter === c ? "#0c0c0c" : "#555",
              border: `1px solid ${filter === c ? "#e0e0e0" : "#1e1e1e"}`
            }}>{c}</div>
          ))}
        </div>

        {/* Tasks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 60 }}>
          {filtered.length === 0 && (
            <div style={{ fontSize: 12, color: "#333", padding: "20px 0" }}>No tasks yet. Add one below.</div>
          )}
          {filtered.map(task => (
            <div key={task.id} className="row" style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", borderRadius: 6, background: "#0e0e0e",
              opacity: task.done ? 0.35 : 1
            }}>
              <div onClick={() => toggle(task.id)} style={{
                width: 16, height: 16, borderRadius: 3, flexShrink: 0, cursor: "pointer",
                border: `1.5px solid ${task.done ? CAT_COLORS[task.category] : "#2a2a2a"}`,
                background: task.done ? CAT_COLORS[task.category] : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {task.done && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
              </div>

              <div style={{ width: 5, height: 5, borderRadius: "50%", background: CAT_COLORS[task.category], flexShrink: 0 }} />

              <div style={{ flex: 1, fontSize: 13, textDecoration: task.done ? "line-through" : "none" }}>
                {task.text}
              </div>

              <div style={{ fontSize: 10, color: CAT_COLORS[task.category], opacity: 0.7, letterSpacing: 1 }}>{task.category.toUpperCase()}</div>

              <div className="del" onClick={() => deleteTask(task.id)} style={{ color: "#333", fontSize: 12, padding: "0 2px" }}>✕</div>
            </div>
          ))}
        </div>

        {/* Add task */}
        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={newCat} onChange={e => setNewCat(e.target.value)} style={{
            padding: "10px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer"
          }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}
            placeholder="New task..."
            style={{ flex: 1, minWidth: 180, padding: "10px 14px", borderRadius: 6, fontSize: 13 }}
          />
          <div className="addbtn" onClick={addTask} style={{
            padding: "10px 18px", background: "#111", border: "1px solid #222",
            borderRadius: 6, fontSize: 12, color: "#888", userSelect: "none"
          }}>+ Add</div>
        </div>

      </div>
    </div>
  );
}
