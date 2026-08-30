# UurunovApp — User Management

A full-stack user management web application built for Itransition's internship Task #4: registration, email confirmation, authentication, and an admin-style user management table with bulk actions (block, unblock, delete, delete unverified, and search).

**Live app:** [uurunov.somee.com](http://uurunov.somee.com)

## Tech Stack

- **Backend:** ASP.NET Core 10, ASP.NET Core Identity, Entity Framework Core
- **Frontend:** Angular 22, Optimus UI, Tailwind CSS
- **Database:** Microsoft SQL Server (Somee-hosted MS SQL Express)
- **Email:** Brevo (transactional email via HTTP API)
- **Hosting:** Somee.com shared hosting (Windows Server 2022, IIS 10, win-x86, self-contained deployment)

## Architecture

The Angular frontend is built to static files and served directly from the ASP.NET Core app's `wwwroot` folder — both apps share a single origin, a single deployment, and a single process. This was a deliberate choice for this project:

- **No CORS configuration needed**, since the API and the SPA are served from the same origin.
- **Cookie-based ASP.NET Core Identity authentication** instead of JWT. Same-origin hosting makes CSRF protection straightforward via `SameSite` cookies, and cookie auth allows a per-request check of the user's live status (see below) without needing to decode or refresh a token.
- A single ASP.NET Core project serves both the API controllers and the Angular SPA's static assets, with `MapFallbackToFile("index.html")` handling client-side routing.

### Server-side status enforcement

Every authenticated API request (except `/api/Auth/login` and `/api/Auth/register`) passes through a global `ActiveUserFilter` that:

1. Confirms the request is authenticated.
2. Re-fetches the user's _current_ status from the database (not from cached cookie claims).
3. Returns `401` and signs the user out server-side if the account is blocked or no longer exists.

This means a user who is blocked or deleted by another admin mid-session is rejected on their very next request, not just their next login. On the frontend, a global HTTP interceptor (`auth-error-interceptor.ts`) catches any `401` response app-wide and redirects to `/login`, so no individual API call needs its own auth-failure handling.

### Data integrity

- `NormalizedEmail` has a **unique index** at the database level, guaranteeing email uniqueness regardless of how many sources might write to the table concurrently — this is enforced independently of any application-level uniqueness checks.
- Deletions are real `DELETE` operations (via `ExecuteDeleteAsync`), not soft-deletes — deleted users are genuinely removed and can freely re-register with the same email.

## Features

- **Registration & login** — any non-empty password is accepted; users can log in and use the app fully even before confirming their email.
- **Async email confirmation** — a confirmation link is emailed via Brevo without blocking the registration response; clicking it moves a user from `Unverified` to `Active` (a `Blocked` user stays `Blocked` even if they click an old link).
- **User management table** — sortable by last login time, with debounced live search by email, Optimus UI `p-table` with checkbox multi-select (header checkbox selects/deselects all).
- **Toolbar actions:**
  - **Block** — sets selected users' status to `Blocked`.
  - **Unblock** — restores selected `Blocked` users to `Active` (or back to `Unverified` if their email was never confirmed).
  - **Delete** — permanently deletes selected users.
  - **Delete unverified** — a global action that removes _every_ currently-unverified user, independent of the current selection.
  - **Search** - searches users via email
- Users can block or delete themselves or any other user, including their own account — doing so immediately invalidates their session.
- Toast notifications surface success/failure messages for every action.

## Local Development

**Prerequisites:** .NET 10 SDK, Node.js, Angular CLI 22.

```bash
# Backend
dotnet restore
dotnet run

# Frontend (separate terminal)
cd ClientApp
npm install
ng serve
```

The Angular dev server proxies API requests to the backend during local development (`proxy.conf.json`). In production, the Angular build output is copied into `wwwroot` and served by the same ASP.NET Core process — see Deployment below.

### Required environment variables

| Variable                               | Purpose                                              |
| -------------------------------------- | ---------------------------------------------------- |
| `ConnectionStrings__DefaultConnection` | SQL Server connection string                         |
| `Email__BrevoApiKey`                   | Brevo transactional email API key                    |
| `Email__FromAddress`                   | Sender address for confirmation emails               |
| `App__BaseUrl`                         | Backend base URL                                     |
| `App__FrontendBaseUrl`                 | Frontend base URL (used to build confirmation links) |

For local development, set these in `Properties/launchSettings.json`.

## Deployment (Somee shared hosting)

```bash
dotnet publish -r win-x86 --self-contained true
./inject-webconfig-env.sh
```

`dotnet publish` regenerates `web.config` from scratch every time, with no custom environment variables.

## API Reference

| Method | Route                         | Description                                                    |
| ------ | ----------------------------- | -------------------------------------------------------------- |
| POST   | `/api/Auth/register`          | Register a new user                                            |
| POST   | `/api/Auth/login`             | Log in                                                         |
| POST   | `/api/Auth/logout`            | Log out                                                        |
| POST   | `/api/Auth/confirm-email`     | Confirm email via token                                        |
| GET    | `/api/Auth/me`                | Get current authenticated user                                 |
| GET    | `/api/User/users?search=`     | List users, sorted by last login, optionally filtered by email |
| POST   | `/api/User/block`             | Block selected users (body: `{ userIds: string[] }`)           |
| POST   | `/api/User/unblock`           | Unblock selected users (body: `{ userIds: string[] }`)         |
| POST   | `/api/User/delete`            | Delete selected users (body: `{ userIds: string[] }`)          |
| POST   | `/api/User/delete-unverified` | Delete all unverified users (no body)                          |

All routes except `register`, `login`, and `confirm-email` require authentication and an active (non-blocked) account.
