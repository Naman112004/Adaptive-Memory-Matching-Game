import '@testing-library/jest-dom';

// Mock Web Audio API for tests
class AudioContextMock {
  createOscillator() {
    return {
      connect: () => {},
      start: () => {},
      stop: () => {},
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      type: 'sine',
    };
  }
  createGain() {
    return {
      connect: () => {},
      gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
    };
  }
  get currentTime() {
    return 0;
  }
  close() {}
}

const globalWindow = window as unknown as { AudioContext?: typeof AudioContextMock; webkitAudioContext?: typeof AudioContextMock };
globalWindow.AudioContext = globalWindow.AudioContext || AudioContextMock;
globalWindow.webkitAudioContext = globalWindow.webkitAudioContext || AudioContextMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
