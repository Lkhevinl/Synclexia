// ─── Test Case CASE-040 ──────────────────────────────────────────────────────
// Test Case ID: CASE-040
// Test Case Description: Validate by tapping "Clear" button
// Expected Result: Traced letters are cleared

// Mock traced letters state
let tracedLettersState = [
  { letter: 'A', path: [{ x: 100, y: 100 }, { x: 105, y: 95 }], completed: true },
  { letter: 'B', path: [{ x: 200, y: 150 }, { x: 205, y: 145 }], completed: true },
  { letter: 'C', path: [{ x: 300, y: 200 }, { x: 305, y: 195 }], completed: true }
];

function clearTracedLetters(buttonName) {
  // Check if button name is provided
  if (!buttonName || buttonName.trim() === '') {
    return {
      success: false,
      actualResult: 'Traced letters not cleared - No button specified',
      lettersCleared: false,
      remainingLetters: tracedLettersState.length
    };
  }

  // Check if it's the clear button
  if (buttonName.toLowerCase() !== 'clear') {
    return {
      success: false,
      actualResult: 'Traced letters not cleared - Invalid button',
      lettersCleared: false,
      remainingLetters: tracedLettersState.length
    };
  }

  // Store previous count for logging
  const previousCount = tracedLettersState.length;

  // Clear all traced letters
  tracedLettersState = [];

  return {
    success: true,
    actualResult: 'Traced letters are cleared',
    lettersCleared: true,
    clearedCount: previousCount,
    remainingLetters: 0
  };
}

// Reset state before each test
function resetTracedLetters() {
  tracedLettersState = [
    { letter: 'A', path: [{ x: 100, y: 100 }, { x: 105, y: 95 }], completed: true },
    { letter: 'B', path: [{ x: 200, y: 150 }, { x: 205, y: 145 }], completed: true },
    { letter: 'C', path: [{ x: 300, y: 200 }, { x: 305, y: 195 }], completed: true }
  ];
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-040 (Validate by tapping "Clear" button)', () => {

  beforeEach(() => {
    resetTracedLetters();
  });

  test('Tap Clear button - traced letters are cleared', () => {
    const expectedResult = 'Traced letters are cleared';
    const result = clearTracedLetters('Clear');

    console.log('Test Case ID: CASE-040');
    console.log('Test Case Description: Validate by tapping "Clear" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Letters Cleared: ${result.lettersCleared}`);
    console.log(`Cleared Count: ${result.clearedCount}`);
    console.log(`Remaining Letters: ${result.remainingLetters}`);

    if (result.success && result.lettersCleared && result.remainingLetters === 0) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.lettersCleared).toBe(true);
    expect(result.actualResult).toContain('cleared');
    expect(result.clearedCount).toBe(3);
    expect(result.remainingLetters).toBe(0);
  });

  test('Tap clear (lowercase) - traced letters are cleared', () => {
    const expectedResult = 'Traced letters are cleared';
    const result = clearTracedLetters('clear');

    console.log('Test Case ID: CASE-040');
    console.log('Test Case Description: Validate by tapping "Clear" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Letters Cleared: ${result.lettersCleared}`);

    if (result.success && result.lettersCleared) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.lettersCleared).toBe(true);
    expect(result.remainingLetters).toBe(0);
  });

  test('Tap CLEAR (uppercase) - traced letters are cleared', () => {
    const expectedResult = 'Traced letters are cleared';
    const result = clearTracedLetters('CLEAR');

    console.log('Test Case ID: CASE-040');
    console.log('Test Case Description: Validate by tapping "Clear" button');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.lettersCleared) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.lettersCleared).toBe(true);
  });

  test('Tap different button - letters should not be cleared (negative test)', () => {
    const result = clearTracedLetters('Submit');

    console.log('Test Case ID: CASE-040');
    console.log('Test Case Description: Validate by tapping "Clear" button');
    console.log('Expected Result: Traced letters are cleared (for Clear button)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Remaining Letters: ${result.remainingLetters}`);

    if (!result.success && !result.lettersCleared) {
      console.log('Outcome: PASSED - Correctly rejected non-Clear button');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.lettersCleared).toBe(false);
    expect(result.remainingLetters).toBe(3);
    expect(result.actualResult).toContain('not cleared');
  });

  test('Empty button name - letters should not be cleared (negative test)', () => {
    const result = clearTracedLetters('');

    console.log('Test Case ID: CASE-040');
    console.log('Test Case Description: Validate by tapping "Clear" button');
    console.log('Expected Result: Traced letters are cleared (for Clear button)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.lettersCleared) {
      console.log('Outcome: PASSED - Correctly rejected empty button name');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.lettersCleared).toBe(false);
    expect(result.actualResult).toContain('No button specified');
  });

  test('Clear single letter - traced letter is cleared', () => {
    // Reset to single letter
    tracedLettersState = [
      { letter: 'A', path: [{ x: 100, y: 100 }], completed: true }
    ];

    const result = clearTracedLetters('Clear');

    console.log('Test Case ID: CASE-040');
    console.log('Test Case Description: Validate by tapping "Clear" button');
    console.log('Expected Result: Traced letters are cleared');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Cleared Count: ${result.clearedCount}`);

    if (result.success && result.lettersCleared && result.clearedCount === 1) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.lettersCleared).toBe(true);
    expect(result.clearedCount).toBe(1);
    expect(result.remainingLetters).toBe(0);
  });

});
