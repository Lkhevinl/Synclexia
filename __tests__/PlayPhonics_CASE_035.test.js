// ─── Test Case CASE-035 ──────────────────────────────────────────────────────
// Test Case ID: CASE-035
// Test Case Description: Validate tapping phonics item
// Expected Result: Correct sound plays

// Mock phonics data with audio
const phonicsData = {
  'A': { letter: 'A', sound: '/æ/', audioFile: 'a_sound.mp3', examples: ['Apple', 'Ant'] },
  'B': { letter: 'B', sound: '/b/', audioFile: 'b_sound.mp3', examples: ['Ball', 'Bat'] },
  'C': { letter: 'C', sound: '/k/', audioFile: 'c_sound.mp3', examples: ['Cat', 'Car'] },
  'D': { letter: 'D', sound: '/d/', audioFile: 'd_sound.mp3', examples: ['Dog', 'Duck'] },
  'E': { letter: 'E', sound: '/ɛ/', audioFile: 'e_sound.mp3', examples: ['Elephant', 'Egg'] }
};

// Mock audio player state
let audioState = {
  isPlaying: false,
  currentSound: null,
  currentLetter: null
};

function playPhonicsSound(letter) {
  // Check if letter is provided
  if (!letter || letter.trim() === '') {
    return {
      playing: false,
      actualResult: 'Sound not played - No phonics item selected',
      error: 'Please select a phonics letter'
    };
  }

  // Check if letter exists in phonics data
  const upperLetter = letter.toUpperCase();
  const phonicsItem = phonicsData[upperLetter];

  if (!phonicsItem) {
    return {
      playing: false,
      actualResult: 'Sound not played - Invalid phonics item',
      error: `Phonics item "${letter}" not found`
    };
  }

  // Play the sound
  audioState = {
    isPlaying: true,
    currentSound: phonicsItem.sound,
    currentLetter: phonicsItem.letter,
    audioFile: phonicsItem.audioFile
  };

  return {
    playing: true,
    actualResult: 'Correct sound plays',
    letter: phonicsItem.letter,
    sound: phonicsItem.sound,
    audioFile: phonicsItem.audioFile
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-035 (Validate tapping phonics item)', () => {

  beforeEach(() => {
    // Reset audio state before each test
    audioState = {
      isPlaying: false,
      currentSound: null,
      currentLetter: null
    };
  });

  test('Tap letter A - correct sound plays', () => {
    const expectedResult = 'Correct sound plays';
    const result = playPhonicsSound('A');

    console.log('Test Case ID: CASE-035');
    console.log('Test Case Description: Validate tapping phonics item');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Letter: ${result.letter}`);
    console.log(`Sound: ${result.sound}`);
    console.log(`Audio File: ${result.audioFile}`);
    console.log(`Audio Playing: ${audioState.isPlaying}`);

    if (result.playing && result.letter === 'A' && result.sound === '/æ/') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.actualResult).toContain('Correct sound plays');
    expect(result.letter).toBe('A');
    expect(result.sound).toBe('/æ/');
    expect(result.audioFile).toBe('a_sound.mp3');
    expect(audioState.isPlaying).toBe(true);
  });

  test('Tap letter B - correct sound plays', () => {
    const expectedResult = 'Correct sound plays';
    const result = playPhonicsSound('B');

    console.log('Test Case ID: CASE-035');
    console.log('Test Case Description: Validate tapping phonics item');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Letter: ${result.letter}`);
    console.log(`Sound: ${result.sound}`);

    if (result.playing && result.letter === 'B' && result.sound === '/b/') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.letter).toBe('B');
    expect(result.sound).toBe('/b/');
    expect(result.audioFile).toBe('b_sound.mp3');
  });

  test('Tap letter C - correct sound plays', () => {
    const expectedResult = 'Correct sound plays';
    const result = playPhonicsSound('C');

    console.log('Test Case ID: CASE-035');
    console.log('Test Case Description: Validate tapping phonics item');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.playing && result.letter === 'C') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.letter).toBe('C');
    expect(result.sound).toBe('/k/');
  });

  test('Tap lowercase letter - correct sound plays', () => {
    const expectedResult = 'Correct sound plays';
    const result = playPhonicsSound('d');

    console.log('Test Case ID: CASE-035');
    console.log('Test Case Description: Validate tapping phonics item');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Letter: ${result.letter}`);
    console.log(`Sound: ${result.sound}`);

    if (result.playing && result.letter === 'D' && result.sound === '/d/') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.letter).toBe('D');
    expect(result.sound).toBe('/d/');
  });

  test('Tap letter E - correct sound plays', () => {
    const expectedResult = 'Correct sound plays';
    const result = playPhonicsSound('E');

    console.log('Test Case ID: CASE-035');
    console.log('Test Case Description: Validate tapping phonics item');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Sound: ${result.sound}`);

    if (result.playing && result.sound === '/ɛ/') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(true);
    expect(result.letter).toBe('E');
    expect(result.sound).toBe('/ɛ/');
  });

  test('No letter selected - sound not played (negative test)', () => {
    const result = playPhonicsSound('');

    console.log('Test Case ID: CASE-035');
    console.log('Test Case Description: Validate tapping phonics item');
    console.log('Expected Result: Correct sound plays (when letter tapped)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.error}`);

    if (!result.playing && result.error) {
      console.log('Outcome: PASSED - Correctly rejected empty selection');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('Invalid letter selected - sound not played (negative test)', () => {
    const result = playPhonicsSound('Z');

    console.log('Test Case ID: CASE-035');
    console.log('Test Case Description: Validate tapping phonics item');
    console.log('Expected Result: Correct sound plays (when valid letter tapped)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.error}`);

    if (!result.playing && result.error) {
      console.log('Outcome: PASSED - Correctly rejected invalid letter');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(false);
    expect(result.error).toContain('not found');
  });

  test('Null letter selected - sound not played (negative test)', () => {
    const result = playPhonicsSound(null);

    console.log('Test Case ID: CASE-035');
    console.log('Test Case Description: Validate tapping phonics item');
    console.log('Expected Result: Correct sound plays (when letter tapped)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.playing) {
      console.log('Outcome: PASSED - Correctly rejected null selection');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.playing).toBe(false);
    expect(result.error).toBeTruthy();
  });

});
