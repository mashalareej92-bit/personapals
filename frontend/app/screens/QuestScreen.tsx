import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  Dimensions, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { QUESTS } from '../constants/quests';
import { MILO } from '../constants/miloImages';
import { API_URL } from '../constants/api';
import { useProfileStore } from '../constants/profileStore';

const { width } = Dimensions.get('window');

const C = {
  canvas: '#F6F0E5', card: '#FFFFFF', ink: '#241B3A', inkSoft: '#5C5470',
  muted: '#938BA3', gold: '#D99A2B', goldSoft: '#F4C964',
  goldWash: 'rgba(217,154,43,0.12)', hairline: 'rgba(36,27,58,0.08)', inkDark: '#1A1330',
};

type ScreenState = 'briefing' | 'step' | 'locked' | 'feedback' | 'travelling' | 'complete';

const THEME: Record<string, { accent: string; bg: string }> = {
  morning_launchpad:     { accent: '#FF9F43', bg: '#FFF8F0' },
  dental_sparkle:        { accent: '#4EA8DE', bg: '#F0F8FF' },
  backpack_pack:         { accent: '#10AC84', bg: '#F0FFF9' },
  lunchbox_ready:        { accent: '#FF6B6B', bg: '#FFF5F5' },
  shoes_on:              { accent: '#FF9F43', bg: '#FFF8F0' },
  bedtime_winddown:      { accent: '#7457F1', bg: '#F5F2FF' },
  clean_room:            { accent: '#FF6B8B', bg: '#FFF2F6' },
  wash_dishes:           { accent: '#00D2D3', bg: '#F0FFFF' },
  do_laundry:            { accent: '#54A0FF', bg: '#F0F5FF' },
  fold_clothes:          { accent: '#FF6B8B', bg: '#FFF2F6' },
  empty_trash:           { accent: '#00D2D3', bg: '#F0FFFF' },
  plant_care:            { accent: '#10AC84', bg: '#F0FFF9' },
  basic_cooking:         { accent: '#FF9F43', bg: '#FFF8F0' },
  set_table:             { accent: '#FF6B6B', bg: '#FFF5F5' },
  wipe_counters:         { accent: '#00D2D3', bg: '#F0FFFF' },
  buy_something:         { accent: '#10AC84', bg: '#F0FFF9' },
  phone_call:            { accent: '#7457F1', bg: '#F5F2FF' },
  ask_directions:        { accent: '#54A0FF', bg: '#F0F5FF' },
  cool_down:             { accent: '#7457F1', bg: '#F5F2FF' },
  screen_timer:          { accent: '#FF6B6B', bg: '#FFF5F5' },
  wash_hands:            { accent: '#4EA8DE', bg: '#F0F8FF' },
  take_shower:           { accent: '#54A0FF', bg: '#F0F5FF' },
  safety_trusted_adults: { accent: '#3B82F6', bg: '#F0F5FF' },
  safety_boundaries:     { accent: '#059669', bg: '#F0FFF8' },
  safety_digital:        { accent: '#6366F1', bg: '#F4F2FF' },
  independence_shopping: { accent: '#10AC84', bg: '#F0FFF9' },
  independence_money:    { accent: '#F59E0B', bg: '#FFFBF0' },
  independence_ordering: { accent: '#FB923C', bg: '#FFF7F0' },
};
const FALLBACK = { accent: '#9333EA', bg: '#F5F2FF' };

const TRAVEL_LABELS: Record<string, string> = {
  ROUTINE: 'Heading to the next stop', CHORE: 'On the way to the next task',
  KITCHEN: 'Rolling to the kitchen',   SOCIAL: 'Off on the next adventure',
  CALM: 'Drifting to a calm place',    HYGIENE: 'Gliding to the next step',
  SAFETY: 'Moving to the next lesson', INDEPENDENCE: 'Exploring further ahead',
};

const stepTitle = (s: any) => (s && typeof s === 'object' ? s.title : s) ?? 'Current Task';

// ── Confetti ──────────────────────────────────────────────────────
function ConfettiParticle({ color, delay }: { color: string; delay: number }) {
  const y = useRef(new Animated.Value(-20)).current;
  const x = useRef(new Animated.Value(Math.random() * width)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(y, { toValue: 900, duration: 2800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 2800, useNativeDriver: true }),
        Animated.timing(rot, { toValue: 10, duration: 2800, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);
  const spin = rot.interpolate({ inputRange: [0, 10], outputRange: ['0deg', '720deg'] });
  return <Animated.View style={{ position: 'absolute', top: 0, left: 0, width: 10, height: 10, borderRadius: 3, backgroundColor: color, transform: [{ translateX: x }, { translateY: y }, { rotate: spin }], opacity, zIndex: 999 }} />;
}

function ConfettiBurst() {
  const CLRS = ['#FFD166', '#FF6B6B', '#4EA8DE', '#10AC84', '#9333EA', '#FF9F43', '#FF85A1'];
  return <>{Array.from({ length: 55 }, (_, i) => <ConfettiParticle key={i} color={CLRS[i % CLRS.length]} delay={Math.random() * 800} />)}</>;
}

// ── Travel Screen ─────────────────────────────────────────────────
function TravelScreen({ quest, onFinish }: { quest: any; onFinish: () => void }) {
  const miloX = useRef(new Animated.Value(-140)).current;
  const miloY = useRef(new Animated.Value(0)).current;
  const fade  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    Animated.parallel([
      Animated.timing(miloX, { toValue: width + 140, duration: 2800, useNativeDriver: true }),
      Animated.loop(Animated.sequence([
        Animated.timing(miloY, { toValue: -20, duration: 480, useNativeDriver: true }),
        Animated.timing(miloY, { toValue: 0,   duration: 480, useNativeDriver: true }),
      ])),
    ]).start();
    const t = setTimeout(onFinish, 2900);
    return () => clearTimeout(t);
  }, []);
  return (
    <LinearGradient colors={['#FBEFD9', C.canvas]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <Animated.View style={{ opacity: fade, alignItems: 'center', marginBottom: 48 }}>
          <Text style={{ fontFamily: 'Nunito_900Black', fontSize: 10, letterSpacing: 2.5, color: C.gold, marginBottom: 6 }}>NEXT STEP</Text>
          <Text style={{ fontFamily: 'Nunito_900Black', fontSize: 22, color: C.ink, textAlign: 'center' }}>{TRAVEL_LABELS[quest.sector] ?? 'On the way'}</Text>
        </Animated.View>
        <View style={{ width: '100%', height: 100, justifyContent: 'center', overflow: 'hidden' }}>
          <View style={{ height: 1, backgroundColor: C.hairline, position: 'absolute', width: '100%' }} />
          <Animated.Image source={MILO.base} style={{ width: 96, height: 96, resizeMode: 'contain', transform: [{ translateX: miloX }, { translateY: miloY }] }} />
        </View>
        <Animated.View style={{ opacity: fade, flexDirection: 'row', gap: 8, marginTop: 48 }}>
          {[0.3, 0.6, 1].map((op, i) => <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.gold, opacity: op }} />)}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── Feedback Screen (after lock, before travel) ───────────────────
function FeedbackScreen({ accent, onPick }: { accent: string; onPick: (fb: 'nailed' | 'tricky' | 'help') => void }) {
  const [picked, setPicked] = useState<'nailed' | 'tricky' | 'help' | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const notedAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const choose = (fb: 'nailed' | 'tricky' | 'help') => {
    setPicked(fb);
    Animated.spring(notedAnim, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }).start();
  };

  const OPTIONS = [
    { id: 'nailed' as const, emoji: '💪', label: 'Nailed it!', color: '#10AC84' },
    { id: 'tricky' as const, emoji: '🤔', label: 'A bit tricky', color: '#FF9F43' },
    { id: 'help' as const, emoji: '🙋', label: 'Needed help', color: '#4EA8DE' },
  ];

  return (
    <LinearGradient colors={['#FBEFD9', C.canvas]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
        <Animated.View style={{ opacity: fade, alignItems: 'center', width: '100%' }}>
          <Image source={MILO.base} style={{ width: 96, height: 96, resizeMode: 'contain', marginBottom: 16 }} />
          <Text style={{ fontFamily: 'Nunito_900Black', fontSize: 10, letterSpacing: 2.5, color: C.gold, marginBottom: 6 }}>QUICK CHECK-IN</Text>
          <Text style={{ fontFamily: 'Nunito_900Black', fontSize: 24, color: C.ink, textAlign: 'center', marginBottom: 28 }}>How did that step go?</Text>

          <View style={{ width: '100%', gap: 12 }}>
            {OPTIONS.map(opt => {
              const isPicked = picked === opt.id;
              const dim = picked !== null && !isPicked;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => choose(opt.id)}
                  activeOpacity={0.85}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 14,
                    backgroundColor: isPicked ? opt.color + '20' : C.card,
                    borderColor: isPicked ? opt.color : C.hairline,
                    borderWidth: 2, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 20,
                    opacity: dim ? 0.45 : 1,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{opt.emoji}</Text>
                  <Text style={{ fontFamily: 'Nunito_900Black', fontSize: 17, color: isPicked ? opt.color : C.ink }}>{opt.label}</Text>
                  {isPicked && <Text style={{ marginLeft: 'auto', fontFamily: 'Nunito_900Black', fontSize: 18, color: opt.color }}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {picked && (
            <Animated.View style={{ opacity: notedAnim, transform: [{ scale: notedAnim }], alignItems: 'center', marginTop: 24, width: '100%' }}>
              <Text style={{ fontFamily: 'Nunito_900Black', fontSize: 16, color: C.gold, marginBottom: 14 }}>Noted! Milo will remember 🌟</Text>
              <TouchableOpacity
                style={{ backgroundColor: C.goldSoft, paddingVertical: 16, borderRadius: 30, alignItems: 'center', width: '100%', shadowColor: C.gold, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 8 }}
                onPress={() => onPick(picked)}
                activeOpacity={0.88}
              >
                <Text style={{ fontFamily: 'Nunito_900Black', fontSize: 17, color: C.inkDark }}>Continue</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── Lock Screen ───────────────────────────────────────────────────
function DialKey({ digit, onPress }: { digit: string; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[lockS.key, !digit && { opacity: 0 }]}
        onPressIn={() => Animated.spring(scale, { toValue: 0.82, useNativeDriver: true, speed: 60 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start()}
        onPress={onPress} activeOpacity={1} disabled={!digit}
      >
        <Text style={lockS.keyText}>{digit}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const PARENT_PIN = '2580';

function LockScreen({ stepLabel, onUnlock }: { stepLabel: string; onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const shake  = useRef(new Animated.Value(0)).current;
  const mScale = useRef(new Animated.Value(1)).current;
  const t1 = useRef(new Animated.Value(0.4)).current;
  const t2 = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    [[t1, 1300], [t2, 1000]].forEach(([v, d]) =>
      Animated.loop(Animated.sequence([
        Animated.timing(v as Animated.Value, { toValue: 1, duration: d as number, useNativeDriver: true }),
        Animated.timing(v as Animated.Value, { toValue: 0.25, duration: d as number, useNativeDriver: true }),
      ])).start()
    );
  }, []);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length !== 4) return;
    if (next === PARENT_PIN) {
      Animated.sequence([
        Animated.spring(mScale, { toValue: 1.18, friction: 3, useNativeDriver: true }),
        Animated.spring(mScale, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
      setTimeout(onUnlock, 600);
    } else {
      setError(true);
      Animated.sequence([
        Animated.timing(shake, { toValue: 13, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -13, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start(() => setTimeout(() => { setPin(''); setError(false); }, 350));
    }
  };

  const dotColor = error ? '#FF6B6B' : pin.length === 4 && pin === PARENT_PIN ? '#10AC84' : C.goldSoft;

  return (
    <LinearGradient colors={['#2A2046', '#1A1330', '#120D24']} style={{ flex: 1 }}>
      <Animated.View style={{ position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: C.goldSoft, top: '12%', left: '14%', opacity: t1 }} />
      <Animated.View style={{ position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: C.goldSoft, top: '20%', right: '18%', opacity: t2 }} />
      <SafeAreaView style={lockS.safe}>
        <Animated.View style={[lockS.ring, { transform: [{ scale: mScale }] }]}>
          <Image source={MILO.base} style={{ width: 88, height: 88, resizeMode: 'contain' }} />
        </Animated.View>
        <Text style={lockS.title}>Mission In Progress</Text>
        <Text style={lockS.sub}>"{stepLabel}"</Text>
        <Text style={lockS.hint}>Finish the task, then ask a grown-up{'\n'}to enter the secret PIN.</Text>
        <Animated.View style={[{ flexDirection: 'row', gap: 16, marginBottom: 10 }, { transform: [{ translateX: shake }] }]}>
          {[0,1,2,3].map(i => <View key={i} style={[lockS.dot, { borderColor: dotColor }, pin.length > i && { backgroundColor: dotColor }]} />)}
        </Animated.View>
        {error && <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 13, color: '#FF6B6B', marginBottom: 8 }}>Wrong PIN — try again</Text>}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 264, gap: 12, justifyContent: 'center', marginTop: 12 }}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
            <DialKey key={i} digit={d} onPress={() => { if (d === '⌫') { setPin(p => p.slice(0,-1)); setError(false); } else if (d) handleDigit(d); }} />
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const lockS = StyleSheet.create({
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  ring: { width: 130, height: 130, borderRadius: 65, borderWidth: 2.5, borderColor: C.goldSoft, backgroundColor: C.goldWash, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: C.goldSoft, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 22, elevation: 0 },
  title: { fontFamily: 'Nunito_900Black', fontSize: 26, color: '#FFFFFF', marginBottom: 6, textAlign: 'center' },
  sub: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: C.goldSoft, marginBottom: 12, textAlign: 'center', paddingHorizontal: 24, lineHeight: 21 },
  hint: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2.5, backgroundColor: 'transparent' },
  key: { width: 74, height: 74, borderRadius: 37, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.16)' },
  keyText: { fontSize: 26, fontFamily: 'Nunito_900Black', color: '#FFFFFF' },
});

// ── Completion Screen ─────────────────────────────────────────────
function CompletionScreen({ quest, taskId, stepFeedback, mood, onBack }: { quest: any; taskId: string; stepFeedback: string | null; mood: string; onBack: () => void }) {
  const store = useProfileStore();
  const mS = useRef(new Animated.Value(0)).current;
  const tO = useRef(new Animated.Value(0)).current;
  const xS = useRef(new Animated.Value(0)).current;
  const nO = useRef(new Animated.Value(0)).current;
  const bO = useRef(new Animated.Value(0)).current;
  const rock = useRef(new Animated.Value(0)).current;

  // ── Wire /complete-quest to backend ──
  // ── Wire /complete-quest to backend ──
  // ── Wire /complete-quest to backend (feeds Milo's memory) ──
  useEffect(() => {
    fetch(`${API_URL}/complete-quest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        child_id: 'child_demo_01',
        quest_id: taskId,
        quest_title: quest.name ?? quest.title,
        xp_earned: quest.rewardXP ?? quest.xp ?? 25,
        step_feedback: stepFeedback,
        mood: mood,
      }),
    })
      .then(r => r.json())
      .then(data => {
        // push fresh server values into the store so Missions shows them instantly
        if (data && typeof data.xp_total === 'number') {
          store.setStats({ xp: data.xp_total, level: data.level, streak: data.streak });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(mS, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
      Animated.timing(tO, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(xS, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
      Animated.timing(nO, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(bO, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(rock, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(rock, { toValue: -1, duration: 300, useNativeDriver: true }),
      Animated.timing(rock, { toValue: 0, duration: 300, useNativeDriver: true }),
    ])).start();
  }, []);

  const spin = rock.interpolate({ inputRange: [-1, 1], outputRange: ['-7deg', '7deg'] });
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <ConfettiBurst />
      <LinearGradient colors={['#FF9F43', '#FF6B6B', '#9333EA']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, gap: 14, paddingBottom: Math.max(insets.bottom, 16) }}>
          <Animated.Image source={MILO.base} style={{ width: 140, height: 140, resizeMode: 'contain', transform: [{ scale: mS }, { rotate: spin }] }} />
          <Animated.View style={{ opacity: tO, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Nunito_900Black', fontSize: 36, color: '#FFF', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 8 }}>Quest Complete!</Text>
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 22 }}>You finished {quest.name ?? quest.title}!{'\n'}Milo is so proud of you!</Text>
          </Animated.View>
          <Animated.View style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 24, paddingHorizontal: 36, paddingVertical: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', transform: [{ scale: xS }] }}>
            <Text style={{ fontFamily: 'Nunito_900Black', fontSize: 40, color: C.goldSoft }}>{`+${quest.rewardXP ?? quest.xp ?? 25}`}</Text>
            <Text style={{ fontFamily: 'Nunito_900Black', fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>XP EARNED</Text>
          </Animated.View>
          <Animated.View style={{ backgroundColor: C.card, borderRadius: 22, overflow: 'hidden', width: '100%', flexDirection: 'row', opacity: nO, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 6 }}>
            <View style={{ width: 5, backgroundColor: C.goldSoft }} />
            <View style={{ flex: 1, padding: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Image source={MILO.base} style={{ width: 22, height: 22, resizeMode: 'contain' }} />
                <Text style={{ fontFamily: 'Nunito_900Black', fontSize: 10, letterSpacing: 1.5, color: C.gold }}>MILO'S NOTE</Text>
                <View style={{ marginLeft: 'auto', backgroundColor: C.goldWash, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(244,201,100,0.4)' }}>
                  <Text style={{ fontFamily: 'Nunito_900Black', fontSize: 9, letterSpacing: 1, color: C.gold }}>AI</Text>
                </View>
              </View>
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 13, color: C.inkSoft, lineHeight: 20 }}>You showed real effort today. Every quest makes you a little bit stronger. Milo can't wait for your next adventure!</Text>
            </View>
          </Animated.View>
          <Animated.View style={{ opacity: bO, width: '100%' }}>
            <TouchableOpacity style={{ backgroundColor: C.goldSoft, paddingVertical: 16, borderRadius: 30, alignItems: 'center', shadowColor: C.gold, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 18, elevation: 8 }} onPress={onBack} activeOpacity={0.88}>
              <Text style={{ fontFamily: 'Nunito_900Black', fontSize: 17, color: C.inkDark }}>Return to Missions</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

// ── MAIN QUEST SCREEN ─────────────────────────────────────────────
export default function QuestScreen({ task, onBack }: { task: any; onBack: () => void }) {
  const questData = QUESTS[task?.id as string];
  const quest = questData ? { ...task, ...questData } : task;
  const theme = THEME[task?.id] ?? FALLBACK;
  const insets = useSafeAreaInsets();

  const [screenState, setScreenState] = useState<ScreenState>('briefing');
  const [currentStep, setCurrentStep] = useState(0);
  const [childInput, setChildInput] = useState('');
  const [lastChildMsg, setLastChildMsg] = useState<string | null>(null);
  const [miloMsg, setMiloMsg] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [stepFeedback, setStepFeedback] = useState<string | null>(null);
  const [mood, setMood] = useState<string>('calm');

  const miloScale   = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide   = useRef(new Animated.Value(22)).current;
  const pulseDot    = useRef(new Animated.Value(0.5)).current;
  const childBubbleAnim = useRef(new Animated.Value(0)).current;

  const steps: any[] = (quest.steps ?? []).map((s: any) =>
    typeof s === 'string' ? { title: s, emoji: '🎯', timer: 30, needsParent: false, instruction: '' } : s
  );
  const step = steps[currentStep];
  const isBriefing = screenState === 'briefing';
  const progress = steps.length > 0 ? currentStep / steps.length : 0;

  const difficulty = steps.length <= 3 ? 'EASY' : steps.length <= 5 ? 'MEDIUM' : 'CHALLENGE';
  const diffColor  = steps.length <= 3 ? '#10AC84' : steps.length <= 5 ? '#FF9F43' : '#FF6B6B';

  useEffect(() => {
    const speeches: string[] = quest.speech ?? [quest.miloGreeting ?? "Let's do this!"];
    const msg = isBriefing
      ? (speeches[0] ?? "Let's take on this quest together!")
      : (speeches[Math.min(currentStep, speeches.length - 1)] ?? `Let's do: ${stepTitle(step)}!`);
    setMiloMsg(msg);
    setChildInput('');
    setLastChildMsg(null);
    setIsThinking(false);
    miloScale.setValue(0);
    cardOpacity.setValue(0);
    cardSlide.setValue(22);
    Animated.parallel([
      Animated.spring(miloScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [screenState, currentStep]);

  useEffect(() => {
    if (isThinking) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseDot, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseDot, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ])).start();
    } else {
      pulseDot.stopAnimation();
      pulseDot.setValue(1);
    }
  }, [isThinking]);

  // ── Wire /chat to backend ──
  const handleSend = () => {
    if (!childInput.trim() || isThinking) return;
    const msg = childInput.trim();
    setLastChildMsg(msg);
    setChildInput('');
    setIsThinking(true);
    childBubbleAnim.setValue(0);
    Animated.spring(childBubbleAnim, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }).start();

    fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        child_id: 'child_demo_01',
        quest_id: task.id,
        quest_title: quest.name ?? quest.title,
        step_title: stepTitle(step),
        step_instruction: step?.instruction ?? '',
        is_briefing: isBriefing,
        message: msg,
        mood: 'calm',
      }),
    })
      .then(r => r.json())
      .then(data => {
        setIsThinking(false);
        setMiloMsg(data.reply ?? "You're doing amazing! Keep going!");
      })
      .catch(() => {
        setIsThinking(false);
        setMiloMsg("I'm right here with you! You've got this! 🌟");
      });
  };

  const handleHint = () => {
    if (isThinking) return;
    setIsThinking(true);
    setLastChildMsg("I need a hint 🙋");
    childBubbleAnim.setValue(0);
    Animated.spring(childBubbleAnim, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }).start();

    fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        child_id: 'child_demo_01',
        quest_id: task.id,
        quest_title: quest.name ?? quest.title,
        step_title: stepTitle(step),
        step_instruction: step?.instruction ?? '',
        is_briefing: isBriefing,
        message: 'I need a hint please',
        mood: 'calm',
      }),
    })
      .then(r => r.json())
      .then(data => {
        setIsThinking(false);
        setMiloMsg(data.reply ?? (step?.instruction ? `Here's a tip: ${step.instruction}` : "Take it one small piece at a time!"));
      })
      .catch(() => {
        setIsThinking(false);
        setMiloMsg(step?.instruction ? `Here's a tip: ${step.instruction}` : "Take it one small piece at a time — you're doing great!");
      });
  };

  const handlePrimary = () => {
    if (isBriefing) { setCurrentStep(0); setScreenState('step'); }
    else setScreenState('locked');
  };

  const advanceStep = () => {
    const next = currentStep + 1;
    if (next >= steps.length) setScreenState('complete');
    else { setCurrentStep(next); setScreenState('step'); }
  };

  if (screenState === 'locked')     return <LockScreen stepLabel={stepTitle(step)} onUnlock={() => setScreenState('feedback')} />;
  if (screenState === 'feedback')   return <FeedbackScreen accent={theme.accent} onPick={(fb) => { setStepFeedback(fb); setScreenState('travelling'); }} />;
  if (screenState === 'travelling') return <TravelScreen quest={quest} onFinish={advanceStep} />;
  if (screenState === 'complete')   return <CompletionScreen quest={quest} taskId={task.id} stepFeedback={stepFeedback} mood={mood} onBack={onBack} />;

  return (
    <LinearGradient colors={['#FBEFD9', theme.bg]} style={S.root}>
      <SafeAreaView style={S.safe} edges={['top']}>

        {/* Fixed Header */}
        <View style={S.header}>
          <TouchableOpacity style={S.backBtn} onPress={onBack} activeOpacity={0.85}>
            <View style={{ gap: 4 }}>
              <View style={{ width: 11, height: 2.5, borderRadius: 1.5, backgroundColor: C.inkSoft, transform: [{ rotate: '-45deg' }, { translateY: 2 }] }} />
              <View style={{ width: 11, height: 2.5, borderRadius: 1.5, backgroundColor: C.inkSoft, transform: [{ rotate: '45deg' }, { translateY: -2 }] }} />
            </View>
            <Text style={S.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={S.questTitle} numberOfLines={1}>{quest.name ?? quest.title}</Text>
          <View style={[S.xpPill, { backgroundColor: theme.accent }]}>
            <Text style={S.xpText}>{quest.rewardXP ?? quest.xp ?? 25} XP</Text>
          </View>
        </View>

        {/* Progress + Step Dots */}
        {!isBriefing && (
          <View style={S.progSection}>
            <View style={S.progRow}>
              <View style={S.progTrack}>
                <View style={[S.progFill, { width: `${progress * 100}%` as any, backgroundColor: theme.accent }]} />
                <View style={[S.progGlow, { left: `${progress * 100}%` as any, backgroundColor: theme.accent, shadowColor: theme.accent }]} />
              </View>
              <Text style={[S.progLabel, { color: theme.accent }]}>{currentStep + 1}/{steps.length}</Text>
            </View>
            <View style={S.dotsRow}>
              {steps.map((_, i) => (
                <View key={i} style={[
                  S.dot,
                  {
                    backgroundColor: i <= currentStep ? theme.accent : 'rgba(36,27,58,0.10)',
                    width: i === currentStep ? 18 : 8,
                    borderWidth: i === currentStep ? 2 : 0,
                    borderColor: theme.accent,
                  },
                ]} />
              ))}
            </View>
          </View>
        )}

        {/* KAV for content + input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={S.main}>

            {/* Milo */}
            <Animated.View style={[S.miloSection, { transform: [{ scale: miloScale }] }]}>
              <View style={[S.miloBg, { backgroundColor: theme.accent + '18' }]}>
                <Image source={quest.miloImage ?? quest.mascot ?? MILO.base} style={S.miloImg} />
              </View>
            </Animated.View>

            {/* Child bubble */}
            {lastChildMsg && (
              <Animated.View style={[S.childBubbleWrap, {
                opacity: childBubbleAnim,
                transform: [{ scale: childBubbleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
              }]}>
                <View style={S.childBubble}>
                  <Text style={S.childBubbleText}>{lastChildMsg}</Text>
                </View>
              </Animated.View>
            )}

            {/* Milo chat card — AI response */}
            <Animated.View style={[S.chatCard, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}>
              <View style={[S.chatBar, { backgroundColor: theme.accent }]} />
              <View style={S.chatBody}>
                <View style={S.chatHeader}>
                  <Text style={[S.chatName, { color: theme.accent }]}>MILO</Text>
                  <View style={S.aiBadge}>
                    <Animated.View style={[S.aiDot, { opacity: isThinking ? pulseDot : 1, backgroundColor: isThinking ? C.gold : C.goldSoft }]} />
                    <Text style={S.aiText}>{isThinking ? 'THINKING' : 'AI'}</Text>
                  </View>
                </View>
                <ScrollView style={{ maxHeight: 120 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                  <Text style={S.chatMsg}>
                    {isThinking ? 'Give me a second...' : miloMsg}
                  </Text>
                </ScrollView>
              </View>
            </Animated.View>

            {/* Input row */}
            <Animated.View style={{ opacity: cardOpacity }}>
              <View style={S.inputRow}>
                <TextInput
                  style={S.textInput}
                  placeholder={isBriefing ? 'Tell Milo how you feel...' : 'Ask anything from Milo!'}
                  placeholderTextColor={C.muted}
                  value={childInput}
                  onChangeText={setChildInput}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                />
                <TouchableOpacity
                  style={[S.sendBtn, { backgroundColor: theme.accent, opacity: childInput.trim() ? 1 : 0.4 }]}
                  onPress={handleSend}
                  activeOpacity={0.85}
                  disabled={!childInput.trim() || isThinking}
                >
                  <View style={{ width: 10, height: 10, borderTopWidth: 2.5, borderRightWidth: 2.5, borderColor: '#FFF', transform: [{ rotate: '45deg' }, { translateX: -2 }] }} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={S.hintBtn} onPress={handleHint} disabled={isThinking}>
                <Text style={[S.hintText, { color: theme.accent }]}>Stuck? Ask Milo for a hint →</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Content card */}
            <Animated.View style={[S.contentCard, { opacity: cardOpacity, transform: [{ translateY: cardSlide }], borderColor: theme.accent + '44' }]}>
              <View style={[S.contentBar, { backgroundColor: theme.accent }]} />
              <View style={S.contentInner}>
                {isBriefing ? (
                  <>
                    <View style={S.briefingHead}>
                      <Text style={[S.contentKicker, { color: theme.accent }]}>TODAY'S MISSION</Text>
                      <View style={[S.diffBadge, { backgroundColor: diffColor + '20', borderColor: diffColor + '55' }]}>
                        <Text style={[S.diffText, { color: diffColor }]}>{difficulty}</Text>
                      </View>
                    </View>
                    <Text style={S.contentHeading}>{quest.name ?? quest.title}</Text>
                    <View style={S.contentDivider} />
                    <View style={{ gap: 7 }}>
                      {steps.slice(0, 4).map((s: any, i: number) => (
                        <View key={i} style={S.stepPreviewRow}>
                          <View style={[S.stepNum, { backgroundColor: theme.accent }]}>
                            <Text style={S.stepNumText}>{i + 1}</Text>
                          </View>
                          <Text style={S.stepPreviewTitle} numberOfLines={1}>{stepTitle(s)}</Text>
                        </View>
                      ))}
                      {steps.length > 4 && <Text style={[S.moreSteps, { color: theme.accent }]}>and {steps.length - 4} more steps</Text>}
                    </View>
                  </>
                ) : (
                  <>
                    <View style={S.stepBadgeRow}>
                      <View style={[S.stepBadge, { backgroundColor: theme.accent + '20', borderColor: theme.accent + '55' }]}>
                        <Text style={[S.stepBadgeText, { color: theme.accent }]}>STEP {currentStep + 1} OF {steps.length}</Text>
                      </View>
                      {step?.needsParent && (
                        <View style={[S.parentTag, { borderColor: theme.accent }]}>
                          <Text style={[S.parentTagText, { color: theme.accent }]}>Parent</Text>
                        </View>
                      )}
                    </View>
                    <Text style={S.activeStepTitle}>{stepTitle(step)}</Text>
                    {step?.instruction && <Text style={S.activeStepInstr} numberOfLines={2}>{step.instruction}</Text>}
                  </>
                )}
              </View>
            </Animated.View>

            <View style={{ flex: 1 }} />

        
          </View>
        </KeyboardAvoidingView>

        {/* Fixed Buttons outside KAV */}
        <View style={[S.buttons, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <TouchableOpacity style={S.goldBtn} onPress={handlePrimary} activeOpacity={0.88}>
            <Text style={S.goldBtnText}>
              {isBriefing ? "Begin Adventure" : "Let's Start! Lock It In"}
            </Text>
          </TouchableOpacity>
          {!isBriefing && (
            <TouchableOpacity style={[S.ghostBtn, { borderColor: theme.accent }]} onPress={() => setScreenState('locked')} activeOpacity={0.8}>
              <Text style={[S.ghostBtnText, { color: theme.accent }]}>Already Done</Text>
            </TouchableOpacity>
          )}
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const CARD_SHADOW = { shadowColor: '#2A1B40', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.09, shadowRadius: 20, elevation: 5 };

const S = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 10, gap: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.card, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: C.hairline, ...CARD_SHADOW, shadowOpacity: 0.06 },
  backText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 13, color: C.inkSoft },
  questTitle: { flex: 1, fontFamily: 'Nunito_900Black', fontSize: 14, color: C.ink, textAlign: 'center' },
  xpPill: { borderRadius: 18, paddingHorizontal: 12, paddingVertical: 7 },
  xpText: { fontFamily: 'Nunito_900Black', fontSize: 11.5, color: '#FFF' },
  progSection: { paddingHorizontal: 18, marginBottom: 4 },
  progRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  progTrack: { flex: 1, height: 5, backgroundColor: 'rgba(36,27,58,0.08)', borderRadius: 4, overflow: 'visible' },
  progFill: { position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 4 },
  progGlow: { position: 'absolute', top: -4.5, width: 14, height: 14, borderRadius: 7, marginLeft: -7, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 7, elevation: 0 },
  progLabel: { fontFamily: 'Nunito_900Black', fontSize: 11 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { height: 8, borderRadius: 4 },
  main: { flex: 1, paddingHorizontal: 18, paddingTop: 4, gap: 10 },
  miloSection: { alignItems: 'center' },
  miloBg: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center' },
  miloImg: { width: 74, height: 74, resizeMode: 'contain' },
  childBubbleWrap: { alignItems: 'flex-end', paddingRight: 4 },
  childBubble: { backgroundColor: C.ink, borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 9, maxWidth: '70%' },
  childBubbleText: { fontFamily: 'Nunito_700Bold', fontSize: 13.5, color: '#FFFFFF', lineHeight: 20 },
  chatCard: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 22, overflow: 'hidden', ...CARD_SHADOW, borderWidth: 1, borderColor: C.hairline },
  chatBar: { width: 5 },
  chatBody: { flex: 1, padding: 13 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  chatName: { fontFamily: 'Nunito_900Black', fontSize: 11, letterSpacing: 1.5 },
  aiBadge: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.goldWash, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(244,201,100,0.4)' },
  aiDot: { width: 5, height: 5, borderRadius: 2.5 },
  aiText: { fontFamily: 'Nunito_900Black', fontSize: 8.5, letterSpacing: 1, color: C.gold },
  chatMsg: { fontFamily: 'Nunito_700Bold', fontSize: 13.5, color: C.ink, lineHeight: 20 },
  contentCard: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 22, overflow: 'hidden', ...CARD_SHADOW, borderWidth: 1.5 },
  contentBar: { width: 5 },
  contentInner: { flex: 1, padding: 13 },
  briefingHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  contentKicker: { fontFamily: 'Nunito_900Black', fontSize: 9.5, letterSpacing: 1.8 },
  diffBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
  diffText: { fontFamily: 'Nunito_900Black', fontSize: 9, letterSpacing: 0.8 },
  contentHeading: { fontFamily: 'Nunito_900Black', fontSize: 16, color: C.ink, marginBottom: 8, marginTop: 2 },
  contentDivider: { height: 1, backgroundColor: C.hairline, marginBottom: 8 },
  stepPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  stepNum: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontFamily: 'Nunito_900Black', fontSize: 10, color: '#FFF' },
  stepPreviewTitle: { flex: 1, fontFamily: 'Nunito_700Bold', fontSize: 12.5, color: C.inkSoft },
  moreSteps: { fontFamily: 'Nunito_700Bold', fontSize: 11, marginLeft: 29 },
  stepBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  stepBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1.5 },
  stepBadgeText: { fontFamily: 'Nunito_900Black', fontSize: 9.5, letterSpacing: 1 },
  parentTag: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1.5, backgroundColor: '#FFFBF2' },
  parentTagText: { fontFamily: 'Nunito_700Bold', fontSize: 10 },
  activeStepTitle: { fontFamily: 'Nunito_900Black', fontSize: 21, color: C.ink, marginBottom: 5 },
  activeStepInstr: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: C.inkSoft, lineHeight: 19 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 50, paddingHorizontal: 6, paddingVertical: 6, gap: 6, borderWidth: 1, borderColor: C.hairline, ...CARD_SHADOW },
  micBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(36,27,58,0.05)', alignItems: 'center', justifyContent: 'center' },
  micCapsule: { width: 10, height: 14, borderRadius: 5, borderWidth: 2, backgroundColor: 'transparent' },
  micNeck: { width: 1.5, height: 5, borderRadius: 1, marginTop: -1 },
  micBase: { width: 14, height: 1.5, borderRadius: 1, marginTop: -1 },
  textInput: { flex: 1, fontFamily: 'Nunito_700Bold', fontSize: 13.5, color: C.ink, paddingVertical: 8, paddingHorizontal: 4 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  hintBtn: { alignItems: 'center', paddingVertical: 6 },
  hintText: { fontFamily: 'Nunito_700Bold', fontSize: 12.5 },
  buttons: { paddingHorizontal: 18, paddingTop: 10, gap: 9 },
  goldBtn: { backgroundColor: C.goldSoft, paddingVertical: 17, borderRadius: 30, alignItems: 'center', shadowColor: C.gold, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 8 },
  goldBtnText: { fontFamily: 'Nunito_900Black', fontSize: 18, color: C.inkDark },
  ghostBtn: { borderRadius: 24, paddingVertical: 12, alignItems: 'center', borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.8)' },
  ghostBtnText: { fontFamily: 'Nunito_900Black', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
});