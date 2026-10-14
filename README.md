# TaskQuest

TaskQuest is a small-steps quest board built with React 19 and Vite 8. Add tasks, set their priority, and earn XP as you complete them.

## Features

- Add quests with high, medium, or low priority.
- Complete quests for 10 XP each. Every 100 XP advances your level.
- Filter the quest board by all, in-progress, or completed quests.
- Save tasks and XP in browser `localStorage`, so progress remains after a refresh.
- Start with sample quests on a fresh browser profile.

Completed quests cannot be reopened. Deleting a quest removes it from the list, but does not remove XP already earned.

## Project structure

```text
TaskQuest/
|-- index.html
|-- package.json
|-- vite.config.js
|-- src/
|   |-- App.jsx               # React interface and event handlers
|   |-- main.jsx              # React entry point
|   |-- styles.css            # Responsive app styles
|   |-- taskLogic.js          # Initial state and task reducer
|   `-- taskLogic.test.js     # Task state tests
```

## Run locally

Requires Node.js 20.19 or newer. From the project directory, install dependencies and start the Vite development server:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Tests and production build

```sh
npm test
npm run build
```

The production files are written to `dist/`.

## Saved data

TaskQuest stores its task list and XP in this browser under the `taskquest-state` localStorage key. Data is local to the browser profile; it is not synced to an account or server. Clearing this browser's site data removes the saved progress.
