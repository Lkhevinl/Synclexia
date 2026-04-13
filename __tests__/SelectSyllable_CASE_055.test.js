// ─── Test Case CASE-055 ──────────────────────────────────────────────────────
// Test Case ID: CASE-055
// Test Case Description: Validate selecting the correct number of syllables (1–4)
// Expected Result: Selection recorded; proceed to the next item

// Mock syllable game state
let currentItemIndex = 0;
let userSelections = [];

const syllableItems = [
  { id: 1, word: 'CAT', syllables: 1, hint: 'One syllable: cat' },
  { id: 2, word: 'TABLE', syllables: 2, hint: 'Two syllables: ta-ble' },
  { id: 3, word: 'BANANA', syllables: 3, hint: 'Three syllables: ba-na-na' },
  { id: 4, word: 'ALLIGATOR', syllables: 4, hint: 'Four syllables: al-li-ga-tor' }
];

function selectSyllableCount(selectedSyllables) {
  // Check if syllable count is provided
  if (selectedSyllables === undefined || selectedSyllables === null) {
    return {
      success: false,
      actualResult: 'Selection failed - No syllable count selected',
      selectionRecorded: false,
      canProceed: false,
      errorMessage: 'Please select a number of syllables (1-4)'
    };
  }

  // Check if syllable count is within valid range (1-4)
  if (selectedSyllables < 1 || selectedSyllables > 4) {
    return {
      success: false,
      actualResult: 'Selection failed - Invalid syllable count',
      selectionRecorded: false,
      canProceed: false,
      errorMessage: 'Syllable count must be between 1 and 4'
    };
  }

  // Check if syllable count is a number
  if (typeof selectedSyllables !== 'number' || !Number.isInteger(selectedSyllables)) {
    return {
      success: false,
      actualResult: 'Selection failed - Invalid input type',
      selectionRecorded: false,
      canProceed: false,
      errorMessage: 'Please select a valid number'
    };
  }

  // Get current item
  const currentItem = syllableItems[currentItemIndex];

  // Record the selection
  const selection = {
    itemId: currentItem.id,
    word: currentItem.word,
    selectedSyllables: selectedSyllables,
    correctSyllables: currentItem.syllables,
    isCorrect: selectedSyllables === currentItem.syllables,
    timestamp: Date.now()
  };

  userSelections.push(selection);

  // Check if there are more items
  const isLastItem = currentItemIndex >= syllableItems.length - 1;

  // Move to next item if not last
  if (!isLastItem) {
    currentItemIndex++;
  }

  return {
    success: true,
    actualResult: 'Selection recorded; proceed to the next item',
    selectionRecorded: true,
    canProceed: true,
    selectedSyllables: selectedSyllables,
    correctAnswer: currentItem.syllables,
    isCorrect: selectedSyllables === currentItem.syllables,
    currentWord: currentItem.word,
    nextItemIndex: currentItemIndex,
    isLastItem: isLastItem,
    totalItems: syllableItems.length,
    hint: currentItem.hint
  };
}

// Reset state before each test
function resetSyllableState() {
  currentItemIndex = 0;
  userSelections = [];
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-055 (Validate selecting the correct number of syllables 1-4)', () => {

  beforeEach(() => {
    resetSyllableState();
  });

  test('Select 1 syllable for CAT - selection recorded; proceed to next item', () => {
    const expectedResult = 'Selection recorded; proceed to the next item';
    const result = selectSyllableCount(1);

    console.log('Test Case ID: CASE-055');
    console.log('Test Case Description: Validate selecting the correct number of syllables (1-4)');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selection Recorded: ${result.selectionRecorded}`);
    console.log(`Can Proceed: ${result.canProceed}`);
    console.log(`Selected Syllables: ${result.selectedSyllables}`);
    console.log(`Current Word: ${result.currentWord}`);
    console.log(`Correct Answer: ${result.correctAnswer}`);
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
    expect(result.selectedSyllables).toBe(1);
    expect(result.currentWord).toBe('CAT');
    expect(result.correctAnswer).toBe(1);
    expect(result.isCorrect).toBe(true);
    expect(result.nextItemIndex).toBe(1);
    expect(userSelections).toHaveLength(1);
  });

  test('Select 2 syllables for TABLE - selection recorded; proceed to next item', () => {
    // Move to second item first
    selectSyllableCount(1);
    
    const expectedResult = 'Selection recorded; proceed to the next item';
    const result = selectSyllableCount(2);

    console.log('Test Case ID: CASE-055');
    console.log('Test Case Description: Validate selecting the correct number of syllables (1-4)');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selected: ${result.selectedSyllables}, Correct: ${result.correctAnswer}`);
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
    expect(result.selectedSyllables).toBe(2);
    expect(result.currentWord).toBe('TABLE');
    expect(result.correctAnswer).toBe(2);
    expect(result.isCorrect).toBe(true);
    expect(result.nextItemIndex).toBe(2);
  });

  test('Select 3 syllables for BANANA - selection recorded; proceed to next item', () => {
    // Move to third item
    selectSyllableCount(1);
    selectSyllableCount(2);
    
    const expectedResult = 'Selection recorded; proceed to the next item';
    const result = selectSyllableCount(3);

    console.log('Test Case ID: CASE-055');
    console.log('Test Case Description: Validate selecting the correct number of syllables (1-4)');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Selected: ${result.selectedSyllables}, Word: ${result.currentWord}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.selectionRecorded && result.isCorrect) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.selectedSyllables).toBe(3);
    expect(result.currentWord).toBe('BANANA');
    expect(result.correctAnswer).toBe(3);
    expect(result.isCorrect).toBe(true);
    expect(result.nextItemIndex).toBe(3);
  });

  test('Select 4 syllables for ALLIGATOR - selection recorded; last item', () => {
    // Move to fourth (last) item
    selectSyllableCount(1);
    selectSyllableCount(2);
    selectSyllableCount(3);
    
    const expectedResult = 'Selection recorded; proceed to the next item';
    const result = selectSyllableCount(4);

    console.log('Test Case ID: CASE-055');
    console.log('Test Case Description: Validate selecting the correct number of syllables (1-4)');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Selected: ${result.selectedSyllables}, Word: ${result.currentWord}`);
    console.log(`Is Last Item: ${result.isLastItem}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.selectionRecorded && result.isCorrect && result.isLastItem) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.selectedSyllables).toBe(4);
    expect(result.currentWord).toBe('ALLIGATOR');
    expect(result.correctAnswer).toBe(4);
    expect(result.isCorrect).toBe(true);
    expect(result.isLastItem).toBe(true);
  });

  test('Select wrong syllable count - still recorded; can proceed (negative test)', () => {
    const expectedResult = 'Selection recorded; proceed to the next item';
    const result = selectSyllableCount(2); // Wrong - CAT has 1 syllable

    console.log('Test Case ID: CASE-055');
    console.log('Test Case Description: Validate selecting the correct number of syllables (1-4)');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selected: ${result.selectedSyllables}, Correct: ${result.correctAnswer}`);
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
    expect(result.selectedSyllables).toBe(2);
    expect(result.correctAnswer).toBe(1);
    expect(result.isCorrect).toBe(false);
  });

  test('Select 0 syllables - invalid; not recorded (negative test)', () => {
    const result = selectSyllableCount(0);

    console.log('Test Case ID: CASE-055');
    console.log('Test Case Description: Validate selecting the correct number of syllables (1-4)');
    console.log('Expected Result: Selection recorded; proceed to the next item (for valid selection)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.selectionRecorded && !result.canProceed) {
      console.log('Outcome: PASSED - Correctly rejected 0 syllables');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.selectionRecorded).toBe(false);
    expect(result.canProceed).toBe(false);
    expect(result.errorMessage).toContain('between 1 and 4');
    expect(userSelections).toHaveLength(0);
  });

  test('Select 5 syllables - invalid; not recorded (negative test)', () => {
    const result = selectSyllableCount(5);

    console.log('Test Case ID: CASE-055');
    console.log('Test Case Description: Validate selecting the correct number of syllables (1-4)');
    console.log('Expected Result: Selection recorded; proceed to the next item (for valid selection)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selected: 5 (out of range)`);

    if (!result.success && !result.selectionRecorded) {
      console.log('Outcome: PASSED - Correctly rejected 5 syllables');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.selectionRecorded).toBe(false);
    expect(result.canProceed).toBe(false);
    expect(result.errorMessage).toContain('between 1 and 4');
  });

  test('No selection made - invalid; not recorded (negative test)', () => {
    const result = selectSyllableCount(undefined);

    console.log('Test Case ID: CASE-055');
    console.log('Test Case Description: Validate selecting the correct number of syllables (1-4)');
    console.log('Expected Result: Selection recorded; proceed to the next item (when selection is made)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.selectionRecorded) {
      console.log('Outcome: PASSED - Correctly rejected undefined selection');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.selectionRecorded).toBe(false);
    expect(result.canProceed).toBe(false);
    expect(result.errorMessage).toContain('select a number');
  });

  test('Non-integer selection - invalid; not recorded (negative test)', () => {
    const result = selectSyllableCount(2.5);

    console.log('Test Case ID: CASE-055');
    console.log('Test Case Description: Validate selecting the correct number of syllables (1-4)');
    console.log('Expected Result: Selection recorded; proceed to the next item (for valid selection)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selected: 2.5 (not an integer)`);

    if (!result.success && !result.selectionRecorded) {
      console.log('Outcome: PASSED - Correctly rejected non-integer');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.selectionRecorded).toBe(false);
    expect(result.canProceed).toBe(false);
    expect(result.errorMessage).toContain('valid number');
  });

});
