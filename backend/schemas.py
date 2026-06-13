"""
All Pydantic data contracts for PersonaPals.

Every piece of child-facing text MUST flow through these schemas.
Nothing reaches the app without passing Pydantic validation first.
"""
from __future__ import annotations
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator

Mood = Literal["calm", "excited", "worried", "frustrated"]


# ── Quest Generation ──────────────────────────────────────────────

class GenerateQuestRequest(BaseModel):
    child_id: str = Field(..., description="Pseudonymous id — never a real name or PII.")
    quest_id: str
    mood: Mood = "calm"
    base_title: Optional[str] = None
    base_steps: Optional[List[str]] = None
    # Pre-summarised history lines from client. Max 10 to keep prompt small.
    history: List[str] = Field(default_factory=list, max_length=10)


class QuestStep(BaseModel):
    id: str
    title: str = Field(..., max_length=40)
    instruction: str = Field(..., max_length=160)
    secondsDuration: int = Field(..., ge=5, le=180)

    @field_validator("title", "instruction")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("must not be blank")
        return v.strip()


class QuestResponse(BaseModel):
    quest_id: str
    title: str = Field(..., max_length=60)
    sector_type: str = "DAILY_LIVING"
    milo_greeting: str = Field(..., max_length=240)
    steps: List[QuestStep] = Field(..., min_length=1, max_length=6)
    source: Literal["ai", "fallback"] = "ai"


# ── Milo Chat ─────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    child_id: str
    quest_id: str
    quest_title: str
    # Current step context — empty strings on the briefing screen.
    step_title: str = ""
    step_instruction: str = ""
    is_briefing: bool = True
    message: str = Field(..., min_length=1, max_length=200)
    mood: Mood = "calm"


class ChatResponse(BaseModel):
    reply: str
    source: Literal["ai", "fallback"] = "ai"


# ── Quest Completion ──────────────────────────────────────────────

class CompleteQuestRequest(BaseModel):
    child_id: str
    quest_id: str
    quest_title: str = ""
    xp_earned: int = Field(default=25, ge=0, le=200)
    # What the child tapped in the Quick Check section.
    step_feedback: Optional[Literal["nailed", "tricky", "help"]] = None
    # Mood at completion — logged so Milo can learn the child's patterns.
    mood: Optional[Mood] = None


class CompleteQuestResponse(BaseModel):
    xp_total: int
    level: int
    level_up: bool
    streak: int
    milo_note: str      # AI-generated personalised note (or fallback)
    source: Literal["ai", "fallback"] = "ai"


# ── Child Profile ─────────────────────────────────────────────────

class ChildProfileResponse(BaseModel):
    child_id: str
    display_name: str = "Explorer"
    xp: int
    level: int
    streak: int
    completed_quests: List[str]
    quests_today: int


class SetNameRequest(BaseModel):
    child_id: str
    display_name: str = Field(..., min_length=1, max_length=30)