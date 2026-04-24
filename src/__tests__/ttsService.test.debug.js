jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

jest.mock('../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn().mockResolvedValue({ data: null, error: new Error('mock') }),
    },
  },
}));

jest.mock('react-native', () => {
  const actualModule = jest.requireActual('react-native');
  return {
    ...actualModule,
    Platform: {
      ...actualModule.Platform,
      OS: 'android',
    },
  };
});

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
    },
  },
}));

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe('debug', () => {
  it('check platform', () => {
    const { Platform } = require('react-native');
    console.log('Platform.OS:', Platform.OS);
    console.log('Platform:', Platform);
    const { stop } = require('../lib/ttsService');
    console.log('About to call stop');
    stop();
    console.log('stop() called successfully');
  });
});
