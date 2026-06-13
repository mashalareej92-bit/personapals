"""
PersonaPals Backend — FastAPI + Groq + SQLite

Endpoints:
  GET  /health
  POST /chat                → Milo responds, WITH memory of the child's history
  POST /complete-quest      → Award XP, log completion + mood, update streak
  GET  /profile/{child_id}  → Live Level / XP / Streak / history for the app

Persistence: SQLite (personapals.db). XP, streaks, quest history, and mood
all survive server restarts — which is what powers Milo's memory.

Quest *generation* was intentionally removed — quests come from the app's
hand-crafted quests.ts (safer + faster). Milo's intelligence lives in the
conversation and the memory, not in regenerating quest content.
"""
from __future__ import annotations
import logging
import random
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import init_db, get_db
import models
from schemas import (
    ChatRequest, ChatResponse,
    CompleteQuestRequest, CompleteQuestResponse,
    ChildProfileResponse, SetNameRequest,
)
from prompt import build_chat_messages
from groq_client import generate_chat_reply
from safety import is_chat_response_safe

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(name)s  %(message)s")
log = logging.getLogger("personapals")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()                       # create tables on startup if missing
    log.info("PersonaPals backend started — database ready.")
    yield
    log.info("PersonaPals backend shutting down.")


app = FastAPI(title="PersonaPals", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # tighten to your app's origin before production
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"ok": True, "version": "2.0.0"}


# ── Milo chat (with memory) ───────────────────────────────────────

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, db: Session = Depends(get_db)) -> ChatResponse:
    """
    Child sends a message → Milo replies, informed by what he remembers.
    Memory facts (streak, how this quest went last time, recent mood) are
    pulled from the DB and injected into the prompt.
    """
    try:
        memory = models.build_memory_summary(db, req.child_id, req.quest_id)
        messages = build_chat_messages(req, memory_facts=memory)
        reply = (await generate_chat_reply(messages)).strip()

        if not is_chat_response_safe(reply):
            log.warning("Chat safety rejected reply for child %s", req.child_id)
            return ChatResponse(reply=_chat_fallback(req), source="fallback")

        log.info("Chat reply  child=%s  quest=%s  memory_facts=%d",
                 req.child_id, req.quest_id, len(memory))
        return ChatResponse(reply=reply, source="ai")

    except Exception as exc:
        log.warning("Chat failed  child=%s  error=%s", req.child_id, exc)
        return ChatResponse(reply=_chat_fallback(req), source="fallback")


def _chat_fallback(req: ChatRequest) -> str:
    return {
        "worried":    "You're safe and Milo is right here! We'll go nice and slowly together.",
        "frustrated": "Big feelings are totally okay! Let's take one tiny step at a time.",
        "excited":    "I love your energy! Let's channel that and get going!",
        "calm":       "You're doing wonderfully! Keep going — Milo believes in you!",
    }.get(req.mood, "You've got this! Milo is cheering for you every step of the way!")


# ── Quest completion (logs everything that feeds memory) ──────────

@app.post("/complete-quest", response_model=CompleteQuestResponse)
async def complete_quest(req: CompleteQuestRequest, db: Session = Depends(get_db)) -> CompleteQuestResponse:
    profile, levelled_up = models.add_xp(db, req.child_id, req.xp_earned)
    profile = models.record_quest_completion(
        db, req.child_id, req.quest_id,
        quest_title=getattr(req, "quest_title", "") or "",
        feedback=req.step_feedback, xp_earned=req.xp_earned,
    )
    if getattr(req, "mood", None):
        models.record_mood(db, req.child_id, req.quest_id, req.mood)

    note = _completion_note(req)
    log.info("Quest completed  child=%s  quest=%s  xp+%d  level=%d  streak=%d",
             req.child_id, req.quest_id, req.xp_earned, profile.level, profile.streak)

    return CompleteQuestResponse(
        xp_total=profile.xp,
        level=profile.level,
        level_up=levelled_up,
        streak=profile.streak,
        milo_note=note,
        source="fallback",
    )


def _completion_note(req: CompleteQuestRequest) -> str:
    by_feedback = {
        "nailed": [
            "You absolutely crushed it! Every time you do that, you grow a little stronger.",
            "That was brilliant! Milo is doing a happy monkey dance just for you!",
        ],
        "tricky": [
            "That was tough, and you pushed through anyway. That's real bravery!",
            "It wasn't easy, but you did it! That's what makes you an explorer.",
        ],
        "help": [
            "Asking for help is one of the smartest things anyone can do. Well done for trying!",
            "You worked hard and used your team. That's what great explorers do!",
        ],
    }
    pool = by_feedback.get(req.step_feedback or "", [
        "You showed real effort today. Milo is so proud of you!",
        "Every quest you finish makes you a little bit stronger. Amazing work!",
    ])
    return random.choice(pool)


# ── Set child name ────────────────────────────────────────────────

@app.post("/set-name")
async def set_name(req: SetNameRequest, db: Session = Depends(get_db)):
    p = models.set_display_name(db, req.child_id, req.display_name)
    log.info("Name set  child=%s  name=%s", req.child_id, p.display_name)
    return {"ok": True, "display_name": p.display_name}


# ── Reset child progress ──────────────────────────────────────────

@app.post("/reset/{child_id}")
async def reset_child(child_id: str, db: Session = Depends(get_db)):
    p = models.reset_child(db, child_id)
    log.info("Child reset  child=%s", child_id)
    return {"ok": True, "xp": p.xp, "level": p.level, "streak": p.streak}


# ── Child profile ─────────────────────────────────────────────────

@app.get("/profile/{child_id}", response_model=ChildProfileResponse)
async def get_child_profile(child_id: str, db: Session = Depends(get_db)) -> ChildProfileResponse:
    p = models.get_or_create_profile(db, child_id)
    return ChildProfileResponse(
        child_id=p.child_id,
        display_name=p.display_name,
        xp=p.xp,
        level=p.level,
        streak=p.streak,
        completed_quests=models.completed_quest_ids(db, child_id),
        quests_today=models.quests_today(db, child_id),
    )