// ─── Test Case CASE-091 ──────────────────────────────────────────────────────
// Test Case ID: CASE-091
// Test Case Description: Validate changing font style
// Expected Result: Font style updates successfully

// Mock settings state
let settingsState = {
  userId: 'USER001',
  fontStyle: 'default',
  availableFontStyles: ['default', 'dyslexic-friendly', 'sans-serif', 'serif'],
  fontFamilyValues: {
    'default': 'Arial, sans-serif',
    'dyslexic-friendly': 'OpenDyslexic, Comic Sans MS, sans-serif',
    'sans-serif': 'Helvetica, Arial, sans-serif',
    'serif': 'Georgia, Times New Roman, serif'
  }
};

function changeFontStyle(userId, newFontStyle) {
  // Check if user is authenticated
  if (!userId || userId.trim() === '') {
    return {
      success: false,
      actualResult: 'Font style not updated - User not authenticated',
      fontStyleUpdated: false,
      errorMessage: 'Please log in to change settings'
    };
  }

  // Check if font style is provided
  if (!newFontStyle || newFontStyle.trim() === '') {
    return {
      success: false,
      actualResult: 'Font style not updated - No font style specified',
      fontStyleUpdated: false,
      errorMessage: 'Please select a font style'
    };
  }

  // Check if font style is valid
  if (!settingsState.availableFontStyles.includes(newFontStyle)) {
    return {
      success: false,
      actualResult: 'Font style not updated - Invalid font style',
      fontStyleUpdated: false,
      errorMessage: 'Please select a valid font style',
      invalidValue: newFontStyle,
      availableOptions: settingsState.availableFontStyles
    };
  }

  // Check if font style is already set to this value
  if (settingsState.fontStyle === newFontStyle) {
    return {
      success: true,
      actualResult: 'Font style already set to ' + newFontStyle,
      fontStyleUpdated: false,
      currentFontStyle: newFontStyle,
      fontFamily: settingsState.fontFamilyValues[newFontStyle],
      message: 'Font style is already set to ' + newFontStyle
    };
  }

  const oldFontStyle = settingsState.fontStyle;
  
  // Update font style
  settingsState.fontStyle = newFontStyle;

  return {
    success: true,
    actualResult: 'Font style updates successfully',
    fontStyleUpdated: true,
    oldFontStyle: oldFontStyle,
    newFontStyle: newFontStyle,
    fontFamily: settingsState.fontFamilyValues[newFontStyle],
    previewText: 'This is a preview of the ' + newFontStyle + ' font style.',
    appliesTo: ['All text content', 'Activity instructions', 'Reading passages', 'UI elements'],
    message: 'Font style changed from ' + oldFontStyle + ' to ' + newFontStyle
  };
}

function getCurrentFontStyle(userId) {
  if (!userId || userId.trim() === '') {
    return {
      success: false,
      errorMessage: 'Please log in to view settings'
    };
  }

  return {
    success: true,
    currentFontStyle: settingsState.fontStyle,
    fontFamily: settingsState.fontFamilyValues[settingsState.fontStyle],
    availableFontStyles: settingsState.availableFontStyles,
    fontFamilyValues: settingsState.fontFamilyValues
  };
}

// Reset state before each test
function resetSettingsState() {
  settingsState = {
    userId: 'USER001',
    fontStyle: 'default',
    availableFontStyles: ['default', 'dyslexic-friendly', 'sans-serif', 'serif'],
    fontFamilyValues: {
      'default': 'Arial, sans-serif',
      'dyslexic-friendly': 'OpenDyslexic, Comic Sans MS, sans-serif',
      'sans-serif': 'Helvetica, Arial, sans-serif',
      'serif': 'Georgia, Times New Roman, serif'
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-091 (Validate changing font style)', () => {

  beforeEach(() => {
    resetSettingsState();
  });

  test('Change to dyslexic-friendly font - font style updates successfully', () => {
    const expectedResult = 'Font style updates successfully';
    const userId = 'USER001';
    const newFontStyle = 'dyslexic-friendly';
    const oldFontStyle = settingsState.fontStyle;
    
    const result = changeFontStyle(userId, newFontStyle);

    console.log('Test Case ID: CASE-091');
    console.log('Test Case Description: Validate changing font style');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Font Style Updated: ${result.fontStyleUpdated}`);
    console.log(`Old Font Style: ${result.oldFontStyle}`);
    console.log(`New Font Style: ${result.newFontStyle}`);
    console.log(`Font Family: ${result.fontFamily}`);
    console.log(`Preview: ${result.previewText}`);
    console.log(`Applies To: ${result.appliesTo ? result.appliesTo.join(', ') : 'none'}`);
    console.log(`Message: ${result.message}`);

    if (result.success && result.fontStyleUpdated && result.newFontStyle === 'dyslexic-friendly') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.fontStyleUpdated).toBe(true);
    expect(result.actualResult).toContain('updates successfully');
    expect(result.oldFontStyle).toBe('default');
    expect(result.newFontStyle).toBe('dyslexic-friendly');
    expect(result.fontFamily).toContain('OpenDyslexic');
    expect(settingsState.fontStyle).toBe('dyslexic-friendly');
  });

  test('Change to sans-serif font - font style updates successfully', () => {
    const userId = 'USER001';
    const newFontStyle = 'sans-serif';
    
    const result = changeFontStyle(userId, newFontStyle);

    console.log('Test Case ID: CASE-091');
    console.log(`New Font Style: ${result.newFontStyle}`);
    console.log(`Font Family: ${result.fontFamily}`);

    if (result.success && result.fontStyleUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.fontStyleUpdated).toBe(true);
    expect(result.newFontStyle).toBe('sans-serif');
    expect(result.fontFamily).toContain('Helvetica');
    expect(settingsState.fontStyle).toBe('sans-serif');
  });

  test('Change to serif font - font style updates successfully', () => {
    const userId = 'USER001';
    const newFontStyle = 'serif';
    
    const result = changeFontStyle(userId, newFontStyle);

    console.log('Test Case ID: CASE-091');
    console.log(`New Font Style: ${result.newFontStyle}`);
    console.log(`Font Family: ${result.fontFamily}`);

    if (result.success && result.fontStyleUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.fontStyleUpdated).toBe(true);
    expect(result.newFontStyle).toBe('serif');
    expect(result.fontFamily).toContain('Georgia');
  });

  test('Select same font style - no update needed', () => {
    const userId = 'USER001';
    const newFontStyle = 'default'; // Already set to default
    
    const result = changeFontStyle(userId, newFontStyle);

    console.log('Test Case ID: CASE-091');
    console.log(`Current Font Style: ${result.currentFontStyle}`);
    console.log(`Font Style Updated: ${result.fontStyleUpdated}`);
    console.log(`Message: ${result.message}`);

    if (result.success && !result.fontStyleUpdated) {
      console.log('Outcome: PASSED - No update needed for same style');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.fontStyleUpdated).toBe(false);
    expect(result.currentFontStyle).toBe('default');
    expect(result.message).toContain('already set');
  });

  test('View current font style settings', () => {
    const userId = 'USER001';
    
    const result = getCurrentFontStyle(userId);

    console.log('Test Case ID: CASE-091');
    console.log(`Current Font Style: ${result.currentFontStyle}`);
    console.log(`Font Family: ${result.fontFamily}`);
    console.log(`Available Styles: ${result.availableFontStyles ? result.availableFontStyles.join(', ') : 'none'}`);

    if (result.success && result.currentFontStyle === 'default') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.currentFontStyle).toBe('default');
    expect(result.fontFamily).toBe('Arial, sans-serif');
    expect(result.availableFontStyles).toContain('default');
    expect(result.availableFontStyles).toContain('dyslexic-friendly');
    expect(result.availableFontStyles).toContain('sans-serif');
    expect(result.availableFontStyles).toContain('serif');
  });

  test('Invalid font style - cannot change (negative test)', () => {
    const userId = 'USER001';
    const newFontStyle = 'comic-sans';
    
    const result = changeFontStyle(userId, newFontStyle);

    console.log('Test Case ID: CASE-091');
    console.log(`Font Style: "${newFontStyle}" (invalid)`);
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Available Options: ${result.availableOptions ? result.availableOptions.join(', ') : 'none'}`);

    if (!result.success && !result.fontStyleUpdated) {
      console.log('Outcome: PASSED - Correctly rejected invalid font style');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.fontStyleUpdated).toBe(false);
    expect(result.errorMessage).toContain('valid font style');
    expect(result.availableOptions).toContain('default');
    expect(result.availableOptions).toContain('dyslexic-friendly');
  });

  test('Without authentication - cannot change (negative test)', () => {
    const userId = '';
    const newFontStyle = 'dyslexic-friendly';
    
    const result = changeFontStyle(userId, newFontStyle);

    console.log('Test Case ID: CASE-091');
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.fontStyleUpdated) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.fontStyleUpdated).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('Empty font style - cannot change (negative test)', () => {
    const userId = 'USER001';
    const newFontStyle = '';
    
    const result = changeFontStyle(userId, newFontStyle);

    console.log('Test Case ID: CASE-091');
    console.log(`Font Style: "" (empty)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.fontStyleUpdated) {
      console.log('Outcome: PASSED - Correctly rejected empty font style');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.fontStyleUpdated).toBe(false);
    expect(result.errorMessage).toContain('select a font style');
  });

});
