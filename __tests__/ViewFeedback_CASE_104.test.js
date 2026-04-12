// ─── Test Case CASE-104 ──────────────────────────────────────────────────────
// Test Case ID: CASE-104
// Test Case Description: Admin views feedback submitted by parents
// Expected Result: Able to view feedback submitted by parents

// Mock feedback data
const FEEDBACK_DATA = {
  totalFeedback: 6,
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
      status: 'pending'
    },
    {
      feedbackId: 'FEED002',
      timestamp: '2024-04-11T14:15:00Z',
      userId: 'USER002',
      userName: 'Sarah Jones',
      userEmail: 'sarah.jones@example.com',
      category: 'Bug Report',
      message: 'The sound doesn\'t play when I click the speaker icon in the spelling game',
      rating: 4,
      status: 'under_review'
    },
    {
      feedbackId: 'FEED003',
      timestamp: '2024-04-12T09:45:00Z',
      userId: 'USER003',
      userName: 'Mike Brown',
      userEmail: 'mike.brown@example.com',
      category: 'General Feedback',
      message: 'Great app! My child has improved their reading skills significantly',
      rating: 5,
      status: 'responded'
    },
    {
      feedbackId: 'FEED004',
      timestamp: '2024-04-12T16:20:00Z',
      userId: 'USER004',
      userName: 'Emily Davis',
      userEmail: 'emily.davis@example.com',
      category: 'Feature Request',
      message: 'Can we have a dark mode option for easier viewing?',
      rating: 4,
      status: 'pending'
    },
    {
      feedbackId: 'FEED005',
      timestamp: '2024-04-13T08:00:00Z',
      userId: 'USER005',
      userName: 'David Wilson',
      userEmail: 'david.wilson@example.com',
      category: 'Bug Report',
      message: 'App crashes when trying to view progress reports on iPad',
      rating: 3,
      status: 'under_review'
    },
    {
      feedbackId: 'FEED006',
      timestamp: '2024-04-13T11:30:00Z',
      userId: 'USER006',
      userName: 'Lisa Miller',
      userEmail: 'lisa.miller@example.com',
      category: 'General Feedback',
      message: 'The parent dashboard is very helpful for tracking progress',
      rating: 5,
      status: 'pending'
    }
  ]
};

function viewFeedback(adminId, filters = {}) {
  // Check if admin is authenticated
  if (!adminId || adminId.trim() === '') {
    return {
      success: false,
      actualResult: 'Unable to view feedback - Admin not authenticated',
      feedbackViewable: false,
      errorMessage: 'Please log in as admin to view feedback'
    };
  }

  // Check if admin has privileges
  if (!adminId.startsWith('ADMIN')) {
    return {
      success: false,
      actualResult: 'Unable to view feedback - Insufficient privileges',
      feedbackViewable: false,
      errorMessage: 'You do not have permission to view feedback'
    };
  }

  let filteredFeedback = [...FEEDBACK_DATA.feedback];

  // Apply filters if provided
  if (filters.category) {
    filteredFeedback = filteredFeedback.filter(f => f.category === filters.category);
  }
  if (filters.status) {
    filteredFeedback = filteredFeedback.filter(f => f.status === filters.status);
  }
  if (filters.rating) {
    filteredFeedback = filteredFeedback.filter(f => f.rating === filters.rating);
  }
  if (filters.userId) {
    filteredFeedback = filteredFeedback.filter(f => f.userId === filters.userId);
  }
  if (filters.startDate) {
    filteredFeedback = filteredFeedback.filter(f => new Date(f.timestamp) >= new Date(filters.startDate));
  }

  // Calculate statistics
  const categoryCounts = {};
  const statusCounts = {};
  const ratingCounts = {};
  
  FEEDBACK_DATA.feedback.forEach(f => {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
    statusCounts[f.status] = (statusCounts[f.status] || 0) + 1;
    ratingCounts[f.rating] = (ratingCounts[f.rating] || 0) + 1;
  });

  const totalRating = FEEDBACK_DATA.feedback.reduce((sum, f) => sum + f.rating, 0);
  const averageRating = (totalRating / FEEDBACK_DATA.totalFeedback).toFixed(1);

  return {
    success: true,
    actualResult: 'Able to view feedback submitted by parents',
    feedbackViewable: true,
    adminId: adminId,
    totalFeedback: FEEDBACK_DATA.totalFeedback,
    displayedFeedback: filteredFeedback.length,
    feedback: filteredFeedback,
    filters: filters,
    statistics: {
      categoryCounts: categoryCounts,
      statusCounts: statusCounts,
      ratingCounts: ratingCounts,
      averageRating: parseFloat(averageRating),
      fiveStarCount: ratingCounts[5] || 0,
      fourStarCount: ratingCounts[4] || 0,
      threeStarCount: ratingCounts[3] || 0
    },
    availableCategories: ['Feature Request', 'Bug Report', 'General Feedback'],
    availableStatuses: ['pending', 'under_review', 'responded', 'resolved'],
    availableRatings: [1, 2, 3, 4, 5]
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-104 (Admin views feedback submitted by parents)', () => {

  test('Admin views all feedback - able to view feedback submitted by parents', () => {
    const expectedResult = 'Able to view feedback submitted by parents';
    const adminId = 'ADMIN001';

    const result = viewFeedback(adminId);

    console.log('Test Case ID: CASE-104');
    console.log('Test Case Description: Admin views feedback submitted by parents');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Feedback Viewable: ${result.feedbackViewable}`);
    console.log(`Admin ID: ${result.adminId}`);
    console.log(`Total Feedback: ${result.totalFeedback}`);
    console.log(`Displayed Feedback: ${result.displayedFeedback}`);
    console.log(`Statistics:`);
    console.log(`  Average Rating: ${result.statistics.averageRating}`);
    console.log(`  5-Star: ${result.statistics.fiveStarCount}`);
    console.log(`  4-Star: ${result.statistics.fourStarCount}`);
    console.log(`  3-Star: ${result.statistics.threeStarCount}`);

    console.log('Recent Feedback:');
    result.feedback.slice(0, 3).forEach((f, index) => {
      console.log(`  ${index + 1}. [${f.rating}★] ${f.userName} - ${f.category}: "${f.message.substring(0, 40)}..."`);
    });

    if (result.success && result.feedbackViewable && result.feedback.length > 0) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.feedbackViewable).toBe(true);
    expect(result.actualResult).toContain('Able to view feedback');
    expect(result.adminId).toBe('ADMIN001');
    expect(result.totalFeedback).toBe(6);
    expect(result.feedback).toHaveLength(6);
    expect(result.statistics.averageRating).toBeGreaterThan(0);
  });

  test('Filter feedback by category Bug Report - able to view filtered feedback', () => {
    const adminId = 'ADMIN001';
    const filters = { category: 'Bug Report' };

    const result = viewFeedback(adminId, filters);

    console.log('Test Case ID: CASE-104');
    console.log(`Filter: category = "Bug Report"`);
    console.log(`Displayed Feedback: ${result.displayedFeedback}`);

    result.feedback.forEach((f, index) => {
      console.log(`  ${index + 1}. [${f.category}] ${f.userName}: ${f.message.substring(0, 50)}...`);
    });

    if (result.success && result.feedback.every(f => f.category === 'Bug Report')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.displayedFeedback).toBe(2);
    expect(result.feedback.every(f => f.category === 'Bug Report')).toBe(true);
  });

  test('Filter feedback by status pending - able to view filtered feedback', () => {
    const adminId = 'ADMIN001';
    const filters = { status: 'pending' };

    const result = viewFeedback(adminId, filters);

    console.log('Test Case ID: CASE-104');
    console.log(`Filter: status = "pending"`);
    console.log(`Displayed Feedback: ${result.displayedFeedback}`);

    result.feedback.forEach((f, index) => {
      console.log(`  ${index + 1}. [${f.status}] ${f.userName}: ${f.category}`);
    });

    if (result.success && result.feedback.every(f => f.status === 'pending')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.displayedFeedback).toBe(3);
    expect(result.feedback.every(f => f.status === 'pending')).toBe(true);
  });

  test('Filter feedback by 5-star rating - able to view top-rated feedback', () => {
    const adminId = 'ADMIN001';
    const filters = { rating: 5 };

    const result = viewFeedback(adminId, filters);

    console.log('Test Case ID: CASE-104');
    console.log(`Filter: rating = 5`);
    console.log(`Displayed Feedback: ${result.displayedFeedback}`);

    result.feedback.forEach((f, index) => {
      console.log(`  ${index + 1}. [${f.rating}★] ${f.userName}: "${f.message.substring(0, 40)}..."`);
    });

    if (result.success && result.feedback.every(f => f.rating === 5)) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.displayedFeedback).toBe(3);
    expect(result.feedback.every(f => f.rating === 5)).toBe(true);
  });

  test('Filter feedback by userId - able to view specific user feedback', () => {
    const adminId = 'ADMIN001';
    const filters = { userId: 'USER001' };

    const result = viewFeedback(adminId, filters);

    console.log('Test Case ID: CASE-104');
    console.log(`Filter: userId = "USER001"`);
    console.log(`Displayed Feedback: ${result.displayedFeedback}`);

    if (result.feedback.length > 0) {
      console.log(`  User: ${result.feedback[0].userName} (${result.feedback[0].userEmail})`);
      console.log(`  Message: ${result.feedback[0].message}`);
    }

    if (result.success && result.feedback.every(f => f.userId === 'USER001')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.displayedFeedback).toBe(1);
    expect(result.feedback[0].userName).toBe('John Smith');
    expect(result.feedback.every(f => f.userId === 'USER001')).toBe(true);
  });

  test('Feedback contains all required fields', () => {
    const adminId = 'ADMIN001';

    const result = viewFeedback(adminId);
    const firstFeedback = result.feedback[0];

    console.log('Test Case ID: CASE-104');
    console.log('Verifying feedback fields:');
    console.log(`  Feedback ID: ${firstFeedback.feedbackId}`);
    console.log(`  Timestamp: ${firstFeedback.timestamp}`);
    console.log(`  User Name: ${firstFeedback.userName}`);
    console.log(`  User Email: ${firstFeedback.userEmail}`);
    console.log(`  Category: ${firstFeedback.category}`);
    console.log(`  Rating: ${firstFeedback.rating}`);
    console.log(`  Status: ${firstFeedback.status}`);

    if (firstFeedback.feedbackId && firstFeedback.userName && firstFeedback.category && 
        firstFeedback.message && firstFeedback.rating !== undefined) {
      console.log('Outcome: PASSED - All required fields present');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(firstFeedback.feedbackId).toBeDefined();
    expect(firstFeedback.timestamp).toBeDefined();
    expect(firstFeedback.userId).toBeDefined();
    expect(firstFeedback.userName).toBeDefined();
    expect(firstFeedback.userEmail).toBeDefined();
    expect(firstFeedback.category).toBeDefined();
    expect(firstFeedback.message).toBeDefined();
    expect(firstFeedback.rating).toBeGreaterThanOrEqual(1);
    expect(firstFeedback.status).toBeDefined();
  });

  test('Feedback statistics calculated correctly', () => {
    const adminId = 'ADMIN001';

    const result = viewFeedback(adminId);
    const stats = result.statistics;

    console.log('Test Case ID: CASE-104');
    console.log('Feedback Statistics:');
    console.log(`  Category Counts:`, stats.categoryCounts);
    console.log(`  Status Counts:`, stats.statusCounts);
    console.log(`  Rating Counts:`, stats.ratingCounts);
    console.log(`  Average Rating: ${stats.averageRating}`);

    const totalFromCategories = Object.values(stats.categoryCounts).reduce((a, b) => a + b, 0);

    if (stats.averageRating >= 1 && stats.averageRating <= 5 && totalFromCategories === 6) {
      console.log('Outcome: PASSED - Statistics correct');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(stats.categoryCounts['Bug Report']).toBe(2);
    expect(stats.categoryCounts['Feature Request']).toBe(2);
    expect(stats.categoryCounts['General Feedback']).toBe(2);
    expect(stats.statusCounts['pending']).toBe(3);
    expect(stats.averageRating).toBeGreaterThanOrEqual(1);
    expect(stats.averageRating).toBeLessThanOrEqual(5);
  });

  test('Available filters returned', () => {
    const adminId = 'ADMIN001';

    const result = viewFeedback(adminId);

    console.log('Test Case ID: CASE-104');
    console.log(`Available Categories: ${result.availableCategories.join(', ')}`);
    console.log(`Available Statuses: ${result.availableStatuses.join(', ')}`);
    console.log(`Available Ratings: ${result.availableRatings.join(', ')}`);

    if (result.availableCategories.length >= 3 && result.availableStatuses.length >= 4) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.availableCategories).toContain('Bug Report');
    expect(result.availableCategories).toContain('Feature Request');
    expect(result.availableCategories).toContain('General Feedback');
    expect(result.availableStatuses).toContain('pending');
    expect(result.availableStatuses).toContain('under_review');
    expect(result.availableStatuses).toContain('responded');
    expect(result.availableRatings).toContain(5);
    expect(result.availableRatings).toContain(1);
  });

  test('Without admin authentication - unable to view feedback (negative test)', () => {
    const adminId = '';

    const result = viewFeedback(adminId);

    console.log('Test Case ID: CASE-104');
    console.log('Expected Result: Able to view feedback submitted by parents (for authorized admins)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.feedbackViewable) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.feedbackViewable).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('With non-admin account - unable to view feedback (negative test)', () => {
    const adminId = 'USER001'; // Regular user

    const result = viewFeedback(adminId);

    console.log('Test Case ID: CASE-104');
    console.log(`User ID: ${adminId} (not an admin)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.feedbackViewable) {
      console.log('Outcome: PASSED - Correctly rejected non-admin user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.feedbackViewable).toBe(false);
    expect(result.errorMessage).toContain('permission');
  });

  test('With learner account - unable to view feedback (negative test)', () => {
    const adminId = 'LEARNER001';

    const result = viewFeedback(adminId);

    console.log('Test Case ID: CASE-104');
    console.log(`User ID: ${adminId} (learner account)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.feedbackViewable) {
      console.log('Outcome: PASSED - Correctly rejected learner account');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.feedbackViewable).toBe(false);
    expect(result.errorMessage).toContain('permission');
  });

});
