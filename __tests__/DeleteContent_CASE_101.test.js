// ─── Test Case CASE-101 ──────────────────────────────────────────────────────
// Test Case ID: CASE-101
// Test Case Description: Validate deleting existing content
// Expected Result: Content deleted successfully

// Mock content data
let contentData = {
  content: [
    { contentId: 'CONTENT001', title: 'Letter A', type: 'phonics', category: 'alphabet', difficulty: 'easy', status: 'active', createdAt: '2023-01-15T10:30:00Z', createdBy: 'ADMIN001' },
    { contentId: 'CONTENT002', title: 'Letter B', type: 'phonics', category: 'alphabet', difficulty: 'easy', status: 'active', createdAt: '2023-02-20T09:15:00Z', createdBy: 'ADMIN001' },
    { contentId: 'CONTENT003', title: 'Simple Words', type: 'spelling', category: 'words', difficulty: 'medium', status: 'active', createdAt: '2023-03-10T11:00:00Z', createdBy: 'ADMIN001' },
    { contentId: 'CONTENT004', title: 'Short Story', type: 'reading', category: 'stories', difficulty: 'hard', status: 'active', createdAt: '2023-04-05T14:20:00Z', createdBy: 'ADMIN002' }
  ],
  totalContent: 4
};

function deleteContent(adminId, contentId) {
  // Check if admin is authenticated
  if (!adminId || adminId.trim() === '') {
    return {
      success: false,
      actualResult: 'Content not deleted - Admin not authenticated',
      contentDeleted: false,
      errorMessage: 'Please log in as admin to delete content'
    };
  }

  // Check if admin has privileges
  if (!adminId.startsWith('ADMIN')) {
    return {
      success: false,
      actualResult: 'Content not deleted - Insufficient privileges',
      contentDeleted: false,
      errorMessage: 'You do not have permission to delete content'
    };
  }

  // Check if content exists
  const contentIndex = contentData.content.findIndex(c => c.contentId === contentId);
  if (contentIndex === -1) {
    return {
      success: false,
      actualResult: 'Content not deleted - Content not found',
      contentDeleted: false,
      errorMessage: 'Content not found'
    };
  }

  const deletedContent = contentData.content[contentIndex];
  const timestamp = new Date().toISOString();

  // Remove content from database
  contentData.content.splice(contentIndex, 1);
  contentData.totalContent--;

  return {
    success: true,
    actualResult: 'Content deleted successfully',
    contentDeleted: true,
    adminId: adminId,
    deletedContentId: contentId,
    deletedContent: deletedContent,
    remainingContent: contentData.totalContent,
    deletedAt: timestamp,
    message: `Content "${deletedContent.title}" (${contentId}) has been deleted successfully`
  };
}

// Reset state before each test
function resetContentData() {
  contentData = {
    content: [
      { contentId: 'CONTENT001', title: 'Letter A', type: 'phonics', category: 'alphabet', difficulty: 'easy', status: 'active', createdAt: '2023-01-15T10:30:00Z', createdBy: 'ADMIN001' },
      { contentId: 'CONTENT002', title: 'Letter B', type: 'phonics', category: 'alphabet', difficulty: 'easy', status: 'active', createdAt: '2023-02-20T09:15:00Z', createdBy: 'ADMIN001' },
      { contentId: 'CONTENT003', title: 'Simple Words', type: 'spelling', category: 'words', difficulty: 'medium', status: 'active', createdAt: '2023-03-10T11:00:00Z', createdBy: 'ADMIN001' },
      { contentId: 'CONTENT004', title: 'Short Story', type: 'reading', category: 'stories', difficulty: 'hard', status: 'active', createdAt: '2023-04-05T14:20:00Z', createdBy: 'ADMIN002' }
    ],
    totalContent: 4
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-101 (Validate deleting existing content)', () => {

  beforeEach(() => {
    resetContentData();
  });

  test('Delete existing phonics content - content deleted successfully', () => {
    const expectedResult = 'Content deleted successfully';
    const adminId = 'ADMIN001';
    const contentId = 'CONTENT001';
    const contentBefore = contentData.totalContent;

    const contentToDelete = contentData.content.find(c => c.contentId === contentId);

    const result = deleteContent(adminId, contentId);

    console.log('Test Case ID: CASE-101');
    console.log('Test Case Description: Validate deleting existing content');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Admin ID: ${result.adminId}`);
    console.log(`Deleted Content ID: ${result.deletedContentId}`);
    console.log(`Deleted Content: ${result.deletedContent.title} (${result.deletedContent.type})`);
    console.log(`Content Before: ${contentBefore}`);
    console.log(`Remaining Content: ${result.remainingContent}`);
    console.log(`Deleted At: ${result.deletedAt}`);
    console.log(`Message: ${result.message}`);

    if (result.success && result.contentDeleted && result.remainingContent === contentBefore - 1) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.contentDeleted).toBe(true);
    expect(result.actualResult).toContain('deleted successfully');
    expect(result.deletedContentId).toBe('CONTENT001');
    expect(result.deletedContent.title).toBe('Letter A');
    expect(result.deletedContent.type).toBe('phonics');
    expect(result.remainingContent).toBe(3);
    expect(contentData.totalContent).toBe(3);
    expect(contentData.content.find(c => c.contentId === 'CONTENT001')).toBeUndefined();
  });

  test('Delete spelling content - content deleted successfully', () => {
    const adminId = 'ADMIN001';
    const contentId = 'CONTENT003';

    const result = deleteContent(adminId, contentId);

    console.log('Test Case ID: CASE-101');
    console.log(`Deleted Content Type: ${result.deletedContent.type}`);
    console.log(`Remaining Content: ${result.remainingContent}`);

    if (result.success && result.contentDeleted) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.contentDeleted).toBe(true);
    expect(result.deletedContent.type).toBe('spelling');
    expect(contentData.content.find(c => c.contentId === 'CONTENT003')).toBeUndefined();
  });

  test('Delete reading content - content deleted successfully', () => {
    const adminId = 'ADMIN001';
    const contentId = 'CONTENT004';

    const result = deleteContent(adminId, contentId);

    console.log('Test Case ID: CASE-101');
    console.log(`Deleted Content Type: ${result.deletedContent.type}`);
    console.log(`Category: ${result.deletedContent.category}`);

    if (result.success && result.contentDeleted) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.contentDeleted).toBe(true);
    expect(result.deletedContent.type).toBe('reading');
    expect(result.deletedContent.category).toBe('stories');
    expect(contentData.content.find(c => c.contentId === 'CONTENT004')).toBeUndefined();
  });

  test('Multiple content deleted - count decreases correctly', () => {
    const adminId = 'ADMIN001';

    // Delete first content
    const result1 = deleteContent(adminId, 'CONTENT001');
    expect(result1.success).toBe(true);
    expect(result1.remainingContent).toBe(3);

    // Delete second content
    const result2 = deleteContent(adminId, 'CONTENT002');

    console.log('Test Case ID: CASE-101');
    console.log('Test: Multiple content deleted');
    console.log(`After first delete: ${result1.remainingContent} content remaining`);
    console.log(`After second delete: ${result2.remainingContent} content remaining`);
    console.log(`Deleted Content 1: ${result1.deletedContentId}`);
    console.log(`Deleted Content 2: ${result2.deletedContentId}`);

    if (result2.success && result2.remainingContent === 2) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result2.success).toBe(true);
    expect(result2.remainingContent).toBe(2);
    expect(contentData.totalContent).toBe(2);
    expect(contentData.content).toHaveLength(2);
  });

  test('Content completely removed from database', () => {
    const adminId = 'ADMIN001';
    const contentId = 'CONTENT002';

    const result = deleteContent(adminId, contentId);

    console.log('Test Case ID: CASE-101');
    console.log('Verifying content completely removed:');

    const searchById = contentData.content.find(c => c.contentId === contentId);
    const searchByTitle = contentData.content.find(c => c.title === 'Letter B');

    console.log(`  Content ID search result: ${searchById}`);
    console.log(`  Title search result: ${searchByTitle}`);
    console.log(`  Total content: ${contentData.totalContent}`);

    if (!searchById && !searchByTitle && contentData.totalContent === 3) {
      console.log('Outcome: PASSED - Content completely removed');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(searchById).toBeUndefined();
    expect(searchByTitle).toBeUndefined();
    expect(contentData.totalContent).toBe(3);
    expect(contentData.content.some(c => c.contentId === 'CONTENT002')).toBe(false);
  });

  test('Delete non-existent content - content not deleted (negative test)', () => {
    const adminId = 'ADMIN001';
    const contentId = 'CONTENT999';
    const contentBefore = contentData.totalContent;

    const result = deleteContent(adminId, contentId);

    console.log('Test Case ID: CASE-101');
    console.log(`Content ID: ${contentId} (does not exist)`);
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Content Before: ${contentBefore}`);
    console.log(`Content After: ${contentData.totalContent}`);

    if (!result.success && !result.contentDeleted && contentData.totalContent === contentBefore) {
      console.log('Outcome: PASSED - Correctly rejected non-existent content');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.contentDeleted).toBe(false);
    expect(result.errorMessage).toContain('not found');
    expect(contentData.totalContent).toBe(4);
  });

  test('Without admin authentication - content not deleted (negative test)', () => {
    const adminId = '';
    const contentId = 'CONTENT001';
    const contentBefore = contentData.totalContent;

    const result = deleteContent(adminId, contentId);

    console.log('Test Case ID: CASE-101');
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Content Before: ${contentBefore}`);
    console.log(`Content After: ${contentData.totalContent}`);

    if (!result.success && !result.contentDeleted && contentData.totalContent === contentBefore) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated admin');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.contentDeleted).toBe(false);
    expect(result.errorMessage).toContain('log in');
    expect(contentData.totalContent).toBe(4);
  });

  test('With non-admin account - content not deleted (negative test)', () => {
    const adminId = 'USER001'; // Regular user
    const contentId = 'CONTENT001';
    const contentBefore = contentData.totalContent;

    const result = deleteContent(adminId, contentId);

    console.log('Test Case ID: CASE-101');
    console.log(`User ID: ${adminId} (not an admin)`);
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Content Before: ${contentBefore}`);
    console.log(`Content After: ${contentData.totalContent}`);

    if (!result.success && !result.contentDeleted && contentData.totalContent === contentBefore) {
      console.log('Outcome: PASSED - Correctly rejected non-admin user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.contentDeleted).toBe(false);
    expect(result.errorMessage).toContain('permission');
    expect(contentData.totalContent).toBe(4);
  });

  test('Delete inactive content - content deleted successfully', () => {
    // First make content inactive
    contentData.content[0].status = 'inactive';

    const adminId = 'ADMIN001';
    const contentId = 'CONTENT001';

    const result = deleteContent(adminId, contentId);

    console.log('Test Case ID: CASE-101');
    console.log(`Deleted Content Status: ${result.deletedContent.status}`);
    console.log(`Remaining Content: ${result.remainingContent}`);

    if (result.success && result.contentDeleted) {
      console.log('Outcome: PASSED - Inactive content deleted');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.contentDeleted).toBe(true);
    expect(result.deletedContent.status).toBe('inactive');
    expect(contentData.totalContent).toBe(3);
  });

});
