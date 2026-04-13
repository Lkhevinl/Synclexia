// ─── Test Case CASE-103 ──────────────────────────────────────────────────────
// Test Case ID: CASE-103
// Test Case Description: Admin adds a maintenance log entry
// Expected Result: Maintenance log is added successfully

// Mock maintenance logs data
let maintenanceLogsData = {
  logs: [
    { logId: 'MAINT001', timestamp: '2024-04-01T10:00:00Z', adminId: 'ADMIN001', type: 'BACKUP', description: 'Database backup completed', status: 'completed', duration: 30 },
    { logId: 'MAINT002', timestamp: '2024-04-05T14:00:00Z', adminId: 'ADMIN002', type: 'UPDATE', description: 'System update to v2.1.0', status: 'completed', duration: 45 }
  ],
  totalLogs: 2
};

const VALID_MAINTENANCE_TYPES = ['BACKUP', 'UPDATE', 'PATCH', 'CLEANUP', 'SECURITY_SCAN', 'OPTIMIZATION', 'RESTART'];

function addMaintenanceLog(adminId, logData) {
  // Check if admin is authenticated
  if (!adminId || adminId.trim() === '') {
    return {
      success: false,
      actualResult: 'Maintenance log not added - Admin not authenticated',
      logAdded: false,
      errorMessage: 'Please log in as admin to add maintenance logs'
    };
  }

  // Check if admin has privileges
  if (!adminId.startsWith('ADMIN')) {
    return {
      success: false,
      actualResult: 'Maintenance log not added - Insufficient privileges',
      logAdded: false,
      errorMessage: 'You do not have permission to add maintenance logs'
    };
  }

  // Check for missing required fields
  const requiredFields = ['type', 'description'];
  const missingFields = [];

  for (const field of requiredFields) {
    if (!logData[field] || logData[field].trim() === '') {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return {
      success: false,
      actualResult: 'Maintenance log not added - Missing required fields',
      logAdded: false,
      errorMessage: `Required field(s) missing: ${missingFields.join(', ')}`
    };
  }

  // Validate maintenance type
  const normalizedType = logData.type.toUpperCase();
  if (!VALID_MAINTENANCE_TYPES.includes(normalizedType)) {
    return {
      success: false,
      actualResult: 'Maintenance log not added - Invalid maintenance type',
      logAdded: false,
      errorMessage: 'Invalid maintenance type',
      validTypes: VALID_MAINTENANCE_TYPES
    };
  }

  // Validate description length
  if (logData.description.length < 5) {
    return {
      success: false,
      actualResult: 'Maintenance log not added - Description too short',
      logAdded: false,
      errorMessage: 'Description must be at least 5 characters'
    };
  }

  // Generate new log ID
  const newLogId = `MAINT${String(maintenanceLogsData.logs.length + 1).padStart(3, '0')}`;
  const timestamp = new Date().toISOString();

  // Create new maintenance log
  const newLog = {
    logId: newLogId,
    timestamp: timestamp,
    adminId: adminId,
    type: normalizedType,
    description: logData.description,
    status: logData.status || 'pending',
    duration: logData.duration || null,
    notes: logData.notes || ''
  };

  // Add log to database
  maintenanceLogsData.logs.push(newLog);
  maintenanceLogsData.totalLogs++;

  return {
    success: true,
    actualResult: 'Maintenance log is added successfully',
    logAdded: true,
    logId: newLogId,
    log: newLog,
    totalLogs: maintenanceLogsData.totalLogs,
    message: `Maintenance log ${newLogId} has been added successfully`
  };
}

// Reset state before each test
function resetMaintenanceLogsData() {
  maintenanceLogsData = {
    logs: [
      { logId: 'MAINT001', timestamp: '2024-04-01T10:00:00Z', adminId: 'ADMIN001', type: 'BACKUP', description: 'Database backup completed', status: 'completed', duration: 30 },
      { logId: 'MAINT002', timestamp: '2024-04-05T14:00:00Z', adminId: 'ADMIN002', type: 'UPDATE', description: 'System update to v2.1.0', status: 'completed', duration: 45 }
    ],
    totalLogs: 2
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-103 (Admin adds a maintenance log entry)', () => {

  beforeEach(() => {
    resetMaintenanceLogsData();
  });

  test('Add backup maintenance log - maintenance log is added successfully', () => {
    const expectedResult = 'Maintenance log is added successfully';
    const adminId = 'ADMIN001';
    const logData = {
      type: 'BACKUP',
      description: 'Weekly database backup completed successfully',
      status: 'completed',
      duration: 25
    };

    const result = addMaintenanceLog(adminId, logData);

    console.log('Test Case ID: CASE-103');
    console.log('Test Case Description: Admin adds a maintenance log entry');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Log Added: ${result.logAdded}`);
    console.log(`Log ID: ${result.logId}`);
    console.log(`Type: ${result.log.type}`);
    console.log(`Description: ${result.log.description}`);
    console.log(`Status: ${result.log.status}`);
    console.log(`Duration: ${result.log.duration} minutes`);
    console.log(`Total Logs: ${result.totalLogs}`);
    console.log(`Message: ${result.message}`);

    if (result.success && result.logAdded && result.logId) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.logAdded).toBe(true);
    expect(result.actualResult).toContain('added successfully');
    expect(result.logId).toBe('MAINT003');
    expect(result.log.type).toBe('BACKUP');
    expect(result.log.description).toBe('Weekly database backup completed successfully');
    expect(result.log.status).toBe('completed');
    expect(result.log.duration).toBe(25);
    expect(result.log.adminId).toBe('ADMIN001');
    expect(result.totalLogs).toBe(3);
  });

  test('Add security scan log - maintenance log is added successfully', () => {
    const adminId = 'ADMIN002';
    const logData = {
      type: 'SECURITY_SCAN',
      description: 'Monthly security vulnerability scan performed',
      status: 'completed',
      duration: 60
    };

    const result = addMaintenanceLog(adminId, logData);

    console.log('Test Case ID: CASE-103');
    console.log(`Type: ${result.log.type}`);
    console.log(`Admin ID: ${result.log.adminId}`);

    if (result.success && result.logAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.logAdded).toBe(true);
    expect(result.log.type).toBe('SECURITY_SCAN');
    expect(result.log.adminId).toBe('ADMIN002');
  });

  test('Add optimization log - maintenance log is added successfully', () => {
    const adminId = 'ADMIN001';
    const logData = {
      type: 'OPTIMIZATION',
      description: 'Database query optimization performed on user tables',
      status: 'completed',
      duration: 15
    };

    const result = addMaintenanceLog(adminId, logData);

    console.log('Test Case ID: CASE-103');
    console.log(`Type: ${result.log.type}`);
    console.log(`Description: ${result.log.description}`);

    if (result.success && result.logAdded) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.logAdded).toBe(true);
    expect(result.log.type).toBe('OPTIMIZATION');
  });

  test('Add pending patch log - maintenance log is added successfully', () => {
    const adminId = 'ADMIN001';
    const logData = {
      type: 'PATCH',
      description: 'Security patch scheduled for next maintenance window',
      status: 'pending',
      notes: 'To be completed during off-peak hours'
    };

    const result = addMaintenanceLog(adminId, logData);

    console.log('Test Case ID: CASE-103');
    console.log(`Type: ${result.log.type}`);
    console.log(`Status: ${result.log.status}`);
    console.log(`Notes: ${result.log.notes}`);

    if (result.success && result.logAdded && result.log.status === 'pending') {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.logAdded).toBe(true);
    expect(result.log.type).toBe('PATCH');
    expect(result.log.status).toBe('pending');
    expect(result.log.notes).toBe('To be completed during off-peak hours');
  });

  test('Multiple maintenance logs added - log IDs increment correctly', () => {
    const adminId = 'ADMIN001';

    // First log
    const result1 = addMaintenanceLog(adminId, {
      type: 'CLEANUP',
      description: 'Temporary files cleanup completed'
    });
    expect(result1.logId).toBe('MAINT003');

    // Second log
    const result2 = addMaintenanceLog(adminId, {
      type: 'RESTART',
      description: 'Application server restarted'
    });

    console.log('Test Case ID: CASE-103');
    console.log('Test: Multiple maintenance logs added');
    console.log(`First Log ID: ${result1.logId}`);
    console.log(`Second Log ID: ${result2.logId}`);
    console.log(`Total Logs: ${maintenanceLogsData.totalLogs}`);

    if (result2.success && result2.logId === 'MAINT004' && maintenanceLogsData.totalLogs === 4) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result2.logId).toBe('MAINT004');
    expect(maintenanceLogsData.totalLogs).toBe(4);
  });

  test('Log data persisted correctly after creation', () => {
    const adminId = 'ADMIN001';
    const logData = {
      type: 'UPDATE',
      description: 'System libraries updated to latest versions',
      status: 'completed',
      duration: 20
    };

    const result = addMaintenanceLog(adminId, logData);

    console.log('Test Case ID: CASE-103');
    console.log('Verifying log data persisted:');

    const persistedLog = maintenanceLogsData.logs.find(l => l.logId === result.logId);

    console.log(`  Log ID: ${persistedLog.logId}`);
    console.log(`  Type: ${persistedLog.type}`);
    console.log(`  Description: ${persistedLog.description}`);
    console.log(`  Admin ID: ${persistedLog.adminId}`);
    console.log(`  Timestamp: ${persistedLog.timestamp}`);

    if (persistedLog && persistedLog.type === 'UPDATE' && persistedLog.adminId === 'ADMIN001') {
      console.log('Outcome: PASSED - Log data persisted correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(persistedLog).toBeDefined();
    expect(persistedLog.type).toBe('UPDATE');
    expect(persistedLog.description).toBe('System libraries updated to latest versions');
    expect(persistedLog.adminId).toBe('ADMIN001');
    expect(persistedLog.timestamp).toBeDefined();
  });

  test('Missing description - log not added (negative test)', () => {
    const adminId = 'ADMIN001';
    const logData = {
      type: 'BACKUP',
      description: ''
    };

    const result = addMaintenanceLog(adminId, logData);

    console.log('Test Case ID: CASE-103');
    console.log('Test Case Description: Admin adds a maintenance log entry');
    console.log('Expected Result: Maintenance log is added successfully (for valid entries)');
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.logAdded) {
      console.log('Outcome: PASSED - Correctly rejected missing description');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.logAdded).toBe(false);
    expect(result.errorMessage).toContain('description');
  });

  test('Invalid maintenance type - log not added (negative test)', () => {
    const adminId = 'ADMIN001';
    const logData = {
      type: 'INVALID_TYPE',
      description: 'Some maintenance task'
    };

    const result = addMaintenanceLog(adminId, logData);

    console.log('Test Case ID: CASE-103');
    console.log(`Type: "${logData.type}" (invalid)`);
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Valid Types: ${result.validTypes ? result.validTypes.join(', ') : 'none'}`);

    if (!result.success && !result.logAdded) {
      console.log('Outcome: PASSED - Correctly rejected invalid type');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.logAdded).toBe(false);
    expect(result.errorMessage).toContain('Invalid maintenance type');
    expect(result.validTypes).toContain('BACKUP');
    expect(result.validTypes).toContain('UPDATE');
    expect(result.validTypes).toContain('SECURITY_SCAN');
  });

  test('Description too short - log not added (negative test)', () => {
    const adminId = 'ADMIN001';
    const logData = {
      type: 'BACKUP',
      description: 'Done'
    };

    const result = addMaintenanceLog(adminId, logData);

    console.log('Test Case ID: CASE-103');
    console.log(`Description: "${logData.description}" (too short)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.logAdded) {
      console.log('Outcome: PASSED - Correctly rejected short description');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.logAdded).toBe(false);
    expect(result.errorMessage).toContain('at least 5 characters');
  });

  test('Without admin authentication - log not added (negative test)', () => {
    const adminId = '';
    const logData = {
      type: 'BACKUP',
      description: 'Database backup completed'
    };

    const result = addMaintenanceLog(adminId, logData);

    console.log('Test Case ID: CASE-103');
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.logAdded) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated admin');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.logAdded).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('With non-admin account - log not added (negative test)', () => {
    const adminId = 'USER001';
    const logData = {
      type: 'BACKUP',
      description: 'Database backup completed'
    };

    const result = addMaintenanceLog(adminId, logData);

    console.log('Test Case ID: CASE-103');
    console.log(`User ID: ${adminId} (not an admin)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.logAdded) {
      console.log('Outcome: PASSED - Correctly rejected non-admin user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.logAdded).toBe(false);
    expect(result.errorMessage).toContain('permission');
  });

});
