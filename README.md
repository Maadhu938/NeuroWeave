# Neuroweave – Cognitive Knowledge Intelligence System

> Weaving intelligence from data, models, and algorithms.

Production frontend for [neuroweave.in](https://neuroweave.in).

## Tech Stack

- **React 18** + **TypeScript**
- **Tailwind CSS 4** (via Vite plugin)
- **Recharts** for data visualization
- **Motion** for animations
- **Lucide React** for icons

## Project Structure

```
src/
├── components/       # Reusable UI components (Sidebar, TopBar, charts)
├── pages/            # Page-level components (Dashboard, BrainMap, etc.)
├── hooks/            # Custom React hooks (useApi)
├── lib/              # Utilities and API client (api.ts)
├── services/         # Business logic services
├── styles/           # CSS (Tailwind, fonts, theme)
└── app/              # App root and routing
```

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

| Variable        | Description                | Default                       |
| --------------- | -------------------------- | ----------------------------- |
| `VITE_API_URL`  | Backend API base URL       | `https://api.neuroweave.in`   |

For local development, create `.env.development`:

```
VITE_API_URL=http://localhost:8000
```

## Build & Preview

```bash
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Set **Framework Preset** to `Vite`.
4. Add the environment variable `VITE_API_URL` pointing to your FastAPI backend.
5. Set the custom domain to `neuroweave.in` in Vercel project settings.
6. Deploy.

## Backend Integration

All API calls go through `src/lib/api.ts`. The backend (FastAPI) is expected at the URL defined by `VITE_API_URL`. Key endpoints:

| Function             | Endpoint                  | Method |
| -------------------- | ------------------------- | ------ |
| `getDashboard()`     | `/api/dashboard`          | GET    |
| `getInsights()`      | `/api/insights`           | GET    |
| `getKnowledgeGraph()`| `/api/knowledge-graph`    | GET    |
| `uploadKnowledge()`  | `/api/upload`             | POST   |
| `uploadText()`       | `/api/upload/text`        | POST   |
| `getStudyPlan()`     | `/api/study-plan`         | GET    |
| `askBrain()`         | `/api/ask`                | POST   |
| `getMemoryHeatmap()` | `/api/memory/heatmap`     | GET    |
| `getMemoryDecay()`   | `/api/memory/decay`       | GET    |
| `getAIInsights()`    | `/api/ai/insights`        | GET    |
| `getTopBarMetrics()` | `/api/metrics/topbar`     | GET    |
