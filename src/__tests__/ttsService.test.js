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

global.window = {
  speechSynthesis: {
    cancel: jest.fn(),
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ttsService.speak', () => {
  it('calls Speech.speak with text and options', async () => {
    const Speech = require('expo-speech');
    const { speak } = require('../lib/ttsService');

    Speech.speak.mockImplementation((text, opts) => opts?.onDone?.());
    await speak('hello');

    expect(Speech.speak).toHaveBeenCalledTimes(1);
    expect(Speech.speak).toHaveBeenCalledWith(
      'hello',
      expect.objectContaining({ language: 'en-US', rate: 0.75 })
    );
  });

  it('does nothing for empty text', async () => {
    const Speech = require('expo-speech');
    const { speak } = require('../lib/ttsService');

    await speak('');
    expect(Speech.speak).not.toHaveBeenCalled();
  });

  it('does nothing for whitespace-only text', async () => {
    const Speech = require('expo-speech');
    const { speak } = require('../lib/ttsService');

    await speak('   ');
    expect(Speech.speak).not.toHaveBeenCalled();
  });

  it('calls stop before speaking', async () => {
    const { speak } = require('../lib/ttsService');

    // speak() calls stop() which calls window.speechSynthesis.cancel (not Speech.stop) in web env
    await speak('hello');

    // Verify that the stop was called (by checking window.speechSynthesis)
    expect(global.window.speechSynthesis.cancel).toHaveBeenCalled();
  });
});

describe('ttsService.stop', () => {
  it('calls appropriate stop method based on platform', async () => {
    const { stop } = require('../lib/ttsService');
    const { Platform } = require('react-native');

    await stop();

    // Platform.OS is 'web' in test environment, so window.speechSynthesis.cancel should be called
    if (Platform.OS === 'web') {
      expect(global.window.speechSynthesis.cancel).toHaveBeenCalledTimes(1);
    } else {
      const Speech = require('expo-speech');
      expect(Speech.stop).toHaveBeenCalledTimes(1);
    }
  });
});

describe('ttsService.speak — voice parameter', () => {
  it('invokes openai-tts with voice "onyx"', async () => {
    const { supabase } = require('../lib/supabase');
    const { speak } = require('../lib/ttsService');
    const Speech = require('expo-speech');
    Speech.speak.mockImplementation((text, opts) => opts?.onDone?.());

    await speak('hello');

    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'openai-tts',
      { body: { text: 'hello', voice: 'onyx' } }
    );
  });
});
