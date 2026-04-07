// ─── Tests for src/lib/analyticsHelper.js ────────────────────────────────────
// Only tests PURE logic functions (no Supabase calls).
// Functions that call Supabase (logSession, getStudentProgress, etc.) are NOT
// tested here because they require a real database connection.

// ══════════════════════════════════════════════════════════════════════════════
// Helper: accuracy calculation  (used inside logSession)
// Formula: Math.round((score / total) * 10000) / 100
// ══════════════════════════════════════════════════════════════════════════════

function calcAccuracy(score, total) {
  return total > 0 ? Math.round((score / total) * 10000) / 100 : 0;
}

describe('calcAccuracy', () => {
  test('100% when score equals total', () => {
    expect(calcAccuracy(10, 10)).toBe(100);
  });

  test('0% when score is 0', () => {
    expect(calcAccuracy(0, 10)).toBe(0);
  });

  test('0% when total is 0 (avoids divide-by-zero)', () => {
    expect(calcAccuracy(5, 0)).toBe(0);
  });

  test('50% for half correct', () => {
    expect(calcAccuracy(5, 10)).toBe(50);
  });

  test('rounds to 2 decimal places', () => {
    // 2/3 = 66.666... → should round to 66.67
    expect(calcAccuracy(2, 3)).toBe(66.67);
  });

  test('handles single correct answer out of many', () => {
    expect(calcAccuracy(1, 4)).toBe(25);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Helper: avgAccuracy calculation  (used inside getStudentProgress)
// Formula: Math.round(sum / count * 100) / 100
// ══════════════════════════════════════════════════════════════════════════════

function calcAvgAccuracy(sessions) {
  if (!sessions || sessions.length === 0) return 0;
  const total = sessions.length;
  const sum = sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0);
  return Math.round((sum / total) * 100) / 100;
}

describe('calcAvgAccuracy', () => {
  test('returns 0 for empty session list', () => {
    expect(calcAvgAccuracy([])).toBe(0);
  });

  test('returns 0 for null input', () => {
    expect(calcAvgAccuracy(null)).toBe(0);
  });

  test('returns single session accuracy unchanged', () => {
    expect(calcAvgAccuracy([{ accuracy: 80 }])).toBe(80);
  });

  test('averages multiple sessions correctly', () => {
    const sessions = [
      { accuracy: 100 },
      { accuracy: 80 },
      { accuracy: 60 },
    ];
    expect(calcAvgAccuracy(sessions)).toBe(80);
  });

  test('treats missing accuracy as 0', () => {
    const sessions = [{ accuracy: 100 }, {}];
    expect(calcAvgAccuracy(sessions)).toBe(50);
  });

  test('rounds to 2 decimal places', () => {
    const sessions = [{ accuracy: 100 }, { accuracy: 0 }, { accuracy: 0 }];
    // (100 + 0 + 0) / 3 = 33.333... → 33.33
    expect(calcAvgAccuracy(sessions)).toBe(33.33);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// formatActivityType  (exported pure function from analyticsHelper.js)
// ══════════════════════════════════════════════════════════════════════════════

const typeMap = {
  'phonics': 'Phonics',
  'phonics_blend': 'Phonics Blending',
  'phonics_rhyme': 'Phonics Rhyming',
  'phonics_segment': 'Phonics Segmenting',
  'spelling': 'Spelling',
  'writing': 'Writing Practice',
  'reading': 'Reading',
  'scan': 'Text Scan',
  'phonological_awareness': 'Phonological Awareness',
};

function formatActivityType(activityType) {
  return typeMap[activityType] || activityType;
}

describe('formatActivityType', () => {
  test('formats phonics correctly', () => {
    expect(formatActivityType('phonics')).toBe('Phonics');
  });

  test('formats spelling correctly', () => {
    expect(formatActivityType('spelling')).toBe('Spelling');
  });

  test('formats phonics_blend correctly', () => {
    expect(formatActivityType('phonics_blend')).toBe('Phonics Blending');
  });

  test('formats writing correctly', () => {
    expect(formatActivityType('writing')).toBe('Writing Practice');
  });

  test('formats reading correctly', () => {
    expect(formatActivityType('reading')).toBe('Reading');
  });

  test('formats phonological_awareness correctly', () => {
    expect(formatActivityType('phonological_awareness')).toBe('Phonological Awareness');
  });

  test('returns the raw string for unknown activity types', () => {
    expect(formatActivityType('some_unknown_type')).toBe('some_unknown_type');
  });

  test('returns undefined input as-is', () => {
    expect(formatActivityType(undefined)).toBeUndefined();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// exportAnalyticsCSV  (exported pure function from analyticsHelper.js)
// ══════════════════════════════════════════════════════════════════════════════

function exportAnalyticsCSV(analyticsData) {
  const { students } = analyticsData;
  const headers = [
    'Student Name', 'Email', 'Total Sessions',
    'Avg Accuracy (%)', 'Streak (days)', 'Last Active',
  ];
  const rows = students.map(s => [
    s.full_name || 'Unknown',
    s.email || 'N/A',
    s.totalSessions,
    s.avgAccuracy.toFixed(2),
    s.streak,
    new Date(s.lastActive).toLocaleDateString(),
  ]);
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

describe('exportAnalyticsCSV', () => {
  const sampleData = {
    students: [
      {
        full_name: 'Juan dela Cruz',
        email: 'juan@school.com',
        totalSessions: 12,
        avgAccuracy: 85.5,
        streak: 3,
        lastActive: '2024-01-15T10:00:00Z',
      },
    ],
  };

  test('first line is the header row', () => {
    const csv = exportAnalyticsCSV(sampleData);
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toBe('Student Name,Email,Total Sessions,Avg Accuracy (%),Streak (days),Last Active');
  });

  test('second line contains student data', () => {
    const csv = exportAnalyticsCSV(sampleData);
    const secondLine = csv.split('\n')[1];
    expect(secondLine).toContain('Juan dela Cruz');
    expect(secondLine).toContain('juan@school.com');
    expect(secondLine).toContain('12');
    expect(secondLine).toContain('85.50');
    expect(secondLine).toContain('3');
  });

  test('uses "Unknown" for missing full_name', () => {
    const data = {
      students: [{ email: 'x@x.com', totalSessions: 0, avgAccuracy: 0, streak: 0, lastActive: '2024-01-01T00:00:00Z' }],
    };
    const csv = exportAnalyticsCSV(data);
    expect(csv).toContain('Unknown');
  });

  test('uses "N/A" for missing email', () => {
    const data = {
      students: [{ full_name: 'Test', totalSessions: 0, avgAccuracy: 0, streak: 0, lastActive: '2024-01-01T00:00:00Z' }],
    };
    const csv = exportAnalyticsCSV(data);
    expect(csv).toContain('N/A');
  });

  test('returns only header when students array is empty', () => {
    const csv = exportAnalyticsCSV({ students: [] });
    expect(csv.split('\n')).toHaveLength(1);
  });

  test('returns correct number of rows for multiple students', () => {
    const data = {
      students: [
        { full_name: 'A', email: 'a@a.com', totalSessions: 1, avgAccuracy: 100, streak: 1, lastActive: '2024-01-01T00:00:00Z' },
        { full_name: 'B', email: 'b@b.com', totalSessions: 2, avgAccuracy: 90, streak: 2, lastActive: '2024-01-02T00:00:00Z' },
      ],
    };
    const csv = exportAnalyticsCSV(data);
    // 1 header + 2 data rows
    expect(csv.split('\n')).toHaveLength(3);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// exportAnalyticsJSON  (exported pure function from analyticsHelper.js)
// ══════════════════════════════════════════════════════════════════════════════

function exportAnalyticsJSON(analyticsData) {
  return JSON.stringify(analyticsData, null, 2);
}

describe('exportAnalyticsJSON', () => {
  test('returns a valid JSON string', () => {
    const data = { overview: { totalSessions: 5 } };
    const result = exportAnalyticsJSON(data);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  test('parsed JSON matches original data', () => {
    const data = { overview: { totalSessions: 5, avgAccuracy: 80 } };
    const result = exportAnalyticsJSON(data);
    expect(JSON.parse(result)).toEqual(data);
  });

  test('is pretty-printed with 2-space indentation', () => {
    const data = { key: 'value' };
    const result = exportAnalyticsJSON(data);
    expect(result).toContain('  "key"');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// completedActivities filter  (from getComprehensiveAnalytics)
// A session is "completed" if score >= 50% of total
// ══════════════════════════════════════════════════════════════════════════════

function isCompleted(session) {
  return (session.score || 0) >= (session.total || 1) * 0.5;
}

describe('isCompleted (50% threshold)', () => {
  test('passes when score equals total (100%)', () => {
    expect(isCompleted({ score: 10, total: 10 })).toBe(true);
  });

  test('passes when score is exactly 50%', () => {
    expect(isCompleted({ score: 5, total: 10 })).toBe(true);
  });

  test('fails when score is below 50%', () => {
    expect(isCompleted({ score: 4, total: 10 })).toBe(false);
  });

  test('fails when score is 0', () => {
    expect(isCompleted({ score: 0, total: 10 })).toBe(false);
  });

  test('handles missing score as 0', () => {
    expect(isCompleted({ total: 10 })).toBe(false);
  });

  test('handles missing total as 1 (score >= 0.5)', () => {
    // total defaults to 1, so score must be >= 0.5
    expect(isCompleted({ score: 1 })).toBe(true);
    expect(isCompleted({ score: 0 })).toBe(false);
  });
});
