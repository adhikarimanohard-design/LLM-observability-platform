from pydantic import BaseModel
from typing import Optional, Dict, Any

class PromptVersionCreate(BaseModel):
    name: str
    template: str
    description: Optional[str] = None

class CompletionRequest(BaseModel):
    model: str
    temperature: float = 0.7
    prompt: Optional[str] = None
    prompt_version_id: Optional[str] = None
    input_variables: Optional[Dict[str, Any]] = None
