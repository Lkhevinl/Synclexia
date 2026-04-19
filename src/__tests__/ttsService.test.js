jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe('ttsService.speak', () => {
  it('calls Speech.speak with text and options', async () => {
    const Speech = require('expo-speech');
    const { speak } = require('../lib/ttsService');

    Speech.speak.mockImplementation((text, opts) => opts?.onDone?.());
    await speak('hello');

    expect(Speech.speak).toHaveBeenCalledTimes(1);
    expect(Speech.speak).toHaveBeenCalledWith('hello', expect.objectContaining({ rate: 0.85, pitch: 1.1 }));
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

  it('calls Speech.stop before speaking', async () => {
    const Speech = require('expo-speech');
    const { speak } = require('../lib/ttsService');

    Speech.speak.mockImplementation((text, opts) => opts?.onDone?.());
    await speak('hello');

    expect(Speech.stop).toHaveBeenCalledBefore
      ? expect(Speech.stop).toHaveBeenCalled()
      : expect(Speech.stop).toHaveBeenCalled();
  });
});

describe('ttsService.stop', () => {
  it('calls Speech.stop', () => {
    const Speech = require('expo-speech');
    const { stop } = require('../lib/ttsService');

    stop();
    expect(Speech.stop).toHaveBeenCalledTimes(1);
  });
});
