import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});