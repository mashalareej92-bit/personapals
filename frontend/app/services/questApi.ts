import { QUESTS } from '../constants/quests';

// Android emulator reaches your machine's localhost via 10.0.2.2.
// iOS simulator can use http://localhost:8000. A real device needs your LAN IP.
// Override via EXPO_PUBLIC_API_URL in your .env.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000';

export type Mood = 'calm' | 'excited' | 'worried' | 'frustrated';

interface AIStep { id: string; title: string; instruction: string; secondsDuration: number; }
interface QuestPayload {
  quest_id: string;
  title: string;
  sector_type: string;
  milo_greeting: string;
  steps: AIStep[];
  source: 'ai' | 'fallback';
}

/** Map the server payload into the exact shape QuestScreen already renders. */
function normalize(task: any, p: QuestPayload) {
  const base = QUESTS[task?.id];
  return {
    ...task,
    title: p.title,
    name: task?.name ?? p.title,
    sector: task?.sector ?? p.sector_type,
    miloGreeting: p.milo_greeting,
    speech: [p.milo_greeting],
    rewardXP: task?.xp ?? base?.rewardXP ?? 25,
    mascot: base?.mascot,                       // image from the registry
    steps: p.steps.map((s) => ({
      id: s.id,
      title: s.title,
      instruction: s.instruction,
      timer: s.secondsDuration,                 // QuestScreen reads `step.timer`
    })),
    source: p.source,
  };
}

/** Pure offline/static quest — used when the server is unreachable. */
export function staticQuest(task: any) {
  const base = QUESTS[task?.id];
  if (!base) return { ...task, source: 'fallback' };
  return { ...task, ...base, name: task?.name ?? base.title, source: 'fallback' };
}

/** Ask the backend to generate an adapted quest for this child + mood. */
export async function generateQuest(task: any, mood: Mood, childId = 'child_demo_01') {
  const base = QUESTS[task?.id];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(`${API_URL}/generate-quest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        child_id: childId,
        quest_id: task.id,
        mood,
        base_title: base?.title ?? task?.name,
        base_steps: base?.steps ?? [],
        history: [], // wire RAG-summarised history here later
      }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const payload: QuestPayload = await res.json();
    return normalize(task, payload);
  } finally {
    clearTimeout(timeout);
  }
}