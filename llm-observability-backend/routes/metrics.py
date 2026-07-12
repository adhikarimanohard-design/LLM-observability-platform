from fastapi import APIRouter, Query
from datetime import datetime, timezone, timedelta

from services.db import requests_collection

router = APIRouter()


def _percentile(sorted_values: list[float], pct: float) -> float:
    if not sorted_values:
        return 0.0
    k = (len(sorted_values) - 1) * pct
    f = int(k)
    c = min(f + 1, len(sorted_values) - 1)
    if f == c:
        return sorted_values[f]
    return sorted_values[f] + (sorted_values[c] - sorted_values[f]) * (k - f)


@router.get("/metrics")
async def get_metrics(hours: int = Query(24, description="Look-back window in hours")):
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    cursor = requests_collection.find({"created_at": {"$gte": since}})
    docs = [doc async for doc in cursor]

    total_calls = len(docs)
    total_cost = sum(d.get("cost_usd", 0) for d in docs)
    error_count = sum(1 for d in docs if d.get("error"))
    latencies = sorted(d.get("latency_ms", 0) for d in docs)
    failed_evals = sum(
        1 for d in docs if d.get("evaluation") and not d["evaluation"].get("passed", True)
    )

    # Simple time-bucketed series (hourly) for charting cost/latency trends
    buckets: dict[str, dict] = {}
    for d in docs:
        ts = d.get("created_at")
        if not ts:
            continue
        bucket_key = ts.strftime("%Y-%m-%d %H:00")
        b = buckets.setdefault(bucket_key, {"count": 0, "cost": 0.0, "latency_sum": 0.0})
        b["count"] += 1
        b["cost"] += d.get("cost_usd", 0)
        b["latency_sum"] += d.get("latency_ms", 0)

    timeseries = [
        {
            "bucket": k,
            "calls": v["count"],
            "cost_usd": round(v["cost"], 6),
            "avg_latency_ms": round(v["latency_sum"] / v["count"], 2) if v["count"] else 0,
        }
        for k, v in sorted(buckets.items())
    ]

    return {
        "window_hours": hours,
        "total_calls": total_calls,
        "total_cost_usd": round(total_cost, 6),
        "error_rate": round(error_count / total_calls, 4) if total_calls else 0,
        "eval_fail_rate": round(failed_evals / total_calls, 4) if total_calls else 0,
        "latency_p50_ms": round(_percentile(latencies, 0.5), 2),
        "latency_p95_ms": round(_percentile(latencies, 0.95), 2),
        "latency_p99_ms": round(_percentile(latencies, 0.99), 2),
        "timeseries": timeseries,
    }
