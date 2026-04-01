# Quantity Measurement App — Frontend

A React 18 single-page application that lets authenticated users compare, convert, and perform arithmetic on physical quantities (length, weight, temperature, and volume). It communicates with a Spring Boot REST backend over JWT-secured API calls and supports social sign-in via Google and GitHub OAuth2.

---

## Features

- **Authentication** — email/password registration & login, forgot-password reset, and OAuth2 sign-in (Google & GitHub)
- **Measurement Calculator** — compare, convert, and do arithmetic (add / subtract / divide) across four unit types
  - Length: Feet, Inches, Yards, Centimetres
  - Weight: Kilogram, Gram, Pound
  - Temperature: Celsius, Fahrenheit, Kelvin
  - Volume: Litre, Millilitre, Gallon
- **Calculation History** — filterable table of every past operation, searchable by operation type or measurement category
- **Dashboard** — at-a-glance stats (total conversions, comparisons, arithmetic ops) and quick-action navigation
- **Profile** — view account details and change password in-place
- **Toast notifications** — non-blocking success/error feedback throughout the UI
- **Protected routes** — unauthenticated users are redirected to `/login` automatically

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI library | React 18 with hooks |
| Routing | React Router v6 |
| State management | Context API (`AuthContext`, `ToastContext`) |
| HTTP client | Native `fetch` (wrapped in `src/api/client.js`) |
| Auth tokens | JWT stored in `localStorage` |
| Social sign-in | OAuth2 (Google, GitHub) via Spring Security backend |
| Styling | Plain CSS (consolidated in `index.css`) |
| Build tooling | Create React App (`react-scripts` 5) |

---

## Project Structure

```
src/
├── api/
│   └── client.js          # All API calls + token helpers
├── context/
│   ├── AuthContext.jsx          # JWT & user-profile state
│   └── ToastContext.jsx         # Toast notification system
├── components/
│   ├── Navbar.jsx               # Sticky top navbar with active-link highlighting
│   ├── ProtectedRoute.jsx       # Auth guard — redirects to /login when unauthenticated
│   ├── AuthBrand.jsx            # Left branding panel shared across auth pages
│   └── PasswordInput.jsx        # Reusable password field with show/hide toggle
├── pages/
│   ├── LoginPage.jsx            # Email/password login + Google & GitHub OAuth2 buttons
│   ├── RegisterPage.jsx         # New account registration
│   ├── ForgotPasswordPage.jsx   # Password reset (no current password required)
│   ├── OAuth2CallbackPage.jsx   # Handles the OAuth2 redirect and stores the JWT
│   ├── DashboardPage.jsx        # Stats overview and quick-action cards
│   ├── MeasurePage.jsx          # Interactive measurement calculator
│   ├── HistoryPage.jsx          # Filterable calculation-history table
│   └── ProfilePage.jsx          # User profile and password-change form
├── App.jsx                      # Route definitions
├── index.js                     # Application entry point
└── index.css                    # All styles (consolidated)
```

---

## Routes

| Path | Page | Protected |
|---|---|---|
| `/login` | Login | No |
| `/register` | Register | No |
| `/forgot-password` | Forgot Password | No |
| `/oauth2/callback` | OAuth2 Callback | No |
| `/dashboard` | Dashboard | Yes |
| `/measure` | Measurement Calculator | Yes |
| `/history` | Calculation History | Yes |
| `/profile` | User Profile | Yes |

Any unmatched path redirects to `/dashboard` (which further redirects to `/login` if the user is not authenticated).

---

## Environment Variables

Create a `.env` file in the project root to override the default backend URL:

```env
# Defaults to http://localhost:8080 when not set
REACT_APP_API_URL=https://your-backend.example.com
```

The variable is read in `src/api/client.js` and applied to every API call as well as the OAuth2 redirect buttons on the login page.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 16 and **npm** ≥ 8
- The [Quantity Measurement App backend](https://github.com/Abhishek-Puri-Goswami/QuantityMeasurementApp) running and accessible (default: `http://localhost:8080`)

### Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. (Optional) configure the backend URL
echo "REACT_APP_API_URL=http://localhost:8080" > .env

# 3. Start the development server
npm start
```

The app will be available at **http://localhost:3000**.

### Production Build

```bash
npm run build
```

The optimised static files are output to the `build/` directory and can be served by any static-file server or CDN.

---

## Password Requirements

When registering or changing a password the backend enforces:

- Minimum **8 characters**
- At least **1 uppercase** letter
- At least **1 number**
- At least **1 special character** (`@`, `#`, `$`, `%`, `^`, `&`, `*`, etc.)

---

## License

This project is licensed under the terms of the [LICENSE](LICENSE) file included in the repository.