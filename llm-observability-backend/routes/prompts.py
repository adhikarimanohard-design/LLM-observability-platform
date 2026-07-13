from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from bson import ObjectId

from models.schemas import PromptVersionCreate
from services.db import prompts_collection, requests_collection

router = APIRouter()

def _serialize(doc) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc

@router.get("/prompts")
async def list_prompts():
    cursor = prompts_collection.find().sort("created_at", -1)
    prompts = [_serialize(doc) async for doc in cursor]

    # attach lightweight performance stats per prompt version
    for p in prompts:
        related = requests_collection.find({"prompt_version_id": p["id"]})
        
        scores = []
        count = 0
        async for r in related:
            count += 1
            ev = r.get("evaluation")
            if ev and "score" in ev:
                scores.append(ev["score"])
        
        p["call_count"] = count
        p["avg_score"] = round(sum(scores) / len(scores), 2) if scores else None

    return prompts

@router.post("/prompts")
async def create_prompt(payload: PromptVersionCreate):
    # Added check to prevent duplicate prompt versions crashing the endpoint
    existing = await prompts_collection.find_one({"name": payload.name})
    if existing:
        raise HTTPException(status_code=409, detail="Prompt version already exists")

    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc)
    
    result = await prompts_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    
    return doc

@router.get("/prompts/{prompt_id}")
async def get_prompt(prompt_id: str):
    doc = await prompts_collection.find_one({"_id": ObjectId(prompt_id)})
    
    if not doc:
        raise HTTPException(status_code=404, detail="Prompt version not found")
        
    return _serialize(doc)
