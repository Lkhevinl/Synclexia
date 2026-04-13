// ─── Test Case CASE-068 ──────────────────────────────────────────────────────
// Test Case ID: CASE-068
// Test Case Description: Validate matching the correct sound
// Expected Result: Selection recorded; Next button appears

// Mock sound match game state
let matchState = {
  currentRound: 1,
  selectedOption: null,
  correctAnswer: 'dog',
  attempts: 0,
  totalScore: 0,
  starsEarned: 0
};

const ROUNDS = {
  1: { sound: 'dog_bark.mp3', correct: 'dog', options: ['dog', 'cat', 'bird'] },
  2: { sound: 'cow_moo.mp3', correct: 'cow', options: ['pig', 'cow', 'sheep'] },
  3: { sound: 'clock_tick.mp3', correct: 'clock', options: ['clock', 'phone', 'doorbell'] },
  4: { sound: 'car_engine.mp3', correct: 'car', options: ['bike', 'car', 'bus'] }
};

function matchSoundCorrect(selectedOption, correctAnswer) {
  // Check if option is provided
  if (!selectedOption || selectedOption.trim() === '') {
    return {
      success: false,
      actualResult: 'Match failed - No option selected',
      selectionRecorded: false,
      nextButtonVisible: false,
      errorMessage: 'Please select an option'
    };
  }

  // Record the attempt
  matchState.attempts++;
  matchState.selectedOption = selectedOption;

  // Check if match is correct
  const isCorrect = selectedOption.toLowerCase() === correctAnswer.toLowerCase();

  if (isCorrect) {
    // Award points and stars
    matchState.totalScore += 10;
    const stars = matchState.attempts === 1 ? 3 : matchState.attempts === 2 ? 2 : 1;
    matchState.starsEarned += stars;

    return {
      success: true,
      actualResult: 'Selection recorded; Next button appears',
      selectionRecorded: true,
      nextButtonVisible: true,
      selectedOption: selectedOption,
      correctAnswer: correctAnswer,
      isCorrect: true,
      attempts: matchState.attempts,
      score: 10,
      totalScore: matchState.totalScore,
      starsEarned: stars,
      totalStars: matchState.starsEarned,
      feedbackMessage: 'Correct! That matches the sound!',
      celebration: true,
      canProceed: true
    };
  } else {
    // Wrong answer
    return {
      success: true,
      actualResult: 'Selection recorded; Next button appears',
      selectionRecorded: true,
      nextButtonVisible: true,
      selectedOption: selectedOption,
      correctAnswer: correctAnswer,
      isCorrect: false,
      attempts: matchState.attempts,
      score: 0,
      totalScore: matchState.totalScore,
      feedbackMessage: `That\'s ${selectedOption}, but that\'s not the right sound.`,
      canProceed: true
    };
  }
}

// Reset state before each test
function resetMatchState() {
  matchState = {
    currentRound: 1,
    selectedOption: null,
    correctAnswer: 'dog',
    attempts: 0,
    totalScore: 0,
    starsEarned: 0
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-068 (Validate matching the correct sound)', () => {

  beforeEach(() => {
    resetMatchState();
  });

  test('Match correct sound (dog) - selection recorded; Next appears; 3 stars', () => {
    const expectedResult = 'Selection recorded; Next button appears';
    const selectedOption = 'dog';
    const correctAnswer = 'dog';
    
    const result = matchSoundCorrect(selectedOption, correctAnswer);

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate matching the correct sound');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selection Recorded: ${result.selectionRecorded}`);
    console.log(`Next Button Visible: ${result.nextButtonVisible}`);
    console.log(`Selected Option: ${result.selectedOption}`);
    console.log(`Correct Answer: ${result.correctAnswer}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Attempts: ${result.attempts}`);
    console.log(`Score: ${result.score}`);
    console.log(`Total Score: ${result.totalScore}`);
    console.log(`Stars Earned: ${result.starsEarned}`);
    console.log(`Total Stars: ${result.totalStars}`);
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
    expect(result.selectedOption).toBe('dog');
    expect(result.correctAnswer).toBe('dog');
    expect(result.isCorrect).toBe(true);
    expect(result.attempts).toBe(1);
    expect(result.score).toBe(10);
    expect(result.totalScore).toBe(10);
    expect(result.starsEarned).toBe(3); // 3 stars for first attempt
    expect(result.totalStars).toBe(3);
    expect(result.celebration).toBe(true);
    expect(result.feedbackMessage).toContain('Correct');
  });

  test('Match correct sound (cow) - selection recorded; Next appears; 3 stars', () => {
    const expectedResult = 'Selection recorded; Next button appears';
    const selectedOption = 'cow';
    const correctAnswer = 'cow';
    
    const result = matchSoundCorrect(selectedOption, correctAnswer);

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate matching the correct sound');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Selected: ${result.selectedOption}, Correct: ${result.correctAnswer}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Score: ${result.score}`);

    if (result.success && result.selectionRecorded && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.selectedOption).toBe('cow');
    expect(result.correctAnswer).toBe('cow');
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(10);
    expect(result.starsEarned).toBe(3);
  });

  test('Match correct sound (clock) - selection recorded; Next appears; 3 stars', () => {
    const expectedResult = 'Selection recorded; Next button appears';
    const selectedOption = 'clock';
    const correctAnswer = 'clock';
    
    const result = matchSoundCorrect(selectedOption, correctAnswer);

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate matching the correct sound');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Selected: ${result.selectedOption}, Correct: ${result.correctAnswer}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.selectionRecorded && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.selectedOption).toBe('clock');
    expect(result.correctAnswer).toBe('clock');
    expect(result.isCorrect).toBe(true);
    expect(result.starsEarned).toBe(3);
  });

  test('Match correct sound (car) - selection recorded; Next appears; 3 stars', () => {
    const expectedResult = 'Selection recorded; Next button appears';
    const selectedOption = 'car';
    const correctAnswer = 'car';
    
    const result = matchSoundCorrect(selectedOption, correctAnswer);

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate matching the correct sound');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Selected: ${result.selectedOption}, Correct: ${result.correctAnswer}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.selectionRecorded && result.nextButtonVisible) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.selectedOption).toBe('car');
    expect(result.correctAnswer).toBe('car');
    expect(result.isCorrect).toBe(true);
    expect(result.starsEarned).toBe(3);
  });

  test('Correct on second attempt - 2 stars awarded', () => {
    // First attempt - wrong
    matchSoundCorrect('cat', 'dog');
    expect(matchState.attempts).toBe(1);
    
    // Second attempt - correct
    const result = matchSoundCorrect('dog', 'dog');

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate matching the correct sound');
    console.log(`Attempts: ${result.attempts}`);
    console.log(`Stars Earned (2nd attempt): ${result.starsEarned}`);
    console.log(`Total Score: ${result.totalScore}`);

    if (result.success && result.isCorrect && result.starsEarned === 2) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(true);
    expect(result.attempts).toBe(2);
    expect(result.score).toBe(10);
    expect(result.totalScore).toBe(10);
    expect(result.starsEarned).toBe(2); // 2 stars for second attempt
    expect(result.totalStars).toBe(2);
  });

  test('Correct on third attempt - 1 star awarded', () => {
    // First two attempts - wrong
    matchSoundCorrect('cat', 'dog');
    matchSoundCorrect('bird', 'dog');
    
    // Third attempt - correct
    const result = matchSoundCorrect('dog', 'dog');

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate matching the correct sound');
    console.log(`Attempts: ${result.attempts}`);
    console.log(`Stars Earned (3rd attempt): ${result.starsEarned}`);
    console.log(`Total Score: ${result.totalScore}`);

    if (result.success && result.isCorrect && result.starsEarned === 1) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(true);
    expect(result.attempts).toBe(3);
    expect(result.score).toBe(10);
    expect(result.totalScore).toBe(10);
    expect(result.starsEarned).toBe(1); // 1 star for third+ attempt
    expect(result.totalStars).toBe(1);
  });

  test('Match wrong sound - still records; shows Next (negative test)', () => {
    const selectedOption = 'cat';
    const correctAnswer = 'dog';
    
    const result = matchSoundCorrect(selectedOption, correctAnswer);

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate matching the correct sound');
    console.log('Expected Result: Selection recorded; Next button appears (for correct match)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selected: ${result.selectedOption}, Correct: ${result.correctAnswer}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Score: ${result.score}`);

    if (result.success && result.selectionRecorded && result.nextButtonVisible && !result.isCorrect) {
      console.log('Outcome: PASSED - Correctly handled wrong match');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.selectedOption).toBe('cat');
    expect(result.correctAnswer).toBe('dog');
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });

  test('No option selected - fails (negative test)', () => {
    const result = matchSoundCorrect('', 'dog');

    console.log('Test Case ID: CASE-068');
    console.log('Test Case Description: Validate matching the correct sound');
    console.log('Expected Result: Selection recorded; Next button appears (when selection made)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.selectionRecorded) {
      console.log('Outcome: PASSED - Correctly rejected empty selection');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.selectionRecorded).toBe(false);
    expect(result.nextButtonVisible).toBe(false);
    expect(result.errorMessage).toContain('select an option');
  });

});
