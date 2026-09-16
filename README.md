# DevPro — AI-Powered Project & Task Management Platform

A full-stack, production-style project and task management platform built as the capstone project for the **Innovation Hacks Full Stack Development Internship**. It combines a React frontend, a Node.js/Express REST API, MongoDB, Redis caching, BullMQ background jobs, and multiple AI-powered features into one connected application.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Guide](#setup-guide)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone & Install](#2-clone--install)
  - [3. Getting Every Credential](#3-getting-every-credential)
  - [4. Backend Environment Variables](#4-backend-environment-variables)
  - [5. Frontend Environment Variables](#5-frontend-environment-variables)
  - [6. Running the App](#6-running-the-app)
- [API Reference](#api-reference)
- [Deployment Notes](#deployment-notes)

---

## Tech Stack

**Frontend** — React 19, Redux Toolkit, React Router, Tailwind CSS v4, Framer Motion, Recharts, D3.js, Axios, React Hot Toast

**Backend** — Node.js, Express 5, MongoDB + Mongoose, Redis (ioredis), BullMQ, Passport (Google OAuth 2.0), JWT, Nodemailer, Multer, ImageKit, Helmet, Morgan

**AI** — Google Gemini API

---

## Features

### Authentication
- Email/password registration and login with hashed passwords (bcrypt) and JWT-based sessions (httpOnly cookie)
- Google OAuth 2.0 login ("Continue with Google"), auto-provisions an account on first login
- Protected routes on both frontend (redirect to login) and backend (`identifyUser` middleware on every private route)
- Profile image and cover image upload (stored via ImageKit)
- Editable profile: name, bio, role

### Projects
- Full CRUD — create, list, view, edit, delete
- Custom project icon: pick from a preset emoji set or upload a custom image
- Project status: Active / On Hold / Completed — changeable only by the project lead
- Project description (AI-generated or manual)
- Custom workflow columns per project (not locked to Todo/In Progress/Done — leads can add their own status columns)
- Redis-cached reads (`GET` list/detail) with automatic cache invalidation on writes

### Tasks
- Full CRUD, scoped to a project
- Drag-and-drop Kanban board across the project's custom columns
- Priority levels (low/medium/high/critical), due dates with live countdown badges
- Assignment restricted to the project lead; regular members see a read-only assignee
- File attachments (upload via ImageKit, with add/remove and image preview)
- A task cannot be marked "Done" until all of its subtasks are completed

### Subtasks
- Full CRUD under a task
- Status per subtask (Todo / In Progress / Done) with a live progress bar on the parent task

### Comments
- Threaded comments per task
- Commenting notifies the task's assignee

### Team & Invitations
- Invite teammates to a project by email
- Email invite includes Accept/Reject links; invites can also be accepted/rejected in-app from the Notifications page
- Pending invite list with cancel option (lead only)
- Directory of current project members with role and lead badge

### Notifications
- In-app notification feed: task assigned, status changed, comment added, project invite
- Real notifications are also queued and sent by **email** via a background worker (BullMQ), independent of whether the person has the app open
- Mark as read / mark all as read / delete
- "View" deep-links straight to the relevant task or project

### My Tasks
- "Assigned to Me" — every task assigned to the logged-in user, across all projects
- "Assigned by Me" (leads only) — everything the user has assigned to teammates, grouped by person

### AI Features (Gemini)
- Generate a project description from its name/type
- Generate task suggestions from a plain-language goal
- Summarize a task (title, description, status, comments) into a short brief
- Suggest a task's priority based on its title/description/due date

### Dashboard & Visualization
- Overview stats (total/active/on-hold/completed projects) with real, data-derived sparkline trends
- Project status donut chart with center totals and legend
- **Interactive network graph** (D3.js force simulation) — every project connected to its members, draggable and zoomable, click-through to the project or a member's profile

### Other
- Fully responsive (desktop sidebar nav + mobile bottom nav)
- Dark "Kinetic Obsidian" design system throughout
- Landing page with a custom WebGL/GLSL shader background

---

## Project Structure

```
DevPro/
├── backend/
│   ├── src/
│   │   ├── config/        # database, redis, imagekit, bullmq connection
│   │   ├── controllers/   # request handlers
│   │   ├── middlewares/   # auth, upload, error handling
│   │   ├── models/        # mongoose schemas
│   │   ├── routes/        # express routers
│   │   ├── services/      # imagekit upload, email, notification queue, ai, google oauth
│   │   ├── utils/         # ApiError, cache helper, email templates, token helpers
│   │   ├── workers/       # BullMQ notification worker (separate process)
│   │   └── app.js
│   └── server.js
└── frontend/
    └── src/
        ├── api/           # axios instance
        ├── app/           # redux store
        ├── components/    # layout, ui, project, task components
        ├── features/      # redux slices (auth, project, task, notification)
        ├── pages/         # route-level pages
        └── routes/        # ProtectedRoute
```

---

## Setup Guide

### 1. Prerequisites

Install these before you start:
- [Node.js](https://nodejs.org/) v18 or newer
- [Git](https://git-scm.com/)
- A MongoDB database — either [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (free tier, no local install needed) or a local MongoDB install
- Redis — either a free [Redis Cloud](https://redis.io/try-free/) instance, or run it locally

### 2. Clone & Install

```bash
git clone <your-repo-url>
cd DevPro

cd backend
npm install

cd ../frontend
npm install
```

### 3. Getting Every Credential

You need six sets of credentials. Here's exactly where to get each one.

#### a) MongoDB URI
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register), create a free account and a free (M0) cluster
2. Click **Connect → Drivers**, copy the connection string (looks like `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/`)
3. Replace `<password>` with your database user's actual password
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so your deployed backend can reach it

#### b) Redis (host / port / password)
1. Go to [Redis Cloud](https://redis.io/try-free/) and create a free database
2. On the database details page, copy the **Public endpoint** — it's in the form `host:port`, split it into `REDIS_HOST` and `REDIS_PORT`
3. Copy the **Default user password** for `REDIS_PASSWORD`

#### c) Google OAuth (Client ID & Secret)
1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create a project (or select an existing one)
3. Click **Create Credentials → OAuth client ID** → Application type: **Web application**
4. Under **Authorized JavaScript origins**, add your frontend URL (e.g. `http://localhost:5173` and your deployed Vercel URL)
5. Under **Authorized redirect URIs**, add: `<YOUR_BACKEND_URL>/api/auth/google/callback` (both the local `http://localhost:3000/...` and deployed version)
6. Copy the **Client ID** and **Client Secret**

#### d) ImageKit (image uploads)
1. Sign up at [ImageKit.io](https://imagekit.io/)
2. Go to **Developer Options** in the dashboard
3. Copy the **Public Key**, **Private Key**, and **URL-endpoint**

#### e) Gemini API Key (AI features)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**, copy it

#### f) Email / SMTP (optional — invites and notifications still work in-app without it)
1. If using Gmail: go to your **Google Account → Security → 2-Step Verification → App Passwords**
2. Generate an app password (not your normal Gmail password) — use this as `SMTP_PASS`
3. `SMTP_USER` is your full Gmail address, `SMTP_HOST` is `smtp.gmail.com`, `SMTP_PORT` is `587`

### 4. Backend Environment Variables

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

JWT_SECRET=any_long_random_string
SESSION_SECRET=any_other_long_random_string

REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

GEMINI_API_KEY=your_gemini_api_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

> Note: `GOOGLE_CLIENT_ID`/`SECRET` and the `SMTP_*` values are optional — if left blank, Google login and outbound emails are simply disabled (everything else, including in-app notifications, still works).

### 5. Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

> **Important:** Vite only exposes variables prefixed with `VITE_` to the browser bundle. This exact name is required — anything else silently falls back to `localhost` even in production.

### 6. Running the App

You need **three** terminals running at once (backend server, backend worker, frontend):

```bash
# Terminal 1 — backend API
cd backend
npm run dev

# Terminal 2 — background notification worker
cd backend
npm run worker:dev

# Terminal 3 — frontend
cd frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:3000/api/health`

---

## API Reference

All routes are prefixed with `/api`. Routes marked 🔒 require an authenticated session (cookie sent automatically by the frontend).

### Auth — `/api/auth`
| Method | Route | Description |
|---|---|---|
| POST | `/register` | Create a new account |
| POST | `/login` | Log in with email/password |
| POST | `/logout` 🔒 | Log out |
| GET | `/getMe` 🔒 | Get the logged-in user's profile |
| GET | `/user/:id` 🔒 | Get another user's public profile |
| PUT | `/profile` 🔒 | Update username / bio / role |
| PUT | `/profile-image` 🔒 | Upload profile picture |
| PUT | `/cover-image` 🔒 | Upload cover image |
| GET | `/google` | Start Google OAuth flow |
| GET | `/google/callback` | Google OAuth callback |

### Projects — `/api/projects`
| Method | Route | Description |
|---|---|---|
| POST | `/create-project` 🔒 | Create a project |
| GET | `/all-projects` 🔒 | List projects the user belongs to |
| GET | `/project/:id` 🔒 | Get one project |
| PUT | `/edit/:id` 🔒 | Update a project (lead only) |
| PUT | `/icon/:id` 🔒 | Upload a custom project icon |
| DELETE | `/delete/:id` 🔒 | Delete a project (creator only) |

### Tasks — `/api/tasks`
| Method | Route | Description |
|---|---|---|
| POST | `/project/:projectId/create` 🔒 | Create a task |
| GET | `/project/:projectId/all` 🔒 | List tasks (supports `?status=` & `?priority=` filters) |
| GET | `/my-assigned` 🔒 | Tasks assigned to the current user |
| GET | `/assigned-by-me` 🔒 | Tasks the current user (as lead) has assigned to others |
| GET | `/:id` 🔒 | Get one task |
| PUT | `/edit/:id` 🔒 | Update a task |
| PUT | `/attachment/:id` 🔒 | Upload a file attachment |
| DELETE | `/attachment/:id` 🔒 | Remove an attachment |
| DELETE | `/delete/:id` 🔒 | Delete a task |

### Subtasks — `/api/subtasks`
| Method | Route | Description |
|---|---|---|
| POST | `/task/:taskId/create` 🔒 | Create a subtask |
| GET | `/task/:taskId/all` 🔒 | List subtasks |
| PUT | `/edit/:id` 🔒 | Update a subtask |
| DELETE | `/delete/:id` 🔒 | Delete a subtask |

### Comments — `/api/comments`
| Method | Route | Description |
|---|---|---|
| POST | `/task/:taskId/create` 🔒 | Add a comment |
| GET | `/task/:taskId/all` 🔒 | List comments |
| DELETE | `/delete/:id` 🔒 | Delete a comment |

### Notifications — `/api/notifications`
| Method | Route | Description |
|---|---|---|
| GET | `/all` 🔒 | List notifications |
| PUT | `/read/:id` 🔒 | Mark one as read |
| PUT | `/read-all` 🔒 | Mark all as read |
| DELETE | `/delete/:id` 🔒 | Delete a notification |

### Invitations — `/api/invitations`
| Method | Route | Description |
|---|---|---|
| POST | `/project/:projectId/invite` 🔒 | Invite a teammate by email |
| GET | `/project/:projectId/all` 🔒 | List a project's invites |
| GET | `/respond/:token` | Accept/reject via the email link (no login needed) |
| POST | `/respond-inapp/:invitationId` 🔒 | Accept/reject from the Notifications page |
| DELETE | `/cancel/:id` 🔒 | Cancel a pending invite |

### AI — `/api/ai`
| Method | Route | Description |
|---|---|---|
| POST | `/project-description` 🔒 | Generate a project description |
| POST | `/task-suggestions` 🔒 | Generate task ideas from a goal |
| GET | `/summarize/:taskId` 🔒 | Summarize a task |
| POST | `/suggest-priority` 🔒 | Suggest a priority level |

---

## Deployment Notes

- **Backend** (e.g. Render): set every variable from the backend `.env` list above in the platform's environment settings, and set `BACKEND_URL` to your deployed backend URL.
- **Frontend** (e.g. Vercel): set `VITE_API_BASE_URL` to `<your-backend-url>/api`, then **redeploy** — Vite bakes environment variables in at build time, so just saving the variable isn't enough.
- Update the Google Cloud OAuth client's **Authorized JavaScript origins** and **Authorized redirect URIs** to include your deployed URLs, not just localhost.
- The notification worker (`npm run worker`) needs to run as its own long-lived process in production, separate from the API server — on Render this means a second **Background Worker** service pointed at the same repo.
