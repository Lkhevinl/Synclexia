import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../components/icons/Icon';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import { logSession } from '../../lib/analyticsHelper';
import * as ttsService from '../../lib/ttsService';

const CARD_WIDTH = (Dimensions.get('window').width - 54) / 2;

// ─── Jolly Phonics Groups ────────────────────────────────────────────────────

const JP_GROUPS = [
  {
    name: 'Group 1', mascot: '🦉',
    heroBg: ['#FF6B6B', '#FF8E53'], shadowColor: '#E05440',
    letters: [
      { letter: 's', emoji: '🐍', word: 'snake', sound: 'ssss',
        storyTitle: 'The Hissing Snake',
        story: 'The sun is shining. A boy takes his dog for a walk. They see some tall grass. SSSSS! A snake is hissing!',
        action: 'Weave your hand and arm in an "s" shape like a snake, and say ssssss.',
        song: '"The snake is in the grass...\nSssssss! Sssssss!"' },
      { letter: 'a', emoji: '🐜', word: 'ant', sound: 'a-a-a',
        storyTitle: 'Ants on your Arm',
        story: 'Some ants crawl up your arm. You try to brush them off, but they keep tickling! A-a-a!',
        action: 'Wiggle your fingers up your arm like ants crawling, and say a-a-a.',
        song: '"A-a-a, ants on my arm...\nA-a-a, they cause such alarm!"' },
      { letter: 't', emoji: '⏰', word: 'tick', sound: 't-t-t',
        storyTitle: 'The Tennis Ball',
        story: 'Watch the tennis ball go back and forth. Tick, tock! T-t-t!',
        action: 'Turn your head side to side following an imaginary tennis ball, and say t-t-t.',
        song: '"T-t-t, tennis ball flies...\nT-t-t, across the skies!"' },
      { letter: 'i', emoji: '🦟', word: 'itch', sound: 'i-i-i',
        storyTitle: 'Itchy Insect',
        story: 'An insect lands on your arm and it itches! I-i-i!',
        action: 'Pretend to scratch your arm and say i-i-i quickly.',
        song: '"I-i-i, it itches me so...\nI-i-i, from head to toe!"' },
      { letter: 'p', emoji: '💨', word: 'puff', sound: 'p-p-p',
        storyTitle: 'Birthday Candles',
        story: 'You blow out the candles on your cake. Puff, puff! P-p-p!',
        action: 'Pretend to blow out candles and say p-p-p with each puff.',
        song: '"P-p-p, puff the candles out...\nP-p-p, give a happy shout!"' },
      { letter: 'n', emoji: '🎵', word: 'hum', sound: 'nnn',
        storyTitle: 'The Airplane',
        story: 'The airplane flies through the sky. Listen to its engine hum! N-n-n!',
        action: 'Stretch your arms like airplane wings and say nnn as the engine.',
        song: '"N-n-n, the airplane flies...\nN-n-n, up through the skies!"' },
    ],
  },
  {
    name: 'Group 2', mascot: '🐱',
    heroBg: ['#FF8C69', '#E8572A'], shadowColor: '#C94A20',
    letters: [
      { letter: 'ck', emoji: '🕰️', word: 'clock', sound: 'ck-ck',
        storyTitle: 'The Ticking Clock',
        story: 'The old clock on the wall goes tick-tock, tick-tock all day long. Ck-ck-ck!',
        action: 'Click your fingers like a clock ticking, and say ck-ck-ck.',
        song: '"Ck-ck-ck, the clock goes tick...\nCk-ck-ck, listen quick!"' },
      { letter: 'e', emoji: '🥚', word: 'egg', sound: 'e-e-e',
        storyTitle: 'The Cracked Egg',
        story: 'An egg cracks open and a little chick peeps out. E-e-e!',
        action: 'Tap your elbows together and say e-e-e like a little chick.',
        song: '"E-e-e, the egg cracks wide...\nE-e-e, a chick inside!"' },
      { letter: 'h', emoji: '🐕', word: 'pant', sound: 'hhh',
        storyTitle: 'The Hot Day',
        story: 'It is a very hot day. You pant like a dog. Hhh! Hhh!',
        action: 'Pant like a dog with your tongue out, and say hhh hhh hhh.',
        song: '"H-h-h, pant like a hound...\nH-h-h, what a sound!"' },
      { letter: 'r', emoji: '🤖', word: 'robot', sound: 'rrr',
        storyTitle: 'The Robot',
        story: 'A big robot stomps through the town. Rrr! Rrr!',
        action: 'Hold your arms out stiffly like a robot and stomp, saying rrr rrr rrr.',
        song: '"R-r-r, the robot marches...\nR-r-r, never tires!"' },
      { letter: 'm', emoji: '🍰', word: 'mmm', sound: 'mmm',
        storyTitle: 'Mmm, Tasty!',
        story: 'You take a big bite of your favourite food. Mmm!',
        action: 'Rub your tummy and say mmm like something tastes really good.',
        song: '"M-m-m, it tastes so good...\nM-m-m, eat it I would!"' },
      { letter: 'd', emoji: '🥁', word: 'drum', sound: 'd-d-d',
        storyTitle: 'The Drum',
        story: 'Bang the drum! The drummer plays fast and loud. D-d-d!',
        action: 'Pretend to beat a drum with your hands and say d-d-d.',
        song: '"D-d-d, beat the drum...\nD-d-d, here I come!"' },
    ],
  },
  {
    name: 'Group 3', mascot: '🐘',
    heroBg: ['#51CF66', '#2F9E44'], shadowColor: '#237032',
    letters: [
      { letter: 'g', emoji: '🚿', word: 'gurgle', sound: 'g-g-g',
        storyTitle: 'The Gurgling Water',
        story: 'Water gurgles down the drain after your bath. G-g-g!',
        action: 'Pretend to pour water from a bottle and say g-g-g like it gurgles.',
        song: '"G-g-g, the water pours...\nG-g-g, down and more!"' },
      { letter: 'o', emoji: '🍊', word: 'orange', sound: 'o-o-o',
        storyTitle: 'The Orange Ball',
        story: 'You squeeze an orange to make juice. Squish! O-o-o!',
        action: 'Pretend to squeeze an orange with both hands and say o-o-o.',
        song: '"O-o-o, squeeze the orange...\nO-o-o, juice is gorgeous!"' },
      { letter: 'u', emoji: '☂️', word: 'umbrella', sound: 'u-u-u',
        storyTitle: 'The Umbrella',
        story: 'It starts to rain! You open your umbrella. U-u-u! Up it goes!',
        action: 'Pretend to open an umbrella above your head and say u-u-u.',
        song: '"U-u-u, open the brolly...\nU-u-u, let\'s be jolly!"' },
      { letter: 'l', emoji: '🍭', word: 'lolly', sound: 'lll',
        storyTitle: 'The Lollipop',
        story: 'You lick a big colourful lollipop. Lll! It tastes so sweet!',
        action: 'Lick your hand like a lollipop and say lll nice and slow.',
        song: '"L-l-l, lick the lolly...\nL-l-l, sweet and jolly!"' },
      { letter: 'f', emoji: '🌬️', word: 'fan', sound: 'fff',
        storyTitle: 'The Fan',
        story: 'The electric fan spins around and cools the room. Fff!',
        action: 'Fan your face with your hand and say fff fff fff like the wind.',
        song: '"F-f-f, the fan goes spin...\nF-f-f, let the cool come in!"' },
      { letter: 'b', emoji: '⚽', word: 'ball', sound: 'b-b-b',
        storyTitle: 'The Bouncing Ball',
        story: 'You bounce a ball on the ground. Boing! B-b-b!',
        action: 'Bounce your hand up and down like a ball and say b-b-b.',
        song: '"B-b-b, the ball goes bounce...\nB-b-b, up an ounce!"' },
    ],
  },
  {
    name: 'Group 4', mascot: '🌟',
    heroBg: ['#FCC419', '#E67700'], shadowColor: '#C96000',
    letters: [
      { letter: 'ai', emoji: '🌧️', word: 'rain', sound: 'ai-ai',
        storyTitle: 'The Rainy Day',
        story: 'Rain falls from the clouds. Drip, drip! You can hear it hit the window. Ai-ai!',
        action: 'Wiggle your fingers downward like falling rain, and say ai-ai-ai.',
        song: '"Ai-ai-ai, rain falls down...\nAi-ai-ai, on the town!"' },
      { letter: 'j', emoji: '🍮', word: 'jelly', sound: 'j-j-j',
        storyTitle: 'The Jelly Jump',
        story: 'A bowl of jelly wobbles and jiggles. J-j-j!',
        action: 'Wobble your body like jelly and say j-j-j.',
        song: '"J-j-j, jelly jiggles...\nJ-j-j, full of wiggles!"' },
      { letter: 'oa', emoji: '⛵', word: 'boat', sound: 'oa-oa',
        storyTitle: 'Floating in a Boat',
        story: 'You float down the river in a little boat. Oa-oa!',
        action: 'Rock your arms like you are in a boat and say oa-oa-oa.',
        song: '"Oa-oa-oa, row your boat...\nOa-oa-oa, stay afloat!"' },
      { letter: 'ie', emoji: '🔭', word: 'spy', sound: 'ie-ie',
        storyTitle: 'I Spy!',
        story: 'You play I Spy and shout "I spy!" Ie-ie! You found it!',
        action: 'Hold your hands like binoculars and say ie-ie-ie.',
        song: '"Ie-ie-ie, I spy high...\nIe-ie-ie, up in the sky!"' },
      { letter: 'ee', emoji: '🐭', word: 'squeak', sound: 'eee',
        storyTitle: 'The Squeaky Mouse',
        story: 'A little mouse runs across the floor. Eee! Eee!',
        action: 'Scrunch up your nose like a mouse and say eee eee eee.',
        song: '"Ee-ee-ee, the mouse squeaks...\nEe-ee-ee, every week!"' },
      { letter: 'or', emoji: '⛈️', word: 'storm', sound: 'or-or',
        storyTitle: 'The Storm',
        story: 'A big storm blows in. The wind howls! Or-or-or!',
        action: 'Spread your arms wide like the wind and sway, saying or-or-or.',
        song: '"Or-or-or, the storm is here...\nOr-or-or, do not fear!"' },
    ],
  },
  {
    name: 'Group 5', mascot: '🦓',
    heroBg: ['#748FFC', '#4263EB'], shadowColor: '#3451B2',
    letters: [
      { letter: 'z', emoji: '🐝', word: 'buzz', sound: 'zzz',
        storyTitle: 'The Buzzing Bee',
        story: 'A bee flies past your ear. Zzz! Zzz! It buzzes loudly.',
        action: 'Buzz around like a bee with your arms out and say zzz zzz zzz.',
        song: '"Z-z-z, the bee goes buzz...\nZ-z-z, because it does!"' },
      { letter: 'w', emoji: '💨', word: 'wind', sound: 'www',
        storyTitle: 'The Wind',
        story: 'The wind blows strongly on a cold day. Www! Your hat almost flies away!',
        action: 'Blow air out of your mouth like the wind and say www www www.',
        song: '"W-w-w, the wind blows strong...\nW-w-w, all day long!"' },
      { letter: 'ng', emoji: '🔔', word: 'ring', sound: 'ng-ng',
        storyTitle: 'The Singing Bell',
        story: 'The church bell rings out over the town. Ng-ng!',
        action: 'Ring an imaginary bell above your head and say ng ng ng.',
        song: '"Ng-ng-ng, the bell rings clear...\nNg-ng-ng, everyone hear!"' },
      { letter: 'v', emoji: '🧹', word: 'vacuum', sound: 'vvv',
        storyTitle: 'The Vacuum Cleaner',
        story: 'Mum turns on the vacuum cleaner. Vvv! It sucks up the dust!',
        action: 'Push a pretend vacuum cleaner and say vvv vvv vvv.',
        song: '"V-v-v, the vacuum hums...\nV-v-v, up it comes!"' },
      { letter: 'oo', emoji: '🦉', word: 'hoot', sound: 'oo-oo',
        storyTitle: 'The Wise Owl',
        story: 'An owl sits in a tree at night and hoots. Oo! Oo!',
        action: 'Make big round eyes with your fingers like an owl and say oo oo oo.',
        song: '"Oo-oo-oo, the owl hoots...\nOo-oo-oo, through the roots!"' },
    ],
  },
  {
    name: 'Group 6', mascot: '🦊',
    heroBg: ['#CC5DE8', '#9C36B5'], shadowColor: '#7A2898',
    letters: [
      { letter: 'y', emoji: '🦬', word: 'yawn', sound: 'yyy',
        storyTitle: 'The Yawning Yak',
        story: 'A big yak is very tired and lets out a huge yawn. Yyy!',
        action: 'Open your mouth wide in a big yawn and say yyy yyy yyy.',
        song: '"Y-y-y, the yak yawns wide...\nY-y-y, nothing to hide!"' },
      { letter: 'x', emoji: '🩻', word: 'x-ray', sound: 'x-x-x',
        storyTitle: 'The X-Ray',
        story: 'The doctor takes an X-ray of your chest. X-x-x! You can see your bones!',
        action: 'Cross your arms in front of you like an X and say x-x-x.',
        song: '"X-x-x, marks the spot...\nX-x-x, tie a knot!"' },
      { letter: 'ch', emoji: '🚂', word: 'chug', sound: 'ch-ch',
        storyTitle: 'The Steam Train',
        story: 'The steam train chugs along the track. Ch-ch-ch! Faster and faster!',
        action: 'Move your arms like train wheels and say ch-ch-ch.',
        song: '"Ch-ch-ch, the train goes by...\nCh-ch-ch, puffing high!"' },
      { letter: 'sh', emoji: '🤫', word: 'shh', sound: 'shh',
        storyTitle: 'Be Quiet!',
        story: 'The baby is sleeping. You tiptoe past the cot and whisper — Shh!',
        action: 'Put your finger to your lips and say shh shh shh very quietly.',
        song: '"Sh-sh-sh, baby sleeps...\nSh-sh-sh, not a peep!"' },
      { letter: 'th', emoji: '😛', word: 'this', sound: 'th-th',
        storyTitle: 'The Naughty Boy',
        story: 'A naughty boy sticks out his tongue and blows. Th-th-th!',
        action: 'Gently put your tongue between your teeth and blow, saying th-th-th.',
        song: '"Th-th-th, tongue comes out...\nTh-th-th, give a shout!"' },
    ],
  },
  {
    name: 'Group 7', mascot: '🦜',
    heroBg: ['#20C997', '#0CA678'], shadowColor: '#087F5B',
    letters: [
      { letter: 'qu', emoji: '🦆', word: 'quack', sound: 'qu-qu',
        storyTitle: 'The Quacking Duck',
        story: 'A duck swims on the pond and quacks loudly. Qu-qu-qu!',
        action: 'Open and close your hand like a duck quacking and say qu-qu-qu.',
        song: '"Qu-qu-qu, the duck says quack...\nQu-qu-qu, it calls you back!"' },
      { letter: 'ou', emoji: '🤕', word: 'ouch', sound: 'ou-ou',
        storyTitle: 'Ouch!',
        story: 'You accidentally touch something sharp. Ou! Ou! It hurts!',
        action: 'Hold your finger and hop on one foot, saying ou-ou-ou like it hurts.',
        song: '"Ou-ou-ou, ouch that hurts...\nOu-ou-ou, even worse!"' },
      { letter: 'oi', emoji: '🫕', word: 'boil', sound: 'oi-oi',
        storyTitle: 'The Boiling Pot',
        story: 'A pot of water boils on the stove. Oi! Oi! The steam rises up!',
        action: 'Stir an imaginary pot and say oi-oi-oi as the water boils.',
        song: '"Oi-oi-oi, the pot boils hot...\nOi-oi-oi, what have we got!"' },
      { letter: 'ue', emoji: '🌤️', word: 'blue', sound: 'ue-ue',
        storyTitle: 'The Blue Sky',
        story: 'You look up at the beautiful blue sky. Ue! The clouds float by.',
        action: 'Point up at the sky and say ue-ue-ue while looking up.',
        song: '"Ue-ue-ue, look at the blue...\nUe-ue-ue, through and through!"' },
      { letter: 'er', emoji: '🤔', word: 'err', sound: 'er-er',
        storyTitle: 'The Nervous Butterfly',
        story: 'You are nervous before your speech. Er... er... What were you going to say?',
        action: 'Put your hand to your chin and think, saying er-er-er.',
        song: '"Er-er-er, what comes next...\nEr-er-er, I\'m perplexed!"' },
      { letter: 'ar', emoji: '🏴‍☠️', word: 'arr', sound: 'ar-ar',
        storyTitle: 'The Pirate Ship',
        story: 'Pirates sail the seven seas. Ar! Ar! They search for treasure!',
        action: 'Put a hand over one eye like a pirate and say ar-ar-ar.',
        song: '"Ar-ar-ar, sail the sea...\nAr-ar-ar, wild and free!"' },
    ],
  },
];

// ─── Sound Card ───────────────────────────────────────────────────────────────

function SoundCard({ item, delay, onPress }) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6, delay }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true, delay }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      cardStyles.wrapper,
      { transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }], opacity: opacityAnim },
    ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => Animated.spring(pressAnim, { toValue: 0.94, useNativeDriver: true, friction: 5 }).start()}
        onPressOut={() => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, friction: 5 }).start()}
        onPress={onPress}
        style={{
          width: CARD_WIDTH, height: 170, borderRadius: 24,
          alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff',
        }}
      >
        <Text style={{ fontSize: 72, fontWeight: '900', color: '#888888', marginBottom: 12, lineHeight: 80 }}>{item.letter}</Text>
        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#EEF3FF', justifyContent: 'center', alignItems: 'center' }}>
          <Icon name="volume-2" size={16} color="#5B8DEF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PhonicsScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [groupIdx, setGroupIdx] = useState(0);
  const [toast, setToast] = useState('');
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const lastLogRef = useRef(0);
  const tapCountRef = useRef(0);

  const group = JP_GROUPS[groupIdx];


  const switchGroup = (idx) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
    ]).start();
    setGroupIdx(idx);
  };

  const showToast = useCallback((msg) => {
    setToast(msg);
    Animated.spring(toastAnim, { toValue: 1, useNativeDriver: true, friction: 7 }).start();
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    }, 2200);
  }, [toastAnim]);

  const handleCardPress = useCallback((item) => {
    ttsService.speak(item.letter);
    showToast(`${item.emoji} ${item.sound}… like a ${item.word}!`);
    if (profile?.id) {
      tapCountRef.current += 1;
      const now = Date.now();
      if (now - lastLogRef.current >= 60000) {
        logSession({ studentId: profile.id, activityType: 'phonics', score: tapCountRef.current, total: tapCountRef.current, details: { label: item.letter } });
        lastLogRef.current = now;
        tapCountRef.current = 0;
      }
    }
  }, [profile, showToast]);

  return (
    <ScreenWrapper role="student" padded={false} edges={['left', 'right', 'bottom']} style={{ backgroundColor: '#FFF8F0' }}>
      <View style={styles.blobTopRight} pointerEvents="none" />
      <View style={styles.blobBottomLeft} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Icon name="chevron-left" size={24} color="#3D3D3D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{group.name} Phonics</Text>
          <Text style={styles.headerMascot}>{group.mascot}</Text>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBannerSection}>
          <LinearGradient
            colors={group.heroBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroBanner, { shadowColor: group.shadowColor }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.heroBannerTitle}>Tap a letter to hear its sound!</Text>
              <Text style={styles.heroBannerSub}>Each letter has a special Jolly Phonics song 🎵 Can you say it too?</Text>
            </View>
            <Text style={styles.heroBannerDeco}>🎶</Text>
          </LinearGradient>
        </View>

        {/* Activities Button */}
        <View style={styles.activitiesSection}>
          <TouchableOpacity
            style={styles.activitiesButton}
            onPress={() => navigation.navigate('PhonicsActivity')}
            activeOpacity={0.85}
          >
            <View style={styles.activitiesIcon}>
              <Text style={{ fontSize: 20 }}>🎮</Text>
            </View>
            <View style={styles.activitiesTextBlock}>
              <Text style={styles.activitiesTitle}>Phonics Activities</Text>
              <Text style={styles.activitiesSub}>Games · Quizzes · Stories</Text>
            </View>
            <Icon name="chevron-right" size={18} color="rgba(255,255,255,0.60)" />
          </TouchableOpacity>
        </View>

        {/* Section Label */}
        <Text style={styles.sectionLabel}>Letter Sounds</Text>

        {/* Cards Grid */}
        <Animated.View style={[
          styles.grid,
          { opacity: slideAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.3, 1] }) },
        ]}>
          {group.letters.map((item, i) => (
            <SoundCard
              key={`${groupIdx}-${item.letter}`}
              item={item}
              delay={i * 55}
              onPress={() => handleCardPress(item)}
            />
          ))}
        </Animated.View>

        {/* Group Dots */}
        <View style={styles.dotsRow}>
          {JP_GROUPS.map((g, i) => (
            <TouchableOpacity key={i} onPress={() => switchGroup(i)} activeOpacity={0.7}>
              <View style={[
                styles.dot,
                i === groupIdx && styles.dotActive,
                i === groupIdx && { backgroundColor: group.heroBg[0] },
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Toast */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toast,
          {
            opacity: toastAnim,
            transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
          },
        ]}
      >
        <Text style={styles.toastText}>{toast}</Text>
      </Animated.View>
    </ScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  blobTopRight: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#FFD6E0', opacity: 0.55,
  },
  blobBottomLeft: {
    position: 'absolute', bottom: 80, left: -80,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: '#D4F0FF', opacity: 0.50,
  },
  header: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backButton: {
    width: 42, height: 42, backgroundColor: '#fff', borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10, shadowRadius: 6,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#3D3D3D' },
  headerMascot: { fontSize: 30 },
  heroBannerSection: { paddingHorizontal: 20, marginBottom: 14 },
  heroBanner: {
    borderRadius: 22, paddingVertical: 18, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center',
    elevation: 8, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28, shadowRadius: 10, overflow: 'hidden',
  },
  heroBannerTitle: { fontSize: 15, fontWeight: '900', color: '#fff', lineHeight: 21 },
  heroBannerSub: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.82)', marginTop: 3, lineHeight: 16 },
  heroBannerDeco: { fontSize: 38, opacity: 0.28, marginLeft: 10 },
  activitiesSection: { paddingHorizontal: 20, marginBottom: 20 },
  activitiesButton: {
    backgroundColor: '#555', borderRadius: 18,
    paddingVertical: 15, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 8,
  },
  activitiesIcon: {
    width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 11, justifyContent: 'center', alignItems: 'center',
  },
  activitiesTextBlock: { flex: 1 },
  activitiesTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  activitiesSub: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginTop: 1 },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#aaa', letterSpacing: 2,
    textTransform: 'uppercase', marginBottom: 14, marginLeft: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 14,
  },
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, marginTop: 28,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DDD' },
  dotActive: { width: 24, height: 8, borderRadius: 4 },
  toast: {
    position: 'absolute', bottom: 32, alignSelf: 'center',
    backgroundColor: '#3D3D3D', borderRadius: 40,
    paddingHorizontal: 22, paddingVertical: 12,
    elevation: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 10,
    maxWidth: '85%', zIndex: 100,
  },
  toastText: { color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center' },
});

const cardStyles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
    height: 170,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 14,
  },
  card: {
    width: CARD_WIDTH,
    height: 170,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  letter: {
    fontSize: 72,
    fontWeight: '900',
    color: '#888',
    marginBottom: 12,
  },
  speakerCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
