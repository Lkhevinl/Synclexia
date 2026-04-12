// ─── Test Case CASE-105 ──────────────────────────────────────────────────────
// Test Case ID: CASE-105
// Test Case Description: Admin responds to feedback submitted by parents
// Expected Result: Able to respond feedback submitted by parents

// Mock feedback data
let feedbackData = {
  feedback: [
    {
      feedbackId: 'FEED001',
      timestamp: '2024-04-10T10:30:00Z',
      userId: 'USER001',
      userName: 'John Smith',
      userEmail: 'john.smith@example.com',
      category: 'Feature Request',
      message: 'Would love to see more phonics activities for advanced learners',
      rating: 5,
      status: 'pending',
      response: null,
      respondedAt: null,
      respondedBy: null
    },
    {
      feedbackId: 'FEED002',
      timestamp: '2024-04-11T14:15:00Z',
      userId: 'USER002',
      userName: 'Sarah Jones',
      userEmail: 'sarah.jones@example.com',
      category: 'Bug Report',
      message: 'The sound does not play when I click the speaker icon',
      rating: 4,
      status: 'under_review',
      response: null,
      respondedAt: null,
      respondedBy: null
    },
    {
      feedbackId: 'FEED003',
      timestamp: '2024-04-12T09:45:00Z',
      userId: 'USER003',
      userName: 'Mike Brown',
      userEmail: 'mike.brown@example.com',
      category: 'General Feedback',
      message: 'Great app! My child has improved their reading skills',
      rating: 5,
      status: 'responded',
      response: 'Thank you for your feedback! We are glad to hear about the improvement.',
      respondedAt: '2024-04-12T10:00:00Z',
      respondedBy: 'ADMIN001'
    }
  ]
};

function respondToFeedback(adminId, feedbackId, response) {
  // Check if admin is authenticated
  if (!adminId || adminId.trim() === '') {
    return {
      success: false,
      actualResult: 'Unable to respond to feedback - Admin not authenticated',
      responseAdded: false,
      errorMessage: 'Please log in as admin to respond to feedback'
    };
  }

  // Check if admin has privileges
  if (!adminId.startsWith('ADMIN')) {
    return {
      success: false,
      actualResult: 'Unable to respond to feedback - Insufficient privileges',
      responseAdded: false,
      errorMessage: 'You do not have permission to respond to feedback'
    };
  }

  // Check if feedback exists
  const feedbackIndex = feedbackData.feedback.findIndex(f => f.feedbackId === feedbackId);
  if (feedbackIndex === -1) {
    return {
      success: false,
      actualResult: 'Unable to respond to feedback - Feedback not found',
      responseAdded: false,
      errorMessage: 'Feedback not found'
    };
  }

  // Check if response is provided
  if (!response || response.trim() === '') {
    return {
      success: false,
      actualResult: 'Unable to respond to feedback - No response provided',
      responseAdded: false,
      errorMessage: 'Please provide a response message'
    };
  }

  // Validate response length
  if (response.length < 10) {
    return {
      success: false,
      actualResult: 'Unable to respond to feedback - Response too short',
      responseAdded: false,
      errorMessage: 'Response must be at least 10 characters'
    };
  }

  const timestamp = new Date().toISOString();
  const feedback = feedbackData.feedback[feedbackIndex];

  // Update feedback with response
  feedbackData.feedback[feedbackIndex] = {
    ...feedback,
    status: 'responded',
    response: response,
    respondedAt: timestamp,
    respondedBy: adminId
  };

  return {
    success: true,
    actualResult: 'Able to respond feedback submitted by parents',
    responseAdded: true,
    feedbackId: feedbackId,
    adminId: adminId,
    userName: feedback.userName,
    userEmail: feedback.userEmail,
    response: response,
    respondedAt: timestamp,
    respondedBy: adminId,
    previousStatus: feedback.status,
    newStatus: 'responded',
    message: `Response to feedback ${feedbackId} from ${feedback.userName} has been submitted successfully`
  };
}

// Reset state before each test
function resetFeedbackData() {
  feedbackData = {
    feedback: [
      {
        feedbackId: 'FEED001',
        timestamp: '2024-04-10T10:30:00Z',
        userId: 'USER001',
        userName: 'John Smith',
        userEmail: 'john.smith@example.com',
        category: 'Feature Request',
        message: 'Would love to see more phonics activities for advanced learners',
        rating: 5,
        status: 'pending',
        response: null,
        respondedAt: null,
        respondedBy: null
      },
      {
        feedbackId: 'FEED002',
        timestamp: '2024-04-11T14:15:00Z',
        userId: 'USER002',
        userName: 'Sarah Jones',
        userEmail: 'sarah.jones@example.com',
        category: 'Bug Report',
        message: 'The sound does not play when I click the speaker icon',
        rating: 4,
        status: 'under_review',
        response: null,
        respondedAt: null,
        respondedBy: null
      },
      {
        feedbackId: 'FEED003',
        timestamp: '2024-04-12T09:45:00Z',
        userId: 'USER003',
        userName: 'Mike Brown',
        userEmail: 'mike.brown@example.com',
        category: 'General Feedback',
        message: 'Great app! My child has improved their reading skills',
        rating: 5,
        status: 'responded',
        response: 'Thank you for your feedback! We are glad to hear about the improvement.',
        respondedAt: '2024-04-12T10:00:00Z',
        respondedBy: 'ADMIN001'
      }
    ]
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-105 (Admin responds to feedback submitted by parents)', () => {

  beforeEach(() => {
    resetFeedbackData();
  });

  test('Admin responds to pending feedback - able to respond feedback submitted by parents', () => {
    const expectedResult = 'Able to respond feedback submitted by parents';
    const adminId = 'ADMIN001';
    const feedbackId = 'FEED001';
    const response = 'Thank you for your feature request! We are working on adding more advanced phonics activities in our next update. Stay tuned!';

    const feedbackBefore = feedbackData.feedback.find(f => f.feedbackId === feedbackId);
    const previousStatus = feedbackBefore.status;

    const result = respondToFeedback(adminId, feedbackId, response);

    console.log('Test Case ID: CASE-105');
    console.log('Test Case Description: Admin responds to feedback submitted by parents');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Response Added: ${result.responseAdded}`);
    console.log(`Feedback ID: ${result.feedbackId}`);
    console.log(`User Name: ${result.userName}`);
    console.log(`User Email: ${result.userEmail}`);
    console.log(`Previous Status: ${result.previousStatus}`);
    console.log(`New Status: ${result.newStatus}`);
    console.log(`Response: ${result.response}`);
    console.log(`Responded At: ${result.respondedAt}`);
    console.log(`Responded By: ${result.respondedBy}`);
    console.log(`Message: ${result.message}`);

    if (result.success && result.responseAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.responseAdded).toBe(true);
    expect(result.actualResult).toContain('Able to respond');
    expect(result.feedbackId).toBe('FEED001');
    expect(result.userName).toBe('John Smith');
    expect(result.previousStatus).toBe('pending');
    expect(result.newStatus).toBe('responded');
    expect(result.response).toBe(response);
    expect(result.respondedBy).toBe('ADMIN001');
    expect(result.respondedAt).toBeDefined();
  });

  test('Admin responds to under_review feedback - able to respond feedback submitted by parents', () => {
    const adminId = 'ADMIN001';
    const feedbackId = 'FEED002';
    const response = 'We have identified the issue with the sound playback and are working on a fix. It should be resolved in the next app update. Thank you for your patience!';

    const result = respondToFeedback(adminId, feedbackId, response);

    console.log('Test Case ID: CASE-105');
    console.log(`Feedback ID: ${result.feedbackId}`);
    console.log(`Previous Status: ${result.previousStatus}`);
    console.log(`New Status: ${result.newStatus}`);

    if (result.success && result.responseAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.responseAdded).toBe(true);
    expect(result.previousStatus).toBe('under_review');
    expect(result.newStatus).toBe('responded');
    expect(result.feedbackId).toBe('FEED002');
  });

  test('Feedback data persisted correctly after response', () => {
    const adminId = 'ADMIN001';
    const feedbackId = 'FEED001';
    const response = 'Thank you for your suggestion. We are actively working on expanding our phonics content for advanced learners.';

    const result = respondToFeedback(adminId, feedbackId, response);

    console.log('Test Case ID: CASE-105');
    console.log('Verifying feedback data persisted:');

    const persistedFeedback = feedbackData.feedback.find(f => f.feedbackId === feedbackId);

    console.log(`  Feedback ID: ${persistedFeedback.feedbackId}`);
    console.log(`  Status: ${persistedFeedback.status}`);
    console.log(`  Response: ${persistedFeedback.response}`);
    console.log(`  Responded By: ${persistedFeedback.respondedBy}`);
    console.log(`  Responded At: ${persistedFeedback.respondedAt}`);

    if (persistedFeedback.status === 'responded' && persistedFeedback.response === response) {
      console.log('Outcome: PASSED - Feedback data persisted correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(persistedFeedback.status).toBe('responded');
    expect(persistedFeedback.response).toBe(response);
    expect(persistedFeedback.respondedBy).toBe('ADMIN001');
    expect(persistedFeedback.respondedAt).toBeDefined();
  });

  test('Response to non-existent feedback - unable to respond (negative test)', () => {
    const adminId = 'ADMIN001';
    const feedbackId = 'FEED999';
    const response = 'This is a response to non-existent feedback.';

    const result = respondToFeedback(adminId, feedbackId, response);

    console.log('Test Case ID: CASE-105');
    console.log(`Feedback ID: ${feedbackId} (does not exist)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.responseAdded) {
      console.log('Outcome: PASSED - Correctly rejected non-existent feedback');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.responseAdded).toBe(false);
    expect(result.errorMessage).toContain('not found');
  });

  test('Empty response - unable to respond (negative test)', () => {
    const adminId = 'ADMIN001';
    const feedbackId = 'FEED001';
    const response = '';

    const result = respondToFeedback(adminId, feedbackId, response);

    console.log('Test Case ID: CASE-105');
    console.log(`Response: "" (empty)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.responseAdded) {
      console.log('Outcome: PASSED - Correctly rejected empty response');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.responseAdded).toBe(false);
    expect(result.errorMessage).toContain('response');
  });

  test('Response too short - unable to respond (negative test)', () => {
    const adminId = 'ADMIN001';
    const feedbackId = 'FEED001';
    const response = 'Thanks.';

    const result = respondToFeedback(adminId, feedbackId, response);

    console.log('Test Case ID: CASE-105');
    console.log(`Response: "${response}" (too short)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.responseAdded) {
      console.log('Outcome: PASSED - Correctly rejected short response');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.responseAdded).toBe(false);
    expect(result.errorMessage).toContain('at least 10 characters');
  });

  test('Without admin authentication - unable to respond (negative test)', () => {
    const adminId = '';
    const feedbackId = 'FEED001';
    const response = 'Thank you for your feedback. We appreciate your input.';

    const result = respondToFeedback(adminId, feedbackId, response);

    console.log('Test Case ID: CASE-105');
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.responseAdded) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated admin');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.responseAdded).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('With non-admin account - unable to respond (negative test)', () => {
    const adminId = 'USER001';
    const feedbackId = 'FEED001';
    const response = 'Thank you for your feedback. We appreciate your input.';

    const result = respondToFeedback(adminId, feedbackId, response);

    console.log('Test Case ID: CASE-105');
    console.log(`User ID: ${adminId} (not an admin)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.responseAdded) {
      console.log('Outcome: PASSED - Correctly rejected non-admin user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.responseAdded).toBe(false);
    expect(result.errorMessage).toContain('permission');
  });

  test('With learner account - unable to respond (negative test)', () => {
    const adminId = 'LEARNER001';
    const feedbackId = 'FEED001';
    const response = 'Thank you for your feedback. We appreciate your input.';

    const result = respondToFeedback(adminId, feedbackId, response);

    console.log('Test Case ID: CASE-105');
    console.log(`User ID: ${adminId} (learner account)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.responseAdded) {
      console.log('Outcome: PASSED - Correctly rejected learner account');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.responseAdded).toBe(false);
    expect(result.errorMessage).toContain('permission');
  });

});
