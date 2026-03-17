# Baymak Frontend

React-based web interface developed for Baymak service management.
The application includes core modules for login/register, dashboard, and service operations.

## Features

- JWT-based authentication and protected route access
- Pages for appointments, devices, technicians, users, and service reports
- Profile management
- Automatic `Authorization` header handling with Axios interceptors
- Centralized API error handling flow for auth/permission issues

## Tech Stack

- React 19
- React Router DOM 7
- Axios
- Vite
- ESLint

## Requirements

- Node.js 18+
- npm 9+
- A running backend service (`http://localhost:8080`)

## Installation

```bash
npm install
```

## Scripts

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## Route Structure

### Public

- `/login`
- `/register`
- `/forgot-password`

### Protected (`/dashboard`)

- `/dashboard`
- `/dashboard/appointments`
- `/dashboard/devices`
- `/dashboard/users`
- `/dashboard/technicians`
- `/dashboard/profile`
- `/dashboard/reports`

## API and Authentication

- API client is defined in `src/api/axiosClient.js`.
- Default `baseURL`: `http://localhost:8080`
- Token is read from `localStorage` with the `token` key and added as `Bearer` to all requests.
- `401` responses are handled through interceptor-based redirect/processing rules.

## Project Structure

```text
src/
  api/
    axiosClient.js
  components/
    Layout.jsx
    ProtectedRoute.jsx
  pages/
    LoginPage.jsx
    RegisterPage.jsx
    ForgotPasswordPage.jsx
    DashboardPage.jsx
    AppointmentsPage.jsx
    DevicesPage.jsx
    UsersPage.jsx
    TechniciansPage.jsx
    ProfilePage.jsx
    ServiceReportsPage.jsx
  App.jsx
  main.jsx
```
