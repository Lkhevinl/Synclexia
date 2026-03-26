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
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ONBOARDING_KEY = '@synclexia_onboarding_complete';

const onboardingData = [
  {
    id: '1',
    title: 'Dyslexia-Friendly Learning',
    description: 'Learn to read and write with tools made especially for kids with dyslexia—big letters, helpful sounds, and simple steps!',
    icon: 'book-outline',
    emoji: '📚',
    // Add image path when you have the image:
    // image: require('../../assets/onboarding-1.png'),
  },
  {
    id: '2',
    title: 'Make It Your Own!',
    description: 'Change colors, fonts, and sounds to match how you learn best. Your app, your way!',
    icon: 'color-palette-outline',
    emoji: '🎨',
    // Add image path when you have the image:
    // image: require('../../assets/onboarding-2.png'),
  },
  {
    id: '3',
    title: 'Learn Through Play',
    description: 'Play fun games that help you read, spell, and learn new words. Learning feels like playtime!',
    icon: 'game-controller-outline',
    emoji: '🎮',
    // Add image path when you have the image:
    // image: require('../../assets/onboarding-3.png'),
  },
  {
    id: '4',
    title: 'Track Your Progress with Parents',
    description: 'Your parents can see your achievements and cheer you on! Share your learning journey together.',
    icon: 'people-outline',
    emoji: '👨‍👩‍👧',
    // Add image path when you have the image:
    // image: require('../../assets/onboarding-4.png'),
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
        {/* If you have a custom image, it will show. Otherwise, shows emoji */}
        {item.image ? (
          <Image
            source={item.image}
            style={styles.customIllustration}
            resizeMode="contain"
          />
        ) : (
          <>
            <View style={styles.illustrationCircle}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            {/* Decorative elements */}
            <View style={styles.decorDot1} />
            <View style={styles.decorDot2} />
            <View style={styles.decorDot3} />
          </>
        )}
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
      <StatusBar barStyle="dark-content" backgroundColor="#FDF6E9" />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

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
    backgroundColor: '#FDF6E9',
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },

  // Slide
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 40,
  },

  // Illustration
  illustrationArea: {
    height: SCREEN_HEIGHT * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  // Add this for custom illustration images
  customIllustration: {
    width: '85%',
    height: '85%',
  },
  illustrationCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  emoji: {
    fontSize: 70,
  },
  decorDot1: {
    position: 'absolute',
    top: 30,
    right: 60,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E57373',
  },
  decorDot2: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#90CAF9',
  },
  decorDot3: {
    position: 'absolute',
    top: 80,
    left: 40,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD93D',
  },

  // Content
  contentArea: {
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5A5A',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    color: '#666',
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
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: '#E57373',
    width: 25,
  },
  dotInactive: {
    backgroundColor: '#D9D9D9',
  },

  // Login Button
  loginBtn: {
    backgroundColor: '#E57373',
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
    borderColor: '#E57373',
  },
  createBtnText: {
    color: '#E57373',
    fontSize: 18,
    fontWeight: '600',
  },
});
