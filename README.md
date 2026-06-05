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

  <p>
    <img src="https://img.shields.io/badge/Vue_3-4FC08D?style=flat&logo=vue.js&logoColor=white" alt="Vue 3"/>
    <img src="https://img.shields.io/badge/Django-092E20?style=flat&logo=django&logoColor=white" alt="Django"/>
    <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
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
- **🔐 Authentication** — JWT-based auth with role-based access (admin, analyst, viewer)
- **🌙 Dark/Light Theme** — System-aware dark mode with manual toggle, persisted to localStorage
- **📱 Responsive Design** — Fully responsive layout for desktop, tablet, and mobile

## 🏗️ Tech Stack

**Frontend**
- [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`)
- [Vite](https://vitejs.dev/) (Build tool & dev server)
- [Pinia](https://pinia.vuejs.org/) (State management)
- [Vue Router](https://router.vuejs.org/) (Routing with auth guards)
- [Tailwind CSS](https://tailwindcss.com/) (Utility-first styling)
- [ApexCharts](https://apexcharts.com/) (Interactive charts via `vue3-apexcharts`)
- [Axios](https://axios-http.com/) (HTTP client with JWT interceptors)
- [VueUse](https://vueuse.org/) (Composition utilities & motion)

**Backend**
- [Django](https://www.djangoproject.com/) 5.2 (Python web framework)
- [Django REST Framework](https://www.django-rest-framework.org/) (REST API)
- [SimpleJWT](https://django-rest-framework-simplejwt.readthedocs.io/) (JWT authentication)
- [PostgreSQL](https://www.postgresql.org/) (Production database)
- [SQLite](https://www.sqlite.org/) (Local development fallback)
- [Pandas](https://pandas.pydata.org/) (CSV data import)
- [WhiteNoise](https://whitenoise.readthedocs.io/) (Static file serving)

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or pnpm

### 1. Clone & Setup

```bash
git clone https://github.com/VijayaKumarchinta/Sales_analytics.git
cd Sales_analytics
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create a superuser
python manage.py createsuperuser

# (Optional) Import sample sales data
python manage.py import_sales_data

# Start the dev server
python manage.py runserver
```

The API will be available at **http://localhost:8000/api/**.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173/**.

### 4. Login

Use the superuser credentials you created, or the demo account:
- **Username:** `admin`
- **Password:** `demo1234`

## 🗄️ Database

The project defaults to **SQLite** for local development. For production, set the following environment variables in `backend/.env`:

```env
DB_ENGINE=postgresql
DB_NAME=sales_analytics
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

> If PostgreSQL is not available, the app automatically falls back to SQLite.

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
│   └── users/            # Custom user model & auth
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── layouts/      # App layout with sidebar
│   │   ├── pages/        # Page components (9 pages)
│   │   ├── router/       # Route definitions & guards
│   │   ├── services/     # Axios API client
│   │   ├── stores/       # Pinia state stores
│   │   └── styles/       # Global CSS & Tailwind
│   └── package.json
├── sales_analytics_USD.csv  # Sample dataset
└── README.md
```

## 📸 Pages

| Page | Route | Description |
|------|-------|-------------|
| **Landing** | `/` | Marketing homepage with features overview |
| **Login** | `/login` | Authentication with JWT |
| **Dashboard** | `/dashboard` | KPI cards, revenue trend, regional bar, category donut |
| **Sales Analysis** | `/dashboard/sales` | Monthly & quarterly sales trends |
| **Profit Analysis** | `/dashboard/profit` | Margin & profitability analysis |
| **Customers** | `/dashboard/customers` | Customer list, segments, LTV, retention |
| **Products** | `/dashboard/products` | Product list, top performers, profitability |
| **Regions** | `/dashboard/regions` | Regional performance comparison |
| **Reports** | `/dashboard/reports` | Export PDF/CSV, email scheduling |
| **Settings** | `/dashboard/settings` | Account & application settings |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for demonstration and educational purposes.

---

<div align="center">
  Built with ❤️ using Vue 3, Django, and AI.
</div>
