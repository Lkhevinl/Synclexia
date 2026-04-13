// ─── Test Case CASE-067 ──────────────────────────────────────────────────────
// Test Case ID: CASE-067
// Test Case Description: Validate matching the wrong sound
// Expected Result: Selection recorded; Next button appears

// Mock sound match game state
let matchState = {
  currentRound: 1,
  selectedOption: null,
  correctAnswer: 'dog',
  attempts: 0,
  totalScore: 0
};

const ROUNDS = {
  1: { sound: 'dog_bark.mp3', correct: 'dog', options: ['dog', 'cat', 'bird'] },
  2: { sound: 'cow_moo.mp3', correct: 'cow', options: ['pig', 'cow', 'sheep'] },
  3: { sound: 'clock_tick.mp3', correct: 'clock', options: ['clock', 'phone', 'doorbell'] },
  4: { sound: 'car_engine.mp3', correct: 'car', options: ['bike', 'car', 'bus'] }
};

function matchSound(selectedOption, correctAnswer) {
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
    matchState.totalScore += 10;
  }

  // Always record selection and show next button
  return {
    success: true,
    actualResult: 'Selection recorded; Next button appears',
    selectionRecorded: true,
    nextButtonVisible: true,
    selectedOption: selectedOption,
    correctAnswer: correctAnswer,
    isCorrect: isCorrect,
    attempts: matchState.attempts,
    totalScore: matchState.totalScore,
    feedbackMessage: isCorrect 
      ? 'Correct! That matches the sound!' 
      : `That\'s ${selectedOption}, but that\'s not the right sound.`,
    canProceed: true
  };
}

// Reset state before each test
function resetMatchState() {
  matchState = {
    currentRound: 1,
    selectedOption: null,
    correctAnswer: 'dog',
    attempts: 0,
    totalScore: 0
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-067 (Validate matching the wrong sound)', () => {

  beforeEach(() => {
    resetMatchState();
  });

  test('Match wrong sound (cat instead of dog) - selection recorded; Next appears', () => {
    const expectedResult = 'Selection recorded; Next button appears';
    const selectedOption = 'cat';
    const correctAnswer = 'dog';
    
    const result = matchSound(selectedOption, correctAnswer);

    console.log('Test Case ID: CASE-067');
    console.log('Test Case Description: Validate matching the wrong sound');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selection Recorded: ${result.selectionRecorded}`);
    console.log(`Next Button Visible: ${result.nextButtonVisible}`);
    console.log(`Selected Option: ${result.selectedOption}`);
    console.log(`Correct Answer: ${result.correctAnswer}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Attempts: ${result.attempts}`);
    console.log(`Total Score: ${result.totalScore}`);
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
    expect(result.selectedOption).toBe('cat');
    expect(result.correctAnswer).toBe('dog');
    expect(result.isCorrect).toBe(false);
    expect(result.attempts).toBe(1);
    expect(result.totalScore).toBe(0); // No score for wrong answer
    expect(result.canProceed).toBe(true);
  });

  test('Match wrong sound (bird instead of dog) - selection recorded; Next appears', () => {
    const expectedResult = 'Selection recorded; Next button appears';
    const selectedOption = 'bird';
    const correctAnswer = 'dog';
    
    const result = matchSound(selectedOption, correctAnswer);

    console.log('Test Case ID: CASE-067');
    console.log('Test Case Description: Validate matching the wrong sound');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selected: ${result.selectedOption}, Correct: ${result.correctAnswer}`);
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
    expect(result.selectedOption).toBe('bird');
    expect(result.correctAnswer).toBe('dog');
    expect(result.isCorrect).toBe(false);
    expect(result.totalScore).toBe(0);
  });

  test('Match wrong sound (pig instead of cow) - selection recorded; Next appears', () => {
    const expectedResult = 'Selection recorded; Next button appears';
    const selectedOption = 'pig';
    const correctAnswer = 'cow';
    
    const result = matchSound(selectedOption, correctAnswer);

    console.log('Test Case ID: CASE-067');
    console.log('Test Case Description: Validate matching the wrong sound');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Selected: ${result.selectedOption}, Correct: ${result.correctAnswer}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.selectionRecorded && !result.isCorrect) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.selectedOption).toBe('pig');
    expect(result.correctAnswer).toBe('cow');
    expect(result.isCorrect).toBe(false);
  });

  test('Match wrong sound (phone instead of clock) - selection recorded; Next appears', () => {
    const expectedResult = 'Selection recorded; Next button appears';
    const selectedOption = 'phone';
    const correctAnswer = 'clock';
    
    const result = matchSound(selectedOption, correctAnswer);

    console.log('Test Case ID: CASE-067');
    console.log('Test Case Description: Validate matching the wrong sound');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Selected: ${result.selectedOption}, Correct: ${result.correctAnswer}`);
    console.log(`Is Correct: ${result.isCorrect}`);

    if (result.success && result.selectionRecorded && !result.isCorrect) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.selectedOption).toBe('phone');
    expect(result.correctAnswer).toBe('clock');
    expect(result.isCorrect).toBe(false);
  });

  test('Match correct sound - selection recorded; Next appears (negative test)', () => {
    const selectedOption = 'dog';
    const correctAnswer = 'dog';
    
    const result = matchSound(selectedOption, correctAnswer);

    console.log('Test Case ID: CASE-067');
    console.log('Test Case Description: Validate matching the wrong sound');
    console.log('Expected Result: Selection recorded; Next button appears (for wrong match)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Selected: ${result.selectedOption}, Correct: ${result.correctAnswer}`);
    console.log(`Is Correct: ${result.isCorrect}`);
    console.log(`Score: ${result.totalScore}`);

    if (result.success && result.selectionRecorded && result.nextButtonVisible && result.isCorrect) {
      console.log('Outcome: PASSED - Correctly handled correct match');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.selectionRecorded).toBe(true);
    expect(result.nextButtonVisible).toBe(true);
    expect(result.selectedOption).toBe('dog');
    expect(result.correctAnswer).toBe('dog');
    expect(result.isCorrect).toBe(true);
    expect(result.totalScore).toBe(10);
  });

  test('Multiple wrong attempts - each selection recorded', () => {
    // First wrong attempt
    const result1 = matchSound('cat', 'dog');
    expect(result1.attempts).toBe(1);
    expect(result1.selectionRecorded).toBe(true);
    expect(result1.isCorrect).toBe(false);
    
    // Second wrong attempt
    const result2 = matchSound('bird', 'dog');

    console.log('Test Case ID: CASE-067');
    console.log('Test Case Description: Validate matching the wrong sound');
    console.log('Test: Multiple wrong attempts');
    console.log(`Attempt 1: Selected ${result1.selectedOption} (wrong), Recorded: ${result1.selectionRecorded}`);
    console.log(`Attempt 2: Selected ${result2.selectedOption} (wrong), Recorded: ${result2.selectionRecorded}`);
    console.log(`Total Attempts: ${result2.attempts}`);
    console.log(`Total Score: ${result2.totalScore}`);

    if (result2.success && result2.selectionRecorded && result2.attempts === 2 && result2.totalScore === 0) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result2.success).toBe(true);
    expect(result2.selectionRecorded).toBe(true);
    expect(result2.nextButtonVisible).toBe(true);
    expect(result2.attempts).toBe(2);
    expect(result2.totalScore).toBe(0); // No points for wrong answers
  });

  test('No option selected - fails (negative test)', () => {
    const result = matchSound('', 'dog');

    console.log('Test Case ID: CASE-067');
    console.log('Test Case Description: Validate matching the wrong sound');
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
