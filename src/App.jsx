import { useEffect, useReducer, useState } from "react";
import { Check, Compass, Plus, Sparkles, Trash2, Trophy, Zap } from "lucide-react";
import { createInitialState, taskReducer, XP_PER_LEVEL, XP_PER_TASK } from "./taskLogic.js";

const filters = [
  { id: "all", label: "All quests" },
  { id: "active", label: "In progress" },
  { id: "completed", label: "Completed" },
];

function makeTaskId() {
  return globalThis.crypto?.randomUUID?.() ?? `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function TaskRow({ task, onComplete, onDelete }) {
  return (
    <li className={`task-row${task.completed ? " is-completed" : ""}`}>
      <button
        className="complete-button"
        type="button"
        aria-label={task.completed ? `${task.title} completed` : `Complete ${task.title}`}
        aria-pressed={task.completed}
        disabled={task.completed}
        onClick={() => onComplete(task.id)}
      >
        {task.completed ? <Check size={16} strokeWidth={2.5} /> : <span aria-hidden="true" />}
      </button>
      <span className="task-name">{task.title}</span>
      <span className={`priority priority-${task.priority}`}>
        <span aria-hidden="true" />
        {task.priority}
      </span>
      <span className="task-xp">{task.completed ? `+${XP_PER_TASK} XP` : `+${XP_PER_TASK}`}</span>
      <button
        className="delete-button"
        type="button"
        aria-label={`Delete ${task.title}`}
        title="Delete quest"
        onClick={() => onDelete(task.id)}
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}

function EmptyState({ filter }) {
  const messages = {
    all: ["Your quest log is empty.", "Add a quest above to get started."],
    active: ["Nothing left in progress.", "Enjoy the clear space, or add a new quest."],
    completed: ["No quests cleared yet.", "Your first small win is waiting."],
  };
  const [heading, detail] = messages[filter];
  return (
    <li className="empty-state">
      <span className="empty-mark"><Sparkles size={18} /></span>
      <strong>{heading}</strong>
      <span>{detail}</span>
    </li>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(taskReducer, undefined, createInitialState);
  const [filter, setFilter] = useState("all");
  const [priority, setPriority] = useState("medium");
  const [storageError, setStorageError] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("taskquest-state", JSON.stringify(state));
      if (storageError) setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [state, storageError]);

  const level = Math.floor(state.xp / XP_PER_LEVEL) + 1;
  const xpInLevel = state.xp % XP_PER_LEVEL;
  const completedCount = state.tasks.filter((task) => task.completed).length;
  const activeCount = state.tasks.length - completedCount;
  const visibleTasks = state.tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  function addTask(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    if (!title) return;

    dispatch({
      type: "task/add",
      task: { id: makeTaskId(), title, priority, completed: false },
    });
    form.reset();
    setPriority("medium");
    setFilter("all");
    setAnnouncement(`Quest added: ${title}`);
    form.elements.title.focus();
  }

  function completeTask(id) {
    dispatch({ type: "task/complete", id });
    setAnnouncement(`Quest completed. You earned ${XP_PER_TASK} XP.`);
  }

  function deleteTask(id) {
    const task = state.tasks.find((item) => item.id === id);
    if (!task) return;
    dispatch({ type: "task/delete", id });
    setAnnouncement(`Quest deleted: ${task.title}`);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="TaskQuest home">
          <span className="brand-mark"><Compass size={22} strokeWidth={2.2} /></span>
          <span>Task<span>Quest</span></span>
        </a>
        <div className="topbar-status">
          <span className="status-dot" aria-hidden="true" />
          <span>{storageError ? "LOCAL SAVE UNAVAILABLE" : "YOUR QUEST LOG"}</span>
        </div>
      </header>

      <section className="hero-grid" id="top" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow"><span>01</span> THE DAILY QUEST</p>
          <h1 id="page-title">Make room for <em>momentum.</em></h1>
          <p className="intro-copy">A few small wins can change the shape of a day. Choose your next quest.</p>
        </div>
        <section className="level-panel" aria-label="Level progress">
          <div className="level-topline">
            <span className="level-icon"><Zap size={17} fill="currentColor" /></span>
            <span className="panel-label">CURRENT LEVEL</span>
            <span className="level-number">{String(level).padStart(2, "0")}</span>
          </div>
          <div className="level-title-row">
            <h2>Level {level}</h2>
            <span>{xpInLevel} <span className="muted">/ {XP_PER_LEVEL} XP</span></span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Progress to next level"
            aria-valuemin={0}
            aria-valuemax={XP_PER_LEVEL}
            aria-valuenow={xpInLevel}
          >
            <span className="progress-fill" style={{ width: `${xpInLevel}%` }} />
          </div>
          <div className="level-bottomline">
            <span>{XP_PER_LEVEL - xpInLevel} XP to next level</span>
            <span className="total-xp"><Sparkles size={13} /> {state.xp} total XP</span>
          </div>
        </section>
      </section>

      <section className="stats-strip" aria-label="Quest summary">
        <div className="stat-item">
          <span className="stat-icon stat-icon-mint"><Trophy size={16} /></span>
          <span className="stat-label">QUESTS CLEARED</span>
          <strong>{completedCount}</strong>
        </div>
        <div className="stat-item">
          <span className="stat-icon stat-icon-orange"><Sparkles size={16} /></span>
          <span className="stat-label">IN PROGRESS</span>
          <strong>{activeCount}</strong>
        </div>
        <p className="stat-note">One completed quest <span>·</span> <strong>+{XP_PER_TASK} XP</strong></p>
      </section>

      <section className="quest-section" aria-labelledby="quest-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span>02</span> YOUR NEXT SMALL WIN</p>
            <h2 id="quest-title">Quest board</h2>
          </div>
          <div className="filters" role="group" aria-label="Filter quests">
            {filters.map((item) => (
              <button
                className={`filter-button${filter === item.id ? " is-active" : ""}`}
                type="button"
                key={item.id}
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
                <span>{item.id === "all" ? state.tasks.length : item.id === "active" ? activeCount : completedCount}</span>
              </button>
            ))}
          </div>
        </div>

        <form className="add-form" onSubmit={addTask}>
          <label className="visually-hidden" htmlFor="task-title">Quest title</label>
          <input
            id="task-title"
            name="title"
            type="text"
            maxLength={90}
            placeholder="What would you like to get done?"
            autoComplete="off"
            required
          />
          <label className="visually-hidden" htmlFor="task-priority">Quest priority</label>
          <select id="task-priority" value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
          <button className="add-button" type="submit"><Plus size={17} /> Add quest</button>
        </form>

        {storageError && (
          <p className="storage-warning" role="alert">Progress could not be saved in this browser. Changes may be lost after refresh.</p>
        )}
        <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>

        <ul className="task-list" aria-label="Quest list">
          {visibleTasks.length ? visibleTasks.map((task) => (
            <TaskRow key={task.id} task={task} onComplete={completeTask} onDelete={deleteTask} />
          )) : <EmptyState filter={filter} />}
        </ul>
      </section>

      <footer className="app-footer">
        <span>KEEP IT MOVING.</span>
        <span>YOUR PROGRESS IS SAVED ON THIS DEVICE</span>
      </footer>
    </main>
  );
}
