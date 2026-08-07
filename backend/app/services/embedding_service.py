"""Semantic property embedding + Qdrant vector store.

Turns each property into a natural-language descriptor, embeds it via Ollama,
and upserts it into Qdrant. Later, a new property can be matched against the
store by cosine similarity — catching duplicates that exact string matching
misses (typos, transliteration variants, abbreviations).

Every operation is best-effort and returns empty results on failure, so the
fraud analysis pipeline still completes even if Ollama or Qdrant is down.
"""

import logging

from qdrant_client import AsyncQdrantClient, models

from app.core.config import settings
from app.core.llm import embed_text

logger = logging.getLogger(__name__)

_client: AsyncQdrantClient | None = None


def _get_client() -> AsyncQdrantClient:
    global _client
    if _client is None:
        _client = AsyncQdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
    return _client


def property_to_text(prop: dict) -> str:
    """Build the descriptor string that gets embedded."""
    parts = [
        f"Owner: {prop.get('owner_name', '')}",
        f"Address: {prop.get('address', '')}",
        f"Ward: {prop.get('ward_id', '')}",
        f"Usage: {prop.get('usage_type') or prop.get('declared_usage_type', '')}",
    ]
    return " | ".join(str(p) for p in parts)


async def ensure_collection() -> bool:
    """Create the Qdrant collection if it doesn't exist. Returns False on failure."""
    try:
        client = _get_client()
        existing = await client.get_collections()
        names = {c.name for c in existing.collections}
        if settings.qdrant_collection not in names:
            await client.create_collection(
                collection_name=settings.qdrant_collection,
                vectors_config=models.VectorParams(
                    size=settings.embedding_dim, distance=models.Distance.COSINE
                ),
            )
        return True
    except Exception as exc:
        logger.warning("Qdrant ensure_collection failed: %s", exc)
        return False


async def upsert_property(property_id: int, prop: dict) -> bool:
    """Embed a property and store it in Qdrant. Returns False on failure."""
    vector = await embed_text(property_to_text(prop))
    if vector is None:
        return False
    try:
        client = _get_client()
        await client.upsert(
            collection_name=settings.qdrant_collection,
            points=[
                models.PointStruct(
                    id=property_id,
                    vector=vector,
                    payload={
                        "property_uid": prop.get("property_uid"),
                        "owner_name": prop.get("owner_name"),
                        "address": prop.get("address"),
                        "ward_id": prop.get("ward_id"),
                    },
                )
            ],
        )
        return True
    except Exception as exc:
        logger.warning("Qdrant upsert failed for property %s: %s", property_id, exc)
        return False


async def find_similar(property_id: int, prop: dict, limit: int = 5) -> list[dict]:
    """Find semantically similar properties, excluding the property itself.

    Returns a list of duplicate_candidate dicts in the shape the
    duplicate_property_agent expects. Empty list on any failure.
    """
    vector = await embed_text(property_to_text(prop))
    if vector is None:
        return []
    try:
        client = _get_client()
        hits = await client.query_points(
            collection_name=settings.qdrant_collection,
            query=vector,
            limit=limit + 1,
            score_threshold=settings.duplicate_similarity_threshold,
        )
    except Exception as exc:
        logger.warning("Qdrant search failed for property %s: %s", property_id, exc)
        return []

    candidates: list[dict] = []
    for point in hits.points:
        if point.id == property_id:
            continue
        payload = point.payload or {}
        candidates.append(
            {
                "property_uid": payload.get("property_uid", "unknown"),
                "owner_name": payload.get("owner_name", "unknown"),
                "address": payload.get("address", ""),
                "ward_id": payload.get("ward_id"),
                "match_type": _infer_match_type(prop, payload),
                "similarity": round(float(point.score), 3),
            }
        )
    return candidates


def _infer_match_type(prop: dict, candidate: dict) -> str:
    """Classify the match strength using the same tiers the agent scores on."""
    same_owner = (
        str(prop.get("owner_name", "")).strip().lower()
        == str(candidate.get("owner_name", "")).strip().lower()
    )
    same_address = (
        str(prop.get("address", "")).strip().lower()
        == str(candidate.get("address", "")).strip().lower()
    )
    same_ward = prop.get("ward_id") is not None and prop.get("ward_id") == candidate.get("ward_id")

    if same_owner and same_address:
        return "same_owner_same_address"
    if same_owner and same_ward:
        return "same_owner_same_ward"
    return "same_owner"
