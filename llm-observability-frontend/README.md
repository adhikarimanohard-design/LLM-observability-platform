# LLM Observability Frontend

React dashboard for the LLM Observability & Evaluation Platform — metric cards, latency/cost trend chart, live test console, and prompt version tracking.

## Local Setup

```bash
npm install
cp .env.example .env      # set VITE_API_BASE_URL to your backend URL
npm run dev
```

Runs at `http://localhost:5173` by default.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | URL of the deployed backend (e.g. `https://your-app.onrender.com`) |

## Deploy to Vercel

1. Push this folder to its own GitHub repo
2. On Vercel: **New Project → import repo**
3. Vercel auto-detects Vite. Confirm:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variable `VITE_API_BASE_URL` pointing to your live Render backend URL
5. Deploy → your dashboard is live

## Build Locally

```bash
npm run build
npm run preview
```
