from fastapi import APIRouter
from datetime import datetime, timezone

from models.schemas import EvalRunRequest
from services.llm_client import call_llm
from services.evaluator import evaluate_response
from services.db import evaluations_collection, prompts_collection
from bson import ObjectId

router = APIRouter()


@router.post("/eval/run")
async def run_eval(payload: EvalRunRequest):
    prompt_doc = await prompts_collection.find_one({"_id": ObjectId(payload.prompt_version_id)})
    template = prompt_doc["template"] if prompt_doc else ""

    results = []
    for case in payload.test_cases:
        rendered_prompt = template.replace("{input}", case.get("input", ""))
        llm_result = await call_llm(rendered_prompt)
        evaluation = await evaluate_response(
            rendered_prompt, llm_result.text, expected_keywords=case.get("expected_keywords")
        )
        results.append(
            {
                "input": case.get("input"),
                "response_text": llm_result.text,
                "latency_ms": round(llm_result.latency_ms, 2),
                "cost_usd": llm_result.cost_usd,
                "evaluation": evaluation,
            }
        )

    pass_count = sum(1 for r in results if r["evaluation"]["passed"])
    summary = {
        "prompt_version_id": payload.prompt_version_id,
        "total_cases": len(results),
        "passed": pass_count,
        "pass_rate": round(pass_count / len(results), 2) if results else 0,
        "results": results,
        "run_at": datetime.now(timezone.utc),
    }

    await evaluations_collection.insert_one(summary)
    summary.pop("_id", None)
    return summary
