# Neuroweave — Project Architecture & How It Works

> **Domain:** [neuroweave.in](https://neuroweave.in) &nbsp;|&nbsp; **API:** api.neuroweave.in &nbsp;|&nbsp; **Stack:** React + FastAPI + PostgreSQL + AI

---

## 1. What Is Neuroweave?

Neuroweave is an **AI-powered adaptive learning system** that transforms uploaded documents into a living knowledge graph, tracks memory retention using a custom algorithm (NAMA), and generates personalised study plans — all through a neural-themed interface.

**Core idea:** Upload your study material → AI extracts concepts & relationships → builds a knowledge graph → tracks how well you remember each concept → tells you exactly what to review and when.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│            React 18 + TypeScript + Vite + Tailwind              │
│                   Deployed on Vercel                            │
│                   (neuroweave.in)                               │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │ Landing  │ │Dashboard │ │Brain Map │ │ Upload Knowledge │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │ Insights │ │ Planner  │ │Ask Brain │ │     Settings     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│                         │                                       │
│              src/lib/api.ts (typed API client)                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │  HTTPS / JSON
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                          BACKEND                                │
│              FastAPI + Uvicorn (Python 3.12)                    │
│             Deployed on Render / Railway                        │
│               (api.neuroweave.in)                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    API Layer (FastAPI)                   │    │
│  │  /api/dashboard  /api/insights  /api/knowledge-graph    │    │
│  │  /api/upload     /api/upload/text  /api/study-plan      │    │
│  │  /api/ask        /api/memory/heatmap  /api/memory/decay │    │
│  │  /api/ai/insights  /api/metrics/topbar  /health         │    │
│  └──────────────────────┬──────────────────────────────────┘    │
│                         │                                       │
│  ┌──────────────────────▼──────────────────────────────────┐    │
│  │                  Service Layer                          │    │
│  │                                                         │    │
│  │  ┌────────────┐  ┌──────────┐  ┌────────────────────┐   │    │
│  │  │ Ingestion  │  │   NAMA   │  │   LLM (Groq)       │   │    │
│  │  │ Pipeline   │  │Algorithm │  │   Llama-3.3-70b    │   │    │
│  │  └────────────┘  └──────────┘  └────────────────────┘   │    │
│  │  ┌────────────┐  ┌──────────┐  ┌────────────────────┐   │    │
│  │  │ Embedding  │  │  Graph   │  │   Vector Search    │   │    │
│  │  │ (BGE-Small)│  │ Service  │  │   (pgvector)       │   │    │
│  │  └────────────┘  └──────────┘  └────────────────────┘   │    │
│  │  ┌────────────┐  ┌──────────┐                           │    │
│  │  │  Insights  │  │ Planner  │                           │    │
│  │  │  Engine    │  │ Engine   │                           │    │
│  │  └────────────┘  └──────────┘                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                         │                                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE                                  │
│             Supabase PostgreSQL + pgvector                      │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │ knowledge_nodes  │  │ knowledge_edges  │                     │
│  │ (384-d vectors)  │──│ (weighted links) │                     │
│  └──────────────────┘  └──────────────────┘                     │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │  review_logs     │  │ upload_records   │                     │
│  └──────────────────┘  └──────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend — Page-by-Page Breakdown

### 3.1 Landing Page
- Animated neural-themed hero with floating particles
- Feature highlights: Brain Map, NAMA Algorithm, Ask Your Brain, Study Planner
- Single CTA: **"Enter Neural Interface"** → Dashboard

### 3.2 Dashboard
The command centre. Fetches `GET /api/dashboard` and displays:
- **4 Metric Cards:** Knowledge Score, Retention Rate, Concepts Mastered, Study Streak
- **Radar Chart:** Knowledge strength by subject/category
- **Area Chart:** 7-day memory retention trend
- **Weak Areas List:** Lowest-strength concepts needing review
- **Upcoming Reviews:** Priority-ordered review schedule
- **AI Insight:** One-line AI-generated learning recommendation
- **Memory Heatmap** (component): Visual topic strength grid via `GET /api/memory/heatmap`
- **Memory Decay Chart** (component): 14-day decay prediction with simulated review boosts

### 3.3 Brain Map
Interactive canvas-based knowledge graph via `GET /api/knowledge-graph`:
- Nodes placed via force-directed polar layout
- **Colour coding:** Green (≥85% strength) → Yellow (70–84%) → Red (<70%)
- Animated pulse effect on each node
- Connection lines between related concepts
- Zoom/pan controls + click-to-select node detail panel
- Shows: node label, category, strength %, connections count

### 3.4 Upload Knowledge
Dual upload interface:
- **File upload:** Drag-and-drop or click for PDF / TXT / MD (max 20 MB) → `POST /api/upload`
- **Text input:** Paste raw text → `POST /api/upload/text`
- Animated processing stages: Extracting → Analysing → Building Graph → Complete
- Displays extracted concept list and relationship count on completion

### 3.5 Insights
AI-powered analytics via `GET /api/insights`:
- **Insight Cards:** Contextual alerts (warning / success / info / danger) generated by LLM
- **Knowledge Coverage Radar:** Subject-by-subject score breakdown
- **Learning Patterns Bar Chart:** Time-of-day effectiveness
- **Subject Retention:** Gradient-filled bars per subject
- Recommendations section with personalised tips

### 3.6 Study Planner
Adaptive spaced-repetition schedule via `GET /api/study-plan`:
- **Stats Row:** Total Reviews, Completed, Time Spent, Avg Score
- **Priority Reviews:** Cards sorted critical → high → medium → low
- **Week Calendar:** 7-day grid with session counts and completion tracking
- **Milestones:** Progress bars toward learning goals

### 3.7 Ask Your Brain (RAG Q&A)
Chat-style interface via `POST /api/ask`:
- User types a question → backend performs **vector similarity search** → feeds context to LLM → returns grounded answer
- Shows related concepts and linked knowledge node IDs
- Suggested starter questions in sidebar
- "How It Works" explainer panel

### 3.8 Settings
- Profile management (name, email)
- Learning preferences (reminders, auto-generation, smart connections)
- Notification toggles
- Data & Privacy controls (export/clear)

### Shared Components
| Component | Purpose |
|-----------|---------|
| **Sidebar** | Fixed 8-item navigation with neural glow logo and "Neural Network Active" status |
| **TopBar** | Always-visible metrics bar (Knowledge Score, Retention Rate, Study Streak) via `GET /api/metrics/topbar` |
| **AIInsightCards** | Reusable insight card grid with type-based icons and colours |
| **MemoryHeatmap** | Animated strength bars per topic with category summary |
| **MemoryDecayChart** | Recharts line chart showing projected memory decay with review interventions |

---

## 4. Backend — Service-by-Service Breakdown

### 4.1 Ingestion Pipeline (`services/ingestion.py`)

The core content processing pipeline:

```
PDF / Raw Text
      │
      ▼
 Extract Text  (PyMuPDF for PDFs)
      │
      ▼
 Chunk Text    (500-word chunks, 50-word overlap)
      │
      ▼
 Extract Concepts  (Groq Llama-3 → JSON array of 5–15 labels)
      │              Falls back to keyword extraction if API unavailable
      ▼
 Match Concepts to Chunks  (keyword overlap scoring)
      │
      ▼
 Generate Embeddings  (Hugging Face Router API → bge-small-en-v1.5, 384-d vectors)
      │
      ▼
 Upsert KnowledgeNodes  (dedup by label, stores content + embedding + category)
      │
      ▼
 Build KnowledgeEdges  (cosine similarity > 0.35 between concept embeddings)
      │
      ▼
 Record Upload Metadata
```

### 4.2 NAMA Algorithm (`services/nama.py`)

**N**euroweave **A**daptive **M**emory **A**lgorithm — the core adaptive learning engine:

```
MemoryStrength = BASE(0.5)
               + w1 × review_factor        (diminishing returns via √review_count)
               + w2 × quiz_score            (direct performance, 0–1)
               + w3 × graph_reinforcement   (Σ neighbour_strength × edge_weight)
               − w4 × time_decay            (log(days_since_review + 1) / 5)
```

| Weight | Value | What It Measures |
|--------|-------|-----------------|
| w1 | 0.10 | How many times you've reviewed a concept (diminishing returns) |
| w2 | 0.30 | How well you scored on quizzes for this concept |
| w3 | 0.25 | How strong the surrounding concepts are (graph reinforcement) |
| w4 | 0.20 | How long since you last looked at this concept (forgetting curve) |

**Key functions:**
- `compute_strength(db, node)` — calculates NAMA score for a single concept
- `refresh_all_strengths(db)` — batch recompute for every node in the graph
- `decay_curve(db, concept)` — projects a 30-day strength curve with simulated optimal review points (days 0, 1, 3, 7, 14)

**Strength is clamped to [0, 1]** and directly drives:
- Colour on the Brain Map (green / yellow / red)
- Priority ordering in the Study Planner (lowest strength → first to review)
- Weak area identification on the Dashboard

### 4.3 Embedding Service (`services/embedding.py`)

- **Model:** `BAAI/bge-small-en-v1.5` (384 dimensions) served via **Hugging Face Router API** (serverless)
- No local model load — embeddings are computed remotely using `httpx.AsyncClient`
- Switched to BGE model via `router.huggingface.co` to resolve stability issues with the old API.
- `embed_batch()` — async batch embedding with L2 normalisation
- `embed_single()` — async single text convenience wrapper
- `cosine_similarity()` — used during edge construction and analytics

### 4.4 LLM Service (`services/llm.py`)

Groq API integration using **Llama-3.3-70b-versatile**:

| Function | Purpose | Temperature |
|----------|---------|-------------|
| `extract_concepts_llm()` | Extract 5–15 concept labels from source text | 0.2 |
| `ask_brain_llm()` | RAG answer with personal knowledge context | 0.3 |
| `generate_insights_llm()` | Generate learning insights from graph summary | 0.4 |

All LLM calls gracefully degrade if `GROQ_API_KEY` is not set — returning empty arrays or helpful fallback messages.

### 4.5 Vector Retrieval (`services/retrieval.py`)

- Uses **pgvector** with IVFFlat cosine distance index
- `search_similar(db, query, top_k=5)` — embeds the query, runs `<=>` distance search, returns nodes + similarity scores
- Powers the "Ask Your Brain" RAG pipeline

### 4.6 Graph Service (`services/graph.py`)

- `get_graph_data(db)` — assembles all nodes with polar-coordinate positions and adjacency lists for the Brain Map
- `get_heatmap_data(db)` — topic-level strength summary for the Memory Heatmap
- Positions are deterministically computed (angle based on index, radius based on ring)

### 4.7 Insights Engine (`services/insights.py`)

Aggregation layer that queries nodes and computes frontend-ready data:

- **Dashboard:** metrics (avg strength, mastered count, streak), 7-day retention curve, knowledge strength by category, weak areas, upcoming reviews, AI-generated insight text
- **Insights page:** AI insight cards, knowledge coverage radar data, learning patterns, subject retention with colours
- **TopBar:** formatted strings (e.g. "82%", "14 days")
- **AI Insight Cards:** delegates to LLM for dynamic insights, falls back to static prompts when empty

### 4.8 Study Planner Engine (`services/planner.py`)

Generates adaptive study schedules based on NAMA scores:

- **Recommendations:** weakest concepts first, assigned time (5–15 min) and priority (critical/high/medium/low)
- **Week schedule:** distributes review sessions evenly across 7 days
- **Milestones:** "Master 10 concepts", "Complete all reviews", coverage goals
- **Stats:** total reviews, completed mastery count, aggregated time, average quiz score

---

## 5. Data Flow — End to End

### Flow 1: Uploading Knowledge
```
User drops a PDF
      │
      ▼
Frontend: POST /api/upload (FormData)
      │
      ▼
Backend: extract_text_from_pdf() → chunk_text() → extract_concepts_llm()
      │
      ▼
Backend: embed_batch() → upsert KnowledgeNodes (with 384-d vector)
      │
      ▼
Backend: cosine_similarity() > 0.35 → create KnowledgeEdges
      │
      ▼
Response: { concepts: ["Quantum Entanglement", ...], relationshipsFound: 12 }
      │
      ▼
Frontend: shows extracted concepts + relationship count
```

### Flow 2: Asking Your Brain
```
User asks: "What is quantum entanglement?"
      │
      ▼
Frontend: POST /api/ask { question: "..." }
      │
      ▼
Backend: embed_single(question) → pgvector search top 5 similar nodes
      │
      ▼
Backend: collect node.content as context chunks
      │
      ▼
Backend: ask_brain_llm(question, context_chunks, related_concepts)
         → Groq Llama-3.3: "Using ONLY the provided context..."
      │
      ▼
Response: { answer: "...", relatedConcepts: [...], knowledgeNodes: [...] }
      │
      ▼
Frontend: displays answer + related concept tags + linked nodes
```

### Flow 3: Dashboard Load
```
User navigates to Dashboard
      │
      ▼
Frontend: GET /api/dashboard + GET /api/memory/heatmap + GET /api/metrics/topbar
      │
      ▼
Backend: query all KnowledgeNodes → compute aggregates
         → LLM generates insight text
      │
      ▼
Response: metrics, retention curve, strength chart, weak areas, reviews, AI insight
      │
      ▼
Frontend: renders metric cards, radar chart, area chart, heatmap, decay chart
```

### Flow 4: Study Planner
```
User opens Study Planner
      │
      ▼
Frontend: GET /api/study-plan
      │
      ▼
Backend: query all nodes → sort by NAMA strength ascending
         → assign priority & time per concept
         → distribute across 7-day schedule
      │
      ▼
Response: recommendations, weekSchedule, milestones, stats
      │
      ▼
Frontend: renders priority review cards, week calendar, milestones, stats
```

---

## 6. Database Schema

```sql
-- Requires: CREATE EXTENSION IF NOT EXISTS vector;

knowledge_nodes
├── id              UUID PRIMARY KEY
├── label           VARCHAR(255)        -- "Quantum Entanglement"
├── category        VARCHAR(100)        -- "science", "mathematics", etc.
├── content         TEXT                -- snippet of source text
├── embedding       VECTOR(384)         -- all-MiniLM-L6-v2 output
├── strength        FLOAT               -- NAMA score [0, 1]
├── review_count    INTEGER
├── quiz_score      FLOAT               -- [0, 1]
├── last_reviewed   TIMESTAMP
└── created_at      TIMESTAMP

knowledge_edges
├── id              UUID PRIMARY KEY
├── source_id       UUID FK → knowledge_nodes
├── target_id       UUID FK → knowledge_nodes
├── weight          FLOAT               -- cosine similarity at creation
├── relation_type   VARCHAR(100)        -- "related_to"
└── created_at      TIMESTAMP

review_logs
├── id              UUID PRIMARY KEY
├── node_id         UUID FK → knowledge_nodes
├── reviewed_at     TIMESTAMP
└── score           FLOAT               -- quiz score if applicable

upload_records
├── id              UUID PRIMARY KEY
├── filename        VARCHAR(500)
├── source_type     VARCHAR(20)         -- "file" | "text"
├── concepts_extracted  INTEGER
├── relationships_found INTEGER
└── created_at      TIMESTAMP
```

**Indexes:**
- `ix_nodes_category` — B-tree on category
- `ix_nodes_embedding` — IVFFlat with `vector_cosine_ops` for similarity search
- `ix_edges_source` / `ix_edges_target` — B-tree for fast adjacency lookups

---

## 7. API Contract (all 11 endpoints)

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/dashboard` | — | `{ metrics, retentionData[], knowledgeStrength[], weakAreas[], upcomingReviews[], aiInsight }` |
| GET | `/api/insights` | — | `{ insights[], knowledgeCoverage[], learningPatterns[], subjectRetention[] }` |
| GET | `/api/knowledge-graph` | — | `{ nodes[]: { id, label, x, y, strength, connections[], category } }` |
| POST | `/api/upload` | FormData (file) | `{ concepts[], relationshipsFound }` |
| POST | `/api/upload/text` | `{ text }` | `{ concepts[], relationshipsFound }` |
| GET | `/api/study-plan` | — | `{ recommendations[], weekSchedule[], milestones[], stats }` |
| POST | `/api/ask` | `{ question }` | `{ answer, relatedConcepts[], knowledgeNodes[] }` |
| GET | `/api/memory/heatmap` | — | `[{ topic, strength, category }]` |
| GET | `/api/memory/decay` | `?concept=X` | `[{ day, strength, reviewed }]` |
| GET | `/api/ai/insights` | — | `[{ title, description, type }]` |
| GET | `/api/metrics/topbar` | — | `{ knowledgeScore, retentionRate, studyStreak }` |

---

## 8. Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI components & state |
| **Bundler** | Vite 6.3.5 | Dev server & production build |
| **Styling** | Tailwind CSS 4 + custom theme.css | Dark neural aesthetic |
| **Animations** | Motion (framer-motion) | Page transitions & micro-interactions |
| **Charts** | Recharts | Radar, area, line, bar charts |
| **Icons** | Lucide React | Consistent icon set |
| **Backend** | FastAPI 0.115.6 | Async Python API server |
| **Database** | Supabase PostgreSQL | Managed Postgres with pgvector |
| **Vector DB** | pgvector (IVFFlat) | 384-d cosine similarity search |
| **Embeddings** | Hugging Face Router API (`bge-small-en-v1.5`) | Text → 384-d vectors |
| **LLM** | Groq API (Llama-3.3-70b) | Concept extraction, Q&A, insights |
| **PDF Parsing** | PyMuPDF (fitz) | PDF → plain text extraction |
| **ORM** | SQLAlchemy 2.0 (async) | Database models & queries |
| **Deployment** | Vercel (frontend) + Render/Railway (backend) | Production hosting |

---

## 9. Running Locally

### Frontend
```bash
cd "Neuroweave Project"
npm install
npm run dev              # → http://localhost:5173
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env: set DATABASE_URL and GROQ_API_KEY

uvicorn app.main:app --reload --port 8000   # → http://localhost:8000
```

The frontend dev server automatically points to `localhost:8000` via `.env.development`.

---

## 10. Deployment

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | https://neuroweave.in |
| Backend | Render / Railway | https://api.neuroweave.in |
| Database | Supabase | PostgreSQL + pgvector |

**Backend deployment options:**
1. **Render/Railway:** Set env vars → Build: `pip install -r requirements.txt` → Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
2. **Docker:** `docker build -t neuroweave-api . && docker run -p 8000:8000 --env-file .env neuroweave-api`

Tables auto-create on first startup. The pgvector extension is enabled automatically.

---

## 11. File Tree

```
Neuroweave Project/
├── index.html                  # HTML shell with OpenGraph meta
├── package.json                # Frontend deps (9 runtime)
├── vite.config.ts              # Vite + Tailwind plugin + @ alias
├── postcss.config.mjs          # PostCSS config
├── .env                        # VITE_API_URL=https://api.neuroweave.in
├── .env.development            # VITE_API_URL=http://localhost:8000
│
├── src/
│   ├── main.tsx                # React entry point
│   ├── app/
│   │   └── App.tsx             # Root component + page routing
│   ├── pages/
│   │   ├── LandingPage.tsx     # Hero + CTA
│   │   ├── Dashboard.tsx       # Metrics + charts + AI insight
│   │   ├── BrainMap.tsx        # Canvas knowledge graph
│   │   ├── UploadKnowledge.tsx # File + text upload
│   │   ├── Insights.tsx        # AI analytics
│   │   ├── StudyPlanner.tsx    # Spaced repetition schedule
│   │   ├── AskYourBrain.tsx    # RAG Q&A chat
│   │   └── Settings.tsx        # User preferences
│   ├── components/
│   │   ├── Sidebar.tsx         # Navigation
│   │   ├── TopBar.tsx          # Top metrics bar
│   │   ├── AIInsightCards.tsx   # Insight card grid
│   │   ├── MemoryHeatmap.tsx   # NAMA strength heatmap
│   │   └── MemoryDecayChart.tsx # Decay curve chart
│   ├── lib/
│   │   └── api.ts              # Typed API client (11 endpoints)
│   ├── hooks/
│   │   └── useApi.ts           # Generic fetch hook
│   └── styles/
│       ├── index.css           # Import aggregator
│       ├── fonts.css           # Google Fonts (Inter)
│       ├── tailwind.css        # Tailwind directives
│       └── theme.css           # CSS variables (dark neural theme)
│
└── backend/
    ├── requirements.txt        # Python deps (13 packages)
    ├── Dockerfile              # Production container
    ├── .env.example            # Env template
    ├── README.md               # Backend docs
    └── app/
        ├── __init__.py
        ├── main.py             # FastAPI app + CORS + lifespan
        ├── config.py           # Pydantic settings
        ├── database.py         # Async SQLAlchemy engine
        ├── models/
        │   ├── __init__.py
        │   └── models.py       # KnowledgeNode, KnowledgeEdge, ReviewLog, UploadRecord
        ├── api/
        │   ├── __init__.py
        │   ├── dashboard.py    # GET /api/dashboard
        │   ├── insights.py     # GET /api/insights
        │   ├── knowledge_graph.py # GET /api/knowledge-graph
        │   ├── upload.py       # POST /api/upload + /api/upload/text
        │   ├── study_planner.py # GET /api/study-plan
        │   ├── ask.py          # POST /api/ask
        │   ├── memory.py       # GET /api/memory/heatmap + /decay
        │   └── metrics.py      # GET /api/metrics/topbar + /api/ai/insights
        └── services/
            ├── __init__.py
            ├── embedding.py    # HF Router API embeddings (384-d)
            ├── ingestion.py    # PDF/text → chunks → concepts → graph
            ├── nama.py         # NAMA algorithm
            ├── llm.py          # Groq Llama-3 integration
            ├── retrieval.py    # pgvector similarity search
            ├── graph.py        # Knowledge graph assembly
            ├── insights.py     # Dashboard & insight aggregation
            └── planner.py      # Study schedule generation
```
