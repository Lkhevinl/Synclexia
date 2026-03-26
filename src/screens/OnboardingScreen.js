import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ONBOARDING_KEY = '@synclexia_onboarding_complete';

// Synclexia App Colors
const COLORS = {
  background: '#F4F1DE',
  textPrimary: '#3A3A3A',
  textSecondary: '#6B6B6B',
  primary: '#F28C82',
  blue: '#6FA8DC',
  green: '#93C47D',
  lavender: '#B4A7D6',
};

const onboardingData = [
  {
    id: '1',
    title: 'Dyslexia-Friendly Learning',
    description: 'Learn to read and write with tools made especially for kids with dyslexia—big letters, helpful sounds, and simple steps!',
    image: require('../../assets/13-removebg-preview.png'),
  },
  {
    id: '2',
    title: 'Make It Your Own!',
    description: 'Change colors, fonts, and sounds to match how you learn best. Your app, your way!',
    image: require('../../assets/10-removebg-preview.png'),
  },
  {
    id: '3',
    title: 'Learn Through Play',
    description: 'Play fun games that help you read, spell, and learn new words. Learning feels like playtime!',
    image: require('../../assets/12-removebg-preview.png'),
  },
  {
    id: '4',
    title: 'Track Your Progress with Parents',
    description: 'Your parents can see your achievements and cheer you on! Share your learning journey together.',
    image: require('../../assets/11-removebg-preview.png'),
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) {
      console.log('Error saving onboarding state:', e);
    }
  };

  const handleLogin = async () => {
    await completeOnboarding();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleCreateAccount = async () => {
    await completeOnboarding();
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignUp' }],
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      {/* Illustration Area */}
      <View style={styles.illustrationArea}>
        <Image
          source={item.image}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <View style={styles.contentArea}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {onboardingData.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            currentIndex === index ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        bounces={false}
        style={styles.flatList}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {renderDots()}

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>

        {/* Create Account Button */}
        <TouchableOpacity
          style={styles.createBtn}
          onPress={handleCreateAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.createBtnText}>Create an Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flatList: {
    flex: 1,
  },

  // Slide
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 30,
    paddingTop: 60,
  },

  // Illustration
  illustrationArea: {
    height: SCREEN_HEIGHT * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },

  // Content
  contentArea: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Bottom Section
  bottomSection: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },

  // Dots
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 25,
  },
  dotInactive: {
    backgroundColor: '#D9D9D9',
    width: 10,
  },

  // Login Button
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  // Create Account Button
  createBtn: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  createBtnText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});
