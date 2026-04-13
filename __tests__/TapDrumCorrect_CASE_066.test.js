// ─── Test Case CASE-066 ──────────────────────────────────────────────────────
// Test Case ID: CASE-066
// Test Case Description: Validate tapping drum icon with correct count
// Expected Result: Sound count increments; Next button appears

// Mock drum tap game state
let drumState = {
  tapCount: 0,
  correctCount: 3,
  word: 'CAT',
  totalTaps: 0
};

function tapDrumCorrect(tapCount, correctCount) {
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
    drumState.totalTaps++;
    
    return {
      success: true,
      actualResult: 'Sound count increments; Next button appears',
      countIncremented: true,
      nextButtonVisible: true,
      tapCount: tapCount,
      correctCount: correctCount,
      isCorrect: true,
      totalTaps: drumState.totalTaps,
      starsEarned: 1,
      message: 'Correct! You counted the sounds!',
      celebration: true
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
      message: `That\'s not quite right. The word "${drumState.word}" has ${correctCount} sounds.`
    };
  }
}

// Reset state before each test
function resetDrumState() {
  drumState = {
    tapCount: 0,
    correctCount: 3,
    word: 'CAT',
    totalTaps: 0
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-066 (Validate tapping drum icon with correct count)', () => {

  beforeEach(() => {
    resetDrumState();
  });

  test('Tap drum with correct count (3 for CAT) - count increments; Next appears', () => {
    const expectedResult = 'Sound count increments; Next button appears';
    const correctTapCount = 3;
    const correctCount = 3;
    
    const result = tapDrumCorrect(correctTapCount, correctCount);

    console.log('Test Case ID: CASE-066');
    console.log('Test Case Description: Validate tapping drum icon with correct count');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Count Incremented: ${result.countIncremented}`);
    console.log(`Next Button Visible: ${result.nextButtonVisible}`);
    console.log(`Tap Count: ${result.tapCount}`);
    console.log(`Correct Count: ${result.correctCount}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Total Taps: ${result.totalTaps}`);
    console.log(`Stars Earned: ${result.starsEarned}`);
    console.log(`Message: ${result.message}`);
    console.log(`Celebration: ${result.celebration}`);

    if (result.success && result.countIncremented && result.nextButtonVisible && result.isCorrect) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.countIncremented).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.actualResult).toContain('increments');
    expect(result.actualResult).toContain('Next button');
    expect(result.tapCount).toBe(3);
    expect(result.correctCount).toBe(3);
    expect(result.isCorrect).toBe(true);
    expect(result.totalTaps).toBe(1);
    expect(result.starsEarned).toBe(1);
    expect(result.message).toContain('Correct');
    expect(result.celebration).toBe(true);
  });

  test('Tap drum with correct count (4 for TABLE) - count increments; Next appears', () => {
    drumState.correctCount = 4;
    drumState.word = 'TABLE';
    
    const expectedResult = 'Sound count increments; Next button appears';
    const correctTapCount = 4;
    const correctCount = 4;
    
    const result = tapDrumCorrect(correctTapCount, correctCount);

    console.log('Test Case ID: CASE-066');
    console.log('Test Case Description: Validate tapping drum icon with correct count');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Word: ${drumState.word}`);
    console.log(`Tap Count: ${result.tapCount}, Correct: ${result.correctCount}`);
    console.log(`Count Incremented: ${result.countIncremented}`);
    console.log(`Next Button: ${result.nextButtonVisible}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.countIncremented && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.countIncremented).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.tapCount).toBe(4);
    expect(result.correctCount).toBe(4);
    expect(result.isCorrect).toBe(true);
    expect(result.totalTaps).toBe(1);
  });

  test('Tap drum with correct count (1 for A) - count increments; Next appears', () => {
    drumState.correctCount = 1;
    drumState.word = 'A';
    
    const expectedResult = 'Sound count increments; Next button appears';
    const correctTapCount = 1;
    const correctCount = 1;
    
    const result = tapDrumCorrect(correctTapCount, correctCount);

    console.log('Test Case ID: CASE-066');
    console.log('Test Case Description: Validate tapping drum icon with correct count');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Word: ${drumState.word}`);
    console.log(`Tap Count: ${result.tapCount}, Correct: ${result.correctCount}`);
    console.log(`Count Incremented: ${result.countIncremented}`);

    if (result.success && result.countIncremented && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.countIncremented).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.tapCount).toBe(1);
    expect(result.correctCount).toBe(1);
    expect(result.isCorrect).toBe(true);
  });

  test('Tap drum with correct count (6 for BANANA) - count increments; Next appears', () => {
    drumState.correctCount = 6;
    drumState.word = 'BANANA';
    
    const expectedResult = 'Sound count increments; Next button appears';
    const correctTapCount = 6;
    const correctCount = 6;
    
    const result = tapDrumCorrect(correctTapCount, correctCount);

    console.log('Test Case ID: CASE-066');
    console.log('Test Case Description: Validate tapping drum icon with correct count');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Word: ${drumState.word}`);
    console.log(`Tap Count: ${result.tapCount}, Correct: ${result.correctCount}`);
    console.log(`Count Incremented: ${result.countIncremented}`);
    console.log(`Next Button: ${result.nextButtonVisible}`);

    if (result.success && result.countIncremented && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.countIncremented).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.tapCount).toBe(6);
    expect(result.correctCount).toBe(6);
    expect(result.isCorrect).toBe(true);
  });

  test('Multiple correct taps - total taps accumulates', () => {
    // First correct tap
    const result1 = tapDrumCorrect(3, 3);
    expect(result1.totalTaps).toBe(1);
    
    // Second correct tap
    drumState.correctCount = 4;
    drumState.word = 'TABLE';
    const result2 = tapDrumCorrect(4, 4);

    console.log('Test Case ID: CASE-066');
    console.log('Test Case Description: Validate tapping drum icon with correct count');
    console.log('Test: Multiple correct taps');
    console.log(`First tap: CAT (3 sounds)`);
    console.log(`Second tap: TABLE (4 sounds)`);
    console.log(`Total Taps: ${result2.totalTaps}`);

    if (result2.success && result2.countIncremented && result2.totalTaps === 2) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result2.success).toBe(true);
    expect(result2.countIncremented).toBe(true);
    expect(result2.totalTaps).toBe(2);
  });

  test('Tap drum with wrong count - count does not increment (negative test)', () => {
    const wrongTapCount = 2;
    const correctCount = 3;
    
    const result = tapDrumCorrect(wrongTapCount, correctCount);

    console.log('Test Case ID: CASE-066');
    console.log('Test Case Description: Validate tapping drum icon with correct count');
    console.log('Expected Result: Sound count increments; Next button appears (for correct count)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Tap Count: ${result.tapCount}, Correct: ${result.correctCount}`);
    console.log(`Count Incremented: ${result.countIncremented}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && !result.countIncremented && !result.isCorrect) {
      console.log('Outcome: PASSED - Correctly handled wrong count');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.countIncremented).toBe(false);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.tapCount).toBe(2);
    expect(result.correctCount).toBe(3);
    expect(result.isCorrect).toBe(false);
    expect(result.actualResult).toContain('does not increment');
  });

  test('No tap count provided - fails (negative test)', () => {
    const result = tapDrumCorrect(undefined, 3);

    console.log('Test Case ID: CASE-066');
    console.log('Test Case Description: Validate tapping drum icon with correct count');
    console.log('Expected Result: Sound count increments; Next button appears (when count provided)');
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
