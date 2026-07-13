from fastapi import APIRouter, HTTPException, Depends, Header
from datetime import datetime, timezone

from models.schemas import SignupRequest, LoginRequest, TokenResponse, UserOut
from services.db import users_collection
from services.auth import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter()


async def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.split(" ", 1)[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    from bson import ObjectId
    user = await users_collection.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/auth/signup", response_model=TokenResponse)
async def signup(payload: SignupRequest):
    existing = await users_collection.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    doc = {
        "name": payload.name,
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc),
    }
    result = await users_collection.insert_one(doc)
    user_id = str(result.inserted_id)
    token = create_access_token(user_id, doc["email"])

    return TokenResponse(
        access_token=token,
        user=UserOut(id=user_id, name=doc["name"], email=doc["email"]),
    )


@router.post("/auth/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = await users_collection.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    token = create_access_token(user_id, user["email"])

    return TokenResponse(
        access_token=token,
        user=UserOut(id=user_id, name=user["name"], email=user["email"]),
    )


@router.get("/auth/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
    )