---
title: PersonaPals Backend
emoji: 🐵
colorFrom: purple
colorTo: yellow
sdk: docker
app_port: 7860
pinned: false
---

# PersonaPals Backend

FastAPI backend for **PersonaPals** — an AI-powered habit-building app for children, featuring Milo the Monkey as a friendly AI companion.

## Tech Stack
- **FastAPI** — REST API framework
- **Groq** (LLaMA 3.1 8B) — powers Milo's conversational AI
- **SQLite + SQLAlchemy** — profile, quest, and memory persistence

## Endpoints
- `GET /health` — service health check
- `POST /chat` — Milo's AI replies (with per-quest memory)
- `POST /complete-quest` — logs a finished quest, returns updated XP/level/streak
- `POST /set-name` — updates the child's display name
- `POST /reset/{child_id}` — resets a child's progress
- `GET /profile/{child_id}` — fetches the full child profile

## Notes
Milo remembers how each quest went last time (nailed it / tricky / needed help) and references it in future sessions — the app's standout feature.