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

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
    },
  },
}));

// Setup global window for web platform fallback
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();

  // Override Platform.OS after resetting modules
  const { Platform } = require('react-native');
  Object.defineProperty(Platform, 'OS', {
    value: 'android',
    configurable: true,
  });

  if (typeof window === 'undefined') {
    global.window = {
      speechSynthesis: {
        cancel: jest.fn(),
      },
    };
  }
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
    const Speech = require('expo-speech');
    const { speak } = require('../lib/ttsService');

    Speech.speak.mockImplementation((text, opts) => opts?.onDone?.());
    await speak('hello');

    expect(Speech.stop).toHaveBeenCalled();
  });
});

describe('ttsService.stop', () => {
  it('calls Speech.stop on non-web platform', async () => {
    const Speech = require('expo-speech');
    const { stop } = require('../lib/ttsService');

    await stop();

    expect(Speech.stop).toHaveBeenCalledTimes(1);
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
