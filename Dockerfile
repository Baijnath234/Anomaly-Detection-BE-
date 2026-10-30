# Multi-stage Dockerfile for Anomaly Detection, RUL & Repair Platform API
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /usr/src/app

RUN apk add --no-cache curl python3 make g++

COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist
COPY src/repair/knowledge-base ./dist/repair/knowledge-base

# Storage directory for trained models and CSV datasets
RUN mkdir -p storage/models storage/uploads && chown -R node:node storage

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/systems || exit 1

CMD ["node", "dist/main.js"]

