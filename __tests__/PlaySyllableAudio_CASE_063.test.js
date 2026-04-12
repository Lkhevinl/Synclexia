// ─── Test Case CASE-063 ──────────────────────────────────────────────────────
// Test Case ID: CASE-063
// Test Case Description: Validate tapping syllable card
// Expected Result: Syllable audio plays

// Mock syllable audio state
let syllableAudioState = {
  isPlaying: false,
  currentSyllable: null,
  playCount: 0
};

const MOCK_SYLLABLES = {
  'C': { audio: 'syllable_c.mp3', duration: 500, type: 'consonant' },
  'A': { audio: 'syllable_a.mp3', duration: 600, type: 'vowel' },
  'T': { audio: 'syllable_t.mp3', duration: 500, type: 'consonant' },
  'D': { audio: 'syllable_d.mp3', duration: 500, type: 'consonant' },
  'O': { audio: 'syllable_o.mp3', duration: 600, type: 'vowel' },
  'G': { audio: 'syllable_g.mp3', duration: 500, type: 'consonant' },
  'B': { audio: 'syllable_b.mp3', duration: 500, type: 'consonant' },
  'L': { audio: 'syllable_l.mp3', duration: 500, type: 'consonant' },
  'SH': { audio: 'syllable_sh.mp3', duration: 700, type: 'blend' }
};

function playSyllableAudio(syllable) {
  // Check if syllable is provided
  if (!syllable || syllable.trim() === '') {
    return {
      success: false,
      actualResult: 'Syllable audio not played - No syllable specified',
      audioPlayed: false,
      errorMessage: 'Please tap a syllable card'
    };
  }

  // Check if syllable exists
  const upperSyllable = syllable.toUpperCase();
  if (!MOCK_SYLLABLES[upperSyllable]) {
    return {
      success: false,
      actualResult: 'Syllable audio not played - Syllable not found',
      audioPlayed: false,
      errorMessage: `Audio not available for syllable: ${syllable}`
    };
  }

  // Play syllable audio
  syllableAudioState.isPlaying = true;
  syllableAudioState.currentSyllable = upperSyllable;
  syllableAudioState.playCount++;

  return {
    success: true,
    actualResult: 'Syllable audio plays',
    audioPlayed: true,
    syllable: upperSyllable,
    syllableType: MOCK_SYLLABLES[upperSyllable].type,
    audioFile: MOCK_SYLLABLES[upperSyllable].audio,
    duration: MOCK_SYLLABLES[upperSyllable].duration,
    playCount: syllableAudioState.playCount
  };
}

// Reset state before each test
function resetSyllableAudioState() {
  syllableAudioState = {
    isPlaying: false,
    currentSyllable: null,
    playCount: 0
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-063 (Validate tapping syllable card)', () => {

  beforeEach(() => {
    resetSyllableAudioState();
  });

  test('Tap syllable card C - syllable audio plays', () => {
    const expectedResult = 'Syllable audio plays';
    const result = playSyllableAudio('C');

    console.log('Test Case ID: CASE-063');
    console.log('Test Case Description: Validate tapping syllable card');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Audio Played: ${result.audioPlayed}`);
    console.log(`Syllable: ${result.syllable}`);
    console.log(`Syllable Type: ${result.syllableType}`);
    console.log(`Audio File: ${result.audioFile}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Play Count: ${result.playCount}`);

    if (result.success && result.audioPlayed && result.syllable === 'C') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.actualResult).toContain('plays');
    expect(result.syllable).toBe('C');
    expect(result.syllableType).toBe('consonant');
    expect(result.audioFile).toBe('syllable_c.mp3');
    expect(result.duration).toBe(500);
    expect(result.playCount).toBe(1);
  });

  test('Tap syllable card A - syllable audio plays', () => {
    const expectedResult = 'Syllable audio plays';
    const result = playSyllableAudio('A');

    console.log('Test Case ID: CASE-063');
    console.log('Test Case Description: Validate tapping syllable card');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Audio Played: ${result.audioPlayed}`);
    console.log(`Syllable: ${result.syllable}`);
    console.log(`Syllable Type: ${result.syllableType}`);

    if (result.success && result.audioPlayed) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.syllable).toBe('A');
    expect(result.syllableType).toBe('vowel');
    expect(result.audioFile).toBe('syllable_a.mp3');
  });

  test('Tap syllable card T - syllable audio plays', () => {
    const expectedResult = 'Syllable audio plays';
    const result = playSyllableAudio('T');

    console.log('Test Case ID: CASE-063');
    console.log('Test Case Description: Validate tapping syllable card');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Audio Played: ${result.audioPlayed}`);

    if (result.success && result.audioPlayed) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.syllable).toBe('T');
    expect(result.syllableType).toBe('consonant');
  });

  test('Tap blend syllable SH - syllable audio plays', () => {
    const expectedResult = 'Syllable audio plays';
    const result = playSyllableAudio('SH');

    console.log('Test Case ID: CASE-063');
    console.log('Test Case Description: Validate tapping syllable card');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Syllable: ${result.syllable}`);
    console.log(`Syllable Type: ${result.syllableType}`);
    console.log(`Duration: ${result.duration}ms`);

    if (result.success && result.audioPlayed && result.syllableType === 'blend') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.syllable).toBe('SH');
    expect(result.syllableType).toBe('blend');
    expect(result.duration).toBe(700);
  });

  test('Tap lowercase syllable card - plays uppercase', () => {
    const expectedResult = 'Syllable audio plays';
    const result = playSyllableAudio('b');

    console.log('Test Case ID: CASE-063');
    console.log('Test Case Description: Validate tapping syllable card');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Tapped: 'b' (lowercase)`);
    console.log(`Played: '${result.syllable}' (uppercase)`);

    if (result.success && result.audioPlayed && result.syllable === 'B') {
      console.log('Outcome: PASSED - Case insensitive');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.syllable).toBe('B');
  });

  test('Play multiple syllables - each plays successfully', () => {
    const expectedResult = 'Syllable audio plays';
    
    // First syllable
    const result1 = playSyllableAudio('C');
    expect(result1.playCount).toBe(1);
    
    // Second syllable
    const result2 = playSyllableAudio('A');
    
    // Third syllable
    const result3 = playSyllableAudio('T');

    console.log('Test Case ID: CASE-063');
    console.log('Test Case Description: Validate tapping syllable card');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Sequence: C-A-T`);
    console.log(`Play Count: ${result3.playCount}`);

    if (result3.success && result3.audioPlayed && result3.playCount === 3) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result3.success).toBe(true);
    expect(result3.audioPlayed).toBe(true);
    expect(result3.syllable).toBe('T');
    expect(result3.playCount).toBe(3);
  });

  test('No syllable tapped - audio not played (negative test)', () => {
    const result = playSyllableAudio('');

    console.log('Test Case ID: CASE-063');
    console.log('Test Case Description: Validate tapping syllable card');
    console.log('Expected Result: Syllable audio plays (when syllable is provided)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.audioPlayed) {
      console.log('Outcome: PASSED - Correctly rejected empty syllable');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.audioPlayed).toBe(false);
    expect(result.errorMessage).toContain('tap a syllable');
  });

  test('Invalid syllable - audio not played (negative test)', () => {
    const result = playSyllableAudio('XYZ');

    console.log('Test Case ID: CASE-063');
    console.log('Test Case Description: Validate tapping syllable card');
    console.log('Expected Result: Syllable audio plays (when syllable exists)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Requested Syllable: XYZ`);

    if (!result.success && !result.audioPlayed) {
      console.log('Outcome: PASSED - Correctly rejected invalid syllable');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.audioPlayed).toBe(false);
    expect(result.errorMessage).toContain('not available');
  });

});
