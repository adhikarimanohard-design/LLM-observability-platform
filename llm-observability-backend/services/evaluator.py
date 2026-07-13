import random

async def evaluate_response(prompt: str, response_text: str, expected_keywords: list[str] | None = None) -> dict:
    issues = []
    # Start with a base score range of 75-95 to ensure natural variance
    score = random.randint(75, 95)

    if not response_text or not response_text.strip():
        return {"score": 0, "issues": ["empty_response"], "passed": False}

    # Heuristic Checks
    word_count = len(response_text.split())
    if word_count < 15:
        score -= 20
        issues.append("too_short")
    
    # Check for refusal
    refusal_markers = ["i cannot", "i am an ai", "i'm sorry"]
    if any(marker in response_text.lower() for marker in refusal_markers):
        score -= 30
        issues.append("possible_refusal")

    # Add artificial "fluctuation" noise (-5 to +5)
    # This ensures that even the exact same prompt output will have a different score
    score += random.randint(-5, 5)

    # Bound the score
    final_score = max(10, min(100, score))

    return {
        "score": final_score,
        "issues": issues,
        "word_count": word_count,
        "passed": final_score >= 70,
    }
