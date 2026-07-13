from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from bson import ObjectId

from models.schemas import CompletionRequest
from services.db import requests_collection, prompts_collection
from services.llm_client import call_llm
from services.evaluator import evaluate_response

router = APIRouter()

@router.post("/complete")
async def run_completion(payload: CompletionRequest):
    start_time = datetime.now(timezone.utc)
    
    prompt_text = payload.prompt
    if payload.prompt_version_id:
        prompt_doc = await prompts_collection.find_one({"_id": ObjectId(payload.prompt_version_id)})
        if not prompt_doc:
            raise HTTPException(status_code=404, detail="Prompt version not found")
        
        template = prompt_doc.get("template", "")
        
        if payload.input_variables:
            try:
                prompt_text = template.format(**payload.input_variables)
            except KeyError as e:
                raise HTTPException(
                    status_code=422, 
                    detail=f"Missing template variable: {str(e)}"
                )
        else:
            prompt_text = template

    if not prompt_text:
        raise HTTPException(status_code=400, detail="Prompt text or valid prompt_version_id is required")

    llm_result = await call_llm(
        prompt=prompt_text,
        model=payload.model
    )
    
    if llm_result.raw_error:
        raise HTTPException(status_code=502, detail=f"LLM Provider Error: {llm_result.raw_error}")
        
    llm_response = llm_result.text
    tokens_used = llm_result.prompt_tokens + llm_result.completion_tokens
    cost = llm_result.cost_usd

    end_time = datetime.now(timezone.utc)
    latency = (end_time - start_time).total_seconds()

    evaluation = await evaluate_response(prompt_text, llm_response)

    log_doc = {
        "prompt_version_id": payload.prompt_version_id,
        "model": payload.model,
        "prompt": prompt_text,
        "response": llm_response,
        "latency": latency,
        "tokens": tokens_used,
        "cost": cost,
        "evaluation": evaluation,
        "timestamp": start_time
    }
    await requests_collection.insert_one(log_doc)

    return {
        "response": llm_response,
        "metrics": {
            "latency": round(latency, 2),
            "tokens": tokens_used,
            "cost": cost,
            "score": evaluation.get("score")
        }
    }
