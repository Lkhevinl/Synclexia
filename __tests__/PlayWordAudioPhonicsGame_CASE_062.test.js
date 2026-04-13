// ─── Test Case CASE-062 ──────────────────────────────────────────────────────
// Test Case ID: CASE-062
// Test Case Description: Validate by tapping "Hear the Word" button
// Expected Result: Word audio plays

// Mock audio state for phonics game
let audioState = {
  isPlaying: false,
  currentWord: null,
  playCount: 0
};

const MOCK_WORDS = {
  'CAT': { audio: 'cat_phonics.mp3', duration: 900, phonemes: ['C', 'A', 'T'] },
  'DOG': { audio: 'dog_phonics.mp3', duration: 800, phonemes: ['D', 'O', 'G'] },
  'FISH': { audio: 'fish_phonics.mp3', duration: 1000, phonemes: ['F', 'I', 'SH'] },
  'BALL': { audio: 'ball_phonics.mp3', duration: 850, phonemes: ['B', 'A', 'L', 'L'] },
  'TABLE': { audio: 'table_phonics.mp3', duration: 1100, phonemes: ['T', 'A', 'B', 'L'] }
};

function playPhonicsWordAudio(buttonName, word) {
  // Check if button name is provided
  if (!buttonName || buttonName.trim() === '') {
    return {
      success: false,
      actualResult: 'Word audio not played - No button specified',
      audioPlayed: false,
      errorMessage: 'Invalid action'
    };
  }

  // Check if it's the hear word button
  const normalizedButton = buttonName.toLowerCase().replace(/\s+/g, '');
  const validButtons = ['heartheword', 'hearword', 'playword', 'play'];
  if (!validButtons.includes(normalizedButton)) {
    return {
      success: false,
      actualResult: 'Word audio not played - Invalid button',
      audioPlayed: false,
      errorMessage: 'Invalid button clicked'
    };
  }

  // Check if word is provided
  if (!word || word.trim() === '') {
    return {
      success: false,
      actualResult: 'Word audio not played - No word specified',
      audioPlayed: false,
      errorMessage: 'No word to play'
    };
  }

  // Check if word exists in dictionary
  const upperWord = word.toUpperCase();
  if (!MOCK_WORDS[upperWord]) {
    return {
      success: false,
      actualResult: 'Word audio not played - Word not found',
      audioPlayed: false,
      errorMessage: `Audio not available for word: ${word}`
    };
  }

  // Play word audio
  audioState.isPlaying = true;
  audioState.currentWord = upperWord;
  audioState.playCount++;

  return {
    success: true,
    actualResult: 'Word audio plays',
    audioPlayed: true,
    word: upperWord,
    phonemes: MOCK_WORDS[upperWord].phonemes,
    audioFile: MOCK_WORDS[upperWord].audio,
    duration: MOCK_WORDS[upperWord].duration,
    playCount: audioState.playCount
  };
}

// Reset state before each test
function resetAudioState() {
  audioState = {
    isPlaying: false,
    currentWord: null,
    playCount: 0
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-062 (Validate by tapping "Hear the Word" button)', () => {

  beforeEach(() => {
    resetAudioState();
  });

  test('Tap "Hear the Word" - word audio plays', () => {
    const expectedResult = 'Word audio plays';
    const result = playPhonicsWordAudio('Hear the Word', 'CAT');

    console.log('Test Case ID: CASE-062');
    console.log('Test Case Description: Validate by tapping "Hear the Word" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Audio Played: ${result.audioPlayed}`);
    console.log(`Word: ${result.word}`);
    console.log(`Phonemes: ${result.phonemes ? result.phonemes.join('-') : 'N/A'}`);
    console.log(`Audio File: ${result.audioFile}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Play Count: ${result.playCount}`);

    if (result.success && result.audioPlayed && result.word === 'CAT') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.actualResult).toContain('plays');
    expect(result.word).toBe('CAT');
    expect(result.phonemes).toEqual(['C', 'A', 'T']);
    expect(result.audioFile).toBe('cat_phonics.mp3');
    expect(result.duration).toBe(900);
    expect(result.playCount).toBe(1);
  });

  test('Tap "hear the word" (lowercase) - word audio plays', () => {
    const expectedResult = 'Word audio plays';
    const result = playPhonicsWordAudio('hear the word', 'DOG');

    console.log('Test Case ID: CASE-062');
    console.log('Test Case Description: Validate by tapping "Hear the Word" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Audio Played: ${result.audioPlayed}`);
    console.log(`Word: ${result.word}`);
    console.log(`Phonemes: ${result.phonemes ? result.phonemes.join('-') : 'N/A'}`);

    if (result.success && result.audioPlayed) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.word).toBe('DOG');
    expect(result.phonemes).toEqual(['D', 'O', 'G']);
  });

  test('Tap "HEAR THE WORD" (uppercase) - word audio plays', () => {
    const expectedResult = 'Word audio plays';
    const result = playPhonicsWordAudio('HEAR THE WORD', 'FISH');

    console.log('Test Case ID: CASE-062');
    console.log('Test Case Description: Validate by tapping "Hear the Word" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.audioPlayed) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.word).toBe('FISH');
    expect(result.phonemes).toEqual(['F', 'I', 'SH']);
    expect(result.duration).toBe(1000);
  });

  test('Play multiple words - each plays successfully', () => {
    const expectedResult = 'Word audio plays';
    
    // First word
    const result1 = playPhonicsWordAudio('Hear the Word', 'BALL');
    expect(result1.playCount).toBe(1);
    
    // Second word
    const result2 = playPhonicsWordAudio('Hear the Word', 'TABLE');

    console.log('Test Case ID: CASE-062');
    console.log('Test Case Description: Validate by tapping "Hear the Word" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Word 1: ${result1.word} (${result1.phonemes.join('-')})`);
    console.log(`Word 2: ${result2.word} (${result2.phonemes.join('-')})`);
    console.log(`Play Count: ${result2.playCount}`);

    if (result2.success && result2.audioPlayed && result2.playCount === 2) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result2.success).toBe(true);
    expect(result2.audioPlayed).toBe(true);
    expect(result2.word).toBe('TABLE');
    expect(result2.phonemes).toEqual(['T', 'A', 'B', 'L']);
    expect(result2.playCount).toBe(2);
  });

  test('Tap different button - audio not played (negative test)', () => {
    const result = playPhonicsWordAudio('Submit', 'CAT');

    console.log('Test Case ID: CASE-062');
    console.log('Test Case Description: Validate by tapping "Hear the Word" button');
    console.log('Expected Result: Word audio plays (for Hear the Word button)');
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

  test('No word specified - audio not played (negative test)', () => {
    const result = playPhonicsWordAudio('Hear the Word', '');

    console.log('Test Case ID: CASE-062');
    console.log('Test Case Description: Validate by tapping "Hear the Word" button');
    console.log('Expected Result: Word audio plays (when word is provided)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.audioPlayed) {
      console.log('Outcome: PASSED - Correctly rejected empty word');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.audioPlayed).toBe(false);
    expect(result.errorMessage).toContain('No word');
  });

  test('Invalid word - audio not played (negative test)', () => {
    const result = playPhonicsWordAudio('Hear the Word', 'INVALIDWORD');

    console.log('Test Case ID: CASE-062');
    console.log('Test Case Description: Validate by tapping "Hear the Word" button');
    console.log('Expected Result: Word audio plays (when word exists)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Requested Word: INVALIDWORD`);

    if (!result.success && !result.audioPlayed) {
      console.log('Outcome: PASSED - Correctly rejected invalid word');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.audioPlayed).toBe(false);
    expect(result.errorMessage).toContain('not available');
  });

});
