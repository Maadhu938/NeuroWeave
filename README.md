# Neuroweave – Cognitive Knowledge Intelligence System

> Weaving intelligence from data, models, and algorithms.

Neuroweave is an **AI-powered adaptive learning platform** that transforms static study materials into dynamic, interactive knowledge graphs. Using the proprietary **NAMA Algorithm**, it tracks your memory retention and generates personalized study schedules to optimize your learning velocity.

[neuroweave.in](https://neuroweave.in) | [api.neuroweave.in](https://api.neuroweave.in) | [Architecture Guide](ARCHITECTURE.md)

---

## 🧠 Core Features

- **Brain Map:** Interactive, force-directed knowledge graph of your study materials.
- **NAMA Algorithm:** Adaptive memory strength tracking based on reviews, performance, and graph connectivity.
- **Ask Your Brain:** RAG-powered Q&A interface for contextual querying of your knowledge base.
- **Adaptive Study Planner:** Automatically prioritized review sessions and learning milestones.
- **Deep Analytics:** Visualization of memory decay and topical knowledge coverage.

---

## 🏗️ Project Structure

- **`src/`** (Frontend): React 18 + TypeScript + Vite + Tailwind CSS.
- **`backend/`** (API): FastAPI + Python 3.12 + SQLAlchemy + pgvector.
- **`ARCHITECTURE.md`**: Detailed technical breakdown and data flows.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (3.12+)
- PostgreSQL with `pgvector` extension (e.g., Supabase)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env # Add your DATABASE_URL and GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
# From root directory
npm install
npm run dev
```

---

## ⚙️ Environment Variables

### Frontend (`.env` / `.env.development`)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://api.neuroweave.in` |

### Backend (`.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GROQ_API_KEY` | API Key for Llama-3 models | Yes |
| `CORS_ORIGINS` | Allowed origins for CORS | No |

---

## 🧪 NAMA Algorithm

The **Neuroweave Adaptive Memory Algorithm** calculates `MemoryStrength` using:
- **Review History:** √(count) factor for diminishing returns.
- **Performance:** Direct quiz and interaction scores.
- **Graph Context:** Reinforcement from related nodes in the knowledge graph.
- **Time Decay:** Logarithmic forgetting curve based on days since last review.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts, Motion (framer-motion), Lucide.
- **Backend:** FastAPI, Pydantic, SQLAlchemy, PyMuPDF (fitz).
- **AI/ML:** Groq (Llama-3.3-70b), Hugging Face (BGE-Small Embeddings), pgvector.
- **Infrastructure:** Vercel (Frontend), Render/Railway (Backend), Supabase (Postgres).
