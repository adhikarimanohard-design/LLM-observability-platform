from fastapi import APIRouter
from datetime import datetime, timezone

from models.schemas import CompleteRequest, CompleteResponse
from services.llm_client import call_llm
from services.evaluator import evaluate_response
from services.db import requests_collection

router = APIRouter()


@router.post("/complete", response_model=CompleteResponse)
async def complete(payload: CompleteRequest):
    result = await call_llm(payload.prompt, model=payload.model)

    evaluation = evaluate_response(
        payload.prompt, result.text, expected_keywords=payload.expected_keywords
    )

    log_entry = {
        "prompt": payload.prompt,
        "prompt_version_id": payload.prompt_version_id,
        "model": payload.model,
        "response_text": result.text,
        "prompt_tokens": result.prompt_tokens,
        "completion_tokens": result.completion_tokens,
        "latency_ms": result.latency_ms,
        "cost_usd": result.cost_usd,
        "evaluation": evaluation,
        "error": result.raw_error,
        "created_at": datetime.now(timezone.utc),
    }
    await requests_collection.insert_one(log_entry)

    return CompleteResponse(
        response_text=result.text,
        latency_ms=round(result.latency_ms, 2),
        prompt_tokens=result.prompt_tokens,
        completion_tokens=result.completion_tokens,
        cost_usd=result.cost_usd,
        evaluation=evaluation,
        error=result.raw_error,
    )
