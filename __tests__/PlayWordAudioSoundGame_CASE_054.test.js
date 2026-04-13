// ─── Test Case CASE-054 ──────────────────────────────────────────────────────
// Test Case ID: CASE-054
// Test Case Description: Validate by tapping "Tap to Hear" button
// Expected Result: Word audio plays

// Mock audio state for sound game
let audioState = {
  isPlaying: false,
  currentSound: null,
  playCount: 0
};

const MOCK_SOUNDS = {
  'dog_bark': { audio: 'dog_bark.mp3', duration: 1200, type: 'animal' },
  'car_horn': { audio: 'car_horn.mp3', duration: 1500, type: 'vehicle' },
  'phone_ring': { audio: 'phone_ring.mp3', duration: 2000, type: 'household' },
  'cat_meow': { audio: 'cat_meow.mp3', duration: 1000, type: 'animal' },
  'bird_chirp': { audio: 'bird_chirp.mp3', duration: 1800, type: 'animal' }
};

function playTapToHear(buttonName, soundId) {
  // Check if button name is provided
  if (!buttonName || buttonName.trim() === '') {
    return {
      success: false,
      actualResult: 'Word audio not played - No button specified',
      audioPlayed: false,
      errorMessage: 'Invalid action'
    };
  }

  // Check if it's the tap to hear button
  const normalizedButton = buttonName.toLowerCase().replace(/\s+/g, '');
  const validButtons = ['taptohear', 'tap hear', 'hear', 'playsound', 'play'];
  if (!validButtons.includes(normalizedButton)) {
    return {
      success: false,
      actualResult: 'Word audio not played - Invalid button',
      audioPlayed: false,
      errorMessage: 'Invalid button clicked'
    };
  }

  // Check if sound ID is provided
  if (!soundId || soundId.trim() === '') {
    return {
      success: false,
      actualResult: 'Word audio not played - No sound specified',
      audioPlayed: false,
      errorMessage: 'No sound to play'
    };
  }

  // Check if sound exists
  if (!MOCK_SOUNDS[soundId]) {
    return {
      success: false,
      actualResult: 'Word audio not played - Sound not found',
      audioPlayed: false,
      errorMessage: `Audio not available for sound: ${soundId}`
    };
  }

  // Play audio
  audioState.isPlaying = true;
  audioState.currentSound = soundId;
  audioState.playCount++;

  return {
    success: true,
    actualResult: 'Word audio plays',
    audioPlayed: true,
    soundId: soundId,
    soundType: MOCK_SOUNDS[soundId].type,
    audioFile: MOCK_SOUNDS[soundId].audio,
    duration: MOCK_SOUNDS[soundId].duration,
    playCount: audioState.playCount
  };
}

// Reset state before each test
function resetAudioState() {
  audioState = {
    isPlaying: false,
    currentSound: null,
    playCount: 0
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-054 (Validate by tapping "Tap to Hear" button)', () => {

  beforeEach(() => {
    resetAudioState();
  });

  test('Tap "Tap to Hear" - word audio plays', () => {
    const expectedResult = 'Word audio plays';
    const result = playTapToHear('Tap to Hear', 'dog_bark');

    console.log('Test Case ID: CASE-054');
    console.log('Test Case Description: Validate by tapping "Tap to Hear" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Audio Played: ${result.audioPlayed}`);
    console.log(`Sound ID: ${result.soundId}`);
    console.log(`Sound Type: ${result.soundType}`);
    console.log(`Audio File: ${result.audioFile}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Play Count: ${result.playCount}`);

    if (result.success && result.audioPlayed && result.soundId === 'dog_bark') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.actualResult).toContain('plays');
    expect(result.soundId).toBe('dog_bark');
    expect(result.soundType).toBe('animal');
    expect(result.audioFile).toBe('dog_bark.mp3');
    expect(result.duration).toBe(1200);
    expect(result.playCount).toBe(1);
  });

  test('Tap "tap to hear" (lowercase) - word audio plays', () => {
    const expectedResult = 'Word audio plays';
    const result = playTapToHear('tap to hear', 'car_horn');

    console.log('Test Case ID: CASE-054');
    console.log('Test Case Description: Validate by tapping "Tap to Hear" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Audio Played: ${result.audioPlayed}`);
    console.log(`Sound Type: ${result.soundType}`);

    if (result.success && result.audioPlayed) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.soundId).toBe('car_horn');
    expect(result.soundType).toBe('vehicle');
  });

  test('Tap "TAP TO HEAR" (uppercase) - word audio plays', () => {
    const expectedResult = 'Word audio plays';
    const result = playTapToHear('TAP TO HEAR', 'phone_ring');

    console.log('Test Case ID: CASE-054');
    console.log('Test Case Description: Validate by tapping "Tap to Hear" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.audioPlayed) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.soundId).toBe('phone_ring');
    expect(result.duration).toBe(2000);
  });

  test('Play multiple sounds - each plays successfully', () => {
    const expectedResult = 'Word audio plays';
    
    // First sound
    const result1 = playTapToHear('Tap to Hear', 'cat_meow');
    expect(result1.playCount).toBe(1);
    
    // Second sound
    const result2 = playTapToHear('Tap to Hear', 'bird_chirp');

    console.log('Test Case ID: CASE-054');
    console.log('Test Case Description: Validate by tapping "Tap to Hear" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Sound 1: ${result1.soundId} (${result1.soundType})`);
    console.log(`Sound 2: ${result2.soundId} (${result2.soundType})`);
    console.log(`Play Count: ${result2.playCount}`);

    if (result2.success && result2.audioPlayed && result2.playCount === 2) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result2.success).toBe(true);
    expect(result2.audioPlayed).toBe(true);
    expect(result2.soundId).toBe('bird_chirp');
    expect(result2.playCount).toBe(2);
  });

  test('Tap different button - audio not played (negative test)', () => {
    const result = playTapToHear('Submit', 'dog_bark');

    console.log('Test Case ID: CASE-054');
    console.log('Test Case Description: Validate by tapping "Tap to Hear" button');
    console.log('Expected Result: Word audio plays (for Tap to Hear button)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.audioPlayed) {
      console.log('Outcome: PASSED - Correctly rejected invalid button');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.audioPlayed).toBe(false);
    expect(result.actualResult).toContain('Invalid button');
  });

  test('No sound specified - audio not played (negative test)', () => {
    const result = playTapToHear('Tap to Hear', '');

    console.log('Test Case ID: CASE-054');
    console.log('Test Case Description: Validate by tapping "Tap to Hear" button');
    console.log('Expected Result: Word audio plays (when sound is provided)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.audioPlayed) {
      console.log('Outcome: PASSED - Correctly rejected empty sound');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.audioPlayed).toBe(false);
    expect(result.errorMessage).toContain('No sound');
  });

  test('Invalid sound ID - audio not played (negative test)', () => {
    const result = playTapToHear('Tap to Hear', 'invalid_sound_123');

    console.log('Test Case ID: CASE-054');
    console.log('Test Case Description: Validate by tapping "Tap to Hear" button');
    console.log('Expected Result: Word audio plays (when sound exists)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Requested Sound: invalid_sound_123`);

    if (!result.success && !result.audioPlayed) {
      console.log('Outcome: PASSED - Correctly rejected invalid sound');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.audioPlayed).toBe(false);
    expect(result.errorMessage).toContain('not available');
  });

});
