from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from bson import ObjectId

from models.schemas import PromptVersionCreate
from services.db import prompts_collection, requests_collection

router = APIRouter()

def _serialize(doc) -> dict:
    if not doc:
        return doc
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    if "created_at" in doc and isinstance(doc["created_at"], datetime):
        doc["created_at"] = doc["created_at"].isoformat()
    return doc

@router.get("/prompts")
async def list_prompts():
    try:
        pipeline = [
            {
                "$lookup": {
                    "from": "requests_collection",
                    "let": { "pid": { "$toString": "$_id" } },
                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$prompt_version_id", "$$pid"] } } }
                    ],
                    "as": "logs"
                }
            },
            {
                "$project": {
                    "name": 1,
                    "template": 1,
                    "created_at": 1,
                    "call_count": {"$size": "$logs"},
                    "avg_score": {"$avg": "$logs.evaluation.score"}
                }
            },
            {"$sort": {"created_at": -1}}
        ]
        
        cursor = prompts_collection.aggregate(pipeline)
        prompts = [_serialize(doc) async for doc in cursor]

        return prompts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/prompts")
async def create_prompt(payload: PromptVersionCreate):
    try:
        existing = await prompts_collection.find_one({"name": payload.name})
        if existing:
            raise HTTPException(status_code=409, detail="Prompt version already exists")

        doc = payload.model_dump()
        doc["created_at"] = datetime.now(timezone.utc)
        
        result = await prompts_collection.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        
        return _serialize(doc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/prompts/{prompt_id}")
async def get_prompt(prompt_id: str):
    try:
        doc = await prompts_collection.find_one({"_id": ObjectId(prompt_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Prompt version not found")
            
        return _serialize(doc)
    except Exception as e:
        if not isinstance(e, HTTPException):
            raise HTTPException(status_code=500, detail=str(e))
        raise e

@router.delete("/prompts/{prompt_id}")
async def delete_prompt(prompt_id: str):
    try:
        result = await prompts_collection.delete_one({"_id": ObjectId(prompt_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Prompt not found")
        
        await requests_collection.delete_many({
            "$or": [
                {"prompt_version_id": prompt_id},
                {"prompt_version_id": ObjectId(prompt_id)}
            ]
        })
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
