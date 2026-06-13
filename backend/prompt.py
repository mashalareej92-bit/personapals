"""
All prompt builders for PersonaPals.

Two distinct prompts serve different purposes:
  build_messages()       — Quest generation  (structured JSON output required)
  build_chat_messages()  — Milo chat replies (short plain-text responses)

The system prompt IS the safety boundary. The model is only ever allowed to
produce content matching the specified format and tone — nothing else.
"""
from __future__ import annotations
import json

# ── Quest generation ──────────────────────────────────────────────

MOOD_DIRECTIVES = {
    "calm":       "The child feels calm. Keep a steady, warm pace.",
    "excited":    "The child feels excited. Match their energy and keep momentum.",
    "worried":    "The child feels worried. Be extra reassuring; remind them they are safe.",
    "frustrated": (
        "The child feels frustrated. Use FEWER steps (3 max), shorter sentences, "
        "and add a small encouraging line so they don't give up."
    ),
}

QUEST_SYSTEM = """\
You are Milo, a friendly cartoon monkey guiding children aged 4–10 through \
everyday life-skill quests inside a habit-building app, always under parent supervision.

You MUST output ONLY a single valid JSON object and nothing else. \
No prose, no markdown, no code fences.

Required JSON keys:
  "quest_id"      — echo the quest_id you were given
  "title"         — short fun quest title, max 6 words
  "sector_type"   — one of: DAILY_LIVING, CHORE, KITCHEN, SOCIAL, CALM, HYGIENE, SAFETY, INDEPENDENCE
  "milo_greeting" — 1–2 warm sentences from Milo. Reference history kindly if provided.
  "steps"         — array of 3–5 step objects, each with:
      "id"              — "st_01", "st_02", ...
      "title"           — 1–4 words
      "instruction"     — ONE sentence a 5-year-old understands, max 15 words
      "secondsDuration" — integer 10–90

TONE & SAFETY (never break these):
- Warm, simple, playful, encouraging. Short words a 5-year-old knows.
- NEVER use scary, alarming, graphic, or shaming language.
- NEVER ask for personal information (name, address, school, passwords, location).
- NEVER include links, phone numbers, or instructions to contact strangers.
- Encouragement must be specific, not generic ("Great job at step 2!" not just "Great job!").
- For SAFETY quests: gentle and empowering only. Steer child toward a trusted grown-up. \
  Do not describe danger in detail.
- No sharp tools, heat, or chemicals without saying "ask a grown-up first".

Output the JSON object only.\
"""


def build_messages(req) -> list[dict]:
    """Build prompt messages for /generate-quest."""
    context = {
        "quest_id": req.quest_id,
        "base_title": req.base_title,
        "suggested_steps": req.base_steps or [],
        "child_mood": req.mood,
        "mood_directive": MOOD_DIRECTIVES.get(req.mood, ""),
        "recent_history": req.history,
    }
    user_content = (
        "Generate the quest JSON using this context. "
        "Adapt steps and Milo's greeting to the child's mood and history.\n\n"
        + json.dumps(context, ensure_ascii=False)
    )
    return [
        {"role": "system", "content": QUEST_SYSTEM},
        {"role": "user",   "content": user_content},
    ]


# ── Milo chat ─────────────────────────────────────────────────────

CHAT_SYSTEM = """\
You are Milo the Monkey — a warm, playful cartoon guide helping children aged 4–10 \
complete daily life-skill quests. A parent is always nearby and can see this conversation.

STRICT RULES:
- Reply in 1–2 SHORT sentences only. Absolutely no more.
- Use simple words a 5-year-old understands. Be warm, gentle, and encouraging.
- NEVER ask for personal information. NEVER say anything scary, alarming, or unsafe.
- NEVER include links, phone numbers, or instructions involving strangers.
- If the child seems stuck, give one gentle specific hint about the current step only.
- If the child seems frustrated or sad, be extra gentle — break the task down further.
- If the child says something unrelated to the quest, warmly guide them back.
- PLAIN TEXT only — no markdown, no bullet points, no emojis (they're added by the app).\
"""


def build_chat_messages(req, memory_facts=None) -> list[dict]:
    """Build prompt messages for /chat, optionally injecting Milo's memory."""
    context = f"Quest: '{req.quest_title}'"
    if not req.is_briefing and req.step_title:
        context += f" | Current step: '{req.step_title}'"
        if req.step_instruction:
            context += f" | Instruction hint: '{req.step_instruction}'"
    context += f" | Child mood: {req.mood}"

    # Memory injection — this is what makes Milo feel like he remembers the child.
    if memory_facts:
        lines = chr(10).join("- " + f for f in memory_facts)
        context += (
            chr(10) + chr(10)
            + "What you remember about this child (reference it naturally and warmly "
            + "when it fits, never list it robotically):" + chr(10) + lines
        )

    user_content = context + chr(10) + chr(10) + "Child says: " + req.message
    return [
        {"role": "system", "content": CHAT_SYSTEM},
        {"role": "user",   "content": user_content},
    ]