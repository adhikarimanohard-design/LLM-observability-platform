from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from bson import ObjectId

from models.schemas import CompleteRequest, CompleteResponse
from services.db import requests_collection, prompts_collection
from services.llm_client import call_llm
from services.evaluator import evaluate_response

router = APIRouter()


async def _render_prompt(payload: CompleteRequest) -> str:
    if not payload.prompt_version_id:
        if not payload.prompt:
            raise HTTPException(status_code=400, detail="Prompt text or a valid prompt_version_id is required")
        return payload.prompt

    prompt_doc = await prompts_collection.find_one({"_id": ObjectId(payload.prompt_version_id)})
    if not prompt_doc:
        raise HTTPException(status_code=404, detail="Prompt version not found")

    template = prompt_doc.get("template", "")

    if payload.input_variables:
        try:
            return template.format(**payload.input_variables)
        except (KeyError, ValueError) as e:
            raise HTTPException(status_code=422, detail=f"Invalid template substitution: {str(e)}")

    return template


@router.post("/complete", response_model=CompleteResponse)
async def complete(payload: CompleteRequest):
    prompt_text = await _render_prompt(payload)

    llm_result = await call_llm(prompt=prompt_text, model=payload.model)

    # Evaluator is synchronous — do NOT await it
    evaluation = evaluate_response(
        prompt_text, llm_result.text, expected_keywords=payload.expected_keywords
    )

    log_entry = {
        "prompt": prompt_text,
        "prompt_version_id": payload.prompt_version_id,
        "model": payload.model,
        "response_text": llm_result.text,
        "prompt_tokens": llm_result.prompt_tokens,
        "completion_tokens": llm_result.completion_tokens,
        "latency_ms": llm_result.latency_ms,
        "cost_usd": llm_result.cost_usd,
        "evaluation": evaluation,
        "error": llm_result.raw_error,
        "created_at": datetime.now(timezone.utc),
    }
    # Log every call — including failures — so the dashboard reflects real reliability
    await requests_collection.insert_one(log_entry)

    return CompleteResponse(
        response_text=llm_result.text,
        latency_ms=round(llm_result.latency_ms, 2),
        prompt_tokens=llm_result.prompt_tokens,
        completion_tokens=llm_result.completion_tokens,
        cost_usd=llm_result.cost_usd,
        evaluation=evaluation,
        error=llm_result.raw_error,
    )
