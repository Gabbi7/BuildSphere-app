# ══════════════════════════════════════════════════════════════════════
#  BuildSphere CV Service — Dockerfile
# ══════════════════════════════════════════════════════════════════════
#  Multi-stage build for a production-ready YOLO inference container.
#
#  Build:  docker build -t buildsphere-cv .
#  Run:    docker run -p 8000:8000 buildsphere-cv
#  GPU:    docker run --gpus all -p 8000:8000 buildsphere-cv
# ══════════════════════════════════════════════════════════════════════

FROM python:3.11-slim AS base

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/
COPY models/ ./models/

# Pre-download the YOLOv8m model weights (so it's baked into the image)
# This avoids downloading on first request. Remove this line if you
# always provide custom weights via models/best.pt.
RUN python -c "from ultralytics import YOLO; YOLO('yolov8m.pt')"

# Create a non-root user for security
RUN groupadd --gid 1000 appuser && \
    useradd --uid 1000 --gid 1000 --create-home appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose the API port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Start the server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
