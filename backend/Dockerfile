FROM python:3.12-slim

# Global CPU/thread limits to stay within 512MB Render dyno
ENV OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    NUMEXPR_NUM_THREADS=1 \
    TOKENIZERS_PARALLELISM=false

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser

WORKDIR /app

# System deps (build tools, optional)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["sh", "-c", "python -c \"import os, socket, urllib.parse; db=os.getenv('DATABASE_URL');\ntry:\n  if not db: raise Exception('No DATABASE_URL');\n  u=urllib.parse.urlparse(db);\n  h=u.hostname; p=u.port or 5432;\n  print(f'Testing TCP to {h}:{p}...');\n  s=socket.create_connection((h, p), timeout=5);\n  print('TCP OK!');\n  s.close();\nexcept Exception as e:\n  print(f'TCP Check Skipped/Failed: {e}');\" ; uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
