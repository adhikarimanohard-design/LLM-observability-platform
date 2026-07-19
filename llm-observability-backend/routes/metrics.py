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
    # Sort chronologically — without this, cursor order isn't guaranteed and
    # the trend line could zig-zag out of time order.
    cursor = requests_collection.find({"created_at": {"$gte": since}}).sort("created_at", 1)
    docs = [doc async for doc in cursor]

    total_calls = len(docs)
    total_cost = sum(d.get("cost_usd", 0) for d in docs)
    error_count = sum(1 for d in docs if d.get("error"))
    latencies = sorted(d.get("latency_ms", 0) for d in docs)
    failed_evals = sum(
        1 for d in docs if d.get("evaluation") and not d["evaluation"].get("passed", True)
    )

    # --- Trend series -----------------------------------------------------
    # Previous version always rolled requests up into 1-hour buckets. During
    # normal testing/demo usage (a handful of calls inside the same hour),
    # that produced a SINGLE bucket -> a single (x, y) point -> an AreaChart
    # with nothing to draw a line/area between, which looked like the graph
    # was broken.
    #
    # Fix: plot one point per request (chronological) so the chart updates
    # after every single test call. Only fall back to time-bucketed rollups
    # once there's enough volume that per-request points would overcrowd
    # the chart.
    docs_with_ts = [d for d in docs if d.get("created_at")]

    if len(docs_with_ts) <= 60:
        timeseries = [
            {
                "bucket": d["created_at"].strftime("%H:%M:%S"),
                "calls": 1,
                "cost_usd": round(d.get("cost_usd", 0), 6),
                "avg_latency_ms": round(d.get("latency_ms", 0), 2),
            }
            for d in docs_with_ts
        ]
    else:
        bucket_minutes = 5 if hours <= 6 else 60
        buckets: dict[str, dict] = {}
        for d in docs_with_ts:
            ts = d["created_at"]
            floor_minute = (ts.minute // bucket_minutes) * bucket_minutes
            rounded = ts.replace(minute=floor_minute, second=0, microsecond=0)
            bucket_key = rounded.strftime(
                "%m-%d %H:%M" if bucket_minutes < 60 else "%Y-%m-%d %H:00"
            )
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