# LLM Observability Backend

FastAPI service that logs, evaluates, and monitors LLM API calls (cost, latency, quality).

## Local Setup

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # fill in MONGODB_URI and LLM_API_KEY
uvicorn main:app --reload
```

API docs available at `http://localhost:8000/docs`

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string (free M0 cluster) |
| `LLM_API_KEY` | Groq or Gemini API key |
| `LLM_PROVIDER` | `groq` or `gemini` |
| `LLM_MODEL` | Model name, e.g. `llama-3.1-8b-instant` |
| `FRONTEND_ORIGIN` | Your deployed frontend URL (for CORS) |

If `LLM_API_KEY` is left empty, `/api/complete` returns a stub response instead of failing, so the API stays demoable without live credentials.

## Deploy to Render

1. Push this folder to its own GitHub repo
2. On Render: **New → Web Service → connect repo**
3. Render auto-detects `render.yaml`. If not, set manually:
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables in the Render dashboard (`MONGODB_URI`, `LLM_API_KEY`, `FRONTEND_ORIGIN`)
5. Deploy → note your live URL (e.g. `https://your-app.onrender.com`)
6. Point UptimeRobot at `https://your-app.onrender.com/health` (5 min interval) to avoid free-tier spin-down

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/complete` | Proxies a request to the LLM, logs metadata |
| GET | `/api/metrics` | Returns latency/cost/error aggregates |
| GET | `/api/prompts` | Lists prompt versions and their performance |
| POST | `/api/prompts` | Registers a new prompt version |
| POST | `/api/eval/run` | Runs a golden test set against a prompt version |
| GET | `/health` | Health check |
