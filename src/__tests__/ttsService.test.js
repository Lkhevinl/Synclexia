jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    Sound: {
      createAsync: jest.fn(),
    },
  },
}));

jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file:///cache/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  EncodingType: { Base64: 'base64' },
}));

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

const mockGoodFetch = () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: async () => new ArrayBuffer(100),
  });
};

describe('ttsService.speak', () => {
  it('calls ElevenLabs API and plays audio on success', async () => {
    const { Audio } = require('expo-av');
    const { speak } = require('../lib/ttsService');

    mockGoodFetch();
    let statusCb;
    const mockSound = {
      setOnPlaybackStatusUpdate: jest.fn(cb => { statusCb = cb; }),
      stopAsync: jest.fn().mockResolvedValue(undefined),
      unloadAsync: jest.fn().mockResolvedValue(undefined),
    };
    Audio.Sound.createAsync.mockResolvedValue({ sound: mockSound });

    const p = speak('hello');
    await new Promise(r => setTimeout(r, 20));
    statusCb({ didJustFinish: true });
    await p;

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(Audio.Sound.createAsync).toHaveBeenCalledTimes(1);
  });

  it('serves second call from cache without fetching again', async () => {
    const { Audio } = require('expo-av');
    const { speak } = require('../lib/ttsService');

    mockGoodFetch();
    let statusCb;
    const mockSound = {
      setOnPlaybackStatusUpdate: jest.fn(cb => { statusCb = cb; }),
      stopAsync: jest.fn().mockResolvedValue(undefined),
      unloadAsync: jest.fn().mockResolvedValue(undefined),
    };
    Audio.Sound.createAsync.mockResolvedValue({ sound: mockSound });

    const p1 = speak('hello');
    await new Promise(r => setTimeout(r, 20));
    statusCb({ didJustFinish: true });
    await p1;

    const p2 = speak('hello');
    await new Promise(r => setTimeout(r, 20));
    statusCb({ didJustFinish: true });
    await p2;

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('does not create audio when API returns non-ok response', async () => {
    const { Audio } = require('expo-av');
    const { speak } = require('../lib/ttsService');

    global.fetch = jest.fn().mockResolvedValue({ ok: false, text: async () => '' });
    await speak('hello');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(Audio.Sound.createAsync).not.toHaveBeenCalled();
  });

  it('does not create audio when fetch throws (network error)', async () => {
    const { Audio } = require('expo-av');
    const { speak } = require('../lib/ttsService');

    global.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));
    await speak('hello');

    expect(Audio.Sound.createAsync).not.toHaveBeenCalled();
  });

  it('does nothing for empty text', async () => {
    const { speak } = require('../lib/ttsService');
    global.fetch = jest.fn();
    await speak('');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('does nothing for whitespace-only text', async () => {
    const { speak } = require('../lib/ttsService');
    global.fetch = jest.fn();
    await speak('   ');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('ttsService.stop', () => {
  it('resolves an in-flight speak promise immediately', async () => {
    const { Audio } = require('expo-av');
    const { speak, stop } = require('../lib/ttsService');

    mockGoodFetch();
    const mockSound = {
      setOnPlaybackStatusUpdate: jest.fn(),
      stopAsync: jest.fn().mockResolvedValue(undefined),
      unloadAsync: jest.fn().mockResolvedValue(undefined),
    };
    Audio.Sound.createAsync.mockResolvedValue({ sound: mockSound });

    const p = speak('hello world');
    await new Promise(r => setTimeout(r, 50));
    stop();
    await p;
  });
});
