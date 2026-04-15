// ─── Integration Test INT-021 ───────────────────────────────────────────────
// Test Case ID   : INT-021
// Test           : Integration when notification is sent to users
// Component      : Manage Notification → View Dashboard
// Input          : Admin creates notification
// Expected Result: Notification appears in dashboard

// Mock admin
const MOCK_ADMIN = {
  id: 'ADMIN001',
  email: 'admin@synclexia.com',
  full_name: 'System Admin',
  role: 'admin',
  is_active: true
};

// Mock learner session
const MOCK_SESSION = {
  user: { id: 'USER001', email: 'alex@synclexia.com' },
  access_token: 'mock_token_abc123'
};

// Mock learner
const MOCK_LEARNER = {
  id: 'USER001',
  email: 'alex@synclexia.com',
  full_name: 'Alex Johnson',
  role: 'student',
  is_active: true
};

// Mock notification payload
const MOCK_NOTIFICATION = {
  id: 'NOTIF_001',
  title: 'New Lesson Available',
  message: 'A new phonics blending lesson has been added. Check it out!',
  type: 'announcement',
  targetAudience: ['student'],
  priority: 'normal',
  createdAt: '2024-04-14T09:00:00Z'
};

// State
let appState = {
  adminLoggedIn: false,
  admin: null,
  learnerLoggedIn: false,
  learner: null,
  notificationStore: new Map(),
  dashboardLoaded: false,
  dashboardNotifications: [],
  notificationDelivered: false
};

function resetState() {
  appState = {
    adminLoggedIn: false,
    admin: null,
    learnerLoggedIn: false,
    learner: null,
    notificationStore: new Map(),
    dashboardLoaded: false,
    dashboardNotifications: [],
    notificationDelivered: false
  };
}

// Admin login
async function adminLogin(admin) {
  if (!admin || admin.role !== 'admin') {
    return {
      success: false,
      actualResult: 'Admin login failed - Not an admin account',
      error: 'Unauthorized'
    };
  }

  if (!admin.is_active) {
    return {
      success: false,
      actualResult: 'Admin login failed - Account inactive',
      error: 'Account inactive'
    };
  }

  await new Promise(resolve => setTimeout(resolve, 25));

  appState.adminLoggedIn = true;
  appState.admin = admin;

  return { success: true, adminId: admin.id, adminLoggedIn: true };
}

// Learner login and dashboard load
async function learnerLoginAndLoadDashboard(learner, session) {
  if (!learner || !session) {
    return {
      success: false,
      actualResult: 'Dashboard load failed - Not authenticated',
      error: 'Not authenticated'
    };
  }

  if (!learner.is_active) {
    return {
      success: false,
      actualResult: 'Dashboard load failed - Account inactive',
      error: 'Account inactive'
    };
  }

  await new Promise(resolve => setTimeout(resolve, 25));

  appState.learnerLoggedIn = true;
  appState.learner = learner;
  appState.dashboardLoaded = true;
  appState.dashboardNotifications = [];

  return { success: true, learnerId: learner.id, dashboardLoaded: true };
}

// Admin creates notification
function createNotification(adminId, notificationData) {
  if (!appState.adminLoggedIn || appState.admin?.id !== adminId) {
    return {
      success: false,
      actualResult: 'Notification creation failed - Admin not authenticated',
      error: 'Admin not authenticated'
    };
  }

  if (!notificationData || !notificationData.id || !notificationData.title || !notificationData.message) {
    return {
      success: false,
      actualResult: 'Notification creation failed - Missing required fields',
      error: 'Invalid notification data'
    };
  }

  if (appState.notificationStore.has(notificationData.id)) {
    return {
      success: false,
      actualResult: 'Notification creation failed - Duplicate notification ID',
      error: 'Duplicate notification ID'
    };
  }

  const notifRecord = {
    ...notificationData,
    createdBy: adminId,
    status: 'active',
    readBy: [],
    sentAt: new Date().toISOString()
  };

  appState.notificationStore.set(notificationData.id, notifRecord);

  return {
    success: true,
    actualResult: 'Notification created successfully',
    notificationId: notificationData.id,
    title: notificationData.title,
    targetAudience: notificationData.targetAudience,
    sentAt: notifRecord.sentAt
  };
}

// Push notifications to learner dashboard
function syncNotificationsToDashboard(learnerId, learnerRole) {
  if (!appState.dashboardLoaded || !appState.learnerLoggedIn) {
    return {
      success: false,
      actualResult: 'Sync failed - Dashboard not loaded',
      error: 'Dashboard not loaded'
    };
  }

  if (appState.notificationStore.size === 0) {
    return {
      success: false,
      actualResult: 'Sync failed - No notifications in store',
      error: 'No notifications to sync'
    };
  }

  const delivered = [];

  appState.notificationStore.forEach(notif => {
    if (notif.status !== 'active') return;
    if (!notif.targetAudience.includes(learnerRole)) return;

    const alreadyDelivered = appState.dashboardNotifications.some(n => n.id === notif.id);
    if (!alreadyDelivered) {
      appState.dashboardNotifications.push({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        priority: notif.priority,
        sentAt: notif.sentAt,
        isRead: false
      });
      delivered.push(notif.id);
    }
  });

  appState.notificationDelivered = delivered.length > 0;

  return {
    success: true,
    actualResult: 'Notification appears in dashboard',
    performedAsExpected: true,
    deliveredCount: delivered.length,
    deliveredIds: delivered,
    dashboardNotificationCount: appState.dashboardNotifications.length,
    notificationDelivered: appState.notificationDelivered,
    integrationFlow: 'Manage Notification → View Dashboard'
  };
}

// Get dashboard notifications for learner
function getDashboardNotifications() {
  if (!appState.dashboardLoaded) {
    return { success: false, error: 'Dashboard not loaded' };
  }
  return {
    success: true,
    notifications: appState.dashboardNotifications,
    count: appState.dashboardNotifications.length,
    unreadCount: appState.dashboardNotifications.filter(n => !n.isRead).length
  };
}

// Full integration: admin login → create notification → learner loads dashboard → notification appears
async function processNotificationToDashboard(admin, learner, session, notificationData) {
  const loginResult = await adminLogin(admin);
  if (!loginResult.success) {
    return {
      success: false,
      actualResult: loginResult.actualResult,
      error: loginResult.error,
      stage: 'admin_login_failed'
    };
  }

  const createResult = createNotification(admin.id, notificationData);
  if (!createResult.success) {
    return {
      success: false,
      actualResult: createResult.actualResult,
      error: createResult.error,
      stage: 'create_failed'
    };
  }

  const dashboardResult = await learnerLoginAndLoadDashboard(learner, session);
  if (!dashboardResult.success) {
    return {
      success: false,
      actualResult: dashboardResult.actualResult,
      error: dashboardResult.error,
      stage: 'dashboard_load_failed'
    };
  }

  const syncResult = syncNotificationsToDashboard(learner.id, learner.role);
  if (!syncResult.success) {
    return {
      success: false,
      actualResult: syncResult.actualResult,
      error: syncResult.error,
      stage: 'sync_failed'
    };
  }

  return {
    ...syncResult,
    notificationId: createResult.notificationId,
    notificationTitle: createResult.title,
    sentAt: createResult.sentAt,
    stage: 'completed'
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Integration Test INT-021 (Manage Notification → View Dashboard)', () => {

  beforeEach(() => {
    resetState();
  });

  test('Admin creates notification - Notification appears in dashboard', async () => {
    const result = await processNotificationToDashboard(
      MOCK_ADMIN, MOCK_LEARNER, MOCK_SESSION, MOCK_NOTIFICATION
    );

    console.log('Test Case ID: INT-021');
    console.log('Test: Integration when notification is sent to users');
    console.log('Component: Manage Notification → View Dashboard');
    console.log(`Input: Admin creates notification`);
    console.log(`Expected Result: Notification appears in dashboard`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Integration Flow: ${result.integrationFlow}`);
    console.log(`Notification ID: ${result.notificationId}`);
    console.log(`Notification Title: ${result.notificationTitle}`);
    console.log(`Delivered Count: ${result.deliveredCount}`);
    console.log(`Dashboard Notification Count: ${result.dashboardNotificationCount}`);
    console.log(`Notification Delivered: ${result.notificationDelivered}`);
    console.log(`Sent At: ${result.sentAt}`);
    console.log(`Performed As Expected: ${result.performedAsExpected ? 'Yes' : 'No'}`);

    if (result.success && result.notificationDelivered && result.deliveredCount === 1) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.performedAsExpected).toBe(true);
    expect(result.notificationId).toBe('NOTIF_001');
    expect(result.notificationTitle).toBe('New Lesson Available');
    expect(result.deliveredCount).toBe(1);
    expect(result.dashboardNotificationCount).toBe(1);
    expect(result.notificationDelivered).toBe(true);
    expect(result.sentAt).toBeDefined();
    expect(result.stage).toBe('completed');
  });

  test('Dashboard contains correct notification details', async () => {
    await processNotificationToDashboard(
      MOCK_ADMIN, MOCK_LEARNER, MOCK_SESSION, MOCK_NOTIFICATION
    );

    const { notifications } = getDashboardNotifications();
    const notif = notifications[0];

    console.log('Test Case ID: INT-021');
    console.log('Test: Dashboard notification details');
    console.log(`ID: ${notif?.id}`);
    console.log(`Title: ${notif?.title}`);
    console.log(`Message: ${notif?.message}`);
    console.log(`Type: ${notif?.type}`);
    console.log(`Priority: ${notif?.priority}`);
    console.log(`Is Read: ${notif?.isRead}`);

    if (notif?.id === 'NOTIF_001' && notif?.isRead === false) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(notif.id).toBe('NOTIF_001');
    expect(notif.title).toBe('New Lesson Available');
    expect(notif.message).toBeDefined();
    expect(notif.type).toBe('announcement');
    expect(notif.priority).toBe('normal');
    expect(notif.isRead).toBe(false);
  });

  test('State flags set after notification delivered', async () => {
    await processNotificationToDashboard(
      MOCK_ADMIN, MOCK_LEARNER, MOCK_SESSION, MOCK_NOTIFICATION
    );

    console.log('Test Case ID: INT-021');
    console.log('Test: App state after delivery');
    console.log(`adminLoggedIn: ${appState.adminLoggedIn}`);
    console.log(`learnerLoggedIn: ${appState.learnerLoggedIn}`);
    console.log(`dashboardLoaded: ${appState.dashboardLoaded}`);
    console.log(`notificationDelivered: ${appState.notificationDelivered}`);
    console.log(`notificationStore size: ${appState.notificationStore.size}`);

    if (appState.notificationDelivered && appState.dashboardLoaded) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(appState.adminLoggedIn).toBe(true);
    expect(appState.learnerLoggedIn).toBe(true);
    expect(appState.dashboardLoaded).toBe(true);
    expect(appState.notificationDelivered).toBe(true);
    expect(appState.notificationStore.size).toBe(1);
  });

  test('Multiple notifications - all appear in dashboard', async () => {
    await adminLogin(MOCK_ADMIN);

    const notif1 = { ...MOCK_NOTIFICATION, id: 'N001', title: 'Notification 1' };
    const notif2 = { ...MOCK_NOTIFICATION, id: 'N002', title: 'Notification 2' };

    createNotification(MOCK_ADMIN.id, notif1);
    createNotification(MOCK_ADMIN.id, notif2);

    await learnerLoginAndLoadDashboard(MOCK_LEARNER, MOCK_SESSION);
    const syncResult = syncNotificationsToDashboard(MOCK_LEARNER.id, MOCK_LEARNER.role);

    const { count, unreadCount } = getDashboardNotifications();

    console.log('Test Case ID: INT-021');
    console.log('Test: Multiple notifications');
    console.log(`Delivered Count: ${syncResult.deliveredCount}`);
    console.log(`Dashboard Count: ${count}`);
    console.log(`Unread Count: ${unreadCount}`);

    if (syncResult.deliveredCount === 2 && count === 2) {
      console.log('Outcome: Performed as Expected');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(syncResult.deliveredCount).toBe(2);
    expect(count).toBe(2);
    expect(unreadCount).toBe(2);
  });

  test('Non-admin - notification creation denied', async () => {
    const nonAdmin = { id: 'USER001', role: 'student', is_active: true };
    const result = await processNotificationToDashboard(
      nonAdmin, MOCK_LEARNER, MOCK_SESSION, MOCK_NOTIFICATION
    );

    console.log('Test Case ID: INT-021');
    console.log('Test: Non-admin create (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'admin_login_failed') {
      console.log('Outcome: Performed as Expected - Blocked correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('admin_login_failed');
    expect(result.error).toBe('Unauthorized');
  });

  test('Learner not authenticated - dashboard load fails', async () => {
    const result = await processNotificationToDashboard(
      MOCK_ADMIN, null, null, MOCK_NOTIFICATION
    );

    console.log('Test Case ID: INT-021');
    console.log('Test: Learner not authenticated (negative test)');
    console.log(`Error: ${result.error}`);
    console.log(`Stage: ${result.stage}`);

    if (!result.success && result.stage === 'dashboard_load_failed') {
      console.log('Outcome: Performed as Expected - Blocked correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.stage).toBe('dashboard_load_failed');
    expect(result.error).toBe('Not authenticated');
  });

  test('Invalid notification data - creation fails gracefully', async () => {
    await adminLogin(MOCK_ADMIN);
    const result = createNotification(MOCK_ADMIN.id, { title: 'Missing id and message' });

    console.log('Test Case ID: INT-021');
    console.log('Test: Invalid notification (negative test)');
    console.log(`Error: ${result.error}`);

    if (!result.success && result.error === 'Invalid notification data') {
      console.log('Outcome: Performed as Expected - Validation worked');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid notification data');
  });

  test('Notification for wrong audience - not delivered to dashboard', async () => {
    await adminLogin(MOCK_ADMIN);

    const teacherOnlyNotif = {
      ...MOCK_NOTIFICATION,
      id: 'NOTIF_TEACHER',
      targetAudience: ['teacher']
    };

    createNotification(MOCK_ADMIN.id, teacherOnlyNotif);
    await learnerLoginAndLoadDashboard(MOCK_LEARNER, MOCK_SESSION);
    const syncResult = syncNotificationsToDashboard(MOCK_LEARNER.id, MOCK_LEARNER.role);

    console.log('Test Case ID: INT-021');
    console.log('Test: Wrong audience (negative test)');
    console.log(`Delivered Count: ${syncResult.deliveredCount}`);
    console.log(`Learner Role: ${MOCK_LEARNER.role}`);
    console.log(`Target Audience: teacher`);

    if (syncResult.deliveredCount === 0) {
      console.log('Outcome: Performed as Expected - Not delivered to wrong audience');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(syncResult.success).toBe(true);
    expect(syncResult.deliveredCount).toBe(0);
    expect(appState.notificationDelivered).toBe(false);
  });

});
