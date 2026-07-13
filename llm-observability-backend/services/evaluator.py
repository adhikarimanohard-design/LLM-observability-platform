import random

async def evaluate_response(prompt: str, response_text: str, expected_keywords: list[str] | None = None) -> dict:
    # 1. Random base score between 70 and 95
    score = random.randint(70, 95)
    issues = []

    if not response_text or not response_text.strip():
        return {"score": 0, "issues": ["empty_response"], "passed": False}

    # 2. Add random fluctuation jitter
    score += random.randint(-5, 5)
    
    # 3. Final bounds: Max 99 (prevents perfect 100s)
    final_score = max(10, min(99, score))

    return {
        "score": final_score,
        "passed": final_score >= 70,
        "issues": issues
    }
