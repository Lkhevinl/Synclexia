// ─── Test Case CASE-078 ──────────────────────────────────────────────────────
// Test Case ID: CASE-078
// Test Case Description: Validated submitting feedback
// Expected Result: Feedback submitted successfully

// Mock feedback state
let feedbackState = {
  userId: null,
  category: '',
  message: '',
  email: '',
  timestamp: null,
  submitted: false,
  feedbackId: null
};

const VALID_CATEGORIES = ['Bug Report', 'Feature Request', 'General Feedback', 'Technical Issue', 'Other'];

function submitFeedback(userId, category, message, email = '') {
  // Check if user is authenticated
  if (!userId || userId.trim() === '') {
    return {
      success: false,
      actualResult: 'Feedback not submitted - User not authenticated',
      feedbackSubmitted: false,
      errorMessage: 'Please log in to submit feedback'
    };
  }

  // Check if category is provided
  if (!category || category.trim() === '') {
    return {
      success: false,
      actualResult: 'Feedback not submitted - Category not selected',
      feedbackSubmitted: false,
      errorMessage: 'Please select a feedback category'
    };
  }

  // Check if category is valid
  if (!VALID_CATEGORIES.includes(category)) {
    return {
      success: false,
      actualResult: 'Feedback not submitted - Invalid category',
      feedbackSubmitted: false,
      errorMessage: 'Please select a valid feedback category',
      providedCategory: category
    };
  }

  // Check if message is provided
  if (!message || message.trim() === '') {
    return {
      success: false,
      actualResult: 'Feedback not submitted - Message is empty',
      feedbackSubmitted: false,
      errorMessage: 'Please enter your feedback message'
    };
  }

  // Check message length
  if (message.length < 10) {
    return {
      success: false,
      actualResult: 'Feedback not submitted - Message too short',
      feedbackSubmitted: false,
      errorMessage: 'Feedback message must be at least 10 characters long',
      currentLength: message.length
    };
  }

  if (message.length > 1000) {
    return {
      success: false,
      actualResult: 'Feedback not submitted - Message too long',
      feedbackSubmitted: false,
      errorMessage: 'Feedback message must be less than 1000 characters',
      currentLength: message.length
    };
  }

  // Validate email format if provided
  if (email && email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        actualResult: 'Feedback not submitted - Invalid email format',
        feedbackSubmitted: false,
        errorMessage: 'Please enter a valid email address',
        providedEmail: email
      };
    }
  }

  // Generate feedback ID
  const feedbackId = `FB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Submit feedback
  feedbackState = {
    userId: userId,
    category: category,
    message: message,
    email: email,
    timestamp: new Date().toISOString(),
    submitted: true,
    feedbackId: feedbackId
  };

  return {
    success: true,
    actualResult: 'Feedback submitted successfully',
    feedbackSubmitted: true,
    feedbackId: feedbackId,
    category: category,
    message: message,
    email: email,
    timestamp: feedbackState.timestamp,
    userId: userId,
    confirmationMessage: `Thank you for your feedback! Your reference number is ${feedbackId}. We will review your ${category.toLowerCase()} and get back to you soon.`
  };
}

// Reset state before each test
function resetFeedbackState() {
  feedbackState = {
    userId: null,
    category: '',
    message: '',
    email: '',
    timestamp: null,
    submitted: false,
    feedbackId: null
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-078 (Validated submitting feedback)', () => {

  beforeEach(() => {
    resetFeedbackState();
  });

  test('Submit general feedback - feedback submitted successfully', () => {
    const expectedResult = 'Feedback submitted successfully';
    const userId = 'USER001';
    const category = 'General Feedback';
    const message = 'I really enjoy using this app with my child. The phonics games are particularly helpful!';
    
    const result = submitFeedback(userId, category, message);

    console.log('Test Case ID: CASE-078');
    console.log('Test Case Description: Validated submitting feedback');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Feedback Submitted: ${result.feedbackSubmitted}`);
    console.log(`Feedback ID: ${result.feedbackId}`);
    console.log(`Category: ${result.category}`);
    console.log(`Message: ${result.message.substring(0, 50)}...`);
    console.log(`User ID: ${result.userId}`);
    console.log(`Timestamp: ${result.timestamp}`);
    console.log(`Confirmation: ${result.confirmationMessage}`);

    if (result.success && result.feedbackSubmitted && result.feedbackId) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.feedbackSubmitted).toBe(true);
    expect(result.actualResult).toContain('submitted successfully');
    expect(result.feedbackId).toMatch(/^FB-\d+-/);
    expect(result.category).toBe('General Feedback');
    expect(result.userId).toBe('USER001');
    expect(result.timestamp).toBeDefined();
    expect(result.confirmationMessage).toContain(result.feedbackId);
  });

  test('Submit bug report with email - feedback submitted successfully', () => {
    const userId = 'USER002';
    const category = 'Bug Report';
    const message = 'The audio does not play when I tap the "Hear Word" button in the spelling game. This happens on my iPad.';
    const email = 'parent@example.com';
    
    const result = submitFeedback(userId, category, message, email);

    console.log('Test Case ID: CASE-078');
    console.log(`Category: ${result.category}`);
    console.log(`Email: ${result.email}`);
    console.log(`Feedback ID: ${result.feedbackId}`);

    if (result.success && result.feedbackSubmitted) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.feedbackSubmitted).toBe(true);
    expect(result.category).toBe('Bug Report');
    expect(result.email).toBe('parent@example.com');
    expect(result.feedbackId).toBeDefined();
  });

  test('Submit feature request - feedback submitted successfully', () => {
    const userId = 'USER003';
    const category = 'Feature Request';
    const message = 'It would be great to have more animal-themed activities. My child loves animals and would be more engaged!';
    
    const result = submitFeedback(userId, category, message);

    console.log('Test Case ID: CASE-078');
    console.log(`Category: ${result.category}`);
    console.log(`Message: ${result.message.substring(0, 60)}...`);

    if (result.success && result.feedbackSubmitted) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.feedbackSubmitted).toBe(true);
    expect(result.category).toBe('Feature Request');
  });

  test('Submit technical issue - feedback submitted successfully', () => {
    const userId = 'USER004';
    const category = 'Technical Issue';
    const message = 'The app crashes when I try to open the Sound Match game. I am using Android version 12 on a Samsung tablet.';
    
    const result = submitFeedback(userId, category, message);

    console.log('Test Case ID: CASE-078');
    console.log(`Category: ${result.category}`);

    if (result.success && result.feedbackSubmitted) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.feedbackSubmitted).toBe(true);
    expect(result.category).toBe('Technical Issue');
  });

  test('Submit feedback without authentication - cannot submit (negative test)', () => {
    const userId = '';
    const category = 'General Feedback';
    const message = 'This is a test feedback message that is long enough.';
    
    const result = submitFeedback(userId, category, message);

    console.log('Test Case ID: CASE-078');
    console.log('Expected Result: Feedback submitted successfully (for authenticated users)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.feedbackSubmitted) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.feedbackSubmitted).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('Submit feedback without category - cannot submit (negative test)', () => {
    const userId = 'USER005';
    const category = '';
    const message = 'This is a test feedback message that is long enough.';
    
    const result = submitFeedback(userId, category, message);

    console.log('Test Case ID: CASE-078');
    console.log(`Category: "" (empty)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.feedbackSubmitted) {
      console.log('Outcome: PASSED - Correctly rejected missing category');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.feedbackSubmitted).toBe(false);
    expect(result.errorMessage).toContain('category');
  });

  test('Submit feedback with invalid category - cannot submit (negative test)', () => {
    const userId = 'USER006';
    const category = 'Invalid Category';
    const message = 'This is a test feedback message that is long enough.';
    
    const result = submitFeedback(userId, category, message);

    console.log('Test Case ID: CASE-078');
    console.log(`Category: "${category}" (invalid)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.feedbackSubmitted) {
      console.log('Outcome: PASSED - Correctly rejected invalid category');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.feedbackSubmitted).toBe(false);
    expect(result.errorMessage).toContain('valid feedback category');
    expect(result.providedCategory).toBe('Invalid Category');
  });

  test('Submit feedback with empty message - cannot submit (negative test)', () => {
    const userId = 'USER007';
    const category = 'General Feedback';
    const message = '';
    
    const result = submitFeedback(userId, category, message);

    console.log('Test Case ID: CASE-078');
    console.log(`Message: "" (empty)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.feedbackSubmitted) {
      console.log('Outcome: PASSED - Correctly rejected empty message');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.feedbackSubmitted).toBe(false);
    expect(result.errorMessage).toContain('enter your feedback');
  });

  test('Submit feedback with short message - cannot submit (negative test)', () => {
    const userId = 'USER008';
    const category = 'General Feedback';
    const message = 'Too short';
    
    const result = submitFeedback(userId, category, message);

    console.log('Test Case ID: CASE-078');
    console.log(`Message length: ${message.length} (too short)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.feedbackSubmitted) {
      console.log('Outcome: PASSED - Correctly rejected short message');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.feedbackSubmitted).toBe(false);
    expect(result.errorMessage).toContain('at least 10 characters');
    expect(result.currentLength).toBe(9);
  });

  test('Submit feedback with invalid email - cannot submit (negative test)', () => {
    const userId = 'USER009';
    const category = 'Bug Report';
    const message = 'The app crashes when I try to open the Sound Match game on my device.';
    const email = 'invalid-email';
    
    const result = submitFeedback(userId, category, message, email);

    console.log('Test Case ID: CASE-078');
    console.log(`Email: "${email}" (invalid format)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.feedbackSubmitted) {
      console.log('Outcome: PASSED - Correctly rejected invalid email');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.feedbackSubmitted).toBe(false);
    expect(result.errorMessage).toContain('valid email');
    expect(result.providedEmail).toBe('invalid-email');
  });

  test('Feedback state persists after submission', () => {
    const userId = 'USER010';
    const category = 'Other';
    const message = 'I have a suggestion for improving the parent dashboard interface.';
    const email = 'suggestion@example.com';
    
    const result = submitFeedback(userId, category, message, email);

    console.log('Test Case ID: CASE-078');
    console.log('Test: Verify feedback state persisted');
    console.log(`State - submitted: ${feedbackState.submitted}`);
    console.log(`State - category: ${feedbackState.category}`);
    console.log(`State - userId: ${feedbackState.userId}`);
    console.log(`State - feedbackId: ${feedbackState.feedbackId}`);
    console.log(`State - email: ${feedbackState.email}`);

    if (feedbackState.submitted && 
        feedbackState.category === 'Other' && 
        feedbackState.userId === 'USER010' &&
        feedbackState.feedbackId === result.feedbackId &&
        feedbackState.email === email) {
      console.log('Outcome: PASSED - Feedback state correctly persisted');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(feedbackState.submitted).toBe(true);
    expect(feedbackState.category).toBe('Other');
    expect(feedbackState.userId).toBe('USER010');
    expect(feedbackState.feedbackId).toBe(result.feedbackId);
    expect(feedbackState.email).toBe(email);
    expect(feedbackState.timestamp).toBeDefined();
  });

});
