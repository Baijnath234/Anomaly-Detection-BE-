# Anomaly Detection, Remaining Useful Life (RUL) & Repair Assistant Platform

An enterprise-grade industrial IoT predictive maintenance backend built with **Node 20**, **NestJS 10**, **TypeORM**, and **PostgreSQL**. The platform features real-time multivariate sensor anomaly detection, Remaining Useful Life (RUL) trajectory forecasting, an expert repair assistant grounded in reliability rules and Claude AI, and Socket.io live streaming.

---

## Key Capabilities

- **Multivariate Sensor Anomaly Detection**:
  - **Z-Score Detector**: Fast baseline statistical deviation with normalized sigmoid scoring.
  - **Isolation Forest**: Multi-tree isolation ensemble for high-dimensional non-linear sensor anomalies.
  - **Local Outlier Factor (LOF)**: Density-based local reachability outlier identification.
  - **One-Class SVM Lite**: RBF kernel Hilbert space boundary calculation.
  - **TF.js Dense Autoencoder**: Deep neural network reconstruction error detector with model persistence.
  - **TF.js LSTM Autoencoder**: Temporal recurrent autoencoder for time-series sequence deviations.
  - **Ensemble Detector**: Weighted score fusion and majority voting across independent detector algorithms.
- **Root Cause & Severity Analysis**:
  - Identifies which sensor metric deviated first and most significantly ($\sigma$-score).
  - Categorizes severity into **Critical**, **Warning**, and **Info** tiers based on magnitude and critical thresholds.
  - Pairwise Pearson correlation matrix calculation.
- **Remaining Useful Life (RUL) Estimation**:
  - Translates multi-sensor degradation into a continuous Health Index ($HI(t) \in [0, 1]$).
  - Fits exponential / Weibull degradation curves to extrapolate time to `failureThreshold`.
  - Computes 90% confidence bands (`etaDays`, `lowerDays`, `upperDays`).
- **Expert Repair Assistant**:
  - Matches anomalies to an industrial engineering knowledge base (`rules.json`).
  - Delivers ordered, actionable maintenance steps and safety precautions.
  - Generates technical explanations via Claude (`@anthropic-ai/sdk`) grounded strictly in empirical data and matched engineering rules.
- **Background Job Processing (BullMQ + Redis)**:
  - Heavy neural network training runs off the request thread in BullMQ background workers.
  - Model weights saved to disk (`TF.js model.save`) and reloaded for low-latency inference.
- **Live Stream Gateway (Socket.io)**:
  - `ws://localhost:3000/live`: Ingests sliding-window sensor streams and broadcasts real-time anomaly alerts.
- **Interactive Swagger Documentation**:
  - Fully typed DTO validation and OpenAPI documentation hosted at `/docs`.

---

## Tech Stack

| Component | Technology |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | NestJS 10 |
| Database | PostgreSQL 16 + TypeORM |
| Background Queues | BullMQ + Redis 7 |
| Machine Learning | `@tensorflow/tfjs`, `simple-statistics`, `ml-matrix` |
| Streaming | `@nestjs/websockets`, `socket.io` |
| CSV Ingestion | `csv-parse`, `multer` |
| AI Repair Engine | `@anthropic-ai/sdk` (Claude 3.5 Sonnet) |
| API Documentation | `@nestjs/swagger` (Swagger UI at `/docs`) |
| Testing | Jest (`npm test`) |

---

## Project Structure

```text
src/
├── main.ts                    # Bootstrap, CORS, ValidationPipe, Swagger (/docs)
├── app.module.ts              # Root application module with database & queues
├── config/
│   ├── configuration.ts       # Typed environment configuration
│   └── env.validation.ts      # class-validator environment validation
├── common/
│   ├── filters/               # Global AllExceptionsFilter with structured logging
│   ├── interceptors/          # LoggingInterceptor & TransformInterceptor
│   └── dto/                   # PaginationDto
├── systems/                   # Monitored equipment CRUD (Turbines, Compressors, Pumps)
│   ├── entities/system.entity.ts
│   ├── systems.controller.ts
│   └── systems.service.ts
├── datasets/                  # CSV upload, schema parsing, time-series storage
│   ├── entities/dataset.entity.ts
│   ├── entities/metric-row.entity.ts
│   ├── datasets.controller.ts
│   └── datasets.service.ts
├── detection/                 # Detection orchestration, models & algorithms
│   ├── entities/detection-run.entity.ts
│   ├── entities/anomaly.entity.ts
│   ├── entities/trained-model.entity.ts
│   ├── detection.controller.ts
│   ├── detection.service.ts
│   └── detectors/
│       ├── detector.interface.ts     # Common IDetector interface
│       ├── detector.factory.ts       # Algorithm instantiation factory
│       ├── zscore.detector.ts        # Statistical Z-score
│       ├── isolation-forest.detector.ts # Tree-based Isolation Forest
│       ├── lof.detector.ts           # Local Outlier Factor
│       ├── ocsvm-lite.detector.ts    # RBF Kernel One-Class SVM
│       ├── autoencoder.detector.ts   # TF.js Dense Autoencoder
│       ├── lstm-autoencoder.detector.ts # TF.js LSTM Autoencoder
│       └── ensemble.detector.ts      # Weighted Majority Vote Ensemble
├── preprocessing/             # Missing values imputation, scaling, sliding windows
├── rul/                       # Health Index & Remaining Useful Life estimation
│   ├── entities/rul-result.entity.ts
│   ├── rul.controller.ts
│   └── rul.service.ts
├── root-cause/                # Top deviating metric & Pearson correlation analysis
├── severity/                  # Severity classification (Critical / Warning / Info)
├── repair/                    # Repair Assistant & Claude AI explanations
│   ├── repair.controller.ts
│   ├── repair.service.ts
│   └── knowledge-base/rules.json # Industrial reliability rule catalog
├── live/                      # Socket.io real-time sliding-window gateway (/live)
├── reports/                   # Downloadable CSV & statistical summary export
└── jobs/                      # BullMQ workers for heavy model training
```

---

## Database Entities

- **`System`**: Monitored machine or asset (`id`, `name`, `type`, `createdAt`, `updatedAt`).
- **`Dataset`**: Uploaded sensor CSV (`id`, `systemId`, `name`, `columns` (jsonb), `rowCount`, `createdAt`).
- **`MetricRow`**: High-frequency sensor observations (`id`, `datasetId`, `timestamp`, `values` (jsonb)) with compound index on `(datasetId, timestamp)`.
- **`DetectionRun`**: Audit log of detection runs (`id`, `datasetId`, `method`, `params` (jsonb), `status`, `createdAt`).
- **`Anomaly`**: Identified outliers (`id`, `runId`, `timestamp`, `score`, `severity`, `metrics` (jsonb), `rootCause`).
- **`RulResult`**: RUL calculation (`id`, `datasetId`, `healthIndex` (jsonb), `etaDays`, `lowerDays`, `upperDays`, `createdAt`).
- **`TrainedModel`**: Saved models (`id`, `systemId`, `method`, `filePath`, `status`, `metrics` (jsonb), `trainedAt`).

---

## Quickstart Setup

### Option 1: Run with Docker Compose (Recommended)

Spins up PostgreSQL 16, Redis 7, and the NestJS Platform API in one command:

```bash
# From workspace root or Anomaly-Detection-BE-
docker compose up --build
```

- **API**: `http://localhost:3000`
- **Swagger Docs**: `http://localhost:3000/docs`
- **WebSocket Gateway**: `ws://localhost:3000/live`

---

### Option 2: Local Development Setup

#### 1. Prerequisites
- **Node.js**: v20.x
- **PostgreSQL**: Running locally on port 5432
- **Redis**: Running locally on port 6379

#### 2. Install Dependencies
```bash
cd Anomaly-Detection-BE-
npm install --legacy-peer-deps
```

#### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure database credentials match your local PostgreSQL instance:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=anomaly_detection
REDIS_HOST=localhost
REDIS_PORT=6379
ANTHROPIC_API_KEY=your_key_here # Optional
MODEL_STORAGE_PATH=./storage/models
```

#### 4. Build & Start the Server
```bash
npm run build
npm run start:dev
```

---

## API Endpoints Reference

### 1. Systems Management
- `POST /api/systems` - Register a monitored system (`{ name, type }`)
- `GET /api/systems` - List monitored systems
- `GET /api/systems/:id` - Get system details

### 2. Dataset Ingestion
- `POST /api/datasets/upload` - Multipart CSV upload (requires a timestamp column + numeric sensor columns)
- `GET /api/datasets/:id/preview` - Preview columns, row count, and first $N$ rows
- `GET /api/datasets` - List uploaded datasets

### 3. Anomaly Detection
- `POST /api/detection/run` - Execute anomaly detection:
  ```json
  {
    "datasetId": "uuid-here",
    "method": "ensemble",
    "sensitivity": 0.8,
    "windowSize": 10
  }
  ```
  *Available methods: `zscore`, `isolation_forest`, `lof`, `ocsvm`, `autoencoder`, `lstm_ae`, `ensemble`*
- `GET /api/detection/:runId/results` - Get detection summary and anomaly list

### 4. Background Model Training (BullMQ)
- `POST /api/models/train` - Enqueue model training job into background worker:
  ```json
  {
    "systemId": "uuid-here",
    "datasetId": "uuid-here",
    "method": "autoencoder",
    "epochs": 30,
    "batchSize": 32
  }
  ```
- `GET /api/models/:id/status` - Poll training status (`QUEUED`, `TRAINING`, `COMPLETED`, `FAILED`) and metrics

### 5. Remaining Useful Life (RUL)
- `POST /api/rul/estimate` - Estimate RUL trajectory:
  ```json
  {
    "datasetId": "uuid-here",
    "failureThreshold": 0.25
  }
  ```
  *Returns `etaDays`, `lowerDays`, `upperDays`, and `healthIndexHistory`*

### 6. Repair Assistant & AI Diagnostics
- `GET /api/repair/:anomalyId` - Returns problem title, severity, root cause, ordered repair steps, safety precautions, and Claude AI explanation.

### 7. Reports & Export
- `GET /api/reports/anomalies/:runId/csv` - Download anomaly findings as CSV report
- `GET /api/reports/summary/:runId` - Statistical aggregation of detection run

### 8. Live WebSocket Stream (`socket.io`)
- Connect to namespace: `ws://localhost:3000/live`
- Emit:
  ```json
  // Event: "metrics:stream"
  {
    "systemId": "uuid-here",
    "timestamp": "2026-10-30T12:00:00Z",
    "values": {
      "vibration": 4.85,
      "temperature": 94.2,
      "pressure": 112.5
    }
  }
  ```
- Listen for real-time anomaly alerts:
  ```javascript
  socket.on('anomaly', (data) => {
    console.log(`Alert on system ${data.systemId}: Severity ${data.severity}, Score ${data.score}`);
  });
  ```

---

## Running Unit Tests

Execute the full Jest test suite across detectors, preprocessing, RUL, severity, and repair services:

```bash
npm test
```

To run with coverage reporting:
```bash
npm run test:cov
```
