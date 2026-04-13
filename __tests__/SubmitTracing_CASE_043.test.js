// ─── Test Case CASE-043 ──────────────────────────────────────────────────────
// Test Case ID: CASE-043
// Test Case Description: Validate by tapping "Done" after tracing
// Expected Result: Proceed to next letter

// Mock letter sequence and state
const letterSequence = ['A', 'B', 'C', 'D', 'E'];
let currentLetterIndex = 0;
let tracedLettersState = [];

function submitDoneAndProceed(buttonName, hasTracedContent) {
  // Check if button name is provided
  if (!buttonName || buttonName.trim() === '') {
    return {
      success: false,
      actualResult: 'Proceed to next letter failed - No button specified',
      proceededToNext: false,
      currentLetter: letterSequence[currentLetterIndex],
      errorMessage: 'Invalid action'
    };
  }

  // Check if it's the done button
  if (buttonName.toLowerCase() !== 'done') {
    return {
      success: false,
      actualResult: 'Proceed to next letter failed - Invalid button',
      proceededToNext: false,
      currentLetter: letterSequence[currentLetterIndex],
      errorMessage: 'Invalid button clicked'
    };
  }

  // Check if there is traced content
  if (!hasTracedContent || tracedLettersState.length === 0) {
    return {
      success: false,
      actualResult: 'Proceed to next letter failed - No tracing detected',
      proceededToNext: false,
      currentLetter: letterSequence[currentLetterIndex],
      errorMessage: 'Please trace the letter before tapping Done'
    };
  }

  // Check if there are more letters
  if (currentLetterIndex >= letterSequence.length - 1) {
    return {
      success: true,
      actualResult: 'All letters completed - Activity finished',
      proceededToNext: false,
      currentLetter: letterSequence[currentLetterIndex],
      allCompleted: true,
      isLastLetter: true
    };
  }

  // Proceed to next letter
  const previousLetter = letterSequence[currentLetterIndex];
  currentLetterIndex++;
  const nextLetter = letterSequence[currentLetterIndex];

  // Clear traced state for new letter
  tracedLettersState = [];

  return {
    success: true,
    actualResult: 'Proceed to next letter',
    proceededToNext: true,
    previousLetter: previousLetter,
    currentLetter: nextLetter,
    letterIndex: currentLetterIndex,
    totalLetters: letterSequence.length
  };
}

// Reset state before each test
function resetState() {
  currentLetterIndex = 0;
  tracedLettersState = [];
}

function addTracedLetter(letter) {
  tracedLettersState.push({
    letter: letter,
    path: [{ x: 100, y: 100 }, { x: 105, y: 95 }],
    completed: true
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-043 (Validate by tapping "Done" after tracing)', () => {

  beforeEach(() => {
    resetState();
  });

  test('Tap Done after tracing A - proceed to next letter B', () => {
    const expectedResult = 'Proceed to next letter';
    addTracedLetter('A');

    const result = submitDoneAndProceed('Done', true);

    console.log('Test Case ID: CASE-043');
    console.log('Test Case Description: Validate by tapping "Done" after tracing');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Proceeded to Next: ${result.proceededToNext}`);
    console.log(`Previous Letter: ${result.previousLetter}`);
    console.log(`Current Letter: ${result.currentLetter}`);
    console.log(`Letter Index: ${result.letterIndex}`);

    if (result.success && result.proceededToNext && result.currentLetter === 'B') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.proceededToNext).toBe(true);
    expect(result.actualResult).toContain('Proceed to next letter');
    expect(result.previousLetter).toBe('A');
    expect(result.currentLetter).toBe('B');
    expect(result.letterIndex).toBe(1);
  });

  test('Tap Done after tracing B - proceed to next letter C', () => {
    addTracedLetter('A');
    submitDoneAndProceed('Done', true); // Move to B
    addTracedLetter('B');

    const expectedResult = 'Proceed to next letter';
    const result = submitDoneAndProceed('Done', true);

    console.log('Test Case ID: CASE-043');
    console.log('Test Case Description: Validate by tapping "Done" after tracing');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Previous Letter: ${result.previousLetter}`);
    console.log(`Current Letter: ${result.currentLetter}`);

    if (result.success && result.proceededToNext && result.currentLetter === 'C') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.proceededToNext).toBe(true);
    expect(result.previousLetter).toBe('B');
    expect(result.currentLetter).toBe('C');
    expect(result.letterIndex).toBe(2);
  });

  test('Tap done (lowercase) after tracing - proceed to next letter', () => {
    addTracedLetter('A');
    const expectedResult = 'Proceed to next letter';
    const result = submitDoneAndProceed('done', true);

    console.log('Test Case ID: CASE-043');
    console.log('Test Case Description: Validate by tapping "Done" after tracing');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Current Letter: ${result.currentLetter}`);

    if (result.success && result.proceededToNext) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.proceededToNext).toBe(true);
    expect(result.currentLetter).toBe('B');
  });

  test('Tap DONE (uppercase) after tracing - proceed to next letter', () => {
    addTracedLetter('A');
    const expectedResult = 'Proceed to next letter';
    const result = submitDoneAndProceed('DONE', true);

    console.log('Test Case ID: CASE-043');
    console.log('Test Case Description: Validate by tapping "Done" after tracing');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.proceededToNext) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.proceededToNext).toBe(true);
  });

  test('Tap Done without tracing - cannot proceed (negative test)', () => {
    const result = submitDoneAndProceed('Done', false);

    console.log('Test Case ID: CASE-043');
    console.log('Test Case Description: Validate by tapping "Done" after tracing');
    console.log('Expected Result: Proceed to next letter (when tracing is done)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Current Letter: ${result.currentLetter}`);

    if (!result.success && !result.proceededToNext) {
      console.log('Outcome: PASSED - Correctly blocked without tracing');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.proceededToNext).toBe(false);
    expect(result.currentLetter).toBe('A'); // Still on A
    expect(result.errorMessage).toContain('trace the letter');
  });

  test('Tap different button - cannot proceed (negative test)', () => {
    addTracedLetter('A');
    const result = submitDoneAndProceed('Next', true);

    console.log('Test Case ID: CASE-043');
    console.log('Test Case Description: Validate by tapping "Done" after tracing');
    console.log('Expected Result: Proceed to next letter (for Done button)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.proceededToNext) {
      console.log('Outcome: PASSED - Correctly rejected invalid button');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.proceededToNext).toBe(false);
    expect(result.actualResult).toContain('Invalid button');
  });

  test('Tap Done on last letter E - all letters completed', () => {
    // Navigate to last letter E
    for (let i = 0; i < letterSequence.length - 1; i++) {
      addTracedLetter(letterSequence[i]);
      submitDoneAndProceed('Done', true);
    }
    // Now on E
    addTracedLetter('E');

    const result = submitDoneAndProceed('Done', true);

    console.log('Test Case ID: CASE-043');
    console.log('Test Case Description: Validate by tapping "Done" after tracing');
    console.log(`Current Letter: ${result.currentLetter}`);
    console.log(`All Completed: ${result.allCompleted}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.allCompleted) {
      console.log('Outcome: PASSED - All letters completed');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.allCompleted).toBe(true);
    expect(result.isLastLetter).toBe(true);
    expect(result.currentLetter).toBe('E');
  });

});
