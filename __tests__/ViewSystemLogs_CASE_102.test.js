// ─── Test Case CASE-102 ──────────────────────────────────────────────────────
// Test Case ID: CASE-102
// Test Case Description: Admin views system logs
// Expected Result: Able to view system logs

// Mock system logs data
const SYSTEM_LOGS = {
  totalLogs: 8,
  logs: [
    {
      logId: 'LOG001',
      timestamp: '2024-04-13T10:30:00Z',
      level: 'INFO',
      category: 'USER',
      action: 'USER_LOGIN',
      userId: 'USER001',
      userRole: 'parent',
      details: 'User logged in successfully',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0'
    },
    {
      logId: 'LOG002',
      timestamp: '2024-04-13T10:35:00Z',
      level: 'INFO',
      category: 'ACTIVITY',
      action: 'ACTIVITY_COMPLETE',
      userId: 'LEARNER001',
      userRole: 'learner',
      details: 'Completed phonics activity with 95% accuracy',
      activityId: 'ACT001',
      score: 95
    },
    {
      logId: 'LOG003',
      timestamp: '2024-04-13T11:00:00Z',
      level: 'WARN',
      category: 'SECURITY',
      action: 'FAILED_LOGIN_ATTEMPT',
      userId: 'USER002',
      userRole: 'parent',
      details: 'Multiple failed login attempts detected',
      ipAddress: '192.168.1.105',
      attemptCount: 3
    },
    {
      logId: 'LOG004',
      timestamp: '2024-04-13T11:15:00Z',
      level: 'INFO',
      category: 'CONTENT',
      action: 'CONTENT_VIEW',
      userId: 'LEARNER001',
      userRole: 'learner',
      details: 'Viewed phonics lesson: Letter A',
      contentId: 'CONTENT001'
    },
    {
      logId: 'LOG005',
      timestamp: '2024-04-13T12:00:00Z',
      level: 'ERROR',
      category: 'SYSTEM',
      action: 'DATABASE_ERROR',
      details: 'Database connection timeout',
      errorCode: 'DB_TIMEOUT_001'
    },
    {
      logId: 'LOG006',
      timestamp: '2024-04-13T12:30:00Z',
      level: 'INFO',
      category: 'ADMIN',
      action: 'USER_CREATED',
      userId: 'ADMIN001',
      userRole: 'admin',
      details: 'Created new user: john.doe@example.com',
      targetUserId: 'USER010'
    },
    {
      logId: 'LOG007',
      timestamp: '2024-04-13T13:00:00Z',
      level: 'INFO',
      category: 'SETTINGS',
      action: 'PROFILE_UPDATE',
      userId: 'USER001',
      userRole: 'parent',
      details: 'Updated profile settings'
    },
    {
      logId: 'LOG008',
      timestamp: '2024-04-13T13:30:00Z',
      level: 'DEBUG',
      category: 'PERFORMANCE',
      action: 'PAGE_LOAD',
      details: 'Dashboard page loaded in 1.2s',
      loadTime: 1200
    }
  ]
};

function viewSystemLogs(adminId, filters = {}) {
  // Check if admin is authenticated
  if (!adminId || adminId.trim() === '') {
    return {
      success: false,
      actualResult: 'Unable to view system logs - Admin not authenticated',
      logsViewable: false,
      errorMessage: 'Please log in as admin to view system logs'
    };
  }

  // Check if admin has privileges
  if (!adminId.startsWith('ADMIN')) {
    return {
      success: false,
      actualResult: 'Unable to view system logs - Insufficient privileges',
      logsViewable: false,
      errorMessage: 'You do not have permission to view system logs'
    };
  }

  let filteredLogs = [...SYSTEM_LOGS.logs];

  // Apply filters if provided
  if (filters.level) {
    filteredLogs = filteredLogs.filter(log => log.level === filters.level);
  }
  if (filters.category) {
    filteredLogs = filteredLogs.filter(log => log.category === filters.category);
  }
  if (filters.userId) {
    filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
  }
  if (filters.startDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
  }
  if (filters.endDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
  }

  // Calculate statistics
  const levelCounts = {};
  const categoryCounts = {};
  SYSTEM_LOGS.logs.forEach(log => {
    levelCounts[log.level] = (levelCounts[log.level] || 0) + 1;
    categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;
  });

  return {
    success: true,
    actualResult: 'Able to view system logs',
    logsViewable: true,
    adminId: adminId,
    totalLogs: SYSTEM_LOGS.totalLogs,
    displayedLogs: filteredLogs.length,
    logs: filteredLogs,
    filters: filters,
    statistics: {
      levelCounts: levelCounts,
      categoryCounts: categoryCounts,
      infoCount: levelCounts['INFO'] || 0,
      warnCount: levelCounts['WARN'] || 0,
      errorCount: levelCounts['ERROR'] || 0,
      debugCount: levelCounts['DEBUG'] || 0
    },
    availableLevels: ['INFO', 'WARN', 'ERROR', 'DEBUG'],
    availableCategories: ['USER', 'ACTIVITY', 'SECURITY', 'CONTENT', 'SYSTEM', 'ADMIN', 'SETTINGS', 'PERFORMANCE']
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-102 (Admin views system logs)', () => {

  test('Admin views all system logs - able to view system logs', () => {
    const expectedResult = 'Able to view system logs';
    const adminId = 'ADMIN001';

    const result = viewSystemLogs(adminId);

    console.log('Test Case ID: CASE-102');
    console.log('Test Case Description: Admin views system logs');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Logs Viewable: ${result.logsViewable}`);
    console.log(`Admin ID: ${result.adminId}`);
    console.log(`Total Logs: ${result.totalLogs}`);
    console.log(`Displayed Logs: ${result.displayedLogs}`);
    console.log(`Statistics:`);
    console.log(`  INFO: ${result.statistics.infoCount}`);
    console.log(`  WARN: ${result.statistics.warnCount}`);
    console.log(`  ERROR: ${result.statistics.errorCount}`);
    console.log(`  DEBUG: ${result.statistics.debugCount}`);

    console.log('Recent Logs:');
    result.logs.slice(0, 3).forEach((log, index) => {
      console.log(`  ${index + 1}. [${log.level}] ${log.category} - ${log.action} (${log.timestamp})`);
    });

    if (result.success && result.logsViewable && result.logs.length > 0) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.logsViewable).toBe(true);
    expect(result.actualResult).toContain('Able to view');
    expect(result.adminId).toBe('ADMIN001');
    expect(result.totalLogs).toBe(8);
    expect(result.logs).toHaveLength(8);
    expect(result.statistics.infoCount).toBe(5);
    expect(result.statistics.warnCount).toBe(1);
    expect(result.statistics.errorCount).toBe(1);
    expect(result.statistics.debugCount).toBe(1);
  });

  test('Filter logs by level ERROR - able to view filtered system logs', () => {
    const adminId = 'ADMIN001';
    const filters = { level: 'ERROR' };

    const result = viewSystemLogs(adminId, filters);

    console.log('Test Case ID: CASE-102');
    console.log(`Filter: level = "ERROR"`);
    console.log(`Displayed Logs: ${result.displayedLogs}`);

    result.logs.forEach((log, index) => {
      console.log(`  ${index + 1}. [${log.level}] ${log.action} - ${log.details}`);
    });

    if (result.success && result.logs.every(log => log.level === 'ERROR')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.displayedLogs).toBe(1);
    expect(result.logs[0].level).toBe('ERROR');
    expect(result.logs[0].action).toBe('DATABASE_ERROR');
  });

  test('Filter logs by category SECURITY - able to view filtered system logs', () => {
    const adminId = 'ADMIN001';
    const filters = { category: 'SECURITY' };

    const result = viewSystemLogs(adminId, filters);

    console.log('Test Case ID: CASE-102');
    console.log(`Filter: category = "SECURITY"`);
    console.log(`Displayed Logs: ${result.displayedLogs}`);

    result.logs.forEach((log, index) => {
      console.log(`  ${index + 1}. [${log.category}] ${log.action} - ${log.details}`);
    });

    if (result.success && result.logs.every(log => log.category === 'SECURITY')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.displayedLogs).toBe(1);
    expect(result.logs[0].category).toBe('SECURITY');
    expect(result.logs[0].action).toBe('FAILED_LOGIN_ATTEMPT');
  });

  test('Filter logs by userId - able to view user-specific logs', () => {
    const adminId = 'ADMIN001';
    const filters = { userId: 'LEARNER001' };

    const result = viewSystemLogs(adminId, filters);

    console.log('Test Case ID: CASE-102');
    console.log(`Filter: userId = "LEARNER001"`);
    console.log(`Displayed Logs: ${result.displayedLogs}`);

    result.logs.forEach((log, index) => {
      console.log(`  ${index + 1}. User: ${log.userId} - ${log.action}`);
    });

    if (result.success && result.logs.every(log => log.userId === 'LEARNER001')) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.displayedLogs).toBe(2);
    expect(result.logs.every(log => log.userId === 'LEARNER001')).toBe(true);
  });

  test('Logs contain all required fields', () => {
    const adminId = 'ADMIN001';

    const result = viewSystemLogs(adminId);
    const firstLog = result.logs[0];

    console.log('Test Case ID: CASE-102');
    console.log('Verifying log fields:');
    console.log(`  Log ID: ${firstLog.logId}`);
    console.log(`  Timestamp: ${firstLog.timestamp}`);
    console.log(`  Level: ${firstLog.level}`);
    console.log(`  Category: ${firstLog.category}`);
    console.log(`  Action: ${firstLog.action}`);
    console.log(`  Details: ${firstLog.details}`);

    if (firstLog.logId && firstLog.timestamp && firstLog.level && firstLog.category && firstLog.action) {
      console.log('Outcome: PASSED - All required fields present');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(firstLog.logId).toBeDefined();
    expect(firstLog.timestamp).toBeDefined();
    expect(firstLog.level).toBeDefined();
    expect(firstLog.category).toBeDefined();
    expect(firstLog.action).toBeDefined();
    expect(firstLog.details).toBeDefined();
  });

  test('Log statistics calculated correctly', () => {
    const adminId = 'ADMIN001';

    const result = viewSystemLogs(adminId);
    const stats = result.statistics;

    console.log('Test Case ID: CASE-102');
    console.log('Log Statistics:');
    console.log(`  Level Counts:`, stats.levelCounts);
    console.log(`  Category Counts:`, stats.categoryCounts);
    console.log(`  Total (INFO+WARN+ERROR+DEBUG): ${stats.infoCount + stats.warnCount + stats.errorCount + stats.debugCount}`);

    const totalFromLevels = stats.infoCount + stats.warnCount + stats.errorCount + stats.debugCount;

    if (totalFromLevels === result.totalLogs) {
      console.log('Outcome: PASSED - Statistics correct');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(stats.levelCounts['INFO']).toBe(5);
    expect(stats.levelCounts['WARN']).toBe(1);
    expect(stats.levelCounts['ERROR']).toBe(1);
    expect(stats.levelCounts['DEBUG']).toBe(1);
    expect(totalFromLevels).toBe(8);
  });

  test('Available filters returned', () => {
    const adminId = 'ADMIN001';

    const result = viewSystemLogs(adminId);

    console.log('Test Case ID: CASE-102');
    console.log(`Available Levels: ${result.availableLevels.join(', ')}`);
    console.log(`Available Categories: ${result.availableCategories.join(', ')}`);

    if (result.availableLevels.length >= 4 && result.availableCategories.length >= 8) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.availableLevels).toContain('INFO');
    expect(result.availableLevels).toContain('WARN');
    expect(result.availableLevels).toContain('ERROR');
    expect(result.availableLevels).toContain('DEBUG');
    expect(result.availableCategories).toContain('USER');
    expect(result.availableCategories).toContain('ACTIVITY');
    expect(result.availableCategories).toContain('SECURITY');
    expect(result.availableCategories).toContain('SYSTEM');
    expect(result.availableCategories).toContain('ADMIN');
  });

  test('Without admin authentication - unable to view system logs (negative test)', () => {
    const adminId = '';

    const result = viewSystemLogs(adminId);

    console.log('Test Case ID: CASE-102');
    console.log('Expected Result: Able to view system logs (for authorized admins)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.logsViewable) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.logsViewable).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('With non-admin account - unable to view system logs (negative test)', () => {
    const adminId = 'USER001'; // Regular user

    const result = viewSystemLogs(adminId);

    console.log('Test Case ID: CASE-102');
    console.log(`User ID: ${adminId} (not an admin)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.logsViewable) {
      console.log('Outcome: PASSED - Correctly rejected non-admin user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.logsViewable).toBe(false);
    expect(result.errorMessage).toContain('permission');
  });

  test('With learner account - unable to view system logs (negative test)', () => {
    const adminId = 'LEARNER001';

    const result = viewSystemLogs(adminId);

    console.log('Test Case ID: CASE-102');
    console.log(`User ID: ${adminId} (learner account)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.logsViewable) {
      console.log('Outcome: PASSED - Correctly rejected learner account');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.logsViewable).toBe(false);
    expect(result.errorMessage).toContain('permission');
  });

});
