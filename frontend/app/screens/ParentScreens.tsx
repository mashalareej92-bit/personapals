/**
 * Four sidebar screens for PersonaPals, all elite GUI, all on real data:
 *   - MissionReports   (analytics: XP, streak, quests, mood — the parent dashboard)
 *   - MiloTreasure     (achievements earned from real milestones)
 *   - ParentSettings   (PIN-gated: child name, sound, reset)
 *   - AboutApp         (what it is + what needs internet vs not)
 *
 * Each is a full-screen overlay. Missions controls which one is open.
 * Reports + Treasure + Settings live behind the parent PIN (2580).
 */
import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  Image, ScrollView, TextInput, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { MILO } from '../constants/miloImages';
import { API_URL } from '../constants/api';
import { useProfileStore } from '../constants/profileStore';

const CHILD_ID = 'child_demo_01';
const PARENT_PIN = '2580';

const C = {
  canvas: '#F6F0E5', canvasDeep: '#EFE6D6', card: '#FFFFFF',
  ink: '#241B3A', inkSoft: '#5C5470', muted: '#938BA3',
  gold: '#D99A2B', goldSoft: '#F4C964', goldWash: 'rgba(217,154,43,0.12)',
  hairline: 'rgba(36,27,58,0.07)', inkDark: '#1A1330',
};
const CARD_SHADOW = { shadowColor: '#2A1B40', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.09, shadowRadius: 20, elevation: 5 };

type Profile = {
  child_id: string; xp: number; level: number; streak: number;
  completed_quests: string[]; quests_today: number;
};

// ── Shared header used by every screen ────────────────────────────
function ScreenHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={s.header}>
      <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.85}>
        <View style={{ gap: 4 }}>
          <View style={{ width: 11, height: 2.5, borderRadius: 1.5, backgroundColor: C.inkSoft, transform: [{ rotate: '-45deg' }, { translateY: 2 }] }} />
          <View style={{ width: 11, height: 2.5, borderRadius: 1.5, backgroundColor: C.inkSoft, transform: [{ rotate: '45deg' }, { translateY: -2 }] }} />
        </View>
        <Text style={s.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
      <View style={{ width: 76 }} />
    </View>
  );
}

// ── PIN gate (wraps the parent-only screens) ──────────────────────
function PinGate({ onUnlock, onBack, title }: { onUnlock: () => void; onBack: () => void; title: string }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;

  const press = (d: string) => {
    if (d === '⌫') { setPin(p => p.slice(0, -1)); setError(false); return; }
    if (pin.length >= 4 || !d) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      if (next === PARENT_PIN) setTimeout(onUnlock, 150);
      else {
        setError(true);
        Animated.sequence([
          Animated.timing(shake, { toValue: 12, duration: 60, useNativeDriver: true }),
          Animated.timing(shake, { toValue: -12, duration: 60, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start(() => setTimeout(() => { setPin(''); setError(false); }, 350));
      }
    }
  };
  const dotColor = error ? '#FF6B6B' : C.goldSoft;

  return (
    <LinearGradient colors={['#2A2046', '#1A1330', '#120D24']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.pinHeaderRow}>
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }} style={s.pinBack}>
            <View style={{ width: 10, height: 10, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderColor: '#FFF', transform: [{ rotate: '-45deg' }] }} />
          </TouchableOpacity>
        </View>
        <View style={s.pinBody}>
          <View style={s.pinRing}>
            <Image source={MILO.base} style={{ width: 70, height: 70, resizeMode: 'contain' }} />
          </View>
          <Text style={s.pinTitle}>Grown-Ups Only</Text>
          <Text style={s.pinSub}>Enter the PIN to open{'\n'}{title}</Text>
          <Animated.View style={[{ flexDirection: 'row', gap: 16, marginVertical: 22 }, { transform: [{ translateX: shake }] }]}>
            {[0,1,2,3].map(i => <View key={i} style={[s.pinDot, { borderColor: dotColor }, pin.length > i && { backgroundColor: dotColor }]} />)}
          </Animated.View>
          {error && <Text style={s.pinErr}>Wrong PIN — try again</Text>}
          <View style={s.pad}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
              <TouchableOpacity key={i} style={[s.padKey, !d && { opacity: 0 }]} disabled={!d} onPress={() => press(d)} activeOpacity={0.7}>
                <Text style={s.padKeyText}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── Data hook ─────────────────────────────────────────────────────
function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(`${API_URL}/profile/${CHILD_ID}`)
      .then(r => r.json())
      .then(d => { if (alive) { setProfile(d); setLoading(false); } })
      .catch(() => { if (alive) { setFailed(true); setLoading(false); } });
    return () => { alive = false; };
  }, []);
  return { profile, loading, failed };
}

// ══════════════════════════════════════════════════════════════════
// 1. MISSION REPORTS  (parent dashboard / analytics)
// ══════════════════════════════════════════════════════════════════
export function MissionReports({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { profile, loading, failed } = useProfile();

  const xpInLevel = profile ? profile.xp % 100 : 0;
  const totalQuests = profile?.completed_quests.length ?? 0;

  return (
    <LinearGradient colors={['#FBEFD9', C.canvas]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Mission Reports" onBack={onBack} />
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 24, gap: 14 }} showsVerticalScrollIndicator={false}>

          {loading && <Text style={s.loading}>Loading reports…</Text>}
          {failed && (
            <View style={s.errCard}>
              <Text style={s.errTitle}>Can't reach the backend</Text>
              <Text style={s.errBody}>Make sure the server is running and your phone is on the same WiFi. Reports use live data, so they need the connection.</Text>
            </View>
          )}

          {profile && (
            <>
              {/* Hero level card */}
              <View style={[s.heroCard, CARD_SHADOW]}>
                <LinearGradient colors={['#2A2046', '#1A1330']} style={s.heroGrad}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={s.heroRing}>
                      <Text style={s.heroLevelNum}>{profile.level}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.heroKicker}>CURRENT LEVEL</Text>
                      <Text style={s.heroXp}>{profile.xp} XP earned</Text>
                      <View style={s.heroBarTrack}>
                        <View style={[s.heroBarFill, { width: `${xpInLevel}%` }]} />
                      </View>
                      <Text style={s.heroBarLabel}>{xpInLevel}/100 to level {profile.level + 1}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* Stat tiles */}
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <StatTile big={`${profile.streak}`} label="DAY STREAK" sub={profile.streak > 0 ? 'Keep it going!' : 'Start today!'} accent="#FF6B6B" />
                <StatTile big={`${totalQuests}`} label="QUESTS DONE" sub="all time" accent="#10AC84" />
              </View>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <StatTile big={`${profile.quests_today}`} label="TODAY" sub="quests so far" accent="#4EA8DE" />
                <StatTile big={`${profile.level}`} label="LEVEL" sub="and climbing" accent="#D99A2B" />
              </View>

              {/* Completed quests list */}
              <View style={[s.panel, CARD_SHADOW]}>
                <Text style={s.panelTitle}>Completed Quests</Text>
                <View style={s.panelDivider} />
                {profile.completed_quests.length === 0 ? (
                  <Text style={s.emptyText}>No quests completed yet. When your child finishes their first quest, it'll appear here.</Text>
                ) : (
                  profile.completed_quests.map((q, i) => (
                    <View key={q + i} style={s.questRow}>
                      <View style={s.questDot} />
                      <Text style={s.questName}>{prettyQuestId(q)}</Text>
                      <Text style={s.questCheck}>✓</Text>
                    </View>
                  ))
                )}
              </View>

              <Text style={s.footNote}>Reports update live from your child's activity.</Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function StatTile({ big, label, sub, accent }: { big: string; label: string; sub: string; accent: string }) {
  return (
    <View style={[s.statTile, CARD_SHADOW]}>
      <View style={[s.statAccent, { backgroundColor: accent }]} />
      <Text style={[s.statBig, { color: accent }]}>{big}</Text>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statSub}>{sub}</Text>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// 2. MILO'S TREASURE  (achievements from real milestones)
// ══════════════════════════════════════════════════════════════════
type Achievement = { id: string; icon: string; title: string; desc: string; earned: (p: Profile) => boolean; progress?: (p: Profile) => string };

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', icon: '🌱', title: 'First Steps', desc: 'Complete your very first quest', earned: p => p.completed_quests.length >= 1 },
  { id: 'getting_going', icon: '⭐', title: 'Getting Going', desc: 'Complete 3 quests', earned: p => p.completed_quests.length >= 3, progress: p => `${Math.min(p.completed_quests.length, 3)}/3` },
  { id: 'explorer', icon: '🧭', title: 'True Explorer', desc: 'Complete 5 quests', earned: p => p.completed_quests.length >= 5, progress: p => `${Math.min(p.completed_quests.length, 5)}/5` },
  { id: 'streak2', icon: '🔥', title: 'On Fire', desc: 'Reach a 2-day streak', earned: p => p.streak >= 2, progress: p => `${Math.min(p.streak, 2)}/2` },
  { id: 'streak7', icon: '💎', title: 'Diamond Streak', desc: 'Reach a 7-day streak', earned: p => p.streak >= 7, progress: p => `${Math.min(p.streak, 7)}/7` },
  { id: 'xp100', icon: '🏅', title: 'Century', desc: 'Earn 100 XP', earned: p => p.xp >= 100, progress: p => `${Math.min(p.xp, 100)}/100` },
  { id: 'xp500', icon: '👑', title: 'XP Champion', desc: 'Earn 500 XP', earned: p => p.xp >= 500, progress: p => `${Math.min(p.xp, 500)}/500` },
  { id: 'level5', icon: '🚀', title: 'High Flyer', desc: 'Reach level 5', earned: p => p.level >= 5, progress: p => `Lv ${p.level}/5` },
];

export function MiloTreasure({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { profile, loading, failed } = useProfile();
  const earnedCount = profile ? ACHIEVEMENTS.filter(a => a.earned(profile)).length : 0;

  return (
    <LinearGradient colors={['#FBEFD9', C.canvas]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Milo's Treasure" onBack={onBack} />
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 24, gap: 14 }} showsVerticalScrollIndicator={false}>

          {loading && <Text style={s.loading}>Opening the treasure chest…</Text>}
          {failed && (
            <View style={s.errCard}>
              <Text style={s.errTitle}>Can't reach the backend</Text>
              <Text style={s.errBody}>Achievements are based on live progress, so the server needs to be running.</Text>
            </View>
          )}

          {profile && (
            <>
              <View style={[s.treasureHero, CARD_SHADOW]}>
                <LinearGradient colors={['#2A2046', '#1A1330']} style={s.treasureGrad}>
                  <Text style={s.treasureCount}>{earnedCount}<Text style={s.treasureCountTotal}> / {ACHIEVEMENTS.length}</Text></Text>
                  <Text style={s.treasureLabel}>TROPHIES EARNED</Text>
                </LinearGradient>
              </View>

              {ACHIEVEMENTS.map(a => {
                const earned = a.earned(profile);
                return (
                  <View key={a.id} style={[s.achCard, CARD_SHADOW, !earned && { opacity: 0.55 }]}>
                    <View style={[s.achIcon, { backgroundColor: earned ? C.goldWash : 'rgba(36,27,58,0.05)' }]}>
                      <Text style={{ fontSize: 26, opacity: earned ? 1 : 0.4 }}>{a.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.achTitle}>{a.title}</Text>
                      <Text style={s.achDesc}>{a.desc}</Text>
                    </View>
                    {earned ? (
                      <View style={s.achBadge}><Text style={s.achBadgeText}>✓</Text></View>
                    ) : (
                      a.progress && <Text style={s.achProgress}>{a.progress(profile)}</Text>
                    )}
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ══════════════════════════════════════════════════════════════════
// 3. PARENT SETTINGS  (PIN-gated controls)
// ══════════════════════════════════════════════════════════════════
export function ParentSettings({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const store = useProfileStore();
  const [childName, setChildName] = useState(store.display_name);
  useEffect(() => { setChildName(store.display_name); }, [store.display_name]);
  const { profile } = useProfile();

  // Defined in component body so it always reads the latest childName (no stale closure)
  const saveName = () => {
    const name = childName.trim() || 'Explorer';
    store.setName(name);
    Alert.alert('Saved', `Name updated to ${name}!`);
  };

  return (
    <LinearGradient colors={['#FBEFD9', C.canvas]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Parent Settings" onBack={onBack} />
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 24, gap: 14 }} showsVerticalScrollIndicator={false}>

          {/* Child profile */}
          <View style={[s.panel, CARD_SHADOW]}>
            <Text style={s.panelTitle}>Child Profile</Text>
            <View style={s.panelDivider} />
            <Text style={s.fieldLabel}>Display Name</Text>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <TextInput
                value={childName}
                onChangeText={setChildName}
                returnKeyType="done"
                onSubmitEditing={saveName}
                style={[s.input, { flex: 1 }]}
                placeholder="Child's name"
                placeholderTextColor={C.muted}
              />
              <TouchableOpacity onPress={saveName} style={s.saveBtn} activeOpacity={0.85}>
                <Text style={s.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
            {profile && <Text style={s.fieldHint}>Level {profile.level} · {profile.xp} XP · {profile.streak}-day streak</Text>}
          </View>

          

          {/* Safety */}
          <View style={[s.panel, CARD_SHADOW]}>
            <Text style={s.panelTitle}>Safety</Text>
            <View style={s.panelDivider} />
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Parent PIN</Text>
              <Text style={s.infoValue}>•••• (2580)</Text>
            </View>
            <Text style={s.fieldHint}>The PIN guards reports, settings, and quest unlocks. PIN editing arrives in a later update.</Text>
          </View>

          {/* Danger zone */}
          <View style={[s.panel, CARD_SHADOW]}>
            <Text style={[s.panelTitle, { color: '#FF6B6B' }]}>Reset</Text>
            <View style={s.panelDivider} />
            <Text style={s.fieldHint}>Resetting clears all XP, streaks, and history for this child. This can't be undone.</Text>
            <TouchableOpacity style={s.dangerBtn} activeOpacity={0.85}
              onPress={() => Alert.alert('Reset Progress?',
                'This clears all XP, streaks, and history for this child. This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reset', style: 'destructive', onPress: () => { store.reset(); Alert.alert('Done', 'Progress has been reset.'); } },
                ]
              )}>
              <Text style={s.dangerBtnText}>Reset Child Progress</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={s.toggleRow}>
      <Text style={s.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: 'rgba(36,27,58,0.15)', true: C.goldSoft }} thumbColor={value ? C.gold : '#f4f3f4'} />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// 4. ABOUT APP
// ══════════════════════════════════════════════════════════════════
export function AboutApp({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={['#FBEFD9', C.canvas]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="About App" onBack={onBack} />
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 24, gap: 14 }} showsVerticalScrollIndicator={false}>

          {/* Brand */}
          <View style={[s.aboutHero, CARD_SHADOW]}>
            <View style={s.aboutRing}><Image source={MILO.base} style={{ width: 76, height: 76, resizeMode: 'contain' }} /></View>
            <Text style={s.aboutBrand}>PersonaPals</Text>
            <Text style={s.aboutTag}>Your child's friendly companion for building everyday life skills, with Milo by their side.</Text>
            <View style={s.aboutVersionPill}><Text style={s.aboutVersionText}>Version 1.0.0 · Beta</Text></View>
          </View>

          {/* What it is */}
          <View style={[s.panel, CARD_SHADOW]}>
            <Text style={s.panelTitle}>What is PersonaPals?</Text>
            <View style={s.panelDivider} />
            <Text style={s.aboutBody}>PersonaPals helps children aged 4–10 build independence, daily habits, and confidence through guided quests. Milo, an AI companion, talks with your child, cheers them on, and remembers their progress but always under a parent's supervision.</Text>
          </View>

          {/* Needs internet */}
          <View style={[s.panel, CARD_SHADOW]}>
            <Text style={s.panelTitle}>What needs internet</Text>
            <View style={s.panelDivider} />
            <NeedsRow online label="Chatting with Milo" desc="His replies are generated live by AI" />
            <NeedsRow online label="Mission Reports" desc="Live progress, XP, and streaks" />
            <NeedsRow online label="Milo's Treasure" desc="Achievements update from live data" />
            <NeedsRow online label="Saving quest progress" desc="XP and completions are stored on the server" />
          </View>

          {/* Works offline */}
          <View style={[s.panel, CARD_SHADOW]}>
            <Text style={s.panelTitle}>What works offline</Text>
            <View style={s.panelDivider} />
            <NeedsRow label="Browsing quests" desc="All quests are built into the app" />
            <NeedsRow label="Reading quest steps" desc="Instructions don't need a connection" />
            <NeedsRow label="The lock screen & PIN" desc="Works without internet" />
            <Text style={[s.fieldHint, { marginTop: 10 }]}>If the connection drops while chatting, Milo shows a friendly backup message so your child is never stuck.</Text>
          </View>

          {/* Privacy */}
          <View style={[s.panel, CARD_SHADOW]}>
            <Text style={s.panelTitle}>Privacy</Text>
            <View style={s.panelDivider} />
            <Text style={s.aboutBody}>PersonaPals never asks your child for personal information. Milo is designed to keep all conversations safe, gentle, and age-appropriate, and to guide children toward a trusted grown-up when needed.</Text>
          </View>

          <Text style={[s.footNote, { textAlign: 'center' }]}>Made with care for curious kids and their grown-ups.</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function NeedsRow({ online, label, desc }: { online?: boolean; label: string; desc: string }) {
  return (
    <View style={s.needsRow}>
      <View style={[s.needsDot, { backgroundColor: online ? '#FF9F43' : '#10AC84' }]} />
      <View style={{ flex: 1 }}>
        <Text style={s.needsLabel}>{label}</Text>
        <Text style={s.needsDesc}>{desc}</Text>
      </View>
      <Text style={[s.needsTag, { color: online ? '#FF9F43' : '#10AC84' }]}>{online ? 'ONLINE' : 'OFFLINE'}</Text>
    </View>
  );
}

// ── helpers ───────────────────────────────────────────────────────
function prettyQuestId(id: string): string {
  return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ══════════════════════════════════════════════════════════════════
// PIN-gating wrappers — export these for Reports / Treasure / Settings
// ══════════════════════════════════════════════════════════════════
export function Gated({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <PinGate title={title} onUnlock={() => setUnlocked(true)} onBack={onBack} />;
  return <>{children}</>;
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 10, gap: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.card, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: C.hairline, ...CARD_SHADOW, shadowOpacity: 0.06 },
  backText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 13, color: C.inkSoft },
  headerTitle: { flex: 1, fontFamily: 'Nunito_900Black', fontSize: 16, color: C.ink, textAlign: 'center' },

  loading: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: C.muted, textAlign: 'center', marginTop: 40 },
  errCard: { backgroundColor: '#FFF5F5', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)' },
  errTitle: { fontFamily: 'Nunito_900Black', fontSize: 14, color: '#FF6B6B', marginBottom: 4 },
  errBody: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: C.inkSoft, lineHeight: 19 },

  // Hero
  heroCard: { borderRadius: 24, overflow: 'hidden' },
  heroGrad: { padding: 18 },
  heroRing: { width: 64, height: 64, borderRadius: 32, borderWidth: 2.5, borderColor: C.goldSoft, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(244,201,100,0.12)' },
  heroLevelNum: { fontFamily: 'Nunito_900Black', fontSize: 28, color: C.goldSoft },
  heroKicker: { fontFamily: 'Nunito_900Black', fontSize: 9, letterSpacing: 1.8, color: 'rgba(255,255,255,0.55)' },
  heroXp: { fontFamily: 'Nunito_900Black', fontSize: 18, color: '#FFF', marginVertical: 3 },
  heroBarTrack: { height: 7, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden', marginTop: 4 },
  heroBarFill: { height: '100%', backgroundColor: C.goldSoft, borderRadius: 4 },
  heroBarLabel: { fontFamily: 'Nunito_700Bold', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  // Stat tiles
  statTile: { flex: 1, backgroundColor: C.card, borderRadius: 20, padding: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.hairline },
  statAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  statBig: { fontFamily: 'Nunito_900Black', fontSize: 34, marginTop: 4 },
  statLabel: { fontFamily: 'Nunito_900Black', fontSize: 10, letterSpacing: 1, color: C.ink, marginTop: 2 },
  statSub: { fontFamily: 'Nunito_700Bold', fontSize: 11, color: C.muted, marginTop: 1 },

  // Panels
  panel: { backgroundColor: C.card, borderRadius: 22, padding: 16, borderWidth: 1, borderColor: C.hairline },
  panelTitle: { fontFamily: 'Nunito_900Black', fontSize: 15, color: C.ink },
  panelDivider: { height: 1, backgroundColor: C.hairline, marginTop: 10, marginBottom: 12 },
  emptyText: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: C.muted, lineHeight: 20 },
  questRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  questDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.goldSoft },
  questName: { flex: 1, fontFamily: 'Nunito_700Bold', fontSize: 14, color: C.ink },
  questCheck: { fontFamily: 'Nunito_900Black', fontSize: 14, color: '#10AC84' },
  footNote: { fontFamily: 'Nunito_700Bold', fontSize: 12, color: C.muted, lineHeight: 18, marginTop: 4, textAlign: 'center' },

  // Treasure
  treasureHero: { borderRadius: 24, overflow: 'hidden' },
  treasureGrad: { padding: 22, alignItems: 'center' },
  treasureCount: { fontFamily: 'Nunito_900Black', fontSize: 44, color: C.goldSoft },
  treasureCountTotal: { fontSize: 24, color: 'rgba(255,255,255,0.5)' },
  treasureLabel: { fontFamily: 'Nunito_900Black', fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  achCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 20, padding: 14, gap: 14, borderWidth: 1, borderColor: C.hairline },
  achIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  achTitle: { fontFamily: 'Nunito_900Black', fontSize: 15, color: C.ink },
  achDesc: { fontFamily: 'Nunito_700Bold', fontSize: 12.5, color: C.muted, marginTop: 2 },
  achBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#10AC84', alignItems: 'center', justifyContent: 'center' },
  achBadgeText: { fontFamily: 'Nunito_900Black', fontSize: 15, color: '#FFF' },
  achProgress: { fontFamily: 'Nunito_900Black', fontSize: 12, color: C.gold },

  // Settings
  fieldLabel: { fontFamily: 'Nunito_800ExtraBold', fontSize: 12, color: C.inkSoft, marginBottom: 6 },
  input: { backgroundColor: C.canvas, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Nunito_700Bold', fontSize: 15, color: C.ink, borderWidth: 1, borderColor: C.hairline },
  saveBtn: { backgroundColor: C.gold, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontFamily: 'Nunito_900Black', fontSize: 14, color: '#FFF' },
  fieldHint: { fontFamily: 'Nunito_700Bold', fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 18 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  toggleLabel: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: C.ink },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoLabel: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: C.ink },
  infoValue: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14, color: C.gold },
  dangerBtn: { backgroundColor: '#FFF5F5', borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,107,107,0.4)', marginTop: 12 },
  dangerBtnText: { fontFamily: 'Nunito_900Black', fontSize: 14, color: '#FF6B6B' },

  // About
  aboutHero: { backgroundColor: C.card, borderRadius: 24, padding: 22, alignItems: 'center', borderWidth: 1, borderColor: C.hairline },
  aboutRing: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.goldWash, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.goldSoft, marginBottom: 12 },
  aboutBrand: { fontFamily: 'Nunito_900Black', fontSize: 24, color: C.ink },
  aboutTag: { fontFamily: 'Nunito_700Bold', fontSize: 13.5, color: C.inkSoft, textAlign: 'center', lineHeight: 20, marginTop: 8, paddingHorizontal: 8 },
  aboutVersionPill: { backgroundColor: C.goldWash, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5, marginTop: 12, borderWidth: 1, borderColor: 'rgba(244,201,100,0.4)' },
  aboutVersionText: { fontFamily: 'Nunito_900Black', fontSize: 11, color: C.gold, letterSpacing: 0.5 },
  aboutBody: { fontFamily: 'Nunito_700Bold', fontSize: 13.5, color: C.inkSoft, lineHeight: 21 },
  needsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, gap: 12 },
  needsDot: { width: 10, height: 10, borderRadius: 5 },
  needsLabel: { fontFamily: 'Nunito_800ExtraBold', fontSize: 13.5, color: C.ink },
  needsDesc: { fontFamily: 'Nunito_700Bold', fontSize: 12, color: C.muted, marginTop: 1 },
  needsTag: { fontFamily: 'Nunito_900Black', fontSize: 9, letterSpacing: 1 },

  // PIN gate
  pinHeaderRow: { paddingHorizontal: 18, paddingTop: 6 },
  pinBack: { width: 44, height: 44, justifyContent: 'center' },
  pinBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, marginTop: -30 },
  pinRing: { width: 110, height: 110, borderRadius: 55, borderWidth: 2.5, borderColor: C.goldSoft, backgroundColor: 'rgba(244,201,100,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  pinTitle: { fontFamily: 'Nunito_900Black', fontSize: 24, color: '#FFF', textAlign: 'center' },
  pinSub: { fontFamily: 'Nunito_700Bold', fontSize: 13.5, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 20, marginTop: 8 },
  pinDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2.5, backgroundColor: 'transparent' },
  pinErr: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: '#FF6B6B', marginBottom: 8 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', width: 264, gap: 12, justifyContent: 'center' },
  padKey: { width: 74, height: 74, borderRadius: 37, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.16)' },
  padKeyText: { fontSize: 26, fontFamily: 'Nunito_900Black', color: '#FFF' },
});
