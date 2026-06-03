import '@testing-library/jest-dom';

// Polyfill for structureClone if needed in some jsdom environments
if (typeof structuredClone === 'undefined') {
  global.structuredClone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
