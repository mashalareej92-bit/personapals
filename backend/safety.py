"""
Two-layer content safety.

Layer 1 — Local blocklist (cheap, synchronous, runs on every response).
Layer 2 — Groq safeguard model stub (production opt-in via USE_SAFEGUARD=1).

The chat path uses a lighter check than quest generation because chat responses
are much shorter and already constrained by the system prompt.
"""
from __future__ import annotations
import os
import re

# Patterns that should never appear in child-facing copy.
_HARD_BLOCK = re.compile(
    r"\bkill\b|\bdie\b|\bblood\b|\bgun\b|\bknife\b|\bstab\b"
    r"|\bstupid\b|\bhate\b|\bdumb\b|\bugly\b|\bidiot\b"
    r"|https?://|www\."
    r"|\bpassword\b|\baddress\b|\bphone.?number\b|\bcredit.?card\b"
    r"|\bstranger\b|\bsecret\b",
    re.IGNORECASE,
)

# Patterns that are fine in adult content but odd in a children's response.
# Used as a lighter check for short chat replies.
_CHAT_EXTRA = re.compile(
    r"\b(adult|violent|weapon|drug|alcohol|smoke|sex|naked)\b",
    re.IGNORECASE,
)


def content_is_safe(texts: list[str]) -> bool:
    """Full safety check for quest generation output (greeting + step instructions)."""
    for t in texts:
        if t and _HARD_BLOCK.search(t):
            return False
    return True


def is_chat_response_safe(text: str) -> bool:
    """Lighter check for short Milo chat replies."""
    if _HARD_BLOCK.search(text):
        return False
    if _CHAT_EXTRA.search(text):
        return False
    # Reject anything suspiciously long (model going off-script)
    if len(text.split()) > 60:
        return False
    return True


async def safeguard_pass(texts: list[str]) -> bool:
    """
    Optional third layer: Groq's dedicated safety model.
    Enable in production by setting USE_SAFEGUARD=1 in .env, then wire the
    TODO below the same way as groq_client._call().
    """
    if os.getenv("USE_SAFEGUARD", "0") != "1":
        return True
    # TODO: POST to Groq with model="llama-guard-3-8b" and return False on any flag.
    return True