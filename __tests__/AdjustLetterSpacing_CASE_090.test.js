// ─── Test Case CASE-090 ──────────────────────────────────────────────────────
// Test Case ID: CASE-090
// Test Case Description: Validate changing letter spacing
// Expected Result: Letter spacing updates accordingly

// Mock settings state
let settingsState = {
  userId: 'USER001',
  letterSpacing: 'normal',
  availableLetterSpacings: ['compact', 'normal', 'wide', 'extra-wide'],
  letterSpacingValues: {
    compact: '-0.5px',
    normal: '0px',
    wide: '2px',
    'extra-wide': '4px'
  }
};

function changeLetterSpacing(userId, newLetterSpacing) {
  // Check if user is authenticated
  if (!userId || userId.trim() === '') {
    return {
      success: false,
      actualResult: 'Letter spacing not updated - User not authenticated',
      letterSpacingUpdated: false,
      errorMessage: 'Please log in to change settings'
    };
  }

  // Check if letter spacing is provided
  if (!newLetterSpacing || newLetterSpacing.trim() === '') {
    return {
      success: false,
      actualResult: 'Letter spacing not updated - No letter spacing specified',
      letterSpacingUpdated: false,
      errorMessage: 'Please select a letter spacing option'
    };
  }

  // Check if letter spacing is valid
  if (!settingsState.availableLetterSpacings.includes(newLetterSpacing)) {
    return {
      success: false,
      actualResult: 'Letter spacing not updated - Invalid letter spacing',
      letterSpacingUpdated: false,
      errorMessage: 'Please select a valid letter spacing option',
      invalidValue: newLetterSpacing,
      availableOptions: settingsState.availableLetterSpacings
    };
  }

  // Check if letter spacing is already set to this value
  if (settingsState.letterSpacing === newLetterSpacing) {
    return {
      success: true,
      actualResult: 'Letter spacing already set to ' + newLetterSpacing,
      letterSpacingUpdated: false,
      currentLetterSpacing: newLetterSpacing,
      letterSpacingValue: settingsState.letterSpacingValues[newLetterSpacing],
      message: 'Letter spacing is already set to ' + newLetterSpacing
    };
  }

  const oldLetterSpacing = settingsState.letterSpacing;
  
  // Update letter spacing
  settingsState.letterSpacing = newLetterSpacing;

  return {
    success: true,
    actualResult: 'Letter spacing updates accordingly',
    letterSpacingUpdated: true,
    oldLetterSpacing: oldLetterSpacing,
    newLetterSpacing: newLetterSpacing,
    letterSpacingValue: settingsState.letterSpacingValues[newLetterSpacing],
    previewText: 'This is a preview of ' + newLetterSpacing + ' letter spacing.',
    appliesTo: ['All text content', 'Activity instructions', 'Reading passages', 'Labels'],
    message: 'Letter spacing changed from ' + oldLetterSpacing + ' to ' + newLetterSpacing
  };
}

function getCurrentLetterSpacing(userId) {
  if (!userId || userId.trim() === '') {
    return {
      success: false,
      errorMessage: 'Please log in to view settings'
    };
  }

  return {
    success: true,
    currentLetterSpacing: settingsState.letterSpacing,
    letterSpacingValue: settingsState.letterSpacingValues[settingsState.letterSpacing],
    availableLetterSpacings: settingsState.availableLetterSpacings,
    letterSpacingValues: settingsState.letterSpacingValues
  };
}

// Reset state before each test
function resetSettingsState() {
  settingsState = {
    userId: 'USER001',
    letterSpacing: 'normal',
    availableLetterSpacings: ['compact', 'normal', 'wide', 'extra-wide'],
    letterSpacingValues: {
      compact: '-0.5px',
      normal: '0px',
      wide: '2px',
      'extra-wide': '4px'
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-090 (Validate changing letter spacing)', () => {

  beforeEach(() => {
    resetSettingsState();
  });

  test('Change to wide letter spacing - letter spacing updates accordingly', () => {
    const expectedResult = 'Letter spacing updates accordingly';
    const userId = 'USER001';
    const newLetterSpacing = 'wide';
    const oldLetterSpacing = settingsState.letterSpacing;
    
    const result = changeLetterSpacing(userId, newLetterSpacing);

    console.log('Test Case ID: CASE-090');
    console.log('Test Case Description: Validate changing letter spacing');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Letter Spacing Updated: ${result.letterSpacingUpdated}`);
    console.log(`Old Letter Spacing: ${result.oldLetterSpacing}`);
    console.log(`New Letter Spacing: ${result.newLetterSpacing}`);
    console.log(`Letter Spacing Value: ${result.letterSpacingValue}`);
    console.log(`Preview: ${result.previewText}`);
    console.log(`Applies To: ${result.appliesTo ? result.appliesTo.join(', ') : 'none'}`);
    console.log(`Message: ${result.message}`);

    if (result.success && result.letterSpacingUpdated && result.newLetterSpacing === 'wide') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.letterSpacingUpdated).toBe(true);
    expect(result.actualResult).toContain('updates accordingly');
    expect(result.oldLetterSpacing).toBe('normal');
    expect(result.newLetterSpacing).toBe('wide');
    expect(result.letterSpacingValue).toBe('2px');
    expect(settingsState.letterSpacing).toBe('wide');
  });

  test('Change to compact letter spacing - letter spacing updates accordingly', () => {
    const userId = 'USER001';
    const newLetterSpacing = 'compact';
    
    const result = changeLetterSpacing(userId, newLetterSpacing);

    console.log('Test Case ID: CASE-090');
    console.log(`New Letter Spacing: ${result.newLetterSpacing}`);
    console.log(`Letter Spacing Value: ${result.letterSpacingValue}`);

    if (result.success && result.letterSpacingUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.letterSpacingUpdated).toBe(true);
    expect(result.newLetterSpacing).toBe('compact');
    expect(result.letterSpacingValue).toBe('-0.5px');
    expect(settingsState.letterSpacing).toBe('compact');
  });

  test('Change to extra-wide letter spacing - letter spacing updates accordingly', () => {
    const userId = 'USER001';
    const newLetterSpacing = 'extra-wide';
    
    const result = changeLetterSpacing(userId, newLetterSpacing);

    console.log('Test Case ID: CASE-090');
    console.log(`New Letter Spacing: ${result.newLetterSpacing}`);
    console.log(`Letter Spacing Value: ${result.letterSpacingValue}`);

    if (result.success && result.letterSpacingUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.letterSpacingUpdated).toBe(true);
    expect(result.newLetterSpacing).toBe('extra-wide');
    expect(result.letterSpacingValue).toBe('4px');
  });

  test('Select same letter spacing - no update needed', () => {
    const userId = 'USER001';
    const newLetterSpacing = 'normal'; // Already set to normal
    
    const result = changeLetterSpacing(userId, newLetterSpacing);

    console.log('Test Case ID: CASE-090');
    console.log(`Current Letter Spacing: ${result.currentLetterSpacing}`);
    console.log(`Letter Spacing Updated: ${result.letterSpacingUpdated}`);
    console.log(`Message: ${result.message}`);

    if (result.success && !result.letterSpacingUpdated) {
      console.log('Outcome: PASSED - No update needed for same spacing');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.letterSpacingUpdated).toBe(false);
    expect(result.currentLetterSpacing).toBe('normal');
    expect(result.message).toContain('already set');
  });

  test('View current letter spacing settings', () => {
    const userId = 'USER001';
    
    const result = getCurrentLetterSpacing(userId);

    console.log('Test Case ID: CASE-090');
    console.log(`Current Letter Spacing: ${result.currentLetterSpacing}`);
    console.log(`Letter Spacing Value: ${result.letterSpacingValue}`);
    console.log(`Available Options: ${result.availableLetterSpacings ? result.availableLetterSpacings.join(', ') : 'none'}`);

    if (result.success && result.currentLetterSpacing === 'normal') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.currentLetterSpacing).toBe('normal');
    expect(result.letterSpacingValue).toBe('0px');
    expect(result.availableLetterSpacings).toContain('compact');
    expect(result.availableLetterSpacings).toContain('normal');
    expect(result.availableLetterSpacings).toContain('wide');
    expect(result.availableLetterSpacings).toContain('extra-wide');
  });

  test('Invalid letter spacing - cannot change (negative test)', () => {
    const userId = 'USER001';
    const newLetterSpacing = 'super-wide';
    
    const result = changeLetterSpacing(userId, newLetterSpacing);

    console.log('Test Case ID: CASE-090');
    console.log(`Letter Spacing: "${newLetterSpacing}" (invalid)`);
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Available Options: ${result.availableOptions ? result.availableOptions.join(', ') : 'none'}`);

    if (!result.success && !result.letterSpacingUpdated) {
      console.log('Outcome: PASSED - Correctly rejected invalid letter spacing');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.letterSpacingUpdated).toBe(false);
    expect(result.errorMessage).toContain('valid letter spacing');
    expect(result.availableOptions).toContain('compact');
    expect(result.availableOptions).toContain('wide');
  });

  test('Without authentication - cannot change (negative test)', () => {
    const userId = '';
    const newLetterSpacing = 'wide';
    
    const result = changeLetterSpacing(userId, newLetterSpacing);

    console.log('Test Case ID: CASE-090');
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.letterSpacingUpdated) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.letterSpacingUpdated).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('Empty letter spacing - cannot change (negative test)', () => {
    const userId = 'USER001';
    const newLetterSpacing = '';
    
    const result = changeLetterSpacing(userId, newLetterSpacing);

    console.log('Test Case ID: CASE-090');
    console.log(`Letter Spacing: "" (empty)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.letterSpacingUpdated) {
      console.log('Outcome: PASSED - Correctly rejected empty letter spacing');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.letterSpacingUpdated).toBe(false);
    expect(result.errorMessage).toContain('select a letter spacing');
  });

});
