# ToDo Management Application – Frontend

A frontend web application for managing personal to-do lists, tasks, notes, and projects. It provides an intuitive user interface that allows users to organize their daily activities, track task progress, manage schedules, and maintain productivity.

The frontend communicates with the ToDo Management RESTful Backend API to handle user authentication, data management, and task operations.

## Features

### Authentication
- Register a new account using username, email, and password.
- Log in using email and password.
- Authenticate API requests using JWT access tokens.
- Maintain the authenticated user's session.
- Retrieve and display the currently authenticated user's profile.
- Provide appropriate feedback for authentication errors and validation failures.

### Dashboard
- Display an overview of the user's to-do lists, tasks, and projects.
- Present task progress and completion status.
- Provide quick access to upcoming and ongoing tasks.
- Display relevant information about daily activities.

### To-do List Management
- Create new to-do lists.
- View details of individual to-do lists.
- Update existing to-do lists.
- Delete to-do lists.
- Retrieve all to-do lists belonging to the authenticated user.
- Search, filter, and paginate to-do lists.
- Display the start time and other relevant information for each list.

### Task Management
- Create tasks and associate them with a to-do list.
- View task details.
- Update task information, including name, description, and expected schedule.
- Delete tasks.
- Mark tasks as completed.
- Display task completion status.
- Retrieve tasks belonging to a specific to-do list.
- Filter and paginate task collections.
- Display expected start and end times.

### Note Management
- Create notes associated with individual tasks.
- View existing task notes.
- Update task notes.
- Delete task notes.
- Provide an interface for recording additional information and reminders related to tasks.

### Project Management
- Create new projects.
- View project details.
- Update project information.
- Delete projects.
- Retrieve projects belonging to the authenticated user.
- Filter and paginate project collections.
- Display project descriptions, start times, and expected completion dates.

### User Experience
- Provide a consistent and intuitive navigation structure.
- Display loading indicators while retrieving data.
- Show success and error notifications after API operations.
- Validate user input before submitting requests.
- Handle API errors and expired authentication sessions.
- Provide confirmation dialogs for destructive operations.
- Support paginated data presentation.

## Tech Stack

The frontend is responsible for rendering the user interface, managing client-side state, handling user interactions, and communicating with the backend through HTTP REST APIs.

- **Frontend Framework:** React 19
- **Programming Language:** TypeScript
- **Styling:** Tailwind CSS 4, lucide-react icons
- **HTTP Client:** Axios (JWT interceptor with automatic token refresh)
- **Server State:** TanStack Query (caching, invalidation, pagination)
- **Client State:** React Context (authenticated user)
- **Routing:** React Router 7
- **Forms & Validation:** React Hook Form + Zod (limits mirror the backend DTO constraints)
- **Notifications:** Sonner
- **Build Tool:** Vite 6
- **API Documentation:** OpenAPI 3.1.0

In development, Vite proxies `/api/*` to `VITE_API_BASE_URL`, so the backend does not need CORS configuration. A production build calls `VITE_API_BASE_URL` directly, which requires CORS on the backend.

## Getting Started

### Prerequisites

Before running the frontend application, ensure that the following requirements are satisfied:

- Node.js and npm (or another supported package manager) are installed.
- The frontend source code has been cloned locally.
- A running instance of the ToDo Management Backend API is available.
- An API client such as Postman or Swagger UI is available for testing backend connectivity.

### Installation

Clone the frontend repository:

```bash
git clone <frontend-repository-url>
```

Navigate to the project directory:

```bash
cd <frontend-project-directory>
```

Install the required dependencies:

```bash
npm install
```

### Environment Configuration

Configure the backend API base URL using the frontend environment configuration.

For example, create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080
```

The environment variable name depends on the frontend framework and build tool being used.

Ensure that the backend application is running and accessible at the configured address.

### Running the Application

Start the frontend development server:

```bash
npm run dev
```

The development server will display the local URL in the terminal. Open that URL in your browser to access the application.

For production builds:

```bash
npm run build
```

To preview the production build locally (if supported):

```bash
npm run preview
```

Refer to the project's `package.json` for the available scripts.

## Backend API Integration

The frontend integrates with the ToDo Management Backend through RESTful HTTP endpoints.

### API Base URL

```text
http://localhost:8080
```

### Authentication

The frontend uses JWT bearer authentication to access protected backend endpoints.

The authentication workflow consists of:

1. Submit registration information to `POST /api/auth/register`.
2. Submit login credentials to `POST /api/auth/login`.
3. Receive an access token from the backend.
4. Include the access token in the Authorization header of subsequent protected API requests.
5. Retrieve the authenticated user's profile through `GET /api/auth/me`.

Example HTTP header:

```http
Authorization: Bearer <access_token>
```

The frontend should handle authentication failures and expired tokens appropriately.

### API Modules

The frontend communicates with the following backend modules:

| Module | Responsibilities |
|---|---|
| Authentication | Registration, login, and user profile |
| To-do Lists | Create, retrieve, update, delete, and search to-do lists |
| Tasks | Task management, scheduling, and completion tracking |
| Notes | Create, retrieve, update, and delete task notes |
| Projects | Project management and project queries |

### API Response Handling

The backend uses a consistent response structure:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

For paginated responses:

```json
{
  "success": true,
  "data": {
    "content": [],
    "meta": {
      "page": 0,
      "size": 10,
      "totalElements": 0,
      "totalPages": 0
    }
  },
  "message": "Operation completed successfully"
}
```

The frontend processes these responses to display data, update application state, and provide appropriate feedback to users.

## Application Workflow

A typical user workflow is as follows:

1. Open the application.
2. Register a new account or log in using existing credentials.
3. Access the dashboard to view an overview of personal activities.
4. Create a to-do list to organize a particular set of activities.
5. Add tasks to the newly created to-do list.
6. Set expected start and end times for individual tasks.
7. Attach notes to tasks when additional information is needed.
8. Update task information and mark tasks as completed.
9. Create and manage projects to organize broader goals.
10. Use filtering and pagination to navigate through to-do lists, tasks, and projects.

## Project Structure

```text
src/
├── config/              # env, React Query client, query-key factory
├── types/               # API envelope types and frontend domain models
├── services/            # HTTP layer: one file per backend module
│   ├── http.ts          #   axios instance, JWT + refresh interceptor, envelope unwrapping
│   ├── mappers.ts       #   backend DTO -> frontend model (handles naming differences)
│   └── *Service.ts      #   auth, todo, task, note, project
├── hooks/               # React Query hooks per module (queries + mutations + toasts)
├── contexts/            # AuthContext (session, login, register, logout)
├── schemas/             # Zod validation schemas (mirror backend constraints)
├── routes/              # router, route guards, central URL paths
├── layouts/             # AuthLayout (public), AppLayout (sidebar + top bar)
├── components/
│   ├── ui/              # design-system primitives: Button, Input, Modal, Drawer, ...
│   ├── todo/            # TodoCard, TodoFormModal
│   ├── task/            # TaskRow, TaskPanel, NoteSection, CreateTaskModal, ...
│   └── project/         # ProjectCard, ProjectFormModal, DeadlineBadge
├── pages/               # auth/, dashboard/, todo/, project/, profile/
├── utils/               # dates, errors, filters, class names
└── main.tsx             # providers + router entry
```

**Data flow:** `page -> hook (React Query) -> service -> http (axios) -> backend`.
Components never call axios directly, and backend naming quirks are resolved in `services/mappers.ts`.

**Adding a feature:** add types in `types/models.ts`, a service in `services/`, hooks in `hooks/`,
query keys in `config/queryKeys.ts`, then components and a page, and register the route in `routes/`.

## Error Handling and Validation

The frontend provides client-side validation and error handling to improve the user experience.

Typical validation and error-handling scenarios include:

- Required field validation.
- Email format validation.
- Password length validation.
- Task and to-do list input validation.
- Invalid or missing authentication tokens.
- Unauthorized API requests.
- Resources that cannot be found.
- Network connectivity failures.
- Unexpected backend errors.

Although the frontend performs input validation, the backend remains responsible for enforcing business rules and validating incoming requests.

## Notes and Limitations

- The frontend depends on the availability of the ToDo Management Backend API.
- API endpoint definitions and request/response structures should remain consistent with the backend OpenAPI documentation.
- The backend currently documents project management endpoints but does not explicitly define how tasks are associated with projects.
- Authentication and authorization behavior should follow the backend implementation.
- The frontend's actual technology stack and environment configuration should be updated to reflect the implementation.
- Database operations and business logic are handled by the backend rather than directly by the frontend.

## License

No license information has been specified for this project. Add a `LICENSE` file and update this section if you intend to distribute or publish the application.
