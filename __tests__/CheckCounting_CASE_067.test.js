// ─── Test Case CASE-067 ──────────────────────────────────────────────────────
// Test Case ID: CASE-067
// Test Case Description: Validate tapping "Check" button with wrong counting
// Expected Result: Selection recorded; Next button appears

// Mock counting check state
let checkState = {
  selectedCount: 0,
  correctCount: 3,
  word: 'CAT',
  attempts: 0
};

function checkCounting(buttonName, selectedCount, correctCount) {
  // Check if button name is provided
  if (!buttonName || buttonName.trim() === '') {
    return {
      success: false,
      actualResult: 'Check failed - No button specified',
      selectionRecorded: false,
      nextButtonVisible: false,
      errorMessage: 'Invalid action'
    };
  }

  // Check if it's the check button
  if (buttonName.toLowerCase() !== 'check') {
    return {
      success: false,
      actualResult: 'Check failed - Invalid button',
      selectionRecorded: false,
      nextButtonVisible: false,
      errorMessage: 'Invalid button clicked'
    };
  }

  // Check if count is provided
  if (selectedCount === undefined || selectedCount === null) {
    return {
      success: false,
      actualResult: 'Check failed - No count selected',
      selectionRecorded: false,
      nextButtonVisible: false,
      errorMessage: 'Please select a count first'
    };
  }

  // Record the attempt
  checkState.attempts++;
  checkState.selectedCount = selectedCount;

  // Check if count is correct
  const isCorrect = selectedCount === correctCount;

  // Always record selection and show next button, regardless of correctness
  return {
    success: true,
    actualResult: 'Selection recorded; Next button appears',
    selectionRecorded: true,
    nextButtonVisible: true,
    selectedCount: selectedCount,
    correctCount: correctCount,
    isCorrect: isCorrect,
    attempts: checkState.attempts,
    word: checkState.word,
    feedbackMessage: isCorrect 
      ? 'Correct! You counted the sounds!' 
      : `That\'s ${selectedCount}, but "${checkState.word}" has ${correctCount} sounds.`,
    canProceed: true
  };
}

// Reset state before each test
function resetCheckState() {
  checkState = {
    selectedCount: 0,
    correctCount: 3,
    word: 'CAT',
    attempts: 0
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-067 (Validate tapping "Check" button with wrong counting)', () => {

  beforeEach(() => {
    resetCheckState();
  });

  test('Tap Check with wrong count (2 for CAT) - selection recorded; Next appears', () => {
    const expectedResult = 'Selection recorded; Next button appears';
    const selectedCount = 2;
    const correctCount = 3;
    
    const result = checkCounting('Check', selectedCount, correctCount);

    console.log('Test Case ID: CASE-067');
    console.log('Test Case Description: Validate tapping "Check" button with wrong counting');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selection Recorded: ${result.selectionRecorded}`);
    console.log(`Next Button Visible: ${result.nextButtonVisible}`);
    console.log(`Selected Count: ${result.selectedCount}`);
    console.log(`Correct Count: ${result.correctCount}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Attempts: ${result.attempts}`);
    console.log(`Word: ${result.word}`);
    console.log(`Feedback: ${result.feedbackMessage}`);
    console.log(`Can Proceed: ${result.canProceed}`);

    if (result.success && result.selectionRecorded && result.nextButtonVisible && !result.isCorrect) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.actualResult).toContain('Selection recorded');
    expect(result.actualResult).toContain('Next button');
    expect(result.selectedCount).toBe(2);
    expect(result.correctCount).toBe(3);
    expect(result.isCorrect).toBe(false);
    expect(result.attempts).toBe(1);
    expect(result.canProceed).toBe(true);
    expect(result.feedbackMessage).toContain('2');
    expect(result.feedbackMessage).toContain('3');
  });

  test('Tap Check with wrong count (4 for CAT) - selection recorded; Next appears', () => {
    const expectedResult = 'Selection recorded; Next button appears';
    const selectedCount = 4;
    const correctCount = 3;
    
    const result = checkCounting('Check', selectedCount, correctCount);

    console.log('Test Case ID: CASE-067');
    console.log('Test Case Description: Validate tapping "Check" button with wrong counting');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selected: ${result.selectedCount}, Correct: ${result.correctCount}`);
    console.log(`Selection Recorded: ${result.selectionRecorded}`);
    console.log(`Next Button: ${result.nextButtonVisible}`);

    if (result.success && result.selectionRecorded && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.selectedCount).toBe(4);
    expect(result.correctCount).toBe(3);
    expect(result.isCorrect).toBe(false);
  });

  test('Tap Check with wrong count (0 for CAT) - selection recorded; Next appears', () => {
    const expectedResult = 'Selection recorded; Next button appears';
    const selectedCount = 0;
    const correctCount = 3;
    
    const result = checkCounting('Check', selectedCount, correctCount);

    console.log('Test Case ID: CASE-067');
    console.log('Test Case Description: Validate tapping "Check" button with wrong counting');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Selected: ${result.selectedCount}, Correct: ${result.correctCount}`);
    console.log(`Selection Recorded: ${result.selectionRecorded}`);

    if (result.success && result.selectionRecorded && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.selectedCount).toBe(0);
    expect(result.isCorrect).toBe(false);
  });

  test('Tap Check with correct count - selection recorded; Next appears (negative test)', () => {
    const selectedCount = 3;
    const correctCount = 3;
    
    const result = checkCounting('Check', selectedCount, correctCount);

    console.log('Test Case ID: CASE-067');
    console.log('Test Case Description: Validate tapping "Check" button with wrong counting');
    console.log('Expected Result: Selection recorded; Next button appears (for wrong counting)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selected: ${result.selectedCount}, Correct: ${result.correctCount}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Selection Recorded: ${result.selectionRecorded}`);
    console.log(`Next Button: ${result.nextButtonVisible}`);

    if (result.success && result.selectionRecorded && result.nextButtonVisible && result.isCorrect) {
      console.log('Outcome: PASSED - Correctly handled correct count');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.selectedCount).toBe(3);
    expect(result.correctCount).toBe(3);
    expect(result.isCorrect).toBe(true);
    expect(result.feedbackMessage).toContain('Correct');
  });

  test('Multiple wrong attempts - each selection recorded', () => {
    // First wrong attempt
    const result1 = checkCounting('Check', 1, 3);
    expect(result1.attempts).toBe(1);
    expect(result1.selectionRecorded).toBe(true);
    
    // Second wrong attempt
    const result2 = checkCounting('Check', 2, 3);

    console.log('Test Case ID: CASE-067');
    console.log('Test Case Description: Validate tapping "Check" button with wrong counting');
    console.log('Test: Multiple wrong attempts');
    console.log(`Attempt 1: Selected 1 (wrong), Recorded: ${result1.selectionRecorded}`);
    console.log(`Attempt 2: Selected 2 (wrong), Recorded: ${result2.selectionRecorded}`);
    console.log(`Total Attempts: ${result2.attempts}`);

    if (result2.success && result2.selectionRecorded && result2.nextButtonVisible && result2.attempts === 2) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result2.success).toBe(true);
    expect(result2.selectionRecorded).toBe(true);
    expect(result2.nextButtonVisible).toBe(true);
    expect(result2.attempts).toBe(2);
    expect(result2.selectedCount).toBe(2);
  });

  test('Tap different button - selection not recorded (negative test)', () => {
    const selectedCount = 2;
    const correctCount = 3;
    
    const result = checkCounting('Submit', selectedCount, correctCount);

    console.log('Test Case ID: CASE-067');
    console.log('Test Case Description: Validate tapping "Check" button with wrong counting');
    console.log('Expected Result: Selection recorded; Next button appears (for Check button)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.selectionRecorded && !result.nextButtonVisible) {
      console.log('Outcome: PASSED - Correctly rejected invalid button');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.selectionRecorded).toBe(false);
    expect(result.nextButtonVisible).toBe(false);
    expect(result.actualResult).toContain('Invalid button');
  });

  test('No count selected - fails (negative test)', () => {
    const result = checkCounting('Check', undefined, 3);

    console.log('Test Case ID: CASE-067');
    console.log('Test Case Description: Validate tapping "Check" button with wrong counting');
    console.log('Expected Result: Selection recorded; Next button appears (when count selected)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.selectionRecorded) {
      console.log('Outcome: PASSED - Correctly rejected undefined count');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.selectionRecorded).toBe(false);
    expect(result.nextButtonVisible).toBe(false);
    expect(result.errorMessage).toContain('select a count');
  });

});
