import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up any timers
  jest.clearAllTimers();
});

afterAll(() => {
  // Force cleanup of any remaining handles
  jest.restoreAllMocks();
});