import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/llm_observability")

_client = AsyncIOMotorClient(MONGODB_URI)
db = _client.get_default_database()

requests_collection = db["requests"]
prompts_collection = db["prompts"]
evaluations_collection = db["evaluations"]
alerts_collection = db["alerts"]
users_collection = db["users"]


async def ping() -> bool:
    """Simple connectivity check used by the health endpoint."""
    try:
        await _client.admin.command("ping")
        return True
    except Exception:
        return False