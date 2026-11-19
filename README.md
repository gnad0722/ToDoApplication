# ToDo Application – Frontend

> **Version 1 – first release.**
> This is the first version of the project. It covers the core features for managing to-do lists, tasks, notes and projects. More features and improvements will come in future versions (see [Roadmap](#roadmap)).

A web application for organizing daily work. You can group tasks into to-do lists, schedule them, attach notes, mark them as done, and keep track of larger goals with projects.

This repository contains the **frontend** only. It talks to the ToDo Management backend through a REST API.

---

## Table of Contents

- [Features in Version 1](#features-in-version-1)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Pages and Routes](#pages-and-routes)
- [Backend API Integration](#backend-api-integration)
- [Project Structure](#project-structure)
- [Validation and Error Handling](#validation-and-error-handling)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features in Version 1

### Authentication
- Sign up with username, email and password.
- Log in with email and password.
- JWT authentication. The access token refreshes automatically, and you are logged out when the session can no longer be renewed.
- Reset a forgotten password in three steps: enter your email, verify the OTP code sent by email, then set a new password.
- Log out (the refresh token is revoked on the backend).

### Dashboard
- Overview stats: number of to-do lists, total tasks, completed tasks and completion rate.
- Upcoming tasks.
- Recently updated to-do lists.
- Project overview.

### To-do Lists
- Create, view, edit and delete to-do lists.
- Search, filter, sort and paginate your lists.
- See each list's start time and task progress.

### Tasks
- Create tasks inside a to-do list, with a name, description and expected start/end times.
- View and edit task details in a side panel.
- Mark tasks as done.
- Delete tasks.
- Filter (for example, done or not done) and paginate the tasks of a list.

### Notes
- Add one note to each task for extra details or reminders.
- View, edit and delete the note.

### Projects
- Create, view, edit and delete projects.
- Set a description, start time and expected end date, with a deadline badge.
- Filter and paginate projects.

### Profile
- View your account information (username, email, member since).
- Change your password or log out.

### User Experience
- Responsive layout with a sidebar and a top bar.
- Loading skeletons, empty states and error states with a retry button.
- Toast messages after each create, update or delete.
- Form validation before a request is sent, plus field errors returned by the backend.
- A confirmation dialog before anything is deleted.

---

## Tech Stack

| Area | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 4, lucide-react icons |
| Routing | React Router 7 |
| Server state | TanStack Query 5 (caching, invalidation, pagination) |
| Client state | React Context (authenticated user) |
| HTTP client | Axios (JWT interceptor with automatic token refresh) |
| Forms & validation | React Hook Form + Zod |
| Dates | date-fns |
| Notifications | Sonner |

---

## Getting Started

### Prerequisites

- **Node.js** 18 or later, and **npm**.
- A running instance of the **ToDo Management backend API** (default: `http://localhost:8080`).

### 1. Clone the repository

```bash
git clone https://github.com/gnad0722/ToDoApplication.git
cd ToDoApplication
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the environment

Copy the example environment file and adjust the backend URL if needed:

```bash
cp .env.example .env
```

```env
# Base URL of the ToDo Management backend API
VITE_API_BASE_URL=http://localhost:8080
```

### 4. Start the development server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

> **How the dev server reaches the backend:** during development, Vite forwards every `/api/*` request to `VITE_API_BASE_URL`, so the backend does not need CORS configuration. A production build calls `VITE_API_BASE_URL` directly, so the backend **must enable CORS** for the frontend's origin.

### 5. Build for production

```bash
npm run build     # type-check and build into dist/
npm run preview   # serve the production build locally
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server on port 5173 |
| `npm run build` | Type-check with `tsc` and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run the TypeScript compiler without building |

---

## Pages and Routes

| Route | Page | Access |
|---|---|---|
| `/login` | Log in | Public |
| `/register` | Sign up | Public |
| `/forgot-password` | Reset password (email → OTP → new password) | Public |
| `/dashboard` | Dashboard overview | Logged in |
| `/lists` | All to-do lists | Logged in |
| `/lists/:id` | To-do list details and its tasks (`?task=<id>` opens a task) | Logged in |
| `/projects` | All projects | Logged in |
| `/projects/:id` | Project details | Logged in |
| `/profile` | User profile | Logged in |

Route guards send logged-out users to the login page, and send logged-in users away from the public auth pages.

---

## Backend API Integration

### Endpoints used

| Module | Endpoints |
|---|---|
| **Auth** | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/forgot-password`, `POST /api/auth/verify-otp`, `POST /api/auth/reset-password` |
| **To-do lists** | `GET /api/todo/me`, `GET /api/todo/{id}`, `POST /api/todo/`, `PATCH /api/todo/{id}`, `DELETE /api/todo/{id}` |
| **Tasks** | `GET /api/task/todo/{todoId}`, `GET /api/task/{id}`, `POST /api/task`, `PATCH /api/task/{id}`, `PATCH /api/task/done/{id}`, `DELETE /api/task/{id}` |
| **Notes** | `GET /api/note/{taskId}`, `POST /api/note/`, `PUT /api/note/{taskId}`, `DELETE /api/note/{taskId}` |
| **Projects** | `GET /api/project/me`, `GET /api/project/{id}`, `POST /api/project/`, `PATCH /api/project/{id}`, `DELETE /api/project/{id}` |

### Authentication flow

1. Logging in returns an **access token** and a **refresh token**.
2. Every protected request sends `Authorization: Bearer <access_token>`.
3. If a request returns `401`, the client calls `/api/auth/refresh` **once**. Concurrent requests share that single refresh call. The original request is then retried with the new token.
4. If the refresh fails, the session ends and you are sent back to the login page.

### Response format

Every backend response uses the same envelope:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

Paginated responses wrap a list of items with metadata:

```json
{
  "success": true,
  "data": {
    "content": [],
    "meta": { "page": 0, "size": 10, "totalElements": 0, "totalPages": 0 }
  },
  "message": "Operation completed successfully"
}
```

The error format the frontend expects is documented in [docs/error-response-format.md](docs/error-response-format.md).

### Filtering, sorting and pagination

List endpoints accept `page`, `size`, `sort` and a filter parameter with the syntax `field:OPERATOR:value`, for example:

```text
GET /api/task/todo/1?page=0&size=10&sort=expectStart,asc&filters=isDone:EQ:false
```

Supported operators: `EQ`, `NOT_EQ`, `CONTAINS`, `STARTS_WITH`, `ENDS_WITH`, `GT`, `GTE`, `LT`, `LTE`, `IS_NULL`, `IS_NOT_NULL`. The query builders are in [src/utils/filters.ts](src/utils/filters.ts).

---

## Project Structure

```text
src/
├── config/              # env, React Query client, query-key factory, page sizes
├── types/               # API envelope types and frontend domain models
├── services/            # HTTP layer, one file per backend module
│   ├── http.ts          #   axios instance, JWT + refresh interceptor, envelope unwrapping
│   ├── mappers.ts       #   backend DTO -> frontend model (handles naming differences)
│   ├── tokenStorage.ts  #   access / refresh token persistence
│   └── *Service.ts      #   auth, todo, task, note, project
├── hooks/               # React Query hooks per module (queries + mutations + toasts)
├── contexts/            # AuthContext (session, login, register, logout)
├── schemas/             # Zod validation schemas (mirror backend constraints)
├── routes/              # router, route guards, central URL paths
├── layouts/             # AuthLayout (public), AppLayout (sidebar + top bar)
├── components/
│   ├── ui/              # shared primitives: Button, Input, Modal, Drawer, ...
│   ├── todo/            # TodoCard, TodoFormModal
│   ├── task/            # TaskRow, TaskPanel, NoteSection, CreateTaskModal, ...
│   └── project/         # ProjectCard, ProjectFormModal, DeadlineBadge
├── pages/               # auth/, dashboard/, todo/, project/, profile/, NotFoundPage
├── utils/               # dates, errors, filters, form errors, class names
├── styles/              # global Tailwind stylesheet
└── main.tsx             # providers + router entry point
```

**Data flow:** `page → hook (React Query) → service → http (axios) → backend`

- Components never call axios directly.
- Differences between backend and frontend field names are handled in one place: `services/mappers.ts`.

**Adding a new feature:**
1. Add the types in `types/models.ts`.
2. Add a service in `services/`.
3. Add the query keys in `config/queryKeys.ts`.
4. Add the hooks in `hooks/`.
5. Build the components and the page.
6. Register the route in `routes/`.

---

## Validation and Error Handling

**Client-side validation** (Zod), with limits that match the backend:

| Field | Rule |
|---|---|
| Username | at least 4 characters |
| Password | 6–72 characters |
| To-do list topic | at least 10 characters |
| Task name | at least 5 characters |
| Note | at least 10 characters |
| Project topic | at least 5 characters |
| Project description | at least 20 characters |
| Start / end times | the end time must be after the start time |

**Server errors** are handled as follows:
- Field-level validation errors from the backend appear under the matching form field.
- Other errors (not found, forbidden, server errors, network failures) are shown as a toast message or as an error state with a retry button.
- An expired session triggers a token refresh, or a logout if the refresh fails.

The backend still enforces all business rules. Frontend validation only gives faster feedback.

---

## Known Limitations

Version 1 has these limitations:

- The app needs the ToDo Management backend to work. It has no offline mode or mock data.
- Tasks cannot be linked to projects yet, because the backend does not define that relationship.
- Each task can have only one note.
- There are no automated tests yet.
- The interface is available in English only, with a light theme only.

---

## Roadmap

This is the **first version** of the application. The project is still being developed, and future versions will add new features and improvements. Ideas being considered include:

- [ ] Linking tasks to projects, with progress tracked at the project level
- [ ] Reminders and deadline notifications
- [ ] Drag-and-drop to reorder tasks
- [ ] Task priority, labels and tags
- [ ] Dark mode
- [ ] Profile editing (username, avatar)
- [ ] Unit and end-to-end tests
- [ ] Multi-language support
- [ ] Deployment guide and CI/CD pipeline

The list may change as the project grows. Suggestions and feedback are welcome.

---

## License

No license has been chosen for this project yet. Add a `LICENSE` file and update this section before distributing or publishing the application.
