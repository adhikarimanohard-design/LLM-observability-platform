# 🤖 LLM OBSERVABILITY & EVALUATION PLATFORM

A deployed, dynamic full-stack web application built as a placement project. This platform simulates a real-world LLM observability and evaluation dashboard — tracking cost, latency, and quality for every request sent to a language model, similar in spirit to tools like Langfuse and Helicone.

---

# 🖇 LIVE URL
https://llm-observability-platform-seven.vercel.app/

---

# 📌 Project Overview

LLM Observability & Evaluation Platform is designed to demonstrate real-world software engineering and MLOps skills expected in campus placements. The application features a live React frontend connected to a FastAPI backend with MongoDB, tracking every LLM API call in real time and surfacing cost, latency, and error metrics through an interactive dashboard.

---

# 🔢 Quantified Metrics

- Tracks 20+ LLM calls in a rolling 24-hour window
- Per-request cost logged to 6 decimal places (as low as $0.0001 per call)
- P95 latency computed and displayed in real time (~880ms observed)
- 0.0% error rate maintained across logged requests
- Prompt version registry supports unlimited saved templates with call count & average score per version
- Live latency/cost trend chart with hover-based timestamp inspection

---

# 🔑 Key Focus Areas

- Full-stack development
- REST API design for AI/LLM workloads
- Prompt versioning & evaluation tracking
- Real-time metrics aggregation
- Frontend–backend integration
- Cloud deployment

---

# 🌐 Live Deployment

**Frontend:** Deployed React app consuming live APIs
**Backend:** FastAPI REST server handling LLM calls, logging, and metrics aggregation
**Database:** MongoDB storing prompt versions, request logs, and metrics

✔️ Frontend and backend are fully connected and working

---

# 🛠️ Tech Stack

### 👨‍💻 FRONTEND
- React.js
- Recharts / Chart.js (latency & cost trend visualization)
- Responsive dark-themed UI

### 👨‍💻 BACKEND
- Python 3
- FastAPI
- Async request handling
- RESTful APIs

### 👨‍💻 DATABASE
- MongoDB (prompt versions, request logs, aggregated metrics)

### 👨‍💻 DEPLOYMENT AND TOOLS
- Vercel / Render (Frontend & Backend deployment)
- Git & GitHub
- Uvicorn (ASGI server)

---

# ✨ Features

## 📟 Real-Time Dashboard
- Total calls (24h) counter
- Total cost (USD) tracker with micro-cost precision
- Error rate monitor
- P95 latency indicator
- Backend health/status indicator (Online/Offline)

---

## 📈 Latency & Cost Trend
- Dual-axis time-series chart plotting latency (ms) against cost (USD)
- Interactive tooltip showing exact latency and cost at any timestamp
- Auto-updating as new requests are logged

---

## 🧪 Test Console
- Send live prompts directly to the connected LLM
- Automatically logs latency, cost, and response into the metrics pipeline
- Instant response preview after each test call

---

## 🔀 Prompt Version Management
- Save and name multiple prompt templates
- Track calls made and average evaluation score per version
- Delete outdated or underperforming prompt versions
- Compare performance across versions (e.g., summarizer-v1 vs embedding-search-v1)

---

## 🔐 Session Handling
- User session indicator (logged-in user displayed on dashboard)
- Secure logout action

---

# 🧠 Evaluation Logic

- Each logged request is scored and tied to its originating prompt version
- Average score per version calculated across all associated calls
- Enables data-driven comparison of prompt quality over iterations
- P95 latency (not just average) used for a more realistic performance signal under load

---

# 👨‍💻 Author

**Adhikari Manohar Dash**

B.Tech CSE Student
Full Stack & AI Enthusiast
