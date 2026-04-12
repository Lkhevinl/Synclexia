// ─── Test Case CASE-042 ──────────────────────────────────────────────────────
// Test Case ID: CASE-042
// Test Case Description: Validate by tapping "Done" with no input/trace
// Expected Result: Error message displayed; cannot proceed

// Mock traced letters state
let tracedLettersState = [];

function submitTracing(buttonName, hasTracedContent) {
  // Check if button name is provided
  if (!buttonName || buttonName.trim() === '') {
    return {
      success: false,
      actualResult: 'Submission failed - No button specified',
      canProceed: false,
      errorMessage: 'Invalid action'
    };
  }

  // Check if it's the done/submit button
  if (buttonName.toLowerCase() !== 'done') {
    return {
      success: false,
      actualResult: 'Submission failed - Invalid button',
      canProceed: false,
      errorMessage: 'Invalid button clicked'
    };
  }

  // Check if there is traced content
  if (!hasTracedContent || tracedLettersState.length === 0) {
    return {
      success: false,
      actualResult: 'Error message displayed; cannot proceed',
      canProceed: false,
      errorMessage: 'Please trace at least one letter before submitting',
      tracedLettersCount: tracedLettersState.length
    };
  }

  // Submission successful
  return {
    success: true,
    actualResult: 'Tracing submitted successfully',
    canProceed: true,
    errorMessage: null,
    tracedLettersCount: tracedLettersState.length
  };
}

// Reset state before each test
function resetTracingState() {
  tracedLettersState = [];
}

function addTracedLetter(letter) {
  tracedLettersState.push({
    letter: letter,
    path: [{ x: 100, y: 100 }],
    completed: true
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-042 (Validate by tapping "Done" with no input/trace)', () => {

  beforeEach(() => {
    resetTracingState();
  });

  test('Tap Done with no traced letters - error message displayed; cannot proceed', () => {
    const expectedResult = 'Error message displayed; cannot proceed';
    const result = submitTracing('Done', false);

    console.log('Test Case ID: CASE-042');
    console.log('Test Case Description: Validate by tapping "Done" with no input/trace');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Can Proceed: ${result.canProceed}`);
    console.log(`Error Message: ${result.errorMessage}`);
    console.log(`Traced Letters Count: ${result.tracedLettersCount}`);

    if (!result.success && !result.canProceed && result.errorMessage) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.canProceed).toBe(false);
    expect(result.actualResult).toContain('Error message displayed');
    expect(result.errorMessage).toContain('trace at least one letter');
    expect(result.tracedLettersCount).toBe(0);
  });

  test('Tap done (lowercase) with no input - error message displayed', () => {
    const expectedResult = 'Error message displayed; cannot proceed';
    const result = submitTracing('done', false);

    console.log('Test Case ID: CASE-042');
    console.log('Test Case Description: Validate by tapping "Done" with no input/trace');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Can Proceed: ${result.canProceed}`);

    if (!result.success && !result.canProceed) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.canProceed).toBe(false);
    expect(result.errorMessage).toBeTruthy();
  });

  test('Tap DONE (uppercase) with empty canvas - error message displayed', () => {
    const expectedResult = 'Error message displayed; cannot proceed';
    const result = submitTracing('DONE', false);

    console.log('Test Case ID: CASE-042');
    console.log('Test Case Description: Validate by tapping "Done" with no input/trace');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.canProceed) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.canProceed).toBe(false);
    expect(result.actualResult).toContain('Error');
  });

  test('Tap Done with traced letters - submission successful (negative test)', () => {
    // Add some traced letters first
    addTracedLetter('A');
    addTracedLetter('B');

    const result = submitTracing('Done', true);

    console.log('Test Case ID: CASE-042');
    console.log('Test Case Description: Validate by tapping "Done" with no input/trace');
    console.log('Expected Result: Error message displayed; cannot proceed (when no input)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Traced Letters Count: ${result.tracedLettersCount}`);

    if (result.success && result.canProceed) {
      console.log('Outcome: PASSED - Correctly allowed submission with traced letters');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.canProceed).toBe(true);
    expect(result.errorMessage).toBeNull();
    expect(result.tracedLettersCount).toBe(2);
  });

  test('Tap different button with no input - submission failed (negative test)', () => {
    const result = submitTracing('Cancel', false);

    console.log('Test Case ID: CASE-042');
    console.log('Test Case Description: Validate by tapping "Done" with no input/trace');
    console.log('Expected Result: Error message displayed; cannot proceed (for Done button with no input)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.canProceed) {
      console.log('Outcome: PASSED - Correctly rejected invalid button');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.canProceed).toBe(false);
    expect(result.actualResult).toContain('Invalid button');
  });

  test('Tap Done after clearing all traces - error message displayed', () => {
    // First add a letter
    addTracedLetter('C');

    // Then clear all (simulating clear action)
    tracedLettersState = [];

    const result = submitTracing('Done', false);

    console.log('Test Case ID: CASE-042');
    console.log('Test Case Description: Validate by tapping "Done" with no input/trace');
    console.log('Expected Result: Error message displayed; cannot proceed');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Traced Letters After Clear: ${tracedLettersState.length}`);

    if (!result.success && !result.canProceed) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.canProceed).toBe(false);
    expect(result.errorMessage).toContain('trace at least one letter');
    expect(tracedLettersState.length).toBe(0);
  });

});
