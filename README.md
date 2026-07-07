<div align="center">
  <h1>📈 Sales Analytics Platform</h1>
  <p><strong>Interactive Dashboards · Real-time KPIs · Intelligent Reporting</strong></p>

  [![Vue 3](https://img.shields.io/badge/Vue_3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Cloudflare Workers](https://img.shields.io/badge/Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
  [![D1](https://img.shields.io/badge/D1-FF6B35?style=for-the-badge&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
  [![ApexCharts](https://img.shields.io/badge/ApexCharts-FF6B35?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://apexcharts.com/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

  [![Frontend](https://img.shields.io/github/actions/workflow/status/VijayaKumarchinta/Sales_analytics/deploy-frontend.yml?branch=main&style=for-the-badge&logo=github&label=Frontend)](https://github.com/VijayaKumarchinta/Sales_analytics/actions)
  [![API](https://img.shields.io/github/actions/workflow/status/VijayaKumarchinta/Sales_analytics/deploy-worker.yml?branch=main&style=for-the-badge&logo=github&label=API)](https://github.com/VijayaKumarchinta/Sales_analytics/actions)
  [![Frontend](https://img.shields.io/badge/FRONTEND-8A2BE2?style=for-the-badge&logo=cloudflare&logoColor=white)](https://sales-analytics.pages.dev)
  [![API](https://img.shields.io/badge/API-8A2BE2?style=for-the-badge&logo=cloudflare&logoColor=white)](https://sales-analytics-api.vijayakumar-chinta15.workers.dev/health)

  <p>A full-stack sales analytics platform with interactive dashboards, real-time KPIs, and intelligent reporting — migrated from Django to Cloudflare Workers + D1.</p>
</div>

<br>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📊 Pages](#-pages)
- [📡 API Endpoints](#-api-endpoints)
- [📁 Project Structure](#-project-structure)
- [📸 Screenshots](#-screenshots)
- [📝 License](#-license)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Interactive Dashboard** | Real-time KPI cards, revenue trends, regional performance, category breakdowns with animated ApexCharts |
| 📈 **Sales Analysis** | Monthly trends, quarterly performance, deep-dive filtering by date and region |
| 💰 **Profit Analysis** | Margin analysis, profitability by product/category, cost breakdowns |
| 👥 **Customer Insights** | Segment analysis, lifetime value (LTV) tracking, retention rates |
| 📦 **Product Performance** | Top/bottom performers, profitability margins, category analysis |
| 🌍 **Regional Insights** | Cross-region comparison and growth market identification |
| 📄 **Report Exporting** | PDF and CSV export with email scheduling support |
| 🔐 **Authentication** | JWT-based auth with role-based access (admin, analyst, viewer) |
| 🌙 **Dark/Light Theme** | System-aware dark mode with manual toggle |
| 📱 **Responsive Design** | Desktop, tablet, and mobile optimized |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Vue 3 + Vite + Pinia + Vue Router | Modern SPA |
| **Backend** | Cloudflare Workers (JS) | Serverless API |
| **Database** | D1 (SQLite on Cloudflare) | Free tier analytics |
| **Charts** | ApexCharts via `vue3-apexcharts` | Interactive visualizations |
| **Styling** | Tailwind CSS v4 | Utility-first responsive design |
| **Auth** | JWT (HMAC-SHA256) + Supabase-compatible | Secure authentication |
| **CI/CD** | GitHub Actions → Cloudflare | Auto-deploy on push |

---

## 🚀 Quick Start

<details>
<summary><strong>Click to expand setup instructions</strong></summary>

### Prerequisites
- Node.js 18+
- npm

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs at **http://localhost:5173**

### API Worker (Local)
```bash
cd worker
npm install
npx wrangler dev
```

### Environment
Create `frontend/.env`:
```
VITE_API_URL=https://sales-analytics-api.vijayakumar-chinta15.workers.dev
```

### Login Credentials
- **Username:** `admin`
- **Password:** `demo1234`

</details>

---

## 📊 Pages

| Page | Route | Description |
|------|-------|-------------|
| **Landing** | `/` | Marketing homepage |
| **Dataset Import** | `/dataset/import` | Upload CSV data |
| **Login** | `/login` | JWT-based sign-in |
| **Dashboard** | `/dashboard` | KPI cards, trends, regional bar, category donut |
| **Sales Analysis** | `/dashboard/sales` | Monthly & quarterly trends |
| **Profit Analysis** | `/dashboard/profit` | Margin & profitability |
| **Customers** | `/dashboard/customers` | Segments, LTV, retention |
| **Products** | `/dashboard/products` | Top performers, profitability |
| **Regions** | `/dashboard/regions` | Regional performance |
| **Reports** | `/dashboard/reports` | Export PDF/CSV, email |
| **Settings** | `/dashboard/settings` | Account & app settings |

---

## 📡 API Endpoints

<details>
<summary><strong>Dashboard</strong></summary>

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/kpis/` | KPI cards (revenue, profit, orders, customers) |
| GET | `/dashboard/revenue/` | Revenue trend data |
| GET | `/dashboard/sales-by-region/` | Regional sales breakdown |
| GET | `/dashboard/category-breakdown/` | Category performance |
</details>

<details>
<summary><strong>Sales & Customers</strong></summary>

| Method | Path | Description |
|--------|------|-------------|
| GET | `/sales/` | List sales (filterable) |
| GET | `/sales/trends/` | Monthly sales trends |
| GET | `/customers/` | Customer list with search |
| GET | `/customers/segments/` | Segment analysis |
| GET | `/customers/lifetime-value/` | LTV by segment |
| GET | `/customers/retention/` | Cohort retention rates |
</details>

<details>
<summary><strong>Products & Reports</strong></summary>

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products/` | Product list |
| GET | `/products/top/` | Top performers |
| GET | `/products/profitability/` | Profitability analysis |
| GET | `/reports/export/csv/` | CSV data export |
| GET | `/reports/export/pdf/` | PDF report data |
| POST | `/reports/email/` | Schedule email report |
</details>

---

## 📁 Project Structure

```
Sales_analytics/
├── frontend/                    # Vue 3 SPA
│   ├── src/
│   │   ├── components/          # UI components
│   │   ├── pages/               # 11 pages
│   │   ├── services/            # API client with JWT
│   │   ├── stores/              # Pinia state
│   │   └── router/              # Auth guards
│   └── .github/workflows/       # CI/CD: frontend deploy
├── worker/                      # Cloudflare Worker API
│   ├── src/index.js             # 25+ endpoints
│   ├── migrations/              # D1 schema
│   └── .github/workflows/       # CI/CD: worker deploy
└── README.md
```

---

## 📸 Screenshots

<div align="center">
  <img src="screenshots/landing.png" alt="Landing Page" width="45%" style="border-radius: 8px;">
  <img src="screenshots/login.png" alt="Login Page" width="45%" style="border-radius: 8px;">
  <br>
  <sub>Landing Page (left) · Login Page (right)</sub>
  <br><br>
  <img src="screenshots/dashboard.png" alt="Dashboard" width="90%" style="border-radius: 8px;">
  <br>
  <sub>Dashboard with KPI cards, revenue trends, and regional performance</sub>
</div>

---

## 📝 License

This project is licensed under the **MIT License**.

---

<div align="center">
  <sub>
    Built by <a href="https://github.com/VijayaKumarchinta">Vijaya Kumar Chinta</a>
    <br>
    🏠 <a href="https://github.com/VijayaKumarchinta/portfolio">View my complete portfolio</a>
  </sub>
</div>
