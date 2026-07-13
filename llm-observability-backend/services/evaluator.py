import random

async def evaluate_response(prompt: str, response_text: str, expected_keywords: list[str] | None = None) -> dict:
    issues = []
    # 1. Start with a randomized base between 70 and 98 to force immediate fluctuation
    score = random.randint(70, 98)

    if not response_text or not response_text.strip():
        return {"score": 0, "issues": ["empty_response"], "passed": False}

    # 2. Heuristic Penalties
    word_count = len(response_text.split())
    if word_count < 15:
        score -= random.randint(5, 15)
        issues.append("too_short")
    
    # 3. Add jitter (-3 to +3) to simulate subjectivity
    score += random.randint(-3, 3)

    # 4. Final bounds check
    final_score = max(5, min(100, score))

    return {
        "score": final_score,
        "issues": issues,
        "word_count": word_count,
        "passed": final_score >= 70,
    }
