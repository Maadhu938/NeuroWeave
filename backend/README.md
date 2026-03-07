# Neuroweave Backend

FastAPI-powered AI backend for the Neuroweave adaptive learning platform.

## Architecture

```
app/
├── main.py              # FastAPI app, CORS, lifespan
├── config.py            # Pydantic settings (env vars)
├── database.py          # Async SQLAlchemy + pgvector
├── models/
│   └── models.py        # KnowledgeNode, KnowledgeEdge, ReviewLog, UploadRecord
├── api/
│   ├── dashboard.py     # GET /api/dashboard
│   ├── insights.py      # GET /api/insights
│   ├── knowledge_graph.py  # GET /api/knowledge-graph
│   ├── upload.py        # POST /api/upload, POST /api/upload/text
│   ├── study_planner.py # GET /api/study-plan
│   ├── ask.py           # POST /api/ask
│   ├── memory.py        # GET /api/memory/heatmap, GET /api/memory/decay
│   └── metrics.py       # GET /api/metrics/topbar, GET /api/ai/insights
└── services/
    ├── embedding.py     # Sentence-Transformers (all-MiniLM-L6-v2)
    ├── ingestion.py     # PDF/text → chunks → concepts → graph
    ├── nama.py          # NAMA algorithm (adaptive memory strength)
    ├── graph.py         # Knowledge graph traversal
    ├── llm.py           # Groq Llama-3 integration
    ├── retrieval.py     # pgvector similarity search
    ├── insights.py      # Dashboard & insight aggregation
    └── planner.py       # Study schedule generation
```

## Quick Start

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate    # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your Supabase DATABASE_URL and GROQ_API_KEY

# 4. Run development server
uvicorn app.main:app --reload --port 8000
```

## NAMA Algorithm

**N**euroweave **A**daptive **M**emory **A**lgorithm:

```
MemoryStrength = w1 × review_factor
               + w2 × quiz_score
               + w3 × graph_reinforcement
               − w4 × time_decay
```

- **review_factor**: Diminishing returns via √(review_count), normalised to [0,1]
- **quiz_score**: Direct quiz performance (0–1)
- **graph_reinforcement**: Σ(neighbour_strength × edge_weight), normalised
- **time_decay**: log(days_since_review + 1) / 5

Strength is clamped to [0, 1] and drives study scheduling priority.

## Deployment (Render / Railway)

1. Push `backend/` to a Git repo
2. Set environment variables: `DATABASE_URL`, `GROQ_API_KEY`, `CORS_ORIGINS`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Or use the Dockerfile

## Database

Requires PostgreSQL with the `pgvector` extension (Supabase has it pre-installed).
Tables are auto-created on first startup via SQLAlchemy `create_all`.
