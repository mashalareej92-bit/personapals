import { useState, useEffect, useCallback } from 'react';
import { generateQuest, staticQuest, Mood } from '../services/questApi';

export type QuestStatus = 'loading' | 'ready' | 'fallback';

/**
 * Feeds QuestScreen. Starts from the static quest (instant render), then asks
 * the AI backend for an adapted version. Any failure (offline, timeout, bad
 * data) silently keeps the safe static quest — the screen never breaks.
 */
export function useQuestData(task: any) {
  const [mood, setMood] = useState<Mood>('calm');
  const [quest, setQuest] = useState<any>(() => staticQuest(task));
  const [status, setStatus] = useState<QuestStatus>('loading');

  const load = useCallback(async (m: Mood) => {
    setStatus('loading');
    try {
      const q = await generateQuest(task, m);
      setQuest(q);
      setStatus(q.source === 'ai' ? 'ready' : 'fallback');
    } catch {
      setQuest(staticQuest(task));
      setStatus('fallback');
    }
  }, [task]);

  useEffect(() => {
    load(mood);
  }, [load, mood]);

  return { quest, status, mood, setMood, reload: () => load(mood) };
}