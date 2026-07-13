"""Lightweight, dependency-free evaluation heuristics.

These are intentionally simple (length checks, refusal/error detection,
keyword coverage) so the project runs on a free tier with no extra ML
dependencies, while still demonstrating the evaluation-layer concept used
in real LLM observability platforms.
"""

import random

REFUSAL_MARKERS = [
    "i cannot", "i can't", "i'm not able to", "as an ai", "i won't",
    "i am a large language model", "i don't know"
]

async def evaluate_response(prompt: str, response_text: str, expected_keywords: list[str] | None = None) -> dict:
    issues = []
    score = 100

    if not response_text or not response_text.strip():
        issues.append("empty_response")
        score -= 100
        return {
            "score": max(0, min(100, score)),
            "issues": issues,
            "word_count": 0,
            "keyword_coverage": None,
            "passed": False,
        }

    word_count = len(response_text.split())
    if word_count < 15:
        issues.append("too_short")
        score -= 15
    elif word_count > 400:
        issues.append("unusually_long")
        score -= 10

    lowered = response_text.lower()
    if any(marker in lowered for marker in REFUSAL_MARKERS):
        issues.append("possible_refusal")
        score -= 25

    if "{" in response_text or "}" in response_text:
        issues.append("unformatted_template_variables")
        score -= 10

    keyword_coverage = None
    if expected_keywords:
        found = [kw for kw in expected_keywords if kw.lower() in lowered]
        keyword_coverage = round(len(found) / len(expected_keywords), 2) if expected_keywords else None
        if keyword_coverage is not None and keyword_coverage < 0.5:
            issues.append("low_keyword_coverage")
            score -= 20

    score -= random.randint(0, 10)

    score = max(0, min(100, score))

    return {
        "score": score,
        "issues": issues,
        "word_count": word_count,
        "keyword_coverage": keyword_coverage,
        "passed": score >= 75,
    }
