jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
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

jest.mock('../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn().mockResolvedValue({ data: null, error: new Error('mock') }),
    },
  },
}));

const { Platform } = require('react-native');
console.log('Platform.OS:', Platform.OS);

const { stop } = require('./src/lib/ttsService');
console.log('stop function:', typeof stop);

stop();
console.log('Test passed');
