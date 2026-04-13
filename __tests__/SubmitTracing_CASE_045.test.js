// ─── Test Case CASE-045 ──────────────────────────────────────────────────────
// Test Case ID: CASE-045
// Test Case Description: Validate by tapping "Next" button after correct tracing
// Expected Result: Next letter loads successfully

// Mock letter sequence data
const letterSequence = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
let currentLetterIndex = 0;

function loadNextLetter(buttonName, isCorrectTracingCompleted) {
  // Check if button name is provided
  if (!buttonName || buttonName.trim() === '') {
    return {
      success: false,
      actualResult: 'Next letter failed to load - No button specified',
      nextLetterLoaded: false,
      currentLetter: letterSequence[currentLetterIndex],
      errorMessage: 'Invalid action'
    };
  }

  // Check if it's the next button
  if (buttonName.toLowerCase() !== 'next') {
    return {
      success: false,
      actualResult: 'Next letter failed to load - Invalid button',
      nextLetterLoaded: false,
      currentLetter: letterSequence[currentLetterIndex],
      errorMessage: 'Invalid button clicked'
    };
  }

  // Check if previous tracing was completed correctly
  if (!isCorrectTracingCompleted) {
    return {
      success: false,
      actualResult: 'Next letter failed to load - Previous tracing not completed',
      nextLetterLoaded: false,
      currentLetter: letterSequence[currentLetterIndex],
      errorMessage: 'Please complete the current letter tracing first'
    };
  }

  // Check if there are more letters
  if (currentLetterIndex >= letterSequence.length - 1) {
    return {
      success: true,
      actualResult: 'All letters completed - No more letters to load',
      nextLetterLoaded: false,
      currentLetter: letterSequence[currentLetterIndex],
      allLettersCompleted: true,
      isLastLetter: true
    };
  }

  // Load next letter
  currentLetterIndex++;
  const nextLetter = letterSequence[currentLetterIndex];

  return {
    success: true,
    actualResult: 'Next letter loads successfully',
    nextLetterLoaded: true,
    currentLetter: nextLetter,
    previousLetter: letterSequence[currentLetterIndex - 1],
    letterIndex: currentLetterIndex,
    totalLetters: letterSequence.length,
    allLettersCompleted: false,
    isLastLetter: currentLetterIndex === letterSequence.length - 1
  };
}

// Reset state before each test
function resetLetterState() {
  currentLetterIndex = 0;
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-045 (Validate by tapping "Next" button after correct tracing)', () => {

  beforeEach(() => {
    resetLetterState();
  });

  test('Tap Next after correct tracing A - next letter B loads successfully', () => {
    const expectedResult = 'Next letter loads successfully';
    const result = loadNextLetter('Next', true);

    console.log('Test Case ID: CASE-045');
    console.log('Test Case Description: Validate by tapping "Next" button after correct tracing');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Next Letter Loaded: ${result.nextLetterLoaded}`);
    console.log(`Current Letter: ${result.currentLetter}`);
    console.log(`Previous Letter: ${result.previousLetter}`);
    console.log(`Letter Index: ${result.letterIndex}`);
    console.log(`Total Letters: ${result.totalLetters}`);

    if (result.success && result.nextLetterLoaded && result.currentLetter === 'B') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.nextLetterLoaded).toBe(true);
    expect(result.actualResult).toContain('loads successfully');
    expect(result.currentLetter).toBe('B');
    expect(result.previousLetter).toBe('A');
    expect(result.letterIndex).toBe(1);
  });

  test('Tap Next after correct tracing B - next letter C loads successfully', () => {
    // First move to B
    loadNextLetter('Next', true);

    const expectedResult = 'Next letter loads successfully';
    const result = loadNextLetter('Next', true);

    console.log('Test Case ID: CASE-045');
    console.log('Test Case Description: Validate by tapping "Next" button after correct tracing');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Current Letter: ${result.currentLetter}`);
    console.log(`Previous Letter: ${result.previousLetter}`);

    if (result.success && result.nextLetterLoaded && result.currentLetter === 'C') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.nextLetterLoaded).toBe(true);
    expect(result.currentLetter).toBe('C');
    expect(result.previousLetter).toBe('B');
    expect(result.letterIndex).toBe(2);
  });

  test('Tap next (lowercase) after correct tracing - next letter loads successfully', () => {
    const expectedResult = 'Next letter loads successfully';
    const result = loadNextLetter('next', true);

    console.log('Test Case ID: CASE-045');
    console.log('Test Case Description: Validate by tapping "Next" button after correct tracing');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Current Letter: ${result.currentLetter}`);

    if (result.success && result.nextLetterLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.nextLetterLoaded).toBe(true);
    expect(result.currentLetter).toBe('B');
  });

  test('Tap NEXT (uppercase) after correct tracing - next letter loads successfully', () => {
    const expectedResult = 'Next letter loads successfully';
    const result = loadNextLetter('NEXT', true);

    console.log('Test Case ID: CASE-045');
    console.log('Test Case Description: Validate by tapping "Next" button after correct tracing');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.nextLetterLoaded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.nextLetterLoaded).toBe(true);
  });

  test('Tap Next without completing tracing - next letter does not load (negative test)', () => {
    const result = loadNextLetter('Next', false);

    console.log('Test Case ID: CASE-045');
    console.log('Test Case Description: Validate by tapping "Next" button after correct tracing');
    console.log('Expected Result: Next letter loads successfully (after correct tracing)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Current Letter: ${result.currentLetter}`);

    if (!result.success && !result.nextLetterLoaded) {
      console.log('Outcome: PASSED - Correctly blocked without correct tracing');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.nextLetterLoaded).toBe(false);
    expect(result.currentLetter).toBe('A'); // Still on A
    expect(result.errorMessage).toContain('complete the current letter');
  });

  test('Tap different button - next letter does not load (negative test)', () => {
    const result = loadNextLetter('Previous', true);

    console.log('Test Case ID: CASE-045');
    console.log('Test Case Description: Validate by tapping "Next" button after correct tracing');
    console.log('Expected Result: Next letter loads successfully (for Next button)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.nextLetterLoaded) {
      console.log('Outcome: PASSED - Correctly rejected invalid button');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.nextLetterLoaded).toBe(false);
    expect(result.actualResult).toContain('Invalid button');
  });

  test('Tap Next on last letter - all letters completed message', () => {
    // Navigate to last letter (G)
    for (let i = 0; i < letterSequence.length - 1; i++) {
      loadNextLetter('Next', true);
    }

    const result = loadNextLetter('Next', true);

    console.log('Test Case ID: CASE-045');
    console.log('Test Case Description: Validate by tapping "Next" button after correct tracing');
    console.log(`Current Letter: ${result.currentLetter}`);
    console.log(`Is Last Letter: ${result.isLastLetter}`);
    console.log(`All Letters Completed: ${result.allLettersCompleted}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.allLettersCompleted && result.currentLetter === 'G') {
      console.log('Outcome: PASSED - All letters completed');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.allLettersCompleted).toBe(true);
    expect(result.isLastLetter).toBe(true);
    expect(result.currentLetter).toBe('G');
  });

});
