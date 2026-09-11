# DevPro — AI-Powered Project & Task Management Platform

Built for the Innovation Hacks Full Stack Development Internship.

## Tech Stack

**Frontend:** React, Redux Toolkit, React Router, Tailwind CSS, Framer Motion, Recharts
**Backend:** Node.js, Express 5, MongoDB (Mongoose), Redis, BullMQ, ImageKit, Passport (Google OAuth), JWT
**AI:** Google Gemini API (project descriptions, task suggestions, task summaries, priority suggestions)

## Features

- Auth: register/login/logout, Google OAuth, JWT cookie sessions, role-based authorization
- Projects: full CRUD, member management, icon upload, Redis-cached reads
- Tasks: full CRUD, drag-and-drop Kanban board, filters (status/priority/assignee), file attachments
- SubTasks: full CRUD under a task
- Comments: per-task discussion thread, triggers notifications
- Notifications: created asynchronously via a BullMQ background worker (task assigned, status changed, comment added), bell icon with unread count
- AI features: generate project description, generate task suggestions from a goal, summarize a task, suggest a task's priority
- Landing page + About page with scroll animations
- Fully responsive dashboard (sidebar + topbar layout)

## Folder Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── config/        # database, redis, imagekit, bullmq connection
│   │   ├── controllers/    # request handlers
│   │   ├── middlewares/    # auth, upload, error handling
│   │   ├── models/         # mongoose schemas
│   │   ├── routes/         # express routers
│   │   ├── services/       # imagekit upload, notification queue, ai, google oauth
│   │   ├── utils/          # ApiError, cache helper, token helpers
│   │   ├── workers/        # BullMQ notification worker (separate process)
│   │   └── app.js
│   └── server.js
└── frontend/
    └── src/
        ├── api/            # axios instance
        ├── app/             # redux store
        ├── components/      # layout, ui, project, task components
        ├── features/        # redux slices (auth, project, task, notification)
        ├── pages/            # route-level pages
        └── routes/           # ProtectedRoute
```

## Running Locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your real values
npm run dev             # starts the API server
npm run worker          # in a second terminal — starts the notification worker
```

Backend needs:
- A MongoDB connection string (MongoDB Atlas free tier works fine)
- A Redis instance (local `redis-server`, or a free Redis Cloud instance)
- An ImageKit account (free tier) for image uploads
- A Google Cloud OAuth Client ID/Secret if you want Google login
- A Gemini API key (free at aistudio.google.com) for the AI features

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env    # points to your backend URL
npm run dev
```

Open http://localhost:5173

## Notes

- This was built and syntax/build-verified in a sandboxed environment (backend boot-tested against a local Redis instance; frontend build-verified with `vite build`, zero errors). It has **not** been tested against real MongoDB, ImageKit, Google OAuth or Gemini credentials — plug in real keys and test end-to-end before relying on it for submission.
- Never commit your real `.env` file — only `.env.example` is included.
