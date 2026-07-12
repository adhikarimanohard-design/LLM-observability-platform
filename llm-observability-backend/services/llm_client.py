import os
import time
import httpx

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "llama-3.1-8b-instant")

# Rough per-1K-token pricing used for cost estimation (USD).
# Update these to match your provider's actual published rates.
PRICING_PER_1K_TOKENS = {
    "groq": {"input": 0.00005, "output": 0.00008},
    "gemini": {"input": 0.000075, "output": 0.0003},
}

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


class LLMCallResult:
    def __init__(self, text, prompt_tokens, completion_tokens, latency_ms, cost_usd, raw_error=None):
        self.text = text
        self.prompt_tokens = prompt_tokens
        self.completion_tokens = completion_tokens
        self.latency_ms = latency_ms
        self.cost_usd = cost_usd
        self.raw_error = raw_error


def _estimate_cost(provider: str, prompt_tokens: int, completion_tokens: int) -> float:
    rates = PRICING_PER_1K_TOKENS.get(provider, PRICING_PER_1K_TOKENS["groq"])
    return round(
        (prompt_tokens / 1000) * rates["input"] + (completion_tokens / 1000) * rates["output"],
        6,
    )


async def call_llm(prompt: str, model: str | None = None) -> LLMCallResult:
    """Calls the configured LLM provider, timing the request and estimating cost.
    Falls back to a stub response if no API key is configured, so the app
    remains demoable without live credentials.
    """
    model = model or LLM_MODEL
    start = time.perf_counter()

    if not LLM_API_KEY:
        latency_ms = (time.perf_counter() - start) * 1000
        stub_text = "[No LLM_API_KEY configured — returning stub response] " + prompt[:120]
        return LLMCallResult(stub_text, len(prompt.split()), 12, latency_ms, 0.0)

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            if LLM_PROVIDER == "groq":
                resp = await client.post(
                    GROQ_URL,
                    headers={"Authorization": f"Bearer {LLM_API_KEY}"},
                    json={
                        "model": model,
                        "messages": [{"role": "user", "content": prompt}],
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                text = data["choices"][0]["message"]["content"]
                usage = data.get("usage", {})
                prompt_tokens = usage.get("prompt_tokens", len(prompt.split()))
                completion_tokens = usage.get("completion_tokens", len(text.split()))

            elif LLM_PROVIDER == "gemini":
                url = GEMINI_URL.format(model=model) + f"?key={LLM_API_KEY}"
                resp = await client.post(
                    url, json={"contents": [{"parts": [{"text": prompt}]}]}
                )
                resp.raise_for_status()
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                prompt_tokens = len(prompt.split())
                completion_tokens = len(text.split())

            else:
                raise ValueError(f"Unsupported LLM_PROVIDER: {LLM_PROVIDER}")

        latency_ms = (time.perf_counter() - start) * 1000
        cost_usd = _estimate_cost(LLM_PROVIDER, prompt_tokens, completion_tokens)
        return LLMCallResult(text, prompt_tokens, completion_tokens, latency_ms, cost_usd)

    except Exception as exc:
        latency_ms = (time.perf_counter() - start) * 1000
        return LLMCallResult("", 0, 0, latency_ms, 0.0, raw_error=str(exc))
