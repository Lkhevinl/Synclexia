// ─── Test Case CASE-064 ──────────────────────────────────────────────────────
// Test Case ID: CASE-064
// Test Case Description: Validate tapping "Blend!" button
// Expected Result: Blended word audio plays and displayed; Next button appears

// Mock blend game state
let blendState = {
  selectedSyllables: [],
  blendedWord: null,
  isBlended: false
};

const BLEND_WORDS = {
  'C-A-T': { word: 'CAT', audio: 'blend_cat.mp3', duration: 1200 },
  'D-O-G': { word: 'DOG', audio: 'blend_dog.mp3', duration: 1100 },
  'B-A-L-L': { word: 'BALL', audio: 'blend_ball.mp3', duration: 1300 },
  'F-I-SH': { word: 'FISH', audio: 'blend_fish.mp3', duration: 1400 }
};

function blendSyllables(buttonName, syllables) {
  // Check if button name is provided
  if (!buttonName || buttonName.trim() === '') {
    return {
      success: false,
      actualResult: 'Blend failed - No button specified',
      audioPlayed: false,
      wordDisplayed: false,
      nextButtonVisible: false
    };
  }

  // Check if it's the blend button
  const normalizedButton = buttonName.toLowerCase().replace(/\s+/g, '').replace(/!/g, '');
  if (normalizedButton !== 'blend') {
    return {
      success: false,
      actualResult: 'Blend failed - Invalid button',
      audioPlayed: false,
      wordDisplayed: false,
      nextButtonVisible: false
    };
  }

  // Check if syllables are provided
  if (!syllables || syllables.length === 0) {
    return {
      success: false,
      actualResult: 'Blend failed - No syllables selected',
      audioPlayed: false,
      wordDisplayed: false,
      nextButtonVisible: false,
      errorMessage: 'Please select syllables first'
    };
  }

  // Create syllable key
  const syllableKey = syllables.join('-').toUpperCase();
  
  // Check if syllables form a valid word
  if (!BLEND_WORDS[syllableKey]) {
    return {
      success: false,
      actualResult: 'Blend failed - Invalid syllable combination',
      audioPlayed: false,
      wordDisplayed: false,
      nextButtonVisible: false,
      errorMessage: 'Those syllables do not form a word'
    };
  }

  const blendResult = BLEND_WORDS[syllableKey];

  // Update state
  blendState.selectedSyllables = syllables;
  blendState.blendedWord = blendResult.word;
  blendState.isBlended = true;

  return {
    success: true,
    actualResult: 'Blended word audio plays and displayed; Next button appears',
    audioPlayed: true,
    wordDisplayed: true,
    nextButtonVisible: true,
    syllables: syllables,
    blendedWord: blendResult.word,
    audioFile: blendResult.audio,
    duration: blendResult.duration,
    displayText: `${syllables.join(' + ')} = ${blendResult.word}`
  };
}

// Reset state before each test
function resetBlendState() {
  blendState = {
    selectedSyllables: [],
    blendedWord: null,
    isBlended: false
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-064 (Validate tapping "Blend!" button)', () => {

  beforeEach(() => {
    resetBlendState();
  });

  test('Tap "Blend!" with C-A-T - blended word audio plays and displayed; Next button appears', () => {
    const expectedResult = 'Blended word audio plays and displayed; Next button appears';
    const syllables = ['C', 'A', 'T'];
    const result = blendSyllables('Blend!', syllables);

    console.log('Test Case ID: CASE-064');
    console.log('Test Case Description: Validate tapping "Blend!" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Audio Played: ${result.audioPlayed}`);
    console.log(`Word Displayed: ${result.wordDisplayed}`);
    console.log(`Next Button Visible: ${result.nextButtonVisible}`);
    console.log(`Syllables: ${result.syllables ? result.syllables.join('-') : 'N/A'}`);
    console.log(`Blended Word: ${result.blendedWord}`);
    console.log(`Display Text: ${result.displayText}`);
    console.log(`Audio File: ${result.audioFile}`);
    console.log(`Duration: ${result.duration}ms`);

    if (result.success && result.audioPlayed && result.wordDisplayed && result.nextButtonVisible && result.blendedWord === 'CAT') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.wordDisplayed).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.actualResult).toContain('audio plays');
    expect(result.actualResult).toContain('displayed');
    expect(result.actualResult).toContain('Next button');
    expect(result.syllables).toEqual(['C', 'A', 'T']);
    expect(result.blendedWord).toBe('CAT');
    expect(result.audioFile).toBe('blend_cat.mp3');
    expect(result.duration).toBe(1200);
    expect(result.displayText).toBe('C + A + T = CAT');
  });

  test('Tap "blend!" (lowercase) with D-O-G - blended word plays and displays', () => {
    const expectedResult = 'Blended word audio plays and displayed; Next button appears';
    const syllables = ['D', 'O', 'G'];
    const result = blendSyllables('blend!', syllables);

    console.log('Test Case ID: CASE-064');
    console.log('Test Case Description: Validate tapping "Blend!" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Blended Word: ${result.blendedWord}`);
    console.log(`Next Button: ${result.nextButtonVisible}`);

    if (result.success && result.audioPlayed && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.wordDisplayed).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.blendedWord).toBe('DOG');
    expect(result.syllables).toEqual(['D', 'O', 'G']);
  });

  test('Tap "BLEND!" (uppercase) with B-A-L-L - blended word plays and displays', () => {
    const expectedResult = 'Blended word audio plays and displayed; Next button appears';
    const syllables = ['B', 'A', 'L', 'L'];
    const result = blendSyllables('BLEND!', syllables);

    console.log('Test Case ID: CASE-064');
    console.log('Test Case Description: Validate tapping "Blend!" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Blended Word: ${result.blendedWord}`);

    if (result.success && result.audioPlayed && result.wordDisplayed) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.blendedWord).toBe('BALL');
    expect(result.syllables).toEqual(['B', 'A', 'L', 'L']);
    expect(result.displayText).toBe('B + A + L + L = BALL');
  });

  test('Tap "Blend" (no exclamation) with F-I-SH - blended word plays', () => {
    const expectedResult = 'Blended word audio plays and displayed; Next button appears';
    const syllables = ['F', 'I', 'SH'];
    const result = blendSyllables('Blend', syllables);

    console.log('Test Case ID: CASE-064');
    console.log('Test Case Description: Validate tapping "Blend!" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Input: Blend (no exclamation)`);
    console.log(`Blended Word: ${result.blendedWord}`);

    if (result.success && result.audioPlayed && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.audioPlayed).toBe(true);
    expect(result.blendedWord).toBe('FISH');
    expect(result.syllables).toEqual(['F', 'I', 'SH']);
  });

  test('Tap different button - blend fails (negative test)', () => {
    const syllables = ['C', 'A', 'T'];
    const result = blendSyllables('Submit', syllables);

    console.log('Test Case ID: CASE-064');
    console.log('Test Case Description: Validate tapping "Blend!" button');
    console.log('Expected Result: Blended word audio plays and displayed; Next button appears (for Blend! button)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.audioPlayed && !result.wordDisplayed && !result.nextButtonVisible) {
      console.log('Outcome: PASSED - Correctly rejected invalid button');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.audioPlayed).toBe(false);
    expect(result.wordDisplayed).toBe(false);
    expect(result.nextButtonVisible).toBe(false);
    expect(result.actualResult).toContain('Invalid button');
  });

  test('No syllables selected - blend fails (negative test)', () => {
    const result = blendSyllables('Blend!', []);

    console.log('Test Case ID: CASE-064');
    console.log('Test Case Description: Validate tapping "Blend!" button');
    console.log('Expected Result: Blended word audio plays (when syllables selected)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.audioPlayed) {
      console.log('Outcome: PASSED - Correctly rejected empty syllables');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.audioPlayed).toBe(false);
    expect(result.errorMessage).toContain('select syllables');
  });

  test('Invalid syllable combination - blend fails (negative test)', () => {
    const syllables = ['X', 'Y', 'Z'];
    const result = blendSyllables('Blend!', syllables);

    console.log('Test Case ID: CASE-064');
    console.log('Test Case Description: Validate tapping "Blend!" button');
    console.log('Expected Result: Blended word audio plays (when valid syllables)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Syllables: X-Y-Z (invalid)`);

    if (!result.success && !result.audioPlayed) {
      console.log('Outcome: PASSED - Correctly rejected invalid combination');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.audioPlayed).toBe(false);
    expect(result.errorMessage).toContain('do not form a word');
  });

});
