import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MILO } from '../constants/miloImages';

const { width } = Dimensions.get('window');

// ── Premium palette (matches Missions / sidebar) ────────────────
const C = {
  gold: '#D99A2B',
  goldSoft: '#F4C964',
  goldWash: 'rgba(217,154,43,0.14)',
  cream: '#F6F0E5',
  inkDark: '#1A1330',
};

// A small twinkling gold dot (drawn, no emoji) ───────────────────
function Twinkle({ style, anim, size = 5 }: { style: any; anim: Animated.Value; size?: number }) {
  return (
    <Animated.View
      style={[
        { position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: C.goldSoft, opacity: anim },
        style,
      ]}
    />
  );
}

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [animationDone, setAnimationDone] = useState(false);

  const miloScale = useRef(new Animated.Value(0)).current;
  const miloY = useRef(new Animated.Value(-50)).current;
  const miloIdleY = useRef(new Animated.Value(0)).current;
  const miloRotate = useRef(new Animated.Value(0)).current;

  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(16)).current;

  const btnOpacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(0.92)).current;
  const btnPulse = useRef(new Animated.Value(1)).current;

  const t1 = useRef(new Animated.Value(0.2)).current;
  const t2 = useRef(new Animated.Value(0.6)).current;
  const t3 = useRef(new Animated.Value(0.3)).current;
  const t4 = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Twinkles
    const twinkle = (v: Animated.Value, dur: number) =>
      Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: dur, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.2, duration: dur, useNativeDriver: true }),
      ]));
    twinkle(t1, 1200).start();
    twinkle(t2, 900).start();
    twinkle(t3, 1500).start();
    twinkle(t4, 1100).start();

    // Halo rings + Milo entrance
    Animated.parallel([
      Animated.timing(ringOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(ringScale, { toValue: 1, friction: 7, tension: 28, useNativeDriver: true }),
      Animated.spring(miloScale, { toValue: 1, friction: 6, tension: 30, useNativeDriver: true }),
      Animated.spring(miloY, { toValue: 0, friction: 6, tension: 22, useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 800, delay: 250, useNativeDriver: true }),
      Animated.spring(titleY, { toValue: 0, friction: 7, delay: 250, useNativeDriver: true }),
    ]).start(() => setAnimationDone(true));
  }, []);

  useEffect(() => {
    if (!animationDone) return;

    Animated.parallel([
      Animated.timing(btnOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(miloIdleY, { toValue: -9, duration: 1900, useNativeDriver: true }),
        Animated.timing(miloIdleY, { toValue: 0, duration: 1900, useNativeDriver: true }),
      ])).start();

      Animated.loop(Animated.sequence([
        Animated.timing(miloRotate, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(miloRotate, { toValue: -1, duration: 2200, useNativeDriver: true }),
        Animated.timing(miloRotate, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])).start();

      Animated.loop(Animated.sequence([
        Animated.timing(btnPulse, { toValue: 1.035, duration: 1300, useNativeDriver: true }),
        Animated.timing(btnPulse, { toValue: 1, duration: 1300, useNativeDriver: true }),
      ])).start();
    });
  }, [animationDone]);

  const spin = miloRotate.interpolate({ inputRange: [-1, 1], outputRange: ['-4deg', '4deg'] });

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#2A2046', C.inkDark, '#120D24']} style={styles.gradient}>

        {/* drawn gold twinkles */}
        <Twinkle anim={t1} style={{ top: '14%', left: '16%' }} size={6} />
        <Twinkle anim={t2} style={{ top: '20%', right: '18%' }} size={4} />
        <Twinkle anim={t3} style={{ top: '30%', left: '26%' }} size={5} />
        <Twinkle anim={t4} style={{ top: '12%', right: '34%' }} size={4} />
        <Twinkle anim={t2} style={{ top: '64%', left: '14%' }} size={5} />
        <Twinkle anim={t3} style={{ top: '70%', right: '16%' }} size={4} />

        <SafeAreaView style={styles.safe}>

          {/* Milo with concentric gold halo */}
          <Animated.View style={[styles.miloBlock, {
            transform: [{ translateY: Animated.add(miloY, miloIdleY) }],
          }]}>
            <Animated.View style={[styles.ringOuter, { opacity: Animated.multiply(ringOpacity, 0.4), transform: [{ scale: ringScale }] }]} />
            <Animated.View style={[styles.ringMid, { opacity: Animated.multiply(ringOpacity, 0.7), transform: [{ scale: ringScale }] }]} />
            <Animated.View style={[styles.avatarRing, {
              transform: [{ scale: miloScale }, { rotate: spin }],
            }]}>
              <View style={styles.avatarInner}>
                <Image source={MILO.base} style={styles.avatar} />
              </View>
            </Animated.View>
          </Animated.View>

          {/* Wordmark + tagline */}
          <Animated.View style={[styles.titleBlock, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
            <View style={styles.proBadge}>
              <View style={styles.proDot} />
              <Text style={styles.proText}>GROW EVERY DAY</Text>
            </View>
            <Text style={styles.brand}>Persona<Text style={{ color: C.goldSoft }}>Pals</Text></Text>
            <View style={styles.tagRule} />
            <Text style={styles.tagline}>A world of daily quests, guided by Milo.</Text>
          </Animated.View>

          {/* CTA */}
          <Animated.View style={[styles.btnWrap, { opacity: btnOpacity, transform: [{ scale: Animated.multiply(btnScale, btnPulse) }] }]}>
            <TouchableOpacity style={styles.beginBtn} onPress={onFinish} activeOpacity={0.88}>
              <Text style={styles.beginText}>Let's Begin</Text>
            </TouchableOpacity>
            <Text style={styles.footnote}>Tap to start your adventure</Text>
          </Animated.View>

        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.inkDark },
  gradient: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },

  miloBlock: { alignItems: 'center', justifyContent: 'center', marginBottom: 44 },
  ringOuter: {
    position: 'absolute', width: 230, height: 230, borderRadius: 115,
    borderWidth: 1, borderColor: C.goldSoft,
  },
  ringMid: {
    position: 'absolute', width: 176, height: 176, borderRadius: 88,
    borderWidth: 1, borderColor: C.goldSoft,
  },
  avatarRing: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 2.5, borderColor: C.goldSoft,
    backgroundColor: C.goldWash,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInner: {
    width: 118, height: 118, borderRadius: 59,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatar: { width: 104, height: 104, resizeMode: 'contain' },

  titleBlock: { alignItems: 'center', marginBottom: 52 },
  proBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: C.goldWash, borderColor: 'rgba(244,201,100,0.45)', borderWidth: 1,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 18,
  },
  proDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.goldSoft },
  proText: { fontFamily: 'Nunito_900Black', fontSize: 10, letterSpacing: 2, color: C.goldSoft },
  brand: {
    fontFamily: 'Nunito_900Black', fontSize: 46, color: '#FFFFFF', letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 10,
  },
  tagRule: { width: 56, height: 3, borderRadius: 2, backgroundColor: C.goldSoft, marginTop: 14, marginBottom: 14, opacity: 0.8 },
  tagline: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: 'rgba(246,240,229,0.7)', textAlign: 'center', lineHeight: 20 },

  btnWrap: { width: '100%', alignItems: 'center' },
  beginBtn: {
    backgroundColor: C.goldSoft,
    paddingVertical: 17, borderRadius: 30, width: width * 0.7, maxWidth: 320,
    alignItems: 'center',
    shadowColor: C.gold, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 18, elevation: 10,
  },
  beginText: { fontFamily: 'Nunito_900Black', fontSize: 19, color: C.inkDark, letterSpacing: 0.3 },
  footnote: { fontFamily: 'Nunito_700Bold', fontSize: 12, color: 'rgba(246,240,229,0.4)', marginTop: 16 },
});
