"""
Database setup — SQLite via SQLAlchemy.

Why SQLite: zero install, single file (personapals.db), and the SQLAlchemy
code is identical to Postgres. To upgrade to Postgres later, change ONE line:
    DATABASE_URL = "postgresql://user:pass@host/db"
and nothing else in the app changes.
"""
from __future__ import annotations
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Single-file DB sitting next to the backend code.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./personapals.db")

# check_same_thread=False is required for SQLite under FastAPI's threadpool.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables. Safe to call on every startup (no-op if they exist)."""
    import models  # noqa: F401 — ensures models are registered before create_all
    Base.metadata.create_all(bind=engine)