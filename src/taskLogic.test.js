import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState, sampleTasks, taskReducer, XP_PER_TASK } from "./taskLogic.js";

const task = { id: "test-1", title: "Write tests", priority: "high", completed: false };

test("first visit starts with sample quests and fresh task objects", () => {
  const state = createInitialState({ getItem: () => null });
  assert.deepEqual(state.tasks, sampleTasks);
  assert.notEqual(state.tasks[0], sampleTasks[0]);
  assert.equal(state.xp, 0);
});

test("saved tasks and XP load from storage", () => {
  const stored = JSON.stringify({ tasks: [{ ...task, completed: true }], xp: 40 });
  assert.deepEqual(createInitialState({ getItem: () => stored }), {
    tasks: [{ ...task, completed: true }],
    xp: 40,
  });
});

test("completing a task awards XP only once", () => {
  const initial = { tasks: [task], xp: 0 };
  const completed = taskReducer(initial, { type: "task/complete", id: task.id });
  assert.equal(completed.xp, XP_PER_TASK);
  assert.equal(completed.tasks[0].completed, true);
  assert.equal(taskReducer(completed, { type: "task/complete", id: task.id }), completed);
});

test("deleting a completed task keeps earned XP", () => {
  const state = { tasks: [{ ...task, completed: true }], xp: XP_PER_TASK };
  assert.deepEqual(taskReducer(state, { type: "task/delete", id: task.id }), { tasks: [], xp: XP_PER_TASK });
});

test("invalid stored data falls back to sample quests", () => {
  const state = createInitialState({ getItem: () => "not valid JSON" });
  assert.deepEqual(state.tasks, sampleTasks);
  assert.equal(state.xp, 0);
});
