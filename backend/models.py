"""
Database models + profile logic for PersonaPals (single child for now).

Three tables:
  ChildProfileRow  — XP, level, streak, last active date
  QuestEvent       — one row per completed quest (feeds history + memory)
  MoodEvent        — one row per mood selection (feeds mood patterns + memory)

The get_profile() / record helpers keep the same shape main.py already used,
so the endpoints barely change — they just talk to the DB now instead of a dict.
"""
from __future__ import annotations
import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, Session

from database import Base

XP_PER_LEVEL = 100


# ── Tables ────────────────────────────────────────────────────────

class ChildProfileRow(Base):
    __tablename__ = "child_profiles"

    child_id: Mapped[str] = mapped_column(String, primary_key=True)
    display_name: Mapped[str] = mapped_column(String, default="Explorer")
    xp: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[int] = mapped_column(Integer, default=1)
    streak: Mapped[int] = mapped_column(Integer, default=0)
    last_active_date: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class QuestEvent(Base):
    __tablename__ = "quest_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[str] = mapped_column(String, index=True)
    quest_id: Mapped[str] = mapped_column(String)
    quest_title: Mapped[str] = mapped_column(String, default="")
    feedback: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # nailed/tricky/help
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())


class MoodEvent(Base):
    __tablename__ = "mood_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[str] = mapped_column(String, index=True)
    quest_id: Mapped[str] = mapped_column(String, default="")
    mood: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())


# ── Profile helpers ───────────────────────────────────────────────

def get_or_create_profile(db: Session, child_id: str) -> ChildProfileRow:
    row = db.get(ChildProfileRow, child_id)
    if row is None:
        row = ChildProfileRow(child_id=child_id)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def add_xp(db: Session, child_id: str, amount: int) -> tuple[ChildProfileRow, bool]:
    """Award XP. Returns (profile, levelled_up)."""
    row = get_or_create_profile(db, child_id)
    prev_level = row.level
    row.xp += amount
    row.level = row.xp // XP_PER_LEVEL + 1
    db.commit()
    db.refresh(row)
    return row, row.level > prev_level


def record_quest_completion(
    db: Session, child_id: str, quest_id: str, quest_title: str,
    feedback: Optional[str], xp_earned: int,
) -> ChildProfileRow:
    """Log the completion, update streak, persist everything."""
    row = get_or_create_profile(db, child_id)

    today = datetime.date.today().isoformat()
    yesterday = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()

    if row.last_active_date == yesterday:
        row.streak += 1
    elif row.last_active_date != today:
        row.streak = 1
    row.last_active_date = today

    db.add(QuestEvent(
        child_id=child_id, quest_id=quest_id, quest_title=quest_title,
        feedback=feedback, xp_earned=xp_earned,
    ))
    db.commit()
    db.refresh(row)
    return row


def record_mood(db: Session, child_id: str, quest_id: str, mood: str) -> None:
    db.add(MoodEvent(child_id=child_id, quest_id=quest_id, mood=mood))
    db.commit()


def quests_today(db: Session, child_id: str) -> int:
    today_start = datetime.datetime.combine(datetime.date.today(), datetime.time.min)
    return (
        db.query(QuestEvent)
        .filter(QuestEvent.child_id == child_id, QuestEvent.created_at >= today_start)
        .count()
    )


def completed_quest_ids(db: Session, child_id: str) -> list[str]:
    rows = (
        db.query(QuestEvent.quest_id)
        .filter(QuestEvent.child_id == child_id)
        .distinct()
        .all()
    )
    return [r[0] for r in rows]


# ── Memory: build a short, de-identified history summary for Milo ──

def build_memory_summary(db: Session, child_id: str, quest_id: str) -> list[str]:
    """
    Returns a few short fact-lines about this child that get injected into
    Milo's chat prompt. This is what makes Milo feel like he *remembers*.
    Kept tiny on purpose — short prompt = fast + cheap + focused.
    """
    facts: list[str] = []
    profile = db.get(ChildProfileRow, child_id)
    if profile is None:
        return facts  # brand new child, no memory yet

    # Streak
    if profile.streak >= 2:
        facts.append(f"The child is on a {profile.streak}-day streak.")

    # How this specific quest went last time
    last_same = (
        db.query(QuestEvent)
        .filter(QuestEvent.child_id == child_id, QuestEvent.quest_id == quest_id)
        .order_by(QuestEvent.created_at.desc())
        .first()
    )
    if last_same and last_same.feedback:
        readable = {"nailed": "did it easily", "tricky": "found it tricky", "help": "needed help"}
        facts.append(f"Last time on this quest, the child {readable.get(last_same.feedback, 'tried it')}.")

    # Recent mood pattern (last 5 moods)
    recent_moods = (
        db.query(MoodEvent.mood)
        .filter(MoodEvent.child_id == child_id)
        .order_by(MoodEvent.created_at.desc())
        .limit(5)
        .all()
    )
    moods = [m[0] for m in recent_moods]
    if moods:
        # Most common recent mood
        common = max(set(moods), key=moods.count)
        if moods.count(common) >= 2:
            facts.append(f"The child has often felt '{common}' in recent sessions.")

    # Total quests completed
    total = db.query(QuestEvent).filter(QuestEvent.child_id == child_id).count()
    if total >= 3:
        facts.append(f"The child has completed {total} quests in total — they're building a real habit.")

    return facts[:4]  # never inject more than 4 lines


def set_display_name(db: Session, child_id: str, name: str) -> ChildProfileRow:
    """Update the child's display name."""
    row = get_or_create_profile(db, child_id)
    row.display_name = (name or "Explorer").strip()[:30]
    db.commit()
    db.refresh(row)
    return row


def reset_child(db: Session, child_id: str) -> ChildProfileRow:
    """Wipe all progress for a child: XP, level, streak, quest + mood history."""
    db.query(QuestEvent).filter(QuestEvent.child_id == child_id).delete()
    db.query(MoodEvent).filter(MoodEvent.child_id == child_id).delete()
    row = get_or_create_profile(db, child_id)
    row.xp = 0
    row.level = 1
    row.streak = 0
    row.last_active_date = None
    db.commit()
    db.refresh(row)
    return row