export const STORAGE_KEY = "taskquest-state";
export const XP_PER_TASK = 10;
export const XP_PER_LEVEL = 100;

export const sampleTasks = [
  { id: "sample-plan", title: "Finish the outline", priority: "high", completed: false },
  { id: "sample-walk", title: "Take a proper lunch break", priority: "low", completed: false },
  { id: "sample-inbox", title: "Clear the inbox backlog", priority: "medium", completed: false },
];

function freshState() {
  return { tasks: sampleTasks.map((task) => ({ ...task })), xp: 0 };
}

export function createInitialState(storage = globalThis.localStorage) {
  try {
    const saved = storage?.getItem(STORAGE_KEY);
    if (saved === null || saved === undefined) return freshState();

    const parsed = JSON.parse(saved);
    if (!parsed || !Array.isArray(parsed.tasks) || !Number.isFinite(parsed.xp) || parsed.xp < 0) {
      return freshState();
    }

    const tasks = parsed.tasks.filter((task) =>
      task && typeof task.id === "string" && typeof task.title === "string" &&
      ["low", "medium", "high"].includes(task.priority) && typeof task.completed === "boolean"
    );
    return { tasks, xp: Math.floor(parsed.xp) };
  } catch {
    return freshState();
  }
}

export function taskReducer(state, action) {
  switch (action.type) {
    case "task/add":
      return { ...state, tasks: [action.task, ...state.tasks] };
    case "task/complete": {
      const task = state.tasks.find((item) => item.id === action.id);
      if (!task || task.completed) return state;

      return {
        tasks: state.tasks.map((item) => item.id === action.id ? { ...item, completed: true } : item),
        xp: state.xp + XP_PER_TASK,
      };
    }
    case "task/delete": {
      const tasks = state.tasks.filter((item) => item.id !== action.id);
      return tasks.length === state.tasks.length ? state : { ...state, tasks };
    }
    default:
      return state;
  }
}
