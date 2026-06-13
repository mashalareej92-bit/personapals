<div align="center">

# 🐵 PersonaPals

### An AI-powered habit-building companion for children, with Milo the Monkey

PersonaPals helps children aged **4–10** build everyday life skills, independence, and healthy routines through guided quests — with **Milo**, a friendly AI companion who talks with them, cheers them on, and *remembers how they did last time*.

Built with **React Native (Expo)** on the front end and **FastAPI + Groq** on the back end, fully deployed to the cloud.

</div>

---

## ✨ What makes it special

- **🧠 Milo remembers.** Milo keeps a per-quest memory. If a child found brushing their teeth tricky last time, Milo brings it up and encourages them the next time around — making the companion feel genuinely attentive rather than scripted.
- **🎯 28 real-world quests** across routines, chores, kitchen skills, social situations, calm-down techniques, hygiene, safety awareness, and independence.
- **💬 Live AI conversation.** Every reply from Milo is generated in real time, kept warm, short, and age-appropriate.
- **🔒 A real parent area.** PIN-gated reports, achievements, and settings — built on the child's actual activity data.
- **🏆 Achievements & XP** that unlock from genuine milestones (streaks, quests completed, XP earned, levels reached).

---

## 📱 Features

### For the child
- A friendly home screen with Milo, live XP / level / streak, and a filterable quest list
- Step-by-step quests with Milo guiding each step
- A "lock screen" so a grown-up confirms each finished step
- A quick check-in after each step (**Nailed it / A bit tricky / Needed help**) that feeds Milo's memory
- Celebration screens with confetti and a personal note from Milo

### For the parent (PIN-gated)
- **Mission Reports** — XP, level progress, streaks, quests completed, daily activity
- **Milo's Treasure** — eight achievements earned from real progress
- **Parent Settings** — set the child's display name, view safety info, reset progress
- **About** — what the app does, and what works online vs. offline

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React Native, Expo, TypeScript, Expo Router |
| **State** | React Context (shared profile store) |
| **Backend** | FastAPI (Python) |
| **AI** | Groq — LLaMA 3.1 8B (fast, low-latency inference) |
| **Database** | SQLite + SQLAlchemy |
| **Deployment** | Hugging Face Spaces (Docker) for the backend |
| **Build** | EAS Build (standalone Android APK) |

---

## 📂 Project Structure

```
PersonaPals/
├── frontend/                  # Expo / React Native app
│   └── app/
│       ├── _layout.tsx        # Root layout + ProfileProvider
│       ├── index.tsx          # App state machine (splash → missions → quest)
│       ├── screens/
│       │   ├── SplashScreen.tsx
│       │   ├── Missions.tsx        # Home: hero, stats, quest list, sidebar
│       │   ├── QuestScreen.tsx     # Quest flow: chat, steps, lock, feedback, complete
│       │   └── ParentScreens.tsx   # Reports, achievements, settings, about
│       ├── constants/
│       │   ├── quests.ts           # All 28 quests
│       │   ├── profileStore.tsx    # Shared profile state (React Context)
│       │   ├── miloImages.ts       # Milo image registry
│       │   └── api.ts              # Backend URL
│       ├── services/               # API helpers
│       └── hooks/                  # Android back handler, animations
│
└── backend/                   # FastAPI + Groq + SQLite
    ├── main.py                # API endpoints
    ├── models.py              # DB tables + memory logic
    ├── schemas.py             # Request/response models
    ├── database.py            # SQLAlchemy setup
    ├── groq_client.py         # Groq integration
    ├── prompt.py              # Milo's prompt construction
    ├── safety.py              # Content safety checks
    ├── Dockerfile             # Hugging Face Spaces deployment
    └── requirements.txt
```

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/health` | Service health check |
| `POST` | `/chat` | Milo's AI reply (injects per-quest memory) |
| `POST` | `/complete-quest` | Logs a finished quest, returns updated XP / level / streak |
| `POST` | `/set-name` | Updates the child's display name |
| `POST` | `/reset/{child_id}` | Resets a child's progress |
| `GET` | `/profile/{child_id}` | Returns the full child profile |

---

## 🚀 Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt

# Create a .env file with your Groq key:
#   GROQ_API_KEY=your_key_here
#   MOCK_MODE=0
#   GROQ_CHAT_MODEL=llama-3.1-8b-instant

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Get a free Groq API key at [console.groq.com](https://console.groq.com).

### Frontend
```bash
cd frontend
npm install

# Point app/constants/api.ts at your backend URL
# (local: http://YOUR_LAN_IP:8000  •  or your deployed URL)

npx expo start
```

---

## ☁️ Deployment

The backend runs on **Hugging Face Spaces** using Docker, so the app works from anywhere without a local server. The Space exposes the FastAPI app on port `7860`; the Groq API key is stored as a Space secret (never committed). The frontend's `api.ts` points at the public Space URL, and the Android app is packaged as a standalone APK via **EAS Build**.

---

## 🗺 Roadmap

Ideas for future iterations:
- Multi-child profiles with authentication
- Persistent hosted database (Postgres) so progress never resets
- Voice interaction (speech-to-text)
- Customisable Milo and unlockable worlds
- Offline-first sync

---

## 🔐 Privacy & Safety

PersonaPals never asks children for personal information. Milo is designed to keep every conversation safe, gentle, and age-appropriate, and to guide children toward a trusted grown-up when needed. The parent area is protected by a PIN.

---

<div align="center">

Made with care for curious kids and their grown-ups. 🌟

</div>
