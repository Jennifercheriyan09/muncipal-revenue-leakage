"""Provider-agnostic LLM client.

Preference order, all optional:
  1. Groq  — if GROQ_API_KEY is set (fast, cloud)
  2. Ollama — local, no key required (offline default)
  3. None  — caller falls back to rule-based text

Every call is defensive: any failure returns None rather than raising,
so the fraud pipeline never breaks because an LLM was unavailable.
"""

import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


async def generate_narrative(prompt: str, max_tokens: int = 350) -> str | None:
    """Generate a text narrative from a prompt, trying providers in order.

    Returns the generated text, or None if no provider produced a result.
    """
    if settings.groq_api_key:
        text = await _try_groq(prompt, max_tokens)
        if text:
            return text

    text = await _try_ollama_chat(prompt)
    if text:
        return text

    logger.info("No LLM provider available; caller should use rule-based fallback.")
    return None


async def _try_groq(prompt: str, max_tokens: int) -> str | None:
    try:
        from groq import AsyncGroq

        client = AsyncGroq(api_key=settings.groq_api_key)
        response = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:
        logger.warning("Groq call failed, will try Ollama: %s", exc)
        return None


async def _try_ollama_chat(prompt: str) -> str | None:
    """Call a local Ollama chat model. No API key needed. Fails fast."""
    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(
                f"{settings.ollama_base_url}/api/chat",
                json={
                    "model": settings.ollama_chat_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False,
                    "options": {"temperature": 0.3},
                },
            )
            resp.raise_for_status()
            data = resp.json()
            content = data.get("message", {}).get("content", "").strip()
            return content or None
    except Exception as exc:
        logger.warning("Ollama chat call failed, falling back to rule-based text: %s", exc)
        return None


async def embed_text(text: str) -> list[float] | None:
    """Return an embedding vector for text via Ollama, or None on failure."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{settings.ollama_base_url}/api/embeddings",
                json={"model": settings.ollama_embed_model, "prompt": text},
            )
            resp.raise_for_status()
            embedding = resp.json().get("embedding")
            if embedding and isinstance(embedding, list):
                return embedding
            return None
    except Exception as exc:
        logger.warning("Ollama embedding call failed: %s", exc)
        return None
