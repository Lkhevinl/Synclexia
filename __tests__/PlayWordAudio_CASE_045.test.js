// ─── Test Case CASE-045 ──────────────────────────────────────────────────────
// Test Case ID: CASE-045
// Test Case Description: Validate by tapping "Hear the word again" button
// Expected Result: Word audio plays

// Mock audio state
let audioState = {
  isPlaying: false,
  currentWord: null,
  playCount: 0
};

const MOCK_WORDS = {
  'CAT': { audio: 'cat.mp3', duration: 800 },
  'DOG': { audio: 'dog.mp3', duration: 700 },
  'BALL': { audio: 'ball.mp3', duration: 900 },
  'TREE': { audio: 'tree.mp3', duration: 750 }
};

function playWordAudio(buttonName, word) {
  // Check if button name is provided
  if (!buttonName || buttonName.trim() === '') {
    return {
      success: false,
      actualResult: 'Word audio not played - No button specified',
      audioPlayed: false,
      errorMessage: 'Invalid action'
    };
  }

  // Check if it's the hear word again button
  const normalizedButton = buttonName.toLowerCase().replace(/\s+/g, '');
  const validButtons = ['hearthewordagain', 'hearword', 'playword', 'playagain'];
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

describe('Test Case CASE-045 (Validate by tapping "Hear the word again" button)', () => {

  beforeEach(() => {
    resetAudioState();
  });

  test('Tap "Hear the word again" - word audio plays', () => {
    const expectedResult = 'Word audio plays';
    const result = playWordAudio('Hear the word again', 'CAT');

    console.log('Test Case ID: CASE-045');
    console.log('Test Case Description: Validate by tapping "Hear the word again" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Audio Played: ${result.audioPlayed}`);
    console.log(`Word: ${result.word}`);
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
    expect(result.audioFile).toBe('cat.mp3');
    expect(result.duration).toBe(800);
  });

  test('Tap hear the word again (lowercase) - word audio plays', () => {
    const expectedResult = 'Word audio plays';
    const result = playWordAudio('hear the word again', 'DOG');

    console.log('Test Case ID: CASE-045');
    console.log('Test Case Description: Validate by tapping "Hear the word again" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Audio Played: ${result.audioPlayed}`);
    console.log(`Word: ${result.word}`);

    if (result.success && result.audioPlayed) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.word).toBe('DOG');
  });

  test('Tap HEAR THE WORD AGAIN (uppercase) - word audio plays', () => {
    const expectedResult = 'Word audio plays';
    const result = playWordAudio('HEAR THE WORD AGAIN', 'BALL');

    console.log('Test Case ID: CASE-045');
    console.log('Test Case Description: Validate by tapping "Hear the word again" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.audioPlayed) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.word).toBe('BALL');
  });

  test('Play word multiple times - audio plays each time', () => {
    const expectedResult = 'Word audio plays';
    
    // First play
    const result1 = playWordAudio('Hear the word again', 'TREE');
    expect(result1.playCount).toBe(1);
    
    // Second play
    const result2 = playWordAudio('Hear the word again', 'TREE');
    
    console.log('Test Case ID: CASE-045');
    console.log('Test Case Description: Validate by tapping "Hear the word again" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result2.actualResult}`);
    console.log(`Play Count: ${result2.playCount}`);

    if (result2.success && result2.audioPlayed && result2.playCount === 2) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result2.success).toBe(true);
    expect(result2.audioPlayed).toBe(true);
    expect(result2.playCount).toBe(2);
  });

  test('Tap different button - audio not played (negative test)', () => {
    const result = playWordAudio('Submit', 'CAT');

    console.log('Test Case ID: CASE-045');
    console.log('Test Case Description: Validate by tapping "Hear the word again" button');
    console.log('Expected Result: Word audio plays (for hear word button)');
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
    const result = playWordAudio('Hear the word again', '');

    console.log('Test Case ID: CASE-045');
    console.log('Test Case Description: Validate by tapping "Hear the word again" button');
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
    const result = playWordAudio('Hear the word again', 'XYZ123');

    console.log('Test Case ID: CASE-045');
    console.log('Test Case Description: Validate by tapping "Hear the word again" button');
    console.log('Expected Result: Word audio plays (when word exists)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Requested Word: XYZ123`);

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
