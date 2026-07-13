from fastapi import APIRouter, HTTPException
from bson import ObjectId
from bson.errors import InvalidId # <-- Add this import at the top

# ... (keep your GET and POST routes exactly the same) ...

@router.delete("/prompts/{prompt_id}")
async def delete_prompt(prompt_id: str):
    try:
        # 1. Check if frontend passed a bad ID
        if prompt_id == "undefined" or not prompt_id:
            raise HTTPException(status_code=400, detail="Received 'undefined' or missing ID from frontend")

        # 2. Safely parse ObjectId
        try:
            obj_id = ObjectId(prompt_id)
        except InvalidId:
            raise HTTPException(status_code=400, detail=f"Invalid MongoDB ID format: {prompt_id}")

        # 3. Delete the prompt
        result = await prompts_collection.delete_one({"_id": obj_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Prompt not found in database")
        
        # 4. Clean up logs
        await requests_collection.delete_many({
            "$or": [
                {"prompt_version_id": prompt_id},
                {"prompt_version_id": obj_id}
            ]
        })
        
        return {"status": "success", "message": "Prompt and logs deleted"}

    except HTTPException:
        raise # Pass FastAPI HTTP exceptions through directly
    except Exception as e:
        # Catch any other Python crash and send the string to the frontend
        raise HTTPException(status_code=500, detail=f"Server crash: {str(e)}")
