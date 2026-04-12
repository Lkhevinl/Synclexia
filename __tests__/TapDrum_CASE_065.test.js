// ─── Test Case CASE-065 ──────────────────────────────────────────────────────
// Test Case ID: CASE-065
// Test Case Description: Validate tapping drum icon with wrong count
// Expected Result: Sound count does not increment; Next button appears

// Mock drum tap game state
let drumState = {
  tapCount: 0,
  correctCount: 3,
  word: 'CAT'
};

function tapDrum(tapCount, correctCount) {
  // Check if tap count is provided
  if (tapCount === undefined || tapCount === null) {
    return {
      success: false,
      actualResult: 'Tap failed - No tap count provided',
      countIncremented: false,
      nextButtonVisible: false,
      errorMessage: 'Please tap the drum'
    };
  }

  // Check if counts are valid numbers
  if (typeof tapCount !== 'number' || typeof correctCount !== 'number') {
    return {
      success: false,
      actualResult: 'Tap failed - Invalid count',
      countIncremented: false,
      nextButtonVisible: false,
      errorMessage: 'Invalid tap count'
    };
  }

  // Check if tap count matches correct count
  const isCorrect = tapCount === correctCount;

  if (isCorrect) {
    // Correct count - increment and show next
    drumState.tapCount = tapCount;
    
    return {
      success: true,
      actualResult: 'Sound count increments; Next button appears',
      countIncremented: true,
      nextButtonVisible: true,
      tapCount: tapCount,
      correctCount: correctCount,
      isCorrect: true,
      message: 'Correct! You counted the sounds!'
    };
  } else {
    // Wrong count - do not increment but still show next
    return {
      success: true,
      actualResult: 'Sound count does not increment; Next button appears',
      countIncremented: false,
      nextButtonVisible: true,
      tapCount: tapCount,
      correctCount: correctCount,
      isCorrect: false,
      message: `That\'s not quite right. The word "${drumState.word}" has ${correctCount} sounds.`,
      suggestion: 'Try again on the next word!'
    };
  }
}

// Reset state before each test
function resetDrumState() {
  drumState = {
    tapCount: 0,
    correctCount: 3,
    word: 'CAT'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-065 (Validate tapping drum icon with wrong count)', () => {

  beforeEach(() => {
    resetDrumState();
  });

  test('Tap drum with wrong count (2 instead of 3) - count does not increment; Next appears', () => {
    const expectedResult = 'Sound count does not increment; Next button appears';
    const wrongTapCount = 2;
    const correctCount = 3;
    
    const result = tapDrum(wrongTapCount, correctCount);

    console.log('Test Case ID: CASE-065');
    console.log('Test Case Description: Validate tapping drum icon with wrong count');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Count Incremented: ${result.countIncremented}`);
    console.log(`Next Button Visible: ${result.nextButtonVisible}`);
    console.log(`Tap Count: ${result.tapCount}`);
    console.log(`Correct Count: ${result.correctCount}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Message: ${result.message}`);
    console.log(`Suggestion: ${result.suggestion}`);

    if (result.success && !result.countIncremented && result.nextButtonVisible && !result.isCorrect) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.countIncremented).toBe(false);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.actualResult).toContain('does not increment');
    expect(result.actualResult).toContain('Next button');
    expect(result.tapCount).toBe(2);
    expect(result.correctCount).toBe(3);
    expect(result.isCorrect).toBe(false);
    expect(result.message).toContain('not quite right');
  });

  test('Tap drum with wrong count (4 instead of 3) - count does not increment; Next appears', () => {
    const expectedResult = 'Sound count does not increment; Next button appears';
    const wrongTapCount = 4;
    const correctCount = 3;
    
    const result = tapDrum(wrongTapCount, correctCount);

    console.log('Test Case ID: CASE-065');
    console.log('Test Case Description: Validate tapping drum icon with wrong count');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Tap Count: ${result.tapCount}, Correct: ${result.correctCount}`);
    console.log(`Count Incremented: ${result.countIncremented}`);
    console.log(`Next Button: ${result.nextButtonVisible}`);

    if (result.success && !result.countIncremented && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.countIncremented).toBe(false);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.tapCount).toBe(4);
    expect(result.correctCount).toBe(3);
    expect(result.isCorrect).toBe(false);
  });

  test('Tap drum with 0 count - count does not increment; Next appears', () => {
    const expectedResult = 'Sound count does not increment; Next button appears';
    const wrongTapCount = 0;
    const correctCount = 3;
    
    const result = tapDrum(wrongTapCount, correctCount);

    console.log('Test Case ID: CASE-065');
    console.log('Test Case Description: Validate tapping drum icon with wrong count');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Tap Count: ${result.tapCount}, Correct: ${result.correctCount}`);
    console.log(`Count Incremented: ${result.countIncremented}`);

    if (result.success && !result.countIncremented && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.countIncremented).toBe(false);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.tapCount).toBe(0);
    expect(result.isCorrect).toBe(false);
  });

  test('Tap drum with correct count (3) - count increments; Next appears (negative test)', () => {
    const correctTapCount = 3;
    const correctCount = 3;
    
    const result = tapDrum(correctTapCount, correctCount);

    console.log('Test Case ID: CASE-065');
    console.log('Test Case Description: Validate tapping drum icon with wrong count');
    console.log('Expected Result: Sound count does not increment; Next button appears (for wrong count)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Tap Count: ${result.tapCount}, Correct: ${result.correctCount}`);
    console.log(`Count Incremented: ${result.countIncremented}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.countIncremented && result.nextButtonVisible && result.isCorrect) {
      console.log('Outcome: PASSED - Correctly handled correct count');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.countIncremented).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.tapCount).toBe(3);
    expect(result.correctCount).toBe(3);
    expect(result.isCorrect).toBe(true);
    expect(result.actualResult).toContain('increments');
  });

  test('Tap drum with excessive wrong count (10) - count does not increment; Next appears', () => {
    const expectedResult = 'Sound count does not increment; Next button appears';
    const wrongTapCount = 10;
    const correctCount = 4;
    
    drumState.correctCount = 4;
    drumState.word = 'TABLE';
    
    const result = tapDrum(wrongTapCount, correctCount);

    console.log('Test Case ID: CASE-065');
    console.log('Test Case Description: Validate tapping drum icon with wrong count');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Word: ${drumState.word}`);
    console.log(`Tap Count: ${result.tapCount}, Correct: ${result.correctCount}`);
    console.log(`Count Incremented: ${result.countIncremented}`);
    console.log(`Next Button: ${result.nextButtonVisible}`);

    if (result.success && !result.countIncremented && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.countIncremented).toBe(false);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.tapCount).toBe(10);
    expect(result.correctCount).toBe(4);
    expect(result.isCorrect).toBe(false);
  });

  test('No tap count provided - fails (negative test)', () => {
    const result = tapDrum(undefined, 3);

    console.log('Test Case ID: CASE-065');
    console.log('Test Case Description: Validate tapping drum icon with wrong count');
    console.log('Expected Result: Sound count does not increment; Next button appears (when wrong count)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.countIncremented && !result.nextButtonVisible) {
      console.log('Outcome: PASSED - Correctly rejected undefined count');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.countIncremented).toBe(false);
    expect(result.nextButtonVisible).toBe(false);
    expect(result.errorMessage).toContain('tap the drum');
  });

});
