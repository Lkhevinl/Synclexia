// ─── Test Case CASE-068 ──────────────────────────────────────────────────────
// Test Case ID: CASE-068
// Test Case Description: Validate tapping "Check" button with correct counting
// Expected Result: Selection recorded; Next button appears

// Mock counting check state
let checkState = {
  selectedCount: 0,
  correctCount: 3,
  word: 'CAT',
  attempts: 0,
  totalStars: 0
};

function checkCountingCorrect(buttonName, selectedCount, correctCount) {
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

  if (isCorrect) {
    // Award stars based on attempts
    const starsEarned = checkState.attempts === 1 ? 3 : checkState.attempts === 2 ? 2 : 1;
    checkState.totalStars += starsEarned;

    return {
      success: true,
      actualResult: 'Selection recorded; Next button appears',
      selectionRecorded: true,
      nextButtonVisible: true,
      selectedCount: selectedCount,
      correctCount: correctCount,
      isCorrect: true,
      attempts: checkState.attempts,
      starsEarned: starsEarned,
      totalStars: checkState.totalStars,
      word: checkState.word,
      feedbackMessage: 'Correct! You counted the sounds!',
      celebration: true,
      canProceed: true
    };
  } else {
    // Wrong count
    return {
      success: true,
      actualResult: 'Selection recorded; Next button appears',
      selectionRecorded: true,
      nextButtonVisible: true,
      selectedCount: selectedCount,
      correctCount: correctCount,
      isCorrect: false,
      attempts: checkState.attempts,
      word: checkState.word,
      feedbackMessage: `That\'s ${selectedCount}, but "${checkState.word}" has ${correctCount} sounds.`,
      canProceed: true
    };
  }
}

// Reset state before each test
function resetCheckState() {
  checkState = {
    selectedCount: 0,
    correctCount: 3,
    word: 'CAT',
    attempts: 0,
    totalStars: 0
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-068 (Validate tapping "Check" button with correct counting)', () => {

  beforeEach(() => {
    resetCheckState();
  });

  test('Tap Check with correct count (3 for CAT) - selection recorded; Next appears', () => {
    const expectedResult = 'Selection recorded; Next button appears';
    const selectedCount = 3;
    const correctCount = 3;
    
    const result = checkCountingCorrect('Check', selectedCount, correctCount);

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate tapping "Check" button with correct counting');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selection Recorded: ${result.selectionRecorded}`);
    console.log(`Next Button Visible: ${result.nextButtonVisible}`);
    console.log(`Selected Count: ${result.selectedCount}`);
    console.log(`Correct Count: ${result.correctCount}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Attempts: ${result.attempts}`);
    console.log(`Stars Earned: ${result.starsEarned}`);
    console.log(`Total Stars: ${result.totalStars}`);
    console.log(`Word: ${result.word}`);
    console.log(`Feedback: ${result.feedbackMessage}`);
    console.log(`Celebration: ${result.celebration}`);
    console.log(`Can Proceed: ${result.canProceed}`);

    if (result.success && result.selectionRecorded && result.nextButtonVisible && result.isCorrect) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.actualResult).toContain('Selection recorded');
    expect(result.actualResult).toContain('Next button');
    expect(result.selectedCount).toBe(3);
    expect(result.correctCount).toBe(3);
    expect(result.isCorrect).toBe(true);
    expect(result.attempts).toBe(1);
    expect(result.starsEarned).toBe(3); // 3 stars for first attempt
    expect(result.totalStars).toBe(3);
    expect(result.celebration).toBe(true);
    expect(result.feedbackMessage).toContain('Correct');
  });

  test('Tap Check with correct count (4 for TABLE) - selection recorded; Next appears', () => {
    checkState.correctCount = 4;
    checkState.word = 'TABLE';
    
    const expectedResult = 'Selection recorded; Next button appears';
    const selectedCount = 4;
    const correctCount = 4;
    
    const result = checkCountingCorrect('Check', selectedCount, correctCount);

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate tapping "Check" button with correct counting');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Word: ${checkState.word}`);
    console.log(`Selected: ${result.selectedCount}, Correct: ${result.correctCount}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Selection Recorded: ${result.selectionRecorded}`);
    console.log(`Next Button: ${result.nextButtonVisible}`);

    if (result.success && result.selectionRecorded && result.nextButtonVisible && result.isCorrect) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.selectedCount).toBe(4);
    expect(result.correctCount).toBe(4);
    expect(result.isCorrect).toBe(true);
    expect(result.starsEarned).toBe(3);
  });

  test('Tap Check with correct count (1 for A) - selection recorded; Next appears', () => {
    checkState.correctCount = 1;
    checkState.word = 'A';
    
    const expectedResult = 'Selection recorded; Next button appears';
    const selectedCount = 1;
    const correctCount = 1;
    
    const result = checkCountingCorrect('Check', selectedCount, correctCount);

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate tapping "Check" button with correct counting');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Word: ${checkState.word}`);
    console.log(`Selected: ${result.selectedCount}, Correct: ${result.correctCount}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.selectionRecorded && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.selectedCount).toBe(1);
    expect(result.correctCount).toBe(1);
    expect(result.isCorrect).toBe(true);
    expect(result.starsEarned).toBe(3);
  });

  test('Tap Check with correct count (6 for BANANA) - selection recorded; Next appears', () => {
    checkState.correctCount = 6;
    checkState.word = 'BANANA';
    
    const expectedResult = 'Selection recorded; Next button appears';
    const selectedCount = 6;
    const correctCount = 6;
    
    const result = checkCountingCorrect('Check', selectedCount, correctCount);

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate tapping "Check" button with correct counting');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Word: ${checkState.word}`);
    console.log(`Selected: ${result.selectedCount}, Correct: ${result.correctCount}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Stars Earned: ${result.starsEarned}`);

    if (result.success && result.selectionRecorded && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.selectedCount).toBe(6);
    expect(result.correctCount).toBe(6);
    expect(result.isCorrect).toBe(true);
    expect(result.starsEarned).toBe(3);
  });

  test('Correct on second attempt - 2 stars awarded', () => {
    // First attempt - wrong
    checkCountingCorrect('Check', 2, 3);
    expect(checkState.attempts).toBe(1);
    
    // Second attempt - correct
    const result = checkCountingCorrect('Check', 3, 3);

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate tapping "Check" button with correct counting');
    console.log(`Attempts: ${result.attempts}`);
    console.log(`Stars Earned (2nd attempt): ${result.starsEarned}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.isCorrect && result.starsEarned === 2) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(true);
    expect(result.attempts).toBe(2);
    expect(result.starsEarned).toBe(2); // 2 stars for second attempt
    expect(result.totalStars).toBe(2);
  });

  test('Correct on third attempt - 1 star awarded', () => {
    // First two attempts - wrong
    checkCountingCorrect('Check', 1, 3);
    checkCountingCorrect('Check', 2, 3);
    
    // Third attempt - correct
    const result = checkCountingCorrect('Check', 3, 3);

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate tapping "Check" button with correct counting');
    console.log(`Attempts: ${result.attempts}`);
    console.log(`Stars Earned (3rd attempt): ${result.starsEarned}`);

    if (result.success && result.isCorrect && result.starsEarned === 1) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(true);
    expect(result.attempts).toBe(3);
    expect(result.starsEarned).toBe(1); // 1 star for third+ attempt
  });

  test('Tap Check with wrong count - still records; shows Next (negative test)', () => {
    const selectedCount = 2;
    const correctCount = 3;
    
    const result = checkCountingCorrect('Check', selectedCount, correctCount);

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate tapping "Check" button with correct counting');
    console.log('Expected Result: Selection recorded; Next button appears (for correct counting)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selected: ${result.selectedCount}, Correct: ${result.correctCount}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.selectionRecorded && result.nextButtonVisible && !result.isCorrect) {
      console.log('Outcome: PASSED - Correctly handled wrong count');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.selectedCount).toBe(2);
    expect(result.correctCount).toBe(3);
    expect(result.isCorrect).toBe(false);
  });

  test('Tap different button - fails (negative test)', () => {
    const selectedCount = 3;
    const correctCount = 3;
    
    const result = checkCountingCorrect('Submit', selectedCount, correctCount);

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate tapping "Check" button with correct counting');
    console.log('Expected Result: Selection recorded; Next button appears (for Check button)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.selectionRecorded) {
      console.log('Outcome: PASSED - Correctly rejected invalid button');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.selectionRecorded).toBe(false);
    expect(result.nextButtonVisible).toBe(false);
    expect(result.actualResult).toContain('Invalid button');
  });

});
