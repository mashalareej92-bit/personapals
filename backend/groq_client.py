"""
Groq API client.

Robust env handling:
  - Loads .env itself (so import order in main.py can't break it).
  - Reads config at CALL time, not import time (so a late .env load still works).
  - MOCK_MODE defaults to "0" (real AI). It only goes mock if you explicitly
    set MOCK_MODE=1 OR no API key is present. This means a corrupted/BOM'd
    first line in .env can never silently force mock mode again.

Models: both quest + chat default to llama-3.1-8b-instant (fastest on Groq).
Override via GROQ_CHAT_MODEL / GROQ_QUEST_MODEL in .env.
"""
from __future__ import annotations
import os
import json
import httpx
from dotenv import load_dotenv

# Load .env right here, when this module is imported — independent of main.py.
load_dotenv()

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


class GroqError(Exception):
    pass


def _cfg() -> dict:
    """Read configuration fresh on every call so env changes always apply."""
    return {
        "key": (os.getenv("GROQ_API_KEY") or "").strip(),
        # Default "0" = real AI. Only "1" forces mock.
        "mock": (os.getenv("MOCK_MODE") or "0").strip() == "1",
        "quest_model": (os.getenv("GROQ_QUEST_MODEL") or "llama-3.1-8b-instant").strip(),
        "chat_model": (os.getenv("GROQ_CHAT_MODEL") or "llama-3.1-8b-instant").strip(),
    }


async def _call(messages: list[dict], model: str, max_tokens: int,
                temperature: float = 0.65, json_mode: bool = False) -> str:
    cfg = _cfg()
    if not cfg["key"]:
        raise GroqError("GROQ_API_KEY is not set")

    payload: dict = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    headers = {
        "Authorization": f"Bearer {cfg['key']}",
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(GROQ_URL, json=payload, headers=headers)
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]
    except httpx.HTTPStatusError as e:
        raise GroqError(f"HTTP {e.response.status_code}: {e.response.text[:200]}") from e
    except (httpx.RequestError, KeyError) as e:
        raise GroqError(str(e)) from e


async def generate_quest_json(messages: list[dict]) -> dict:
    cfg = _cfg()
    if cfg["mock"] or not cfg["key"]:
        return _mock_quest(messages)
    content = await _call(messages, cfg["quest_model"], max_tokens=700, json_mode=True)
    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        raise GroqError(f"Model returned invalid JSON: {e}") from e


async def generate_chat_reply(messages: list[dict]) -> str:
    cfg = _cfg()
    if cfg["mock"] or not cfg["key"]:
        return _mock_chat(messages)
    reply = await _call(messages, cfg["chat_model"], max_tokens=100, temperature=0.7)
    return reply.strip().strip("*_`")


async def generate_json(messages: list[dict]) -> dict:
    return await generate_quest_json(messages)


# ── Mock implementations (only used when MOCK_MODE=1 or no key) ────

def _mock_quest(messages: list[dict]) -> dict:
    try:
        ctx = json.loads(messages[-1]["content"].split("\n\n", 1)[-1])
    except (json.JSONDecodeError, IndexError):
        ctx = {}
    qid = ctx.get("quest_id", "demo_quest")
    title = ctx.get("base_title") or "Daily Quest"
    suggested = ctx.get("suggested_steps") or ["Get ready", "Do the task", "Finish up"]
    steps = [
        {"id": f"st_{i:02d}", "title": s[:40],
         "instruction": f"{s}. Take your time and tell Milo when you're done.",
         "secondsDuration": 30}
        for i, s in enumerate(suggested[:5], start=1)
    ]
    return {"quest_id": qid, "title": title[:60], "sector_type": "DAILY_LIVING",
            "milo_greeting": "Let's do this together!", "steps": steps}


def _mock_chat(messages: list[dict]) -> str:
    return "[MOCK MODE] Set MOCK_MODE=0 and a valid GROQ_API_KEY to get real Milo replies."