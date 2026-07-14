import os
from fastapi import FastAPI, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from routes import complete, metrics, prompts, eval as eval_route, auth as auth_route
from services.db import ping

app = FastAPI(
    title="LLM Observability & Evaluation Platform",
    description="Logs, evaluates, and monitors LLM API calls: cost, latency, and quality.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complete.router, prefix="/api", tags=["complete"])
app.include_router(metrics.router, prefix="/api", tags=["metrics"])
app.include_router(prompts.router, prefix="/api", tags=["prompts"])
app.include_router(eval_route.router, prefix="/api", tags=["eval"])
app.include_router(auth_route.router, prefix="/api", tags=["auth"])


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )


@app.get("/health")
async def health():
    db_ok = await ping()
    return {"status": "ok" if db_ok else "degraded", "db_connected": db_ok}


@app.head("/health")
async def health_head():
    return Response(status_code=200)


@app.get("/")
async def root():
    return {"message": "LLM Observability & Evaluation Platform API", "docs": "/docs"}


@app.head("/")
async def root_head():
    return Response(status_code=200)