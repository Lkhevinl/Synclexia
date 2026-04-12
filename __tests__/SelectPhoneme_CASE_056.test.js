// ─── Test Case CASE-056 ──────────────────────────────────────────────────────
// Test Case ID: CASE-056
// Test Case Description: Validate selecting first/last sound
// Expected Result: Selection recorded; proceed to the next item

// Mock phoneme game state
let currentItemIndex = 0;
let userSelections = [];

const phonemeItems = [
  { id: 1, word: 'CAT', firstSound: 'C', lastSound: 'T', hint: 'Starts with C, ends with T' },
  { id: 2, word: 'DOG', firstSound: 'D', lastSound: 'G', hint: 'Starts with D, ends with G' },
  { id: 3, word: 'FISH', firstSound: 'F', lastSound: 'SH', hint: 'Starts with F, ends with SH' },
  { id: 4, word: 'BOOK', firstSound: 'B', lastSound: 'K', hint: 'Starts with B, ends with K' }
];

function selectPhoneme(soundType, selectedSound) {
  // Check if sound type is provided
  if (!soundType || soundType.trim() === '') {
    return {
      success: false,
      actualResult: 'Selection failed - No sound type specified',
      selectionRecorded: false,
      canProceed: false,
      errorMessage: 'Please select "first" or "last" sound'
    };
  }

  // Check if sound type is valid
  const normalizedType = soundType.toLowerCase().trim();
  if (normalizedType !== 'first' && normalizedType !== 'last') {
    return {
      success: false,
      actualResult: 'Selection failed - Invalid sound type',
      selectionRecorded: false,
      canProceed: false,
      errorMessage: 'Sound type must be "first" or "last"'
    };
  }

  // Check if selected sound is provided
  if (!selectedSound || selectedSound.trim() === '') {
    return {
      success: false,
      actualResult: 'Selection failed - No sound selected',
      selectionRecorded: false,
      canProceed: false,
      errorMessage: 'Please select a sound'
    };
  }

  // Get current item
  const currentItem = phonemeItems[currentItemIndex];

  // Determine correct answer based on sound type
  const correctSound = normalizedType === 'first' ? currentItem.firstSound : currentItem.lastSound;

  // Record the selection
  const selection = {
    itemId: currentItem.id,
    word: currentItem.word,
    soundType: normalizedType,
    selectedSound: selectedSound.toUpperCase(),
    correctSound: correctSound,
    isCorrect: selectedSound.toUpperCase() === correctSound,
    timestamp: Date.now()
  };

  userSelections.push(selection);

  // Check if there are more items
  const isLastItem = currentItemIndex >= phonemeItems.length - 1;

  // Move to next item if not last
  if (!isLastItem) {
    currentItemIndex++;
  }

  return {
    success: true,
    actualResult: 'Selection recorded; proceed to the next item',
    selectionRecorded: true,
    canProceed: true,
    soundType: normalizedType,
    selectedSound: selectedSound.toUpperCase(),
    correctSound: correctSound,
    isCorrect: selectedSound.toUpperCase() === correctSound,
    currentWord: currentItem.word,
    nextItemIndex: currentItemIndex,
    isLastItem: isLastItem,
    totalItems: phonemeItems.length,
    hint: currentItem.hint
  };
}

// Reset state before each test
function resetPhonemeState() {
  currentItemIndex = 0;
  userSelections = [];
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-056 (Validate selecting first/last sound)', () => {

  beforeEach(() => {
    resetPhonemeState();
  });

  test('Select first sound C for CAT - selection recorded; proceed to next item', () => {
    const expectedResult = 'Selection recorded; proceed to the next item';
    const result = selectPhoneme('first', 'C');

    console.log('Test Case ID: CASE-056');
    console.log('Test Case Description: Validate selecting first/last sound');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selection Recorded: ${result.selectionRecorded}`);
    console.log(`Can Proceed: ${result.canProceed}`);
    console.log(`Sound Type: ${result.soundType}`);
    console.log(`Selected Sound: ${result.selectedSound}`);
    console.log(`Current Word: ${result.currentWord}`);
    console.log(`Correct Sound: ${result.correctSound}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Next Item Index: ${result.nextItemIndex}`);
    console.log(`Total Items: ${result.totalItems}`);
    console.log(`Hint: ${result.hint}`);

    if (result.success && result.selectionRecorded && result.canProceed && result.isCorrect) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.canProceed).toBe(true);
    expect(result.actualResult).toContain('Selection recorded');
    expect(result.actualResult).toContain('proceed to the next item');
    expect(result.soundType).toBe('first');
    expect(result.selectedSound).toBe('C');
    expect(result.currentWord).toBe('CAT');
    expect(result.correctSound).toBe('C');
    expect(result.isCorrect).toBe(true);
    expect(result.nextItemIndex).toBe(1);
    expect(userSelections).toHaveLength(1);
  });

  test('Select last sound T for CAT - selection recorded; proceed to next item', () => {
    const expectedResult = 'Selection recorded; proceed to the next item';
    const result = selectPhoneme('last', 'T');

    console.log('Test Case ID: CASE-056');
    console.log('Test Case Description: Validate selecting first/last sound');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Sound Type: ${result.soundType}`);
    console.log(`Selected Sound: ${result.selectedSound}`);
    console.log(`Current Word: ${result.currentWord}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.selectionRecorded && result.isCorrect) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.canProceed).toBe(true);
    expect(result.soundType).toBe('last');
    expect(result.selectedSound).toBe('T');
    expect(result.currentWord).toBe('CAT');
    expect(result.correctSound).toBe('T');
    expect(result.isCorrect).toBe(true);
  });

  test('Select first sound D for DOG - selection recorded; proceed to next item', () => {
    // Move to second item
    selectPhoneme('first', 'C');
    
    const expectedResult = 'Selection recorded; proceed to the next item';
    const result = selectPhoneme('first', 'D');

    console.log('Test Case ID: CASE-056');
    console.log('Test Case Description: Validate selecting first/last sound');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Word: ${result.currentWord}, Selected: ${result.selectedSound}, Correct: ${result.correctSound}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.selectionRecorded && result.isCorrect) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.soundType).toBe('first');
    expect(result.selectedSound).toBe('D');
    expect(result.currentWord).toBe('DOG');
    expect(result.correctSound).toBe('D');
    expect(result.isCorrect).toBe(true);
    expect(result.nextItemIndex).toBe(2);
  });

  test('Select last sound SH for FISH - selection recorded; proceed to next item', () => {
    // Move to third item
    selectPhoneme('first', 'C');
    selectPhoneme('first', 'D');
    
    const expectedResult = 'Selection recorded; proceed to the next item';
    const result = selectPhoneme('last', 'SH');

    console.log('Test Case ID: CASE-056');
    console.log('Test Case Description: Validate selecting first/last sound');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Word: ${result.currentWord}, Selected: ${result.selectedSound}, Correct: ${result.correctSound}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.selectionRecorded && result.isCorrect) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.soundType).toBe('last');
    expect(result.selectedSound).toBe('SH');
    expect(result.currentWord).toBe('FISH');
    expect(result.correctSound).toBe('SH');
    expect(result.isCorrect).toBe(true);
  });

  test('Select first sound for BOOK - last item', () => {
    // Move to fourth (last) item
    selectPhoneme('first', 'C');
    selectPhoneme('first', 'D');
    selectPhoneme('last', 'SH');
    
    const expectedResult = 'Selection recorded; proceed to the next item';
    const result = selectPhoneme('first', 'B');

    console.log('Test Case ID: CASE-056');
    console.log('Test Case Description: Validate selecting first/last sound');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Word: ${result.currentWord}, Selected: ${result.selectedSound}`);
    console.log(`Is Last Item: ${result.isLastItem}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.selectionRecorded && result.isCorrect && result.isLastItem) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.selectedSound).toBe('B');
    expect(result.currentWord).toBe('BOOK');
    expect(result.correctSound).toBe('B');
    expect(result.isCorrect).toBe(true);
    expect(result.isLastItem).toBe(true);
  });

  test('Select wrong phoneme - still recorded; can proceed (negative test)', () => {
    const expectedResult = 'Selection recorded; proceed to the next item';
    const result = selectPhoneme('first', 'D'); // Wrong - CAT starts with C

    console.log('Test Case ID: CASE-056');
    console.log('Test Case Description: Validate selecting first/last sound');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Word: ${result.currentWord}`);
    console.log(`Selected: ${result.selectedSound}, Correct: ${result.correctSound}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Can Proceed: ${result.canProceed}`);

    if (result.success && result.selectionRecorded && !result.isCorrect && result.canProceed) {
      console.log('Outcome: PASSED - Wrong answer recorded but can still proceed');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.canProceed).toBe(true);
    expect(result.selectedSound).toBe('D');
    expect(result.correctSound).toBe('C');
    expect(result.isCorrect).toBe(false);
  });

  test('Invalid sound type - not recorded (negative test)', () => {
    const result = selectPhoneme('middle', 'A');

    console.log('Test Case ID: CASE-056');
    console.log('Test Case Description: Validate selecting first/last sound');
    console.log('Expected Result: Selection recorded; proceed to the next item (for valid type)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.selectionRecorded && !result.canProceed) {
      console.log('Outcome: PASSED - Correctly rejected invalid sound type');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.selectionRecorded).toBe(false);
    expect(result.canProceed).toBe(false);
    expect(result.errorMessage).toContain('first" or "last"');
    expect(userSelections).toHaveLength(0);
  });

  test('No sound type - not recorded (negative test)', () => {
    const result = selectPhoneme('', 'C');

    console.log('Test Case ID: CASE-056');
    console.log('Test Case Description: Validate selecting first/last sound');
    console.log('Expected Result: Selection recorded; proceed to the next item (when type provided)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.selectionRecorded) {
      console.log('Outcome: PASSED - Correctly rejected empty sound type');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.selectionRecorded).toBe(false);
    expect(result.canProceed).toBe(false);
    expect(result.errorMessage).toContain('first" or "last"');
  });

  test('No sound selected - not recorded (negative test)', () => {
    const result = selectPhoneme('first', '');

    console.log('Test Case ID: CASE-056');
    console.log('Test Case Description: Validate selecting first/last sound');
    console.log('Expected Result: Selection recorded; proceed to the next item (when sound selected)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.selectionRecorded) {
      console.log('Outcome: PASSED - Correctly rejected empty sound');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.selectionRecorded).toBe(false);
    expect(result.canProceed).toBe(false);
    expect(result.errorMessage).toContain('select a sound');
  });

  test('Case insensitive selection - recorded correctly', () => {
    const expectedResult = 'Selection recorded; proceed to the next item';
    const result = selectPhoneme('first', 'c'); // lowercase c for CAT

    console.log('Test Case ID: CASE-056');
    console.log('Test Case Description: Validate selecting first/last sound');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Selected: 'c' (lowercase)`);
    console.log(`Stored as: ${result.selectedSound}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.selectionRecorded && result.isCorrect) {
      console.log('Outcome: PASSED - Case insensitive matching works');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.selectedSound).toBe('C');
    expect(result.isCorrect).toBe(true);
  });

});
