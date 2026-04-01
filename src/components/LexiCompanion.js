/**
 * LexiCompanion — Smart draggable floating AI guide.
 *
 * • Drag anywhere → snaps to nearest corner on release.
 * • Idle for 4 s → fades to 35% opacity + shrinks (minimized).
 * • Any touch / new route → wakes back to full size & opacity.
 * • Gentle bounce animation when fully visible.
 * • Context-aware speech bubble per screen (mute-able).
 * • Tap → opens quick-insights panel.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  ScrollView, ActivityIndicator, Animated, Dimensions, PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Ellipse, Polygon } from 'react-native-svg';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { analyzeStudentProfile } from '../lib/strengthsAnalysis';
import { getMessageForRoute } from '../lib/lexiMessages';

// ─── constants ────────────────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');
const MUTE_KEY = '@lexi_muted_v1';
const POS_KEY  = '@lexi_corner_v1';

const OWL_FULL = 56;
const OWL_MINI = 32;
const MARGIN   = 16;
const ABOVE_TAB = 100;  // clear the floating tab bar

const CORNERS = {
  TL: { x: MARGIN,                  y: 64 },
  TR: { x: SW - OWL_FULL - MARGIN,  y: 64 },
  BL: { x: MARGIN,                  y: SH - OWL_FULL - ABOVE_TAB },
  BR: { x: SW - OWL_FULL - MARGIN,  y: SH - OWL_FULL - ABOVE_TAB },
};

function nearestCorner(x, y) {
  return Object.values(CORNERS).reduce((best, c) =>
    Math.hypot(x - c.x, y - c.y) < Math.hypot(best.x - x, best.y - y) ? c : best
  );
}

// ─── SVG owl illustration ─────────────────────────────────────────────────────
function LexiOwl({ size = 56 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36">
      <Ellipse cx="18" cy="22" rx="11" ry="12" fill="#F5CBA7" />
      <Ellipse cx="8"  cy="23" rx="4.5" ry="6.5" fill="#E59866" transform="rotate(-12 8 23)" />
      <Ellipse cx="28" cy="23" rx="4.5" ry="6.5" fill="#E59866" transform="rotate(12 28 23)" />
      <Ellipse cx="18" cy="25" rx="6.5" ry="7"   fill="#FAE5D3" />
      <Circle  cx="18" cy="12" r="9.5"            fill="#F5CBA7" />
      <Polygon points="12,5 9,0 14,3"             fill="#E59866" />
      <Polygon points="24,5 27,0 22,3"            fill="#E59866" />
      <Circle  cx="14" cy="12" r="4.2"            fill="#fff" />
      <Circle  cx="22" cy="12" r="4.2"            fill="#fff" />
      <Circle  cx="14" cy="12" r="2.6"            fill="#5D4037" />
      <Circle  cx="22" cy="12" r="2.6"            fill="#5D4037" />
      <Circle  cx="14.5" cy="11.5" r="1"          fill="#1A1A1A" />
      <Circle  cx="22.5" cy="11.5" r="1"          fill="#1A1A1A" />
      <Circle  cx="15.3" cy="10.8" r="0.55"       fill="#fff" />
      <Circle  cx="23.3" cy="10.8" r="0.55"       fill="#fff" />
      <Polygon points="18,14.5 15.5,17.5 20.5,17.5" fill="#E67E22" />
      <Ellipse cx="14.5" cy="33.5" rx="3" ry="1.3" fill="#E59866" />
      <Ellipse cx="21.5" cy="33.5" rx="3" ry="1.3" fill="#E59866" />
    </Svg>
  );
}

/** Recursively find the deepest focused route name. */
function getActiveRouteName(state) {
  if (!state?.routes?.length) return null;
  const route = state.routes[state.index ?? state.routes.length - 1];
  if (route?.state) return getActiveRouteName(route.state);
  return route?.name ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LexiCompanion() {
  const { profile }  = useAuth();
  const navigation   = useNavigation();
  const routeName    = useNavigationState(s => getActiveRouteName(s));

  // ── ui state ────────────────────────────────────────────────────────────────
  const [bubbleVisible,  setBubbleVisible]  = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [muted,          setMuted]          = useState(false);
  const [panelVisible,   setPanelVisible]   = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [insightData,    setInsightData]    = useState(null);
  const [minimized,      setMinimized]      = useState(false);
  // which corner the owl is currently snapped to (for bubble positioning)
  const [corner,         setCorner]         = useState(CORNERS.BR);

  // ── animation refs ──────────────────────────────────────────────────────────
  const position    = useRef(new Animated.ValueXY(CORNERS.BR)).current;
  const bounceY     = useRef(new Animated.Value(0)).current;
  const tapScale    = useRef(new Animated.Value(1)).current;
  const dragScale   = useRef(new Animated.Value(1)).current;
  const idleOpacity = useRef(new Animated.Value(1)).current;
  const owlSize     = useRef(new Animated.Value(OWL_FULL)).current;
  const bubbleFade  = useRef(new Animated.Value(0)).current;
  const bubbleSlide = useRef(new Animated.Value(40)).current;
  const panelSlide  = useRef(new Animated.Value(SH)).current;
  const panelFade   = useRef(new Animated.Value(0)).current;

  // live position tracker (doesn't trigger re-renders during drag)
  const posRef      = useRef({ ...CORNERS.BR });
  const isDragging  = useRef(false);
  const dismissTimer = useRef(null);
  const idleTimer    = useRef(null);

  // ── persist / restore corner ────────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(POS_KEY).then(v => {
      if (!v) return;
      try {
        const saved = JSON.parse(v);
        position.setValue(saved);
        posRef.current = saved;
        setCorner(saved);
      } catch (_) {}
    });
    AsyncStorage.getItem(MUTE_KEY).then(v => { if (v === 'true') setMuted(true); });
  }, []);

  // track live position
  useEffect(() => {
    const id = position.addListener(({ x, y }) => { posRef.current = { x, y }; });
    return () => position.removeListener(id);
  }, []);

  // ── idle logic ───────────────────────────────────────────────────────────────
  const wake = useCallback(() => {
    clearTimeout(idleTimer.current);
    if (minimized) setMinimized(false);
    Animated.parallel([
      Animated.timing(idleOpacity, { toValue: 1,        duration: 250, useNativeDriver: true }),
      Animated.spring(owlSize,     { toValue: OWL_FULL, friction: 6,   useNativeDriver: false }),
    ]).start();
  }, [minimized, idleOpacity, owlSize]);

  const startIdleTimer = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setMinimized(true);
      Animated.parallel([
        Animated.timing(idleOpacity, { toValue: 0.35,   duration: 700, useNativeDriver: true }),
        Animated.spring(owlSize,     { toValue: OWL_MINI, friction: 6, useNativeDriver: false }),
      ]).start();
    }, 4000);
  }, [idleOpacity, owlSize]);

  // ── idle bounce loop (only when not minimized) ───────────────────────────────
  useEffect(() => {
    if (minimized) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceY, { toValue: -6, duration: 700, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0,  duration: 700, useNativeDriver: true }),
        Animated.delay(1600),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [minimized]);

  // ── pan responder (drag) ─────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,

      onPanResponderGrant: () => {
        isDragging.current = true;
        position.extractOffset();
        clearTimeout(idleTimer.current);
        Animated.parallel([
          Animated.timing(idleOpacity, { toValue: 1,    duration: 150, useNativeDriver: true }),
          Animated.spring(dragScale,   { toValue: 1.18, friction: 5,   useNativeDriver: true }),
          Animated.spring(owlSize,     { toValue: OWL_FULL, friction: 5, useNativeDriver: false }),
        ]).start();
        if (minimized) setMinimized(false);
      },

      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: () => {
        isDragging.current = false;
        position.flattenOffset();

        const snap = nearestCorner(posRef.current.x, posRef.current.y);

        Animated.parallel([
          Animated.spring(position,  { toValue: snap, tension: 65, friction: 11, useNativeDriver: false }),
          Animated.spring(dragScale, { toValue: 1,    friction: 6,               useNativeDriver: true  }),
        ]).start(() => {
          setCorner(snap);
          AsyncStorage.setItem(POS_KEY, JSON.stringify(snap));
          startIdleTimer();
        });
      },

      onPanResponderTerminate: () => {
        isDragging.current = false;
        position.flattenOffset();
        Animated.spring(dragScale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
        startIdleTimer();
      },
    })
  ).current;

  // ── speech bubble helpers ────────────────────────────────────────────────────
  const dismissBubble = useCallback((immediate = false) => {
    clearTimeout(dismissTimer.current);
    if (immediate) {
      bubbleFade.setValue(0);
      setBubbleVisible(false);
      return;
    }
    Animated.parallel([
      Animated.timing(bubbleFade,  { toValue: 0,  duration: 200, useNativeDriver: true }),
      Animated.timing(bubbleSlide, { toValue: 16, duration: 160, useNativeDriver: true }),
    ]).start(() => setBubbleVisible(false));
  }, [bubbleFade, bubbleSlide]);

  // show bubble on route change
  useEffect(() => {
    if (!routeName || muted) return;
    wake();
    const msg = getMessageForRoute(routeName);
    if (!msg) { startIdleTimer(); return; }

    const showTimer = setTimeout(() => {
      setCurrentMessage(msg);
      setBubbleVisible(true);
      bubbleSlide.setValue(16);
      bubbleFade.setValue(0);
      Animated.parallel([
        Animated.spring(bubbleSlide, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
        Animated.timing(bubbleFade,  { toValue: 1, duration: 220,            useNativeDriver: true }),
      ]).start();
      clearTimeout(dismissTimer.current);
      dismissTimer.current = setTimeout(() => {
        dismissBubble();
        startIdleTimer();
      }, 5500);
    }, 1500);

    return () => {
      clearTimeout(showTimer);
      dismissBubble(true);
    };
  }, [routeName, muted]);

  // ── mute ────────────────────────────────────────────────────────────────────
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    AsyncStorage.setItem(MUTE_KEY, next ? 'true' : 'false');
    if (next) dismissBubble();
  };

  // ── avatar tap ───────────────────────────────────────────────────────────────
  const handleAvatarTap = () => {
    if (isDragging.current) return;
    wake();
    dismissBubble();
    Animated.sequence([
      Animated.timing(tapScale, { toValue: 1.22, duration: 100, useNativeDriver: true }),
      Animated.spring(tapScale, { toValue: 1,    friction: 4,   useNativeDriver: true }),
    ]).start();
    openPanel();
  };

  // ── insights panel ───────────────────────────────────────────────────────────
  const openPanel = async () => {
    setPanelVisible(true);
    panelSlide.setValue(SH);
    panelFade.setValue(0);
    Animated.parallel([
      Animated.spring(panelSlide, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
      Animated.timing(panelFade,  { toValue: 1, duration: 260,             useNativeDriver: true }),
    ]).start();
    if (!insightData && profile?.id) {
      setLoading(true);
      try   { setInsightData(await analyzeStudentProfile(profile.id, 60)); }
      catch (_) {}
      finally { setLoading(false); }
    }
  };

  const closePanel = () => {
    Animated.parallel([
      Animated.timing(panelSlide, { toValue: SH, duration: 280, useNativeDriver: true }),
      Animated.timing(panelFade,  { toValue: 0,  duration: 220, useNativeDriver: true }),
    ]).start(() => { setPanelVisible(false); startIdleTimer(); });
  };

  // ── derived ──────────────────────────────────────────────────────────────────
  const firstName  = profile?.full_name?.split(' ')[0] ?? 'Learner';
  const score      = insightData?.overallScore ?? 0;
  const sColor     = score >= 75 ? '#4CAF50' : score >= 50 ? '#FF9800' : '#EF5350';
  const sLabel     = score >= 75 ? 'Strong Learner! 🌟' : score >= 50 ? 'Making Progress! 💪' : 'Keep Going! 🚀';
  const owlOnLeft  = corner.x < SW / 2;

  // bubble slide direction based on owl side
  const bubbleLeft  = owlOnLeft ? OWL_FULL + 8 : undefined;
  const bubbleRight = owlOnLeft ? undefined : OWL_FULL + 8;

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ══ SPEECH BUBBLE (independent absolute, uses corner state) ══ */}
      {bubbleVisible && !minimized && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.bubbleAnchor,
            // Always float ABOVE the owl so it never covers content below
            { bottom: SH - corner.y + 8 },
            owlOnLeft
              ? { left: corner.x }
              : { right: SW - corner.x - OWL_FULL },
            { opacity: bubbleFade, transform: [{ translateY: bubbleSlide }] },
          ]}
        >
          <View style={styles.bubbleBox}>
            <Text style={styles.bubbleText}>{currentMessage}</Text>
            <View style={styles.bubbleFooter}>
              <TouchableOpacity onPress={toggleMute} style={styles.muteRow} activeOpacity={0.7}>
                <Ionicons name={muted ? 'volume-mute-outline' : 'volume-medium-outline'} size={13} color="#B0BEC5" />
                <Text style={styles.muteTxt}>{muted ? 'Unmute' : 'Mute'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => dismissBubble()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={15} color="#CFD8DC" />
              </TouchableOpacity>
            </View>
          </View>
          {/* Down-pointing tail toward the owl below */}
          <View style={[styles.tailDown, owlOnLeft ? { alignSelf: 'flex-start', marginLeft: 20 } : { alignSelf: 'flex-end', marginRight: 20 }]} />
        </Animated.View>
      )}

      {/* ══ OWL (draggable) ══ */}
      {/* Outer view: position only (JS driver — left/top not supported by native) */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.owlFloat, position.getLayout()]}
      >
        {/* Inner view: opacity + transform (native driver) */}
        <Animated.View style={{
          opacity: idleOpacity,
          transform: [
            { translateY: minimized ? 0 : bounceY },
            { scale: Animated.multiply(tapScale, dragScale) },
          ],
        }}>
          <TouchableOpacity onPress={handleAvatarTap} activeOpacity={0.85}>
            <Animated.View style={{ width: owlSize, height: owlSize, alignItems: 'center', justifyContent: 'center' }}>
              <LexiOwl size={OWL_FULL} />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* ══ INSIGHTS PANEL ══ */}
      <Modal visible={panelVisible} transparent animationType="none" onRequestClose={closePanel}>
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.backdrop, { opacity: panelFade }]} />
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closePanel} />

          <Animated.View style={[styles.sheet, { transform: [{ translateY: panelSlide }] }]}>
            <View style={styles.sheetHandle} />

            {/* Lexi header */}
            <LinearGradient colors={['#FFF4EE', '#fff']} style={styles.panelHeader}>
              <View style={styles.panelAvatar}>
                <LexiOwl size={38} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.lexiName}>Lexi</Text>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineTxt}>online</Text>
                </View>
                <Text style={styles.lexiRole}>Your AI Learning Buddy</Text>
              </View>
              <TouchableOpacity onPress={toggleMute} style={styles.muteIconBtn} activeOpacity={0.7}>
                <Ionicons
                  name={muted ? 'volume-mute-outline' : 'volume-medium-outline'}
                  size={18}
                  color={muted ? '#EF5350' : '#90A4AE'}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={closePanel} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#90A4AE" />
              </TouchableOpacity>
            </LinearGradient>

            {/* Body */}
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color="#E8927C" />
                <Text style={styles.loadingTxt}>Analyzing your journey...</Text>
              </View>
            ) : insightData ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.panelScroll}>
                <View style={styles.chatBubble}>
                  <Text style={styles.chatTxt}>{`Hi ${firstName}! Here's your progress today 👇`}</Text>
                </View>
                <View style={styles.chatTail} />

                <View style={[styles.scoreCard, { borderColor: sColor + '44' }]}>
                  <View style={[styles.scoreRing, { borderColor: sColor }]}>
                    <Text style={[styles.scoreNum, { color: sColor }]}>{score}</Text>
                    <Text style={[styles.scorePct, { color: sColor }]}>%</Text>
                  </View>
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text style={[styles.scoreLabel, { color: sColor }]}>{sLabel}</Text>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${score}%`, backgroundColor: sColor }]} />
                    </View>
                    <Text style={styles.sessionMeta}>
                      {insightData.totalSessions} sessions · {insightData.activitiesPracticed} activities
                    </Text>
                  </View>
                </View>

                {insightData.strengths.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✅  Your Strengths</Text>
                    {insightData.strengths.slice(0, 3).map(item => (
                      <View key={item.activity} style={styles.statRow}>
                        <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
                          <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.statLabel}>{item.label}</Text>
                          <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${item.avgAccuracy}%`, backgroundColor: '#4CAF50' }]} />
                          </View>
                        </View>
                        <Text style={[styles.statPct, { color: '#4CAF50' }]}>{item.avgAccuracy}%</Text>
                      </View>
                    ))}
                  </View>
                )}

                {insightData.weaknesses.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>❌  Areas to Focus</Text>
                    {insightData.weaknesses.slice(0, 3).map(item => (
                      <View key={item.activity} style={styles.statRow}>
                        <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
                          <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.statLabel}>{item.label}</Text>
                          <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${item.avgAccuracy}%`, backgroundColor: '#FF9800' }]} />
                          </View>
                        </View>
                        <Text style={[styles.statPct, { color: '#FF9800' }]}>{item.avgAccuracy}%</Text>
                      </View>
                    ))}
                  </View>
                )}

                {insightData.strengths.length === 0 && insightData.weaknesses.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={{ fontSize: 44, marginBottom: 12 }}>🎯</Text>
                    <Text style={styles.emptyTxt}>Complete some activities first — I'll track your progress!</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.reportBtn}
                  onPress={() => { closePanel(); setTimeout(() => navigation.navigate('AIInsights'), 300); }}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={['#FF8C69', '#C87456']} style={styles.reportGradient}>
                    <Ionicons name="analytics-outline" size={20} color="#fff" />
                    <Text style={styles.reportTxt}>View Full Report</Text>
                    <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.75)" />
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View style={styles.loadingWrap}>
                <Text style={styles.emptyTxt}>Couldn't load insights. Try again later.</Text>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Owl float ────────────────────────────────────────────────────────────────
  owlFloat: {
    position: 'absolute',
    zIndex: 99,
    elevation: 15,
    // bubble is rendered inside here, anchored relative to owl
  },

  // ── Speech bubble ─────────────────────────────────────────────────────────────
  bubbleAnchor: {
    position: 'absolute',
    flexDirection: 'column',
    zIndex: 98,
    elevation: 14,
  },
  bubbleBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    width: 200,
  },
  bubbleText: { fontSize: 13, color: '#333', lineHeight: 19, marginBottom: 7 },
  bubbleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  muteRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  muteTxt: { fontSize: 11, color: '#B0BEC5', fontWeight: '600' },
  // Down-pointing tail toward the owl below
  tailDown: {
    width: 0, height: 0,
    borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 9,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -1,
  },

  // ── Modal / panel ──────────────────────────────────────────────────────────
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: SH * 0.76,
    paddingBottom: 28,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  sheetHandle: {
    width: 38, height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },

  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  panelAvatar: {
    width: 48, height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  lexiName:  { fontSize: 16, fontWeight: '800', color: '#263238' },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4CAF50' },
  onlineTxt: { fontSize: 11, color: '#4CAF50', fontWeight: '600' },
  lexiRole:  { fontSize: 12, color: '#90A4AE' },
  muteIconBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
  },

  loadingWrap: { alignItems: 'center', paddingVertical: 44 },
  loadingTxt:  { marginTop: 14, fontSize: 14, color: '#E8927C', fontWeight: '600' },
  panelScroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },

  chatBubble: {
    backgroundColor: '#FFF0E8',
    borderRadius: 18, borderBottomLeftRadius: 4,
    paddingHorizontal: 16, paddingVertical: 12,
    alignSelf: 'flex-start',
    maxWidth: '88%',
  },
  chatTxt:  { fontSize: 14, color: '#333', lineHeight: 20 },
  chatTail: {
    width: 12, height: 8,
    backgroundColor: '#FFF0E8',
    marginLeft: 18, borderBottomRightRadius: 6,
    transform: [{ skewX: '-20deg' }],
    marginBottom: 16,
  },

  scoreCard: {
    flexDirection: 'row', alignItems: 'center',
    gap: 16, backgroundColor: '#FAF5F1',
    borderRadius: 18, borderWidth: 1.5,
    padding: 16, marginBottom: 20,
  },
  scoreRing: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 3,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    flexDirection: 'row',
  },
  scoreNum:    { fontSize: 24, fontWeight: 'bold' },
  scorePct:    { fontSize: 13, fontWeight: '700', color: '#999' },
  scoreLabel:  { fontSize: 13, fontWeight: '700' },
  sessionMeta: { fontSize: 11, color: '#B0BEC5' },

  progressTrack: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 3 },

  section:      { marginBottom: 18 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#455A64', marginBottom: 10, letterSpacing: 0.2 },
  statRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  statIcon: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  statLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 5 },
  statPct:   { fontSize: 13, fontWeight: '800', minWidth: 38, textAlign: 'right' },

  emptyState: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 16 },
  emptyTxt:   { fontSize: 13, color: '#90A4AE', textAlign: 'center', lineHeight: 20 },

  reportBtn: {
    borderRadius: 18, overflow: 'hidden', marginTop: 6,
    elevation: 6,
    shadowColor: '#C87456',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  reportGradient: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10, paddingVertical: 17,
  },
  reportTxt: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
});
