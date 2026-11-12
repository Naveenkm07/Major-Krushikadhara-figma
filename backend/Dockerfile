FROM node:22-bookworm-slim

# Install Python + OpenSSL (required by Prisma + YOLO11s TFLite inference worker)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-venv \
    python3-pip \
    openssl \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Create isolated Python runtime for scripts/infer_pest.py
RUN python3 -m venv /opt/venv \
  && /opt/venv/bin/pip install --no-cache-dir --upgrade pip

WORKDIR /app

COPY requirements.txt ./
RUN /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
COPY models ./models
COPY public-web ./public-web

RUN npm run build \
  && mkdir -p /app/uploads/scans /app/.local-cache \
  && chmod -R a+rwX /app/uploads /app/.local-cache

ENV NODE_ENV=production
ENV PORT=5000
ENV PYTHON_EXECUTABLE=/opt/venv/bin/python

EXPOSE 5000

CMD ["node", "dist/server.js"]

