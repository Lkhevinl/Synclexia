// ─── Test Case CASE-037 ──────────────────────────────────────────────────────
// Test Case ID: CASE-037
// Test Case Description: Validate by tapping "Writing" activity
// Expected Result: Writing activity screen opens successfully

// Mock writing activity data
const writingActivityData = {
  id: 'writing',
  title: 'Writing Activity',
  description: 'Practice writing letters and words',
  exercises: [
    { id: 1, type: 'letter_tracing', letter: 'A', instruction: 'Trace the letter A' },
    { id: 2, type: 'word_completion', word: 'CAT', missingLetter: 'A', hint: 'C _ T' },
    { id: 3, type: 'free_writing', prompt: 'Write your name' }
  ],
  tools: ['pencil', 'eraser', 'color_palette'],
  difficultyLevels: ['easy', 'medium', 'hard']
};

function openWritingActivity(activityName) {
  // Check if activity name is provided
  if (!activityName || activityName.trim() === '') {
    return {
      success: false,
      actualResult: 'Writing activity screen failed to open - Activity not specified',
      screenOpened: false,
      data: null
    };
  }

  // Check if it's the writing activity
  if (activityName.toLowerCase() !== 'writing') {
    return {
      success: false,
      actualResult: 'Writing activity screen failed to open - Invalid activity',
      screenOpened: false,
      data: null
    };
  }

  // Open writing activity screen
  return {
    success: true,
    actualResult: 'Writing activity screen opens successfully',
    screenOpened: true,
    data: writingActivityData,
    exerciseCount: writingActivityData.exercises.length,
    availableTools: writingActivityData.tools
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-037 (Validate by tapping "Writing" activity)', () => {

  test('Tap Writing activity - writing activity screen opens successfully', () => {
    const expectedResult = 'Writing activity screen opens successfully';
    const result = openWritingActivity('Writing');

    console.log('Test Case ID: CASE-037');
    console.log('Test Case Description: Validate by tapping "Writing" activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Screen Opened: ${result.screenOpened}`);
    console.log(`Activity Title: ${result.data ? result.data.title : 'N/A'}`);
    console.log(`Exercise Count: ${result.exerciseCount}`);
    console.log(`Available Tools: ${result.availableTools ? result.availableTools.join(', ') : 'N/A'}`);

    if (result.success && result.screenOpened && result.data) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenOpened).toBe(true);
    expect(result.actualResult).toContain('opens successfully');
    expect(result.data.title).toBe('Writing Activity');
    expect(result.exerciseCount).toBe(3);
  });

  test('Tap writing (lowercase) - writing activity screen opens successfully', () => {
    const expectedResult = 'Writing activity screen opens successfully';
    const result = openWritingActivity('writing');

    console.log('Test Case ID: CASE-037');
    console.log('Test Case Description: Validate by tapping "Writing" activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Screen Opened: ${result.screenOpened}`);

    if (result.success && result.screenOpened) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenOpened).toBe(true);
    expect(result.data.id).toBe('writing');
  });

  test('Tap WRITING (uppercase) - writing activity screen opens successfully', () => {
    const expectedResult = 'Writing activity screen opens successfully';
    const result = openWritingActivity('WRITING');

    console.log('Test Case ID: CASE-037');
    console.log('Test Case Description: Validate by tapping "Writing" activity');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);

    if (result.success && result.screenOpened) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.screenOpened).toBe(true);
    expect(result.exerciseCount).toBe(3);
  });

  test('Tap different activity - writing screen should not open (negative test)', () => {
    const result = openWritingActivity('Phonics');

    console.log('Test Case ID: CASE-037');
    console.log('Test Case Description: Validate by tapping "Writing" activity');
    console.log('Expected Result: Writing activity screen opens successfully (for Writing activity)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenOpened) {
      console.log('Outcome: PASSED - Correctly rejected non-Writing activity');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenOpened).toBe(false);
    expect(result.actualResult).toContain('failed');
  });

  test('Empty activity name - writing screen should not open (negative test)', () => {
    const result = openWritingActivity('');

    console.log('Test Case ID: CASE-037');
    console.log('Test Case Description: Validate by tapping "Writing" activity');
    console.log('Expected Result: Writing activity screen opens successfully (for Writing activity)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenOpened) {
      console.log('Outcome: PASSED - Correctly rejected empty activity');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenOpened).toBe(false);
    expect(result.actualResult).toContain('not specified');
  });

  test('Null activity name - writing screen should not open (negative test)', () => {
    const result = openWritingActivity(null);

    console.log('Test Case ID: CASE-037');
    console.log('Test Case Description: Validate by tapping "Writing" activity');
    console.log('Expected Result: Writing activity screen opens successfully (for Writing activity)');
    console.log(`Actual Result: ${result.actualResult}`);

    if (!result.success && !result.screenOpened) {
      console.log('Outcome: PASSED - Correctly rejected null activity');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.screenOpened).toBe(false);
  });

});
