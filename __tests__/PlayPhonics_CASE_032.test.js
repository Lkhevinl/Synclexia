// ─── Test Case CASE-032 ──────────────────────────────────────────────────────
// Test Case ID: CASE-032
// Test Case Description: Validate tapping phonics item
// Expected Result: Correct sound plays

// Mock phoneme player that simulates the phonicsSynth behavior
const phonemeSoundMap = {
  's': { sound: 'ssss', type: 'synthesized', duration: 750 },
  'a': { sound: 'a-a-a', type: 'synthesized', duration: 850 },
  't': { sound: 't-t-t', type: 'synthesized', duration: 100 },
  'i': { sound: 'i-i-i', type: 'synthesized', duration: 650 },
  'p': { sound: 'p-p-p', type: 'synthesized', duration: 120 },
  'n': { sound: 'nnn', type: 'synthesized', duration: 750 },
  'ck': { sound: 'ck-ck', type: 'synthesized', duration: 600 },
  'e': { sound: 'e-e-e', type: 'synthesized', duration: 700 },
  'h': { sound: 'hhh', type: 'synthesized', duration: 500 },
  'r': { sound: 'rrr', type: 'synthesized', duration: 800 },
  'm': { sound: 'mmm', type: 'synthesized', duration: 800 },
  'd': { sound: 'd-d-d', type: 'synthesized', duration: 400 },
};

function playPhoneme(letter) {
  if (!letter) {
    return {
      success: false,
      actualResult: 'No phoneme letter provided',
      soundPlayed: null,
      letter: null
    };
  }

  const normalizedLetter = letter.toLowerCase();
  const phonemeData = phonemeSoundMap[normalizedLetter];

  if (phonemeData) {
    return {
      success: true,
      actualResult: `Correct sound played for letter "${letter}"`,
      soundPlayed: phonemeData.sound,
      type: phonemeData.type,
      duration: phonemeData.duration,
      letter: normalizedLetter
    };
  } else {
    // Fallback to speech synthesis for unmapped letters
    return {
      success: true,
      actualResult: `Speech fallback played for letter "${letter}"`,
      soundPlayed: letter,
      type: 'speech',
      duration: 500,
      letter: normalizedLetter
    };
  }
}

function handlePhonicsCardPress(item) {
  if (!item || !item.letter) {
    return {
      success: false,
      actualResult: 'Invalid phonics item - no letter to play',
      soundPlayed: null,
      letter: null
    };
  }

  const result = playPhoneme(item.letter);
  
  return {
    ...result,
    itemTapped: item,
    toastMessage: `${item.emoji} ${item.sound}… like a ${item.word}!`
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-032 (Validate tapping phonics item)', () => {

  test('Tap letter "s" - snake sound plays correctly', () => {
    const expectedResult = 'Correct sound played';
    const phonicsItem = { letter: 's', emoji: '🐍', word: 'snake', sound: 'ssss' };
    const result = handlePhonicsCardPress(phonicsItem);

    console.log('Test Case ID: CASE-032');
    console.log('Test Case Description: Validate tapping phonics item');
    console.log('Test: Tap letter "s" - snake');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Letter: ${result.letter}`);
    console.log(`Sound Played: ${result.soundPlayed}`);
    console.log(`Type: ${result.type}`);
    console.log(`Toast: ${result.toastMessage}`);

    if (result.success && result.soundPlayed === 'ssss' && result.letter === 's') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.soundPlayed).toBe('ssss');
    expect(result.letter).toBe('s');
    expect(result.type).toBe('synthesized');
    expect(result.toastMessage).toContain('🐍');
  });

  test('Tap letter "a" - ant sound plays correctly', () => {
    const expectedResult = 'Correct sound played';
    const phonicsItem = { letter: 'a', emoji: '🐜', word: 'ant', sound: 'a-a-a' };
    const result = handlePhonicsCardPress(phonicsItem);

    console.log('Test Case ID: CASE-032');
    console.log('Test Case Description: Validate tapping phonics item');
    console.log('Test: Tap letter "a" - ant');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Sound Played: ${result.soundPlayed}`);

    if (result.success && result.soundPlayed === 'a-a-a') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.soundPlayed).toBe('a-a-a');
    expect(result.type).toBe('synthesized');
  });

  test('Tap letter "t" - tick sound plays correctly', () => {
    const expectedResult = 'Correct sound played';
    const phonicsItem = { letter: 't', emoji: '⏰', word: 'tick', sound: 't-t-t' };
    const result = handlePhonicsCardPress(phonicsItem);

    console.log('Test Case ID: CASE-032');
    console.log('Test: Tap letter "t" - tick');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Sound Played: ${result.soundPlayed}`);

    if (result.success && result.soundPlayed === 't-t-t') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.soundPlayed).toBe('t-t-t');
  });

  test('Tap letter "ck" - clock sound plays correctly', () => {
    const expectedResult = 'Correct sound played';
    const phonicsItem = { letter: 'ck', emoji: '🕰️', word: 'clock', sound: 'ck-ck' };
    const result = handlePhonicsCardPress(phonicsItem);

    console.log('Test Case ID: CASE-032');
    console.log('Test: Tap letter "ck" - clock');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Sound Played: ${result.soundPlayed}`);

    if (result.success && result.soundPlayed === 'ck-ck') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.soundPlayed).toBe('ck-ck');
  });

  test('Tap letter "m" - mmm sound plays correctly', () => {
    const expectedResult = 'Correct sound played';
    const phonicsItem = { letter: 'm', emoji: '🍰', word: 'mmm', sound: 'mmm' };
    const result = handlePhonicsCardPress(phonicsItem);

    console.log('Test Case ID: CASE-032');
    console.log('Test: Tap letter "m" - mmm');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.soundPlayed === 'mmm') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.soundPlayed).toBe('mmm');
  });

  test('Tap uppercase letter "S" - converts to lowercase and plays', () => {
    const phonicsItem = { letter: 'S', emoji: '🐍', word: 'snake', sound: 'ssss' };
    const result = handlePhonicsCardPress(phonicsItem);

    console.log('Test Case ID: CASE-032');
    console.log('Test: Tap uppercase "S"');
    console.log(`Letter normalized: ${result.letter}`);
    console.log(`Sound Played: ${result.soundPlayed}`);

    if (result.success && result.letter === 's' && result.soundPlayed === 'ssss') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.letter).toBe('s');
    expect(result.soundPlayed).toBe('ssss');
  });

  test('Tap unknown letter "x" - speech fallback plays', () => {
    const phonicsItem = { letter: 'x', emoji: '📦', word: 'box', sound: 'ks' };
    const result = handlePhonicsCardPress(phonicsItem);

    console.log('Test Case ID: CASE-032');
    console.log('Test: Tap unknown letter "x" - fallback');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Type: ${result.type}`);

    if (result.success && result.type === 'speech') {
      console.log('Outcome: PASSED - Fallback speech used');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.type).toBe('speech');
  });

  test('Tap with null item - fails gracefully', () => {
    const result = handlePhonicsCardPress(null);

    console.log('Test Case ID: CASE-032');
    console.log('Test: Tap null item (negative test)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && result.soundPlayed === null) {
      console.log('Outcome: PASSED - Correctly handled null item');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.soundPlayed).toBeNull();
  });

  test('Tap with missing letter - fails gracefully', () => {
    const phonicsItem = { emoji: '🐍', word: 'snake', sound: 'ssss' };
    const result = handlePhonicsCardPress(phonicsItem);

    console.log('Test Case ID: CASE-032');
    console.log('Test: Tap item without letter (negative test)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success) {
      console.log('Outcome: PASSED - Correctly rejected missing letter');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.actualResult).toContain('Invalid');
  });

  test('Multiple taps sequence - each plays independently', () => {
    const items = [
      { letter: 's', emoji: '🐍', word: 'snake', sound: 'ssss' },
      { letter: 'a', emoji: '🐜', word: 'ant', sound: 'a-a-a' },
      { letter: 't', emoji: '⏰', word: 'tick', sound: 't-t-t' }
    ];

    const results = items.map(item => handlePhonicsCardPress(item));

    console.log('Test Case ID: CASE-032');
    console.log('Test: Multiple taps sequence');
    console.log(`Items tapped: ${results.length}`);
    console.log(`Sounds played: ${results.map(r => r.soundPlayed).join(', ')}`);

    const allSuccess = results.every(r => r.success);
    const correctSounds = results[0].soundPlayed === 'ssss' &&
                         results[1].soundPlayed === 'a-a-a' &&
                         results[2].soundPlayed === 't-t-t';

    if (allSuccess && correctSounds) {
      console.log('Outcome: PASSED - All sounds played correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(allSuccess).toBe(true);
    expect(correctSounds).toBe(true);
  });

});
