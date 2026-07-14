from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class CompleteRequest(BaseModel):
    prompt: str
    prompt_version_id: Optional[str] = None
    model: Optional[str] = None
    temperature: float = 0.7
    expected_keywords: Optional[list[str]] = None
    input_variables: Optional[Dict[str, Any]] = None


class CompleteResponse(BaseModel):
    response_text: str
    latency_ms: float
    prompt_tokens: int
    completion_tokens: int
    cost_usd: float
    evaluation: dict
    error: Optional[str] = None


class PromptVersionCreate(BaseModel):
    name: str
    template: str
    description: Optional[str] = None


class PromptVersion(PromptVersionCreate):
    id: str
    created_at: datetime
    avg_score: Optional[float] = None
    call_count: int = 0


class EvalRunRequest(BaseModel):
    prompt_version_id: str
    test_cases: list[dict] = Field(
        default_factory=list,
        description="Each item: {'input': str, 'expected_keywords': [str]}",
    )


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
