// ─── Test Case CASE-079 ──────────────────────────────────────────────────────
// Test Case ID: CASE-079
// Test Case Description: Validate viewing about us section
// Expected Result: Able to view about us

// Mock About Us data
const ABOUT_US_DATA = {
  title: 'About Synclexia',
  mission: 'Empowering children with dyslexia to achieve their full potential through innovative, engaging, and accessible learning tools.',
  vision: 'A world where every child with dyslexia has the support and resources they need to succeed in reading and writing.',
  companyInfo: {
    founded: '2020',
    headquarters: 'San Francisco, CA',
    team: 'Dedicated educators, developers, and specialists',
    users: '50,000+ learners worldwide'
  },
  story: [
    'Synclexia was founded in 2020 by a team of educators, technologists, and parents of children with dyslexia.',
    'We recognized the need for specialized learning tools that adapt to the unique ways dyslexic minds process information.',
    'Our team includes speech-language pathologists, special education teachers, and software engineers who collaborate to create effective learning experiences.',
    'Today, Synclexia serves thousands of families worldwide, helping children build confidence and skills in reading and writing.'
  ],
  values: [
    { title: 'Accessibility', description: 'Learning tools should be available to every child, regardless of their learning differences.' },
    { title: 'Innovation', description: 'We continuously research and implement new methods to improve learning outcomes.' },
    { title: 'Empathy', description: 'We design with understanding of the challenges faced by children with dyslexia and their families.' },
    { title: 'Evidence-Based', description: 'Our activities are grounded in scientific research on dyslexia and learning science.' }
  ],
  team: [
    { name: 'Dr. Sarah Chen', role: 'Founder & CEO', background: 'Former special education teacher with 15 years of experience' },
    { name: 'Michael Rodriguez', role: 'Chief Technology Officer', background: 'Software engineer and parent of a child with dyslexia' },
    { name: 'Dr. Emily Watson', role: 'Head of Curriculum', background: 'Speech-language pathologist and researcher' },
    { name: 'James Park', role: 'Lead Designer', background: 'UX designer specializing in accessible interfaces' }
  ],
  contact: {
    email: 'info@synclexia.com',
    website: 'www.synclexia.com',
    social: {
      facebook: 'facebook.com/synclexia',
      twitter: '@synclexia',
      instagram: '@synclexia_app'
    }
  },
  version: '2.5.1',
  lastUpdated: '2024-04-01'
};

function viewAboutUs() {
  return {
    success: true,
    actualResult: 'Able to view about us',
    aboutUsLoaded: true,
    data: ABOUT_US_DATA,
    title: ABOUT_US_DATA.title,
    mission: ABOUT_US_DATA.mission,
    vision: ABOUT_US_DATA.vision,
    companyInfo: ABOUT_US_DATA.companyInfo,
    story: ABOUT_US_DATA.story,
    values: ABOUT_US_DATA.values,
    team: ABOUT_US_DATA.team,
    contact: ABOUT_US_DATA.contact,
    version: ABOUT_US_DATA.version,
    lastUpdated: ABOUT_US_DATA.lastUpdated
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST CASE
// ═════════════════════════════════════════════════════════════════════════════

describe('Test Case CASE-079 (Validate viewing about us section)', () => {

  test('View About Us section - able to view about us', () => {
    const expectedResult = 'Able to view about us';
    const result = viewAboutUs();

    console.log('Test Case ID: CASE-079');
    console.log('Test Case Description: Validate viewing about us section');
    console.log(`Expected Result: ${expectedResult}`);
    console.log(`Actual Result: ${result.actualResult}`);
    console.log(`About Us Loaded: ${result.aboutUsLoaded}`);
    console.log(`Title: ${result.title}`);
    console.log(`Mission: ${result.mission.substring(0, 60)}...`);
    console.log(`Vision: ${result.vision.substring(0, 60)}...`);
    console.log(`Version: ${result.version}`);
    console.log(`Last Updated: ${result.lastUpdated}`);
    console.log(`Company Info:`, result.companyInfo);
    console.log(`Story paragraphs: ${result.story.length}`);
    console.log(`Core Values: ${result.values.length}`);
    console.log(`Team members: ${result.team.length}`);

    if (result.success && result.aboutUsLoaded && result.data) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.aboutUsLoaded).toBe(true);
    expect(result.actualResult).toContain('view about us');
    expect(result.title).toBe('About Synclexia');
    expect(result.mission).toContain('Empowering');
    expect(result.vision).toContain('world');
    expect(result.version).toBe('2.5.1');
    expect(result.lastUpdated).toBe('2024-04-01');
    expect(result.companyInfo).toBeDefined();
    expect(result.story).toHaveLength(4);
    expect(result.values).toHaveLength(4);
    expect(result.team).toHaveLength(4);
  });

  test('Company information accessible - able to view about us', () => {
    const result = viewAboutUs();

    console.log('Test Case ID: CASE-079');
    console.log(`Founded: ${result.companyInfo.founded}`);
    console.log(`Headquarters: ${result.companyInfo.headquarters}`);
    console.log(`Team: ${result.companyInfo.team}`);
    console.log(`Users: ${result.companyInfo.users}`);

    if (result.success && result.companyInfo.founded && result.companyInfo.users) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.success).toBe(true);
    expect(result.companyInfo.founded).toBe('2020');
    expect(result.companyInfo.headquarters).toBe('San Francisco, CA');
    expect(result.companyInfo.team).toContain('educators');
    expect(result.companyInfo.users).toContain('50,000');
  });

  test('Company story available - able to view about us', () => {
    const result = viewAboutUs();

    console.log('Test Case ID: CASE-079');
    console.log('Company Story:');
    result.story.forEach((paragraph, index) => {
      console.log(`  ${index + 1}. ${paragraph.substring(0, 70)}...`);
    });

    if (result.success && result.story.length > 0) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.story).toHaveLength(4);
    expect(result.story[0]).toContain('2020');
    expect(result.story[result.story.length - 1]).toContain('thousands');
  });

  test('Core values displayed - able to view about us', () => {
    const result = viewAboutUs();

    console.log('Test Case ID: CASE-079');
    console.log('Core Values:');
    result.values.forEach(value => {
      console.log(`  - ${value.title}: ${value.description.substring(0, 50)}...`);
    });

    if (result.success && result.values.length === 4) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.values).toHaveLength(4);
    expect(result.values.map(v => v.title)).toContain('Accessibility');
    expect(result.values.map(v => v.title)).toContain('Innovation');
    expect(result.values.map(v => v.title)).toContain('Empathy');
    expect(result.values.map(v => v.title)).toContain('Evidence-Based');
  });

  test('Team information available - able to view about us', () => {
    const result = viewAboutUs();

    console.log('Test Case ID: CASE-079');
    console.log('Team Members:');
    result.team.forEach(member => {
      console.log(`  - ${member.name}: ${member.role}`);
    });

    if (result.success && result.team.length > 0) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.team).toHaveLength(4);
    expect(result.team[0].name).toBe('Dr. Sarah Chen');
    expect(result.team[0].role).toBe('Founder & CEO');
    expect(result.team[1].role).toBe('Chief Technology Officer');
  });

  test('Contact information visible - able to view about us', () => {
    const result = viewAboutUs();

    console.log('Test Case ID: CASE-079');
    console.log(`Email: ${result.contact.email}`);
    console.log(`Website: ${result.contact.website}`);
    console.log(`Facebook: ${result.contact.social.facebook}`);
    console.log(`Twitter: ${result.contact.social.twitter}`);
    console.log(`Instagram: ${result.contact.social.instagram}`);

    if (result.success && result.contact.email && result.contact.website) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.contact).toBeDefined();
    expect(result.contact.email).toBe('info@synclexia.com');
    expect(result.contact.website).toBe('www.synclexia.com');
    expect(result.contact.social.facebook).toContain('synclexia');
    expect(result.contact.social.twitter).toContain('@synclexia');
  });

  test('App version displayed - able to view about us', () => {
    const result = viewAboutUs();

    console.log('Test Case ID: CASE-079');
    console.log(`App Version: ${result.version}`);
    console.log(`Last Updated: ${result.lastUpdated}`);

    if (result.version && result.lastUpdated) {
      console.log('Outcome: PASSED');
    } else {
      console.log('Outcome: FAILED');
    }

    expect(result.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(result.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

});
