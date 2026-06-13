import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MILO } from '../constants/miloImages';
import { API_URL } from '../constants/api';
import { MissionReports, MiloTreasure, ParentSettings, AboutApp, Gated } from './ParentScreens';
import { useProfileStore } from '../constants/profileStore';
import { useAndroidBack } from '../hooks/useAndroidBack';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(width * 0.82, 340);

const C = {
  canvas: '#F6F0E5',
  canvasDeep: '#EFE6D6',
  card: '#FFFFFF',
  ink: '#241B3A',
  inkSoft: '#5C5470',
  muted: '#938BA3',
  gold: '#D99A2B',
  goldSoft: '#F4C964',
  goldWash: 'rgba(217,154,43,0.12)',
  hairline: 'rgba(36,27,58,0.07)',
  inkDark: '#1A1330',
};

const SECTORS = [
  { id: 'ALL', label: 'All', color: C.ink },
  { id: 'ROUTINE', label: 'Routines', color: '#FF9F43' },
  { id: 'CHORE', label: 'Chores', color: '#FF6B8B' },
  { id: 'KITCHEN', label: 'Kitchen', color: '#FF6B6B' },
  { id: 'SOCIAL', label: 'Social', color: '#10AC84' },
  { id: 'CALM', label: 'Calm', color: '#7457F1' },
  { id: 'HYGIENE', label: 'Hygiene', color: '#4EA8DE' },
  { id: 'SAFETY', label: 'Safety', color: '#3B82F6' },
  { id: 'INDEPENDENCE', label: 'Independence', color: '#F59E0B' },
];

const TASKS = [
  { id: 'morning_launchpad', sector: 'ROUTINE', name: 'Morning Launchpad', emoji: '☀️', description: 'Wake up, clear your sheets, and get dressed.', accent: '#FF9F43', bg: '#FFF9F2' },
  { id: 'dental_sparkle', sector: 'ROUTINE', name: 'Brush & Sparkle', emoji: '🪥', description: 'Clean your teeth top and bottom for a bright smile.', accent: '#4EA8DE', bg: '#F2FAFF' },
  { id: 'backpack_pack', sector: 'ROUTINE', name: 'Backpack Checklist', emoji: '🎒', description: 'Gather your diary, assignments, and pencil case.', accent: '#10AC84', bg: '#F2FFF9' },
  { id: 'lunchbox_ready', sector: 'ROUTINE', name: 'Lunchbox Assembly', emoji: '🍱', description: 'Place your snacks and water flask inside your bag pouch.', accent: '#FF6B6B', bg: '#FFFEF2' },
  { id: 'shoes_on', sector: 'ROUTINE', name: 'Shoe & Coat Armor', emoji: '👟', description: 'Put on your socks, tie your laces, and grab your jacket.', accent: '#FF9F43', bg: '#FFF9F2' },
  { id: 'bedtime_winddown', sector: 'ROUTINE', name: 'Bedtime Slowdown', emoji: '🌙', description: 'Change into comfy PJs and make your room quiet.', accent: '#7457F1', bg: '#F6F2FF' },
  { id: 'clean_room', sector: 'CHORE', name: 'Room Ranger Duty', emoji: '🧹', description: 'Put your toys in their boxes and pick up items from the floor.', accent: '#FF6B6B', bg: '#FFF2F5' },
  { id: 'wash_dishes', sector: 'CHORE', name: 'Dish Bubble Splash', emoji: '🍽️', description: 'Rinse your plate, cup, and spoon carefully in the kitchen sink.', accent: '#00D2D3', bg: '#F2FFFF' },
  { id: 'do_laundry', sector: 'CHORE', name: 'Laundry Sorting', emoji: '🧺', description: 'Drop dark clothes and light clothes into their correct baskets.', accent: '#54A0FF', bg: '#F2F7FF' },
  { id: 'fold_clothes', sector: 'CHORE', name: 'Wardrobe Origami', emoji: '👕', description: 'Fold your clean t-shirts and match your socks into pairs.', accent: '#FF6B8B', bg: '#FFF2F5' },
  { id: 'empty_trash', sector: 'CHORE', name: 'Trash Bin Patrol', emoji: '🗑️', description: 'Take the small trash bags to the main house garbage bin.', accent: '#00D2D3', bg: '#F2FFFF' },
  { id: 'plant_care', sector: 'CHORE', name: 'Botanical Guardian', emoji: '🪴', description: 'Give the house plants a small splash of water so they grow.', accent: '#10AC84', bg: '#F2FFF9' },
  { id: 'basic_cooking', sector: 'KITCHEN', name: 'Snack Master Chef', emoji: '🥪', description: 'Safely assemble your own sandwich or cereal bowl.', accent: '#FF9F43', bg: '#FFF9F2' },
  { id: 'set_table', sector: 'KITCHEN', name: 'Table Layout Design', emoji: '🍴', description: 'Lay out mats, forks, spoons, and water glasses before dinner.', accent: '#FF6B6B', bg: '#FFFEF2' },
  { id: 'wipe_counters', sector: 'KITCHEN', name: 'Countertop Cruiser', emoji: '🧽', description: 'Use a damp cloth to wipe away crumbs after eating.', accent: '#00D2D3', bg: '#F2FFFF' },
  { id: 'buy_something', sector: 'SOCIAL', name: 'Shopkeeper Checkout', emoji: '🪙', description: 'Practice greeting a cashier, handing over money, and taking change.', accent: '#10AC84', bg: '#F2FFF9' },
  { id: 'phone_call', sector: 'SOCIAL', name: 'Phone Call Connect', emoji: '📞', description: 'Dial a family member, say hello clearly, and talk safely.', accent: '#7457F1', bg: '#F6F2FF' },
  { id: 'ask_directions', sector: 'SOCIAL', name: 'Information Seeker', emoji: '🗺️', description: 'Practice asking an employee at a store where an item is located.', accent: '#54A0FF', bg: '#F2F7FF' },
  { id: 'cool_down', sector: 'CALM', name: 'Reset Button', emoji: '🧘', description: 'Take 5 deep breaths or look out the window when feeling big feelings.', accent: '#7457F1', bg: '#F6F2FF' },
  { id: 'screen_timer', sector: 'CALM', name: 'Device Disconnect', emoji: '📵', description: 'Turn off your tablet or TV without an argument when the timer rings.', accent: '#FF6B6B', bg: '#FFFEF2' },
  { id: 'wash_hands', sector: 'HYGIENE', name: 'Suds & Scrub', emoji: '🧼', description: 'Scrub your hands with soap for 20 full seconds before eating.', accent: '#4EA8DE', bg: '#F2FAFF' },
  { id: 'take_shower', sector: 'HYGIENE', name: 'Shower Spaceship', emoji: '🚿', description: 'Wash your hair, scrub your body, and dry off completely.', accent: '#54A0FF', bg: '#F2F7FF' },
  { id: 'safety_trusted_adults', sector: 'SAFETY', name: 'Safety Squad', emoji: '🛡️', description: 'Name the trusted grown-ups who keep you safe.', accent: '#3B82F6', bg: '#F2F7FF' },
  { id: 'safety_boundaries', sector: 'SAFETY', name: 'My Body, My Rules', emoji: '✋', description: 'Learn that your body is yours and it is okay to say no.', accent: '#059669', bg: '#F2FFF9' },
  { id: 'safety_digital', sector: 'SAFETY', name: 'Online Explorer Shield', emoji: '📱', description: 'Stay smart and private when using a tablet or phone.', accent: '#6366F1', bg: '#F4F2FF' },
  { id: 'independence_shopping', sector: 'INDEPENDENCE', name: 'Market Mission', emoji: '🛒', description: 'Read a list and find each item at the store.', accent: '#10AC84', bg: '#F2FFF9' },
  { id: 'independence_money', sector: 'INDEPENDENCE', name: 'Coin Counter', emoji: '🪙', description: 'Count your coins and learn what you can buy.', accent: '#F59E0B', bg: '#FFFBEB' },
  { id: 'independence_ordering', sector: 'INDEPENDENCE', name: 'Order Hero', emoji: '🍔', description: 'Practice ordering your food politely at a counter.', accent: '#FB923C', bg: '#FFF7ED' },
];

function Chevron({ color = C.muted, size = 9 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size * 1.6, justifyContent: 'center' }}>
      <View style={{
        width: size, height: size,
        borderTopWidth: 2, borderRightWidth: 2, borderColor: color,
        transform: [{ rotate: '45deg' }],
      }} />
    </View>
  );
}

function TaskCard({ task, index, onPress }: { task: any; index: number; onPress: (task: any) => void }) {
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 350, delay: Math.min(index * 55, 500), useNativeDriver: true }),
    ]).start();
  }, [task.id]);

  const onIn = () => Animated.spring(pressAnim, { toValue: 0.975, useNativeDriver: true, speed: 50 }).start();
  const onOut = () => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  return (
    <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }] }}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onPress(task)}
        onPressIn={onIn}
        onPressOut={onOut}
        style={styles.card}
      >
        <View style={[styles.accentRail, { backgroundColor: task.accent }]} />
        <View style={[styles.medallion, { backgroundColor: task.bg, borderColor: task.accent + '33' }]}>
          <Text style={styles.medallionEmoji}>{task.emoji}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardSector, { color: task.accent }]}>{task.sector}</Text>
          <Text style={styles.cardTitle} numberOfLines={1}>{task.name}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{task.description}</Text>
        </View>
        <View style={styles.cardRight}>
          <Chevron color={C.muted} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Missions({ onSelectTask }: { onSelectTask: (task: any) => void }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const profile = useProfileStore();

  // Refresh stats whenever we close a parent screen / return to the list
  useEffect(() => {
    if (activeScreen === null) profile.refresh();
  }, [activeScreen]);


  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);


  const toggleSidebar = (open: boolean) => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    if (open) setSidebarOpen(true);
    Animated.parallel([
      Animated.timing(sidebarAnim, { toValue: open ? 0 : -SIDEBAR_WIDTH, duration: 280, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: open ? 1 : 0, duration: 280, useNativeDriver: true }),
    ]).start(() => {
      if (!open) setSidebarOpen(false);
      isAnimating.current = false;
    });
  };

  const openScreen = (label: string) => {
    sidebarAnim.setValue(-SIDEBAR_WIDTH);
    overlayOpacity.setValue(0);
    setSidebarOpen(false);
    isAnimating.current = false;
    setActiveScreen(label);
  };

  useAndroidBack(() => {
    if (activeScreen !== null) { setActiveScreen(null); return true; }
    if (sidebarOpen) { toggleSidebar(false); return true; }
    return false;
  });

  const filteredTasks = activeFilter === 'ALL' ? TASKS : TASKS.filter((t) => t.sector === activeFilter);
  const MENU = ['Mission Reports', "Milo's Treasure", 'Parent Settings'];


  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent animated />
      <LinearGradient colors={['#FBEFD9', C.canvas]} style={styles.topWash} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Hero card with live backend stats */}
          <View style={styles.hero}>
            <View style={styles.heroRow}>
              {/* Menu button in hero */}
              <TouchableOpacity style={styles.menuBtn} onPress={() => toggleSidebar(true)} activeOpacity={0.7}>
                <View style={styles.menuBar} />
                <View style={styles.menuBar} />
                <View style={styles.menuBar} />
              </TouchableOpacity>
              <View style={styles.heroAvatarRing}>
                <View style={styles.heroAvatarInner}>
                  <Image source={MILO.base} style={styles.heroAvatar} />
                </View>
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroKicker}>WELCOME</Text>
                <Text style={styles.heroName}>Hi, {profile.display_name}</Text>
                <Text style={styles.heroSub}>Milo has new quests waiting for you today.</Text>
              </View>
    
            </View>

            {/* Live stats from backend */}
            <View style={styles.statStrip}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.level}</Text>
                <Text style={styles.statLabel}>LEVEL</Text>
              </View>
              <View style={styles.statSep} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.xp.toLocaleString()}</Text>
                <Text style={styles.statLabel}>TOTAL XP</Text>
              </View>
              <View style={styles.statSep} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.streak}</Text>
                <Text style={styles.statLabel}>DAY STREAK</Text>
              </View>
            </View>
          </View>

          {/* Section heading */}
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Choose your quest</Text>
            <View style={styles.goldRule} />
          </View>

          {/* Filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
            style={styles.chipsScroll}
          >
            {SECTORS.map((s) => {
              const selected = activeFilter === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  activeOpacity={0.85}
                  onPress={() => setActiveFilter(s.id)}
                  style={[styles.chip, selected && { backgroundColor: C.ink, borderColor: C.ink }]}
                >
                  {selected && <View style={[styles.chipDot, { backgroundColor: s.id === 'ALL' ? C.goldSoft : s.color }]} />}
                  <Text style={[styles.chipText, selected && { color: '#FFFFFF' }]}>{s.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Task list */}
          <View style={styles.list}>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} onPress={onSelectTask} />
              ))
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Nothing here yet</Text>
                <Text style={styles.emptySub}>This category has no quests right now.</Text>
              </View>
            )}
          </View>

          <View style={{ height: 56 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Overlay */}
      <Animated.View pointerEvents={sidebarOpen ? 'auto' : 'none'} style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={{ flex: 1 }} onPress={() => toggleSidebar(false)} />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
        <LinearGradient colors={['#2A2046', C.inkDark, '#120D24']} style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.sbHeader}>
              <View style={styles.sbAvatarRing}>
                <Image source={MILO.base} style={styles.sbAvatar} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sbBrand}>PersonaPals</Text>
                <View style={styles.sbProBadge}>
                  <Text style={styles.sbProText}>DESIGNED WITH CARE</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.sbClose}
                onPress={() => toggleSidebar(false)}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              >
                <View style={[styles.closeBar, { transform: [{ rotate: '45deg' }] }]} />
                <View style={[styles.closeBar, { transform: [{ rotate: '-45deg' }] }]} />
              </TouchableOpacity>
            </View>

            <View style={styles.sbDivider} />

            <View style={styles.sbMenu}>
              {MENU.map((label) => (
                <TouchableOpacity key={label} activeOpacity={0.7} style={styles.sbItem}
                  onPress={() => openScreen(label)}>
                  <View style={styles.sbItemMark} />
                  <Text style={styles.sbItemLabel}>{label}</Text>
                  <Chevron color="rgba(255,255,255,0.35)" size={8} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flex: 1 }} />

            <View style={styles.sbFooter}>
              <View style={styles.sbDivider} />
              <TouchableOpacity activeOpacity={0.7} style={styles.sbItem}
                onPress={() => openScreen('About App')}>
                <View style={styles.sbItemMark} />
                <Text style={styles.sbItemLabel}>About App</Text>
                <Chevron color="rgba(255,255,255,0.35)" size={8} />
              </TouchableOpacity>
              <Text style={styles.sbVersion}>Version 1.0.0  ·  Beta</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>
      {/* Parent screens render on top — Missions stays mounted underneath */}
      {activeScreen === 'Mission Reports' && (
        <View style={StyleSheet.absoluteFill}>
          <Gated title="Mission Reports" onBack={() => setActiveScreen(null)}><MissionReports onBack={() => setActiveScreen(null)} /></Gated>
        </View>
      )}
      {activeScreen === "Milo's Treasure" && (
        <View style={StyleSheet.absoluteFill}>
          <Gated title="Milo's Treasure" onBack={() => setActiveScreen(null)}><MiloTreasure onBack={() => setActiveScreen(null)} /></Gated>
        </View>
      )}
      {activeScreen === 'Parent Settings' && (
        <View style={StyleSheet.absoluteFill}>
          <Gated title="Parent Settings" onBack={() => setActiveScreen(null)}><ParentSettings onBack={() => setActiveScreen(null)} /></Gated>
        </View>
      )}
      {activeScreen === 'About App' && (
        <View style={StyleSheet.absoluteFill}>
          <AboutApp onBack={() => setActiveScreen(null)} />
        </View>
      )}
    </View>
  );
}

const SHADOW = {
  shadowColor: '#2A1B40',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 6,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.canvas },
  topWash: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },
  safe: { flex: 1 },
  scrollContent: { paddingBottom: 8 },

  menuBtn: { width: 36, height: 44, justifyContent: 'center', gap: 5, alignItems: 'flex-start', marginRight: 8 },
  menuBar: { width: 20, height: 2.5, borderRadius: 2, backgroundColor: C.ink },

  hero: { marginHorizontal: 16, marginTop: 12, backgroundColor: C.card, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: C.hairline, ...SHADOW },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroAvatarRing: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.goldSoft, backgroundColor: C.goldWash },
  heroAvatarInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.canvasDeep, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroAvatar: { width: 58, height: 58, resizeMode: 'contain' },
  heroText: { flex: 1, marginLeft: 14 },
  heroKicker: { fontFamily: 'Nunito_800ExtraBold', fontSize: 10, letterSpacing: 1.6, color: C.gold, marginBottom: 2 },
  heroName: { fontFamily: 'Nunito_900Black', fontSize: 22, color: C.ink, marginBottom: 3 },
  heroSub: { fontFamily: 'Nunito_600SemiBold', fontSize: 12, color: C.inkSoft, lineHeight: 17 },

  statStrip: { flexDirection: 'row', alignItems: 'center', marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.hairline },
  stat: { flex: 1, alignItems: 'center' },
  statSep: { width: 1, height: 30, backgroundColor: C.hairline },
  statValue: { fontFamily: 'Nunito_900Black', fontSize: 20, color: C.ink },
  statLabel: { fontFamily: 'Nunito_800ExtraBold', fontSize: 9, letterSpacing: 1, color: C.muted, marginTop: 3 },

  sectionHead: { flexDirection: 'row', alignItems: 'center', marginTop: 28, marginBottom: 14, paddingHorizontal: 20 },
  sectionTitle: { fontFamily: 'Nunito_900Black', fontSize: 19, color: C.ink },
  goldRule: { flex: 1, height: 2, borderRadius: 2, backgroundColor: C.goldSoft, marginLeft: 14, opacity: 0.6 },

  chipsScroll: { marginBottom: 18 },
  chipsRow: { paddingHorizontal: 16, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: C.card, paddingHorizontal: 16, height: 40, borderRadius: 14, borderWidth: 1, borderColor: C.hairline },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 13, color: C.inkSoft },

  list: { paddingHorizontal: 16, gap: 14 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 24, padding: 14, paddingLeft: 18, borderWidth: 1, borderColor: C.hairline, overflow: 'hidden', ...SHADOW, shadowOpacity: 0.07, shadowRadius: 14, elevation: 3 },
  accentRail: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  medallion: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, marginRight: 14 },
  medallionEmoji: { fontSize: 30 },
  cardBody: { flex: 1, paddingRight: 6 },
  cardSector: { fontFamily: 'Nunito_900Black', fontSize: 9.5, letterSpacing: 1.2, marginBottom: 3 },
  cardTitle: { fontFamily: 'Nunito_900Black', fontSize: 16.5, color: C.ink, marginBottom: 3 },
  cardDesc: { fontFamily: 'Nunito_600SemiBold', fontSize: 12, color: C.muted, lineHeight: 16 },
  cardRight: { width: 22, alignItems: 'center', justifyContent: 'center' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontFamily: 'Nunito_900Black', fontSize: 16, color: C.ink, marginBottom: 4 },
  emptySub: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: C.muted },

  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(26,19,48,0.55)', zIndex: 99 },
  sidebar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: SIDEBAR_WIDTH, zIndex: 100, borderTopRightRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
  sbHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingTop: 20, paddingBottom: 18, gap: 14 },
  sbAvatarRing: { width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: C.goldSoft, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  sbAvatar: { width: 44, height: 44, resizeMode: 'contain' },
  sbBrand: { fontFamily: 'Nunito_900Black', fontSize: 19, color: '#FFFFFF', marginBottom: 5 },
  sbProBadge: { alignSelf: 'flex-start', backgroundColor: C.goldWash, borderColor: 'rgba(244,201,100,0.5)', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  sbProText: { fontFamily: 'Nunito_900Black', fontSize: 9, letterSpacing: 1.5, color: C.goldSoft },
  sbClose: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.08)' },
  closeBar: { position: 'absolute', width: 15, height: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.8)' },
  sbDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 22 },
  sbMenu: { paddingHorizontal: 14, paddingTop: 14 },
  sbItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 12, gap: 14, borderRadius: 14 },
  sbItemMark: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.goldSoft, opacity: 0.85 },
  sbItemLabel: { flex: 1, fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: 'rgba(255,255,255,0.92)' },
  sbFooter: { paddingHorizontal: 14, paddingBottom: 8 },
  sbVersion: { fontFamily: 'Nunito_700Bold', fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 10 },
});