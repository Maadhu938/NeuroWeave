FROM python:3.12-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser

WORKDIR /app

# System deps for sentence-transformers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Pre-download embedding model during build
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["sh", "-c", "python -c \"import os, socket, urllib.parse; db=os.getenv('DATABASE_URL');\ntry:\n  if not db: raise Exception('No DATABASE_URL');\n  u=urllib.parse.urlparse(db);\n  h=u.hostname; p=u.port or 5432;\n  print(f'Testing TCP to {h}:{p}...');\n  s=socket.create_connection((h, p), timeout=5);\n  print('TCP OK!');\n  s.close();\nexcept Exception as e:\n  print(f'TCP Check Skipped/Failed: {e}');\" ; uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
