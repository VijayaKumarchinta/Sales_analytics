<div align="center">
  <br>
  <div style="display: inline-flex; align-items: center; gap: 12px; padding: 8px 24px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 16px;">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
    </svg>
    <span style="color: white; font-size: 20px; font-weight: 700;">Sales Analytics</span>
  </div>
  <br>

  **A full-stack sales analytics platform with interactive dashboards, real-time KPIs, and intelligent reporting.**

  > **📍 Runs locally** — No live demo deployed. Follow the Quick Start guide below to run the app.

  <p>
    <img src="https://img.shields.io/badge/Vue_3-4FC08D?style=flat&logo=vue.js&logoColor=white" alt="Vue 3"/>
    <img src="https://img.shields.io/badge/Django-092E20?style=flat&logo=django&logoColor=white" alt="Django"/>
    <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase"/>
    <img src="https://img.shields.io/badge/ApexCharts-FF6B35?style=flat&logo=chartdotjs&logoColor=white" alt="ApexCharts"/>
  </p>
</div>

---

## ✨ Features

- **📊 Interactive Dashboard** — Real-time KPI cards (revenue, profit, margin, orders), revenue trends, regional performance, and category breakdowns with animated ApexCharts
- **📈 Sales Analysis** — Monthly trends, quarterly performance, and deep-dive filtering by date range and region
- **💰 Profit Analysis** — Margin analysis, profitability by product/category, and cost breakdowns
- **👥 Customer Insights** — Segment analysis, lifetime value (LTV) tracking, retention rates, and customer lists
- **📦 Product Performance** — Top/bottom performers, profitability margins, category analysis
- **🌍 Regional Insights** — Cross-region comparison and growth market identification
- **📄 Report Exporting** — PDF and CSV export with email scheduling support
- **🔐 Authentication** — Supabase Auth with email/password, Google OAuth, and GitHub OAuth. Role-based access (admin, analyst, viewer).
- **🌙 Dark/Light Theme** — System-aware dark mode with manual toggle, persisted to localStorage
- **📱 Responsive Design** — Fully responsive layout for desktop, tablet, and mobile

## 📸 Screenshots

<div align="center">
  <img src="screenshots/landing.png" alt="Landing Page" width="45%" style="border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); margin: 8px;"/>
  <img src="screenshots/login.png" alt="Login Page" width="45%" style="border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); margin: 8px;"/>
  <p style="color: #64748b; font-size: 0.9rem; margin-top: 8px;">
    <strong>Left:</strong> Landing page with hero section, features, and stats
    • <strong>Right:</strong> Login page with email/password, OAuth buttons, and sign-up toggle
  </p>
</div>

## 🏗️ Tech Stack

**Frontend**
- [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`)
- [Vite](https://vitejs.dev/) (Build tool & dev server)
- [Pinia](https://pinia.vuejs.org/) (State management)
- [Vue Router](https://router.vuejs.org/) (Routing with auth guards)
- [Tailwind CSS](https://tailwindcss.com/) (Utility-first styling)
- [ApexCharts](https://apexcharts.com/) (Interactive charts via `vue3-apexcharts`)
- [Supabase JS](https://supabase.com/docs/reference/javascript) (Auth client SDK)
- [Axios](https://axios-http.com/) (HTTP client with JWT interceptors)
- [VueUse](https://vueuse.org/) (Composition utilities & motion)

**Backend**
- [Django](https://www.djangoproject.com/) 5.2 (Python web framework)
- [Django REST Framework](https://www.django-rest-framework.org/) (REST API)
- [Supabase](https://supabase.com/) (Managed PostgreSQL database + Auth)
- [PostgreSQL](https://www.postgresql.org/) (via Supabase)
- [Pandas](https://pandas.pydata.org/) (CSV data import)
- [WhiteNoise](https://whitenoise.readthedocs.io/) (Static file serving)

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or pnpm
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone & Setup

```bash
git clone https://github.com/VijayaKumarchinta/Sales_analytics.git
cd Sales_analytics
```

### 2. Supabase Setup

Create a free Supabase project at [supabase.com](https://supabase.com), then copy the following values from your project dashboard:

| Variable | Where to Find It |
|----------|-----------------|
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Project Settings → API → Publishable key |
| `SUPABASE_JWT_SECRET` | Project Settings → API → JWT Settings → JWT Secret |
| `DATABASE_URL` | Project Settings → Database → Connection string → URI |

### 3. Backend Setup

```bash
cd backend

# Copy environment file and fill in your Supabase credentials
cp .env.example .env
# Edit .env with your Supabase values

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (creates tables on your Supabase database)
python manage.py migrate

# (Optional) Import sample sales data
python manage.py import_sales_data --clear

# Start the dev server
python manage.py runserver
```

The API will be available at **http://localhost:8000/api/**.

### 4. Frontend Setup

```bash
cd frontend

# Copy environment file and fill in your Supabase credentials
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173/**.

### 5. Login

Authentication is handled by **Supabase Auth**. You can:

- **Email/Password** — Sign up a new account or sign in with existing credentials
- **Google OAuth** — Click the Google button (requires OAuth configured in Supabase dashboard)
- **GitHub OAuth** — Click the GitHub button (requires OAuth configured in Supabase dashboard)

Enable OAuth providers in your Supabase dashboard: **Authentication → Providers → Google / GitHub**

## 🗄️ Database

The project uses **Supabase PostgreSQL** in production. Configuration is done via the `DATABASE_URL` environment variable in `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
```

For local development without Supabase, set `DB_ENGINE=sqlite` in `.env` to fall back to SQLite.

## 🔐 Authentication

Authentication is powered by **Supabase Auth**:

- **Backend** validates Supabase JWT tokens via a custom `SupabaseAuthentication` class (`users/authentication.py`). When a user signs in through the frontend, their Supabase JWT is sent to Django, which validates it and maps the user to a local Django `User` record via the `supabase_uid` field.
- **Frontend** uses the `@supabase/supabase-js` SDK for login, sign-up, password reset, and OAuth. The auth store (`stores/auth.js`) manages session state and auto-refreshes tokens.
- **Router guards** protect all `/dashboard/*` routes — unauthenticated users are redirected to `/login`.

## 📊 Data Import

The project includes a CSV import command to populate your database with sample data:

```bash
python manage.py import_sales_data           # Import from default CSV
python manage.py import_sales_data --clear   # Clear existing data, then import
```

The CSV file (`sales_analytics_USD.csv`) should be placed in the project root directory.

## 🧪 Testing

```bash
# Frontend tests (Vitest)
cd frontend && npm test

# Backend tests (Django)
cd backend && python manage.py test
```

## 📁 Project Structure

```
Sales_analytics/
├── backend/
│   ├── analytics/        # Dashboard KPI views
│   ├── config/           # Django settings & URL config
│   ├── customers/        # Customer management
│   ├── products/         # Product management
│   ├── reports/          # CSV/PDF export & email
│   ├── sales/            # Sales data & import command
│   └── users/            # Custom user model, Supabase auth
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── layouts/      # App layout with sidebar
│   │   ├── pages/        # Page components (9 pages)
│   │   ├── router/       # Route definitions & guards
│   │   ├── services/     # Axios API client & Supabase client
│   │   ├── stores/       # Pinia state stores
│   │   └── styles/       # Global CSS & Tailwind
│   └── package.json
├── sales_analytics_USD.csv  # Sample dataset (gitignored)
└── README.md
```

## 📸 Pages

| Page | Route | Description |
|------|-------|-------------|
| **Landing** | `/` | Marketing homepage with features overview |
| **Login** | `/login` | Authentication with Supabase (email/password, Google, GitHub) |
| **Dashboard** | `/dashboard` | KPI cards, revenue trend, regional bar, category donut |
| **Sales Analysis** | `/dashboard/sales` | Monthly & quarterly sales trends |
| **Profit Analysis** | `/dashboard/profit` | Margin & profitability analysis |
| **Customers** | `/dashboard/customers` | Customer list, segments, LTV, retention |
| **Products** | `/dashboard/products` | Product list, top performers, profitability |
| **Regions** | `/dashboard/regions` | Regional performance comparison |
| **Reports** | `/dashboard/reports` | Export PDF/CSV, email scheduling |
| **Settings** | `/dashboard/settings` | Account & application settings |

---

<div align="center">
  Built with ❤️ using Vue 3, Django, Supabase, and AI.
  <br><br>
  <sub>🏠 <a href="https://github.com/VijayaKumarchinta/portfolio">View my complete portfolio</a></sub>
</div>
