// ─── Test Case CASE-100 ──────────────────────────────────────────────────────
// Test Case ID: CASE-100
// Test Case Description: Validate updating existing content
// Expected Result: Content updated successfully

// Mock content data
let contentData = {
  content: [
    { contentId: 'CONTENT001', title: 'Letter A', type: 'phonics', category: 'alphabet', difficulty: 'easy', status: 'active', createdAt: '2023-01-15T10:30:00Z', createdBy: 'ADMIN001' },
    { contentId: 'CONTENT002', title: 'Letter B', type: 'phonics', category: 'alphabet', difficulty: 'easy', status: 'active', createdAt: '2023-02-20T09:15:00Z', createdBy: 'ADMIN001' },
    { contentId: 'CONTENT003', title: 'Simple Words', type: 'spelling', category: 'words', difficulty: 'medium', status: 'active', createdAt: '2023-03-10T11:00:00Z', createdBy: 'ADMIN001' }
  ]
};

const VALID_CONTENT_TYPES = ['phonics', 'spelling', 'sound-match', 'tracing', 'reading'];
const VALID_CATEGORIES = ['alphabet', 'words', 'sentences', 'stories'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const VALID_STATUSES = ['active', 'inactive', 'draft'];

function editContent(adminId, contentId, contentDataInput) {
  // Check if admin is authenticated
  if (!adminId || adminId.trim() === '') {
    return {
      success: false,
      actualResult: 'Content not updated - Admin not authenticated',
      contentUpdated: false,
      errorMessage: 'Please log in as admin to edit content'
    };
  }

  // Check if admin has privileges
  if (!adminId.startsWith('ADMIN')) {
    return {
      success: false,
      actualResult: 'Content not updated - Insufficient privileges',
      contentUpdated: false,
      errorMessage: 'You do not have permission to edit content'
    };
  }

  // Check if content exists
  const contentIndex = contentData.content.findIndex(c => c.contentId === contentId);
  if (contentIndex === -1) {
    return {
      success: false,
      actualResult: 'Content not updated - Content not found',
      contentUpdated: false,
      errorMessage: 'Content not found'
    };
  }

  const existingContent = contentData.content[contentIndex];

  // Validate type if provided
  if (contentDataInput.type !== undefined) {
    if (!VALID_CONTENT_TYPES.includes(contentDataInput.type)) {
      return {
        success: false,
        actualResult: 'Content not updated - Invalid content type',
        contentUpdated: false,
        errorMessage: 'Invalid content type',
        validTypes: VALID_CONTENT_TYPES
      };
    }
  }

  // Validate category if provided
  if (contentDataInput.category !== undefined) {
    if (!VALID_CATEGORIES.includes(contentDataInput.category)) {
      return {
        success: false,
        actualResult: 'Content not updated - Invalid category',
        contentUpdated: false,
        errorMessage: 'Invalid category',
        validCategories: VALID_CATEGORIES
      };
    }
  }

  // Validate difficulty if provided
  if (contentDataInput.difficulty !== undefined) {
    if (!VALID_DIFFICULTIES.includes(contentDataInput.difficulty)) {
      return {
        success: false,
        actualResult: 'Content not updated - Invalid difficulty',
        contentUpdated: false,
        errorMessage: 'Invalid difficulty level',
        validDifficulties: VALID_DIFFICULTIES
      };
    }
  }

  // Validate status if provided
  if (contentDataInput.status !== undefined) {
    if (!VALID_STATUSES.includes(contentDataInput.status)) {
      return {
        success: false,
        actualResult: 'Content not updated - Invalid status',
        contentUpdated: false,
        errorMessage: 'Invalid status',
        validStatuses: VALID_STATUSES
      };
    }
  }

  const timestamp = new Date().toISOString();
  const oldValues = { ...existingContent };

  // Update content
  contentData.content[contentIndex] = {
    ...existingContent,
    ...contentDataInput,
    updatedAt: timestamp,
    updatedBy: adminId
  };

  return {
    success: true,
    actualResult: 'Content updated successfully',
    contentUpdated: true,
    contentId: contentId,
    oldValues: {
      title: oldValues.title,
      type: oldValues.type,
      category: oldValues.category,
      difficulty: oldValues.difficulty,
      status: oldValues.status
    },
    newValues: {
      title: contentData.content[contentIndex].title,
      type: contentData.content[contentIndex].type,
      category: contentData.content[contentIndex].category,
      difficulty: contentData.content[contentIndex].difficulty,
      status: contentData.content[contentIndex].status
    },
    updatedFields: Object.keys(contentDataInput),
    updatedAt: timestamp,
    content: contentData.content[contentIndex]
  };
}

// Reset state before each test
function resetContentData() {
  contentData = {
    content: [
      { contentId: 'CONTENT001', title: 'Letter A', type: 'phonics', category: 'alphabet', difficulty: 'easy', status: 'active', createdAt: '2023-01-15T10:30:00Z', createdBy: 'ADMIN001' },
      { contentId: 'CONTENT002', title: 'Letter B', type: 'phonics', category: 'alphabet', difficulty: 'easy', status: 'active', createdAt: '2023-02-20T09:15:00Z', createdBy: 'ADMIN001' },
      { contentId: 'CONTENT003', title: 'Simple Words', type: 'spelling', category: 'words', difficulty: 'medium', status: 'active', createdAt: '2023-03-10T11:00:00Z', createdBy: 'ADMIN001' }
    ]
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-100 (Validate updating existing content)', () => {

  beforeEach(() => {
    resetContentData();
  });

  test('Update content title - content updated successfully', () => {
    const expectedResult = 'Content updated successfully';
    const adminId = 'ADMIN001';
    const contentId = 'CONTENT001';
    const contentDataInput = {
      title: 'Letter A - Apple'
    };
    
    const result = editContent(adminId, contentId, contentDataInput);

    console.log('Test Case ID: CASE-100');
    console.log('Test Case Description: Validate updating existing content');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`Content Updated: ${result.contentUpdated}`);
    console.log(`Content ID: ${result.contentId}`);
    console.log(`Old Title: ${result.oldValues.title}`);
    console.log(`New Title: ${result.newValues.title}`);
    console.log(`Updated Fields: ${result.updatedFields.join(', ')}`);
    console.log(`Updated At: ${result.updatedAt}`);
    console.log(`Updated By: ${result.content.updatedBy}`);

    if (result.success && result.contentUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.contentUpdated).toBe(true);
    expect(result.actualResult).toContain('updated successfully');
    expect(result.oldValues.title).toBe('Letter A');
    expect(result.newValues.title).toBe('Letter A - Apple');
    expect(result.updatedFields).toContain('title');
    expect(result.content.updatedBy).toBe('ADMIN001');
  });

  test('Update content difficulty - content updated successfully', () => {
    const adminId = 'ADMIN001';
    const contentId = 'CONTENT001';
    const contentDataInput = {
      difficulty: 'medium'
    };
    
    const result = editContent(adminId, contentId, contentDataInput);

    console.log('Test Case ID: CASE-100');
    console.log(`Old Difficulty: ${result.oldValues.difficulty}`);
    console.log(`New Difficulty: ${result.newValues.difficulty}`);

    if (result.success && result.contentUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.contentUpdated).toBe(true);
    expect(result.oldValues.difficulty).toBe('easy');
    expect(result.newValues.difficulty).toBe('medium');
  });

  test('Update content status - content updated successfully', () => {
    const adminId = 'ADMIN001';
    const contentId = 'CONTENT002';
    const contentDataInput = {
      status: 'inactive'
    };
    
    const result = editContent(adminId, contentId, contentDataInput);

    console.log('Test Case ID: CASE-100');
    console.log(`Old Status: ${result.oldValues.status}`);
    console.log(`New Status: ${result.newValues.status}`);

    if (result.success && result.contentUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.contentUpdated).toBe(true);
    expect(result.oldValues.status).toBe('active');
    expect(result.newValues.status).toBe('inactive');
  });

  test('Update content type and category - content updated successfully', () => {
    const adminId = 'ADMIN001';
    const contentId = 'CONTENT003';
    const contentDataInput = {
      type: 'reading',
      category: 'stories'
    };
    
    const result = editContent(adminId, contentId, contentDataInput);

    console.log('Test Case ID: CASE-100');
    console.log(`Old Type: ${result.oldValues.type} → New Type: ${result.newValues.type}`);
    console.log(`Old Category: ${result.oldValues.category} → New Category: ${result.newValues.category}`);

    if (result.success && result.updatedFields.length === 2) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.contentUpdated).toBe(true);
    expect(result.oldValues.type).toBe('spelling');
    expect(result.newValues.type).toBe('reading');
    expect(result.oldValues.category).toBe('words');
    expect(result.newValues.category).toBe('stories');
  });

  test('Update multiple fields - content updated successfully', () => {
    const adminId = 'ADMIN001';
    const contentId = 'CONTENT001';
    const contentDataInput = {
      title: 'Updated Letter A',
      difficulty: 'hard',
      status: 'draft'
    };
    
    const result = editContent(adminId, contentId, contentDataInput);

    console.log('Test Case ID: CASE-100');
    console.log('Updating multiple fields:');
    console.log(`  Title: ${result.oldValues.title} → ${result.newValues.title}`);
    console.log(`  Difficulty: ${result.oldValues.difficulty} → ${result.newValues.difficulty}`);
    console.log(`  Status: ${result.oldValues.status} → ${result.newValues.status}`);
    console.log(`Updated Fields: ${result.updatedFields.join(', ')}`);

    if (result.success && result.updatedFields.length === 3) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.contentUpdated).toBe(true);
    expect(result.updatedFields).toHaveLength(3);
    expect(result.updatedFields).toContain('title');
    expect(result.updatedFields).toContain('difficulty');
    expect(result.updatedFields).toContain('status');
  });

  test('Content data persisted correctly after update', () => {
    const adminId = 'ADMIN001';
    const contentId = 'CONTENT001';
    const contentDataInput = {
      title: 'Persisted Update'
    };
    
    const result = editContent(adminId, contentId, contentDataInput);

    console.log('Test Case ID: CASE-100');
    console.log('Verifying content data persisted:');
    
    const persistedContent = contentData.content.find(c => c.contentId === contentId);
    
    console.log(`  Content ID: ${persistedContent.contentId}`);
    console.log(`  Title: ${persistedContent.title}`);
    console.log(`  Type: ${persistedContent.type}`);
    console.log(`  Updated By: ${persistedContent.updatedBy}`);
    console.log(`  Updated At: ${persistedContent.updatedAt}`);

    if (persistedContent.title === 'Persisted Update' && persistedContent.updatedBy === 'ADMIN001') {
      console.log('Outcome: PASSED - Content data persisted correctly');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(persistedContent.title).toBe('Persisted Update');
    expect(persistedContent.updatedBy).toBe('ADMIN001');
    expect(persistedContent.updatedAt).toBeDefined();
    expect(persistedContent.createdAt).toBeDefined(); // Original createdAt preserved
  });

  test('Update non-existent content - content not updated (negative test)', () => {
    const adminId = 'ADMIN001';
    const contentId = 'CONTENT999';
    const contentDataInput = {
      title: 'Non-existent'
    };
    
    const result = editContent(adminId, contentId, contentDataInput);

    console.log('Test Case ID: CASE-100');
    console.log(`Content ID: ${contentId} (does not exist)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.contentUpdated) {
      console.log('Outcome: PASSED - Correctly rejected non-existent content');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.contentUpdated).toBe(false);
    expect(result.errorMessage).toContain('not found');
  });

  test('Invalid content type - content not updated (negative test)', () => {
    const adminId = 'ADMIN001';
    const contentId = 'CONTENT001';
    const contentDataInput = {
      type: 'invalid-type'
    };
    
    const result = editContent(adminId, contentId, contentDataInput);

    console.log('Test Case ID: CASE-100');
    console.log(`Type: "${contentDataInput.type}" (invalid)`);
    console.log(`Error: ${result.errorMessage}`);
    console.log(`Valid Types: ${result.validTypes ? result.validTypes.join(', ') : 'none'}`);

    if (!result.success && !result.contentUpdated) {
      console.log('Outcome: PASSED - Correctly rejected invalid type');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.contentUpdated).toBe(false);
    expect(result.errorMessage).toContain('Invalid content type');
  });

  test('Without admin authentication - content not updated (negative test)', () => {
    const adminId = '';
    const contentId = 'CONTENT001';
    const contentDataInput = {
      title: 'No Auth Update'
    };
    
    const result = editContent(adminId, contentId, contentDataInput);

    console.log('Test Case ID: CASE-100');
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.contentUpdated) {
      console.log('Outcome: PASSED - Correctly rejected unauthenticated admin');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.contentUpdated).toBe(false);
    expect(result.errorMessage).toContain('log in');
  });

  test('With non-admin account - content not updated (negative test)', () => {
    const adminId = 'USER001';
    const contentId = 'CONTENT001';
    const contentDataInput = {
      title: 'Non-Admin Update'
    };
    
    const result = editContent(adminId, contentId, contentDataInput);

    console.log('Test Case ID: CASE-100');
    console.log(`User ID: ${adminId} (not an admin)`);
    console.log(`Error: ${result.errorMessage}`);

    if (!result.success && !result.contentUpdated) {
      console.log('Outcome: PASSED - Correctly rejected non-admin user');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(false);
    expect(result.contentUpdated).toBe(false);
    expect(result.errorMessage).toContain('permission');
  });

});
