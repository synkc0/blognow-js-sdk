import {
  BlogNowError,
  APIKeyError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  NetworkError,
  TimeoutError,
  ConfigurationError,
  createErrorFromResponse,
} from '../src/utils/errors';

describe('Error Classes', () => {
  describe('BlogNowError', () => {
    it('should create base error with correct properties', () => {
      const error = new BlogNowError('Test message', 'TEST_CODE', 400, { detail: 'test' });
      
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.status).toBe(400);
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.name).toBe('BlogNowError');
    });
  });

  describe('APIKeyError', () => {
    it('should create API key error with default message', () => {
      const error = new APIKeyError();
      
      expect(error.message).toBe('Invalid or missing API key');
      expect(error.code).toBe('INVALID_API_KEY');
      expect(error.status).toBe(401);
    });

    it('should create API key error with custom message', () => {
      const error = new APIKeyError('Custom API key error');
      
      expect(error.message).toBe('Custom API key error');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error', () => {
      const error = new NotFoundError();
      
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError();
      
      expect(error.message).toBe('Request validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.status).toBe(422);
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with retry after', () => {
      const error = new RateLimitError('Rate limited', 60);
      
      expect(error.message).toBe('Rate limited');
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.status).toBe(429);
      expect(error.retryAfter).toBe(60);
    });
  });

  describe('ServerError', () => {
    it('should create server error', () => {
      const error = new ServerError();
      
      expect(error.message).toBe('Internal server error');
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.status).toBe(500);
    });

    it('should create server error with custom status', () => {
      const error = new ServerError('Service unavailable', 503);
      
      expect(error.message).toBe('Service unavailable');
      expect(error.status).toBe(503);
    });
  });

  describe('NetworkError', () => {
    it('should create network error', () => {
      const error = new NetworkError();
      
      expect(error.message).toBe('Network connectivity issue');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.status).toBeUndefined();
    });
  });

  describe('TimeoutError', () => {
    it('should create timeout error', () => {
      const error = new TimeoutError();
      
      expect(error.message).toBe('Request timeout');
      expect(error.code).toBe('TIMEOUT');
    });
  });

  describe('ConfigurationError', () => {
    it('should create configuration error', () => {
      const error = new ConfigurationError();
      
      expect(error.message).toBe('SDK configuration error');
      expect(error.code).toBe('CONFIGURATION_ERROR');
    });
  });

  describe('createErrorFromResponse', () => {
    it('should create APIKeyError for 401 status', () => {
      const error = createErrorFromResponse(401, 'Unauthorized');
      
      expect(error).toBeInstanceOf(APIKeyError);
      expect(error.message).toBe('Unauthorized');
    });

    it('should create NotFoundError for 404 status', () => {
      const error = createErrorFromResponse(404, 'Not found');
      
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe('Not found');
    });

    it('should create ValidationError for 422 status', () => {
      const error = createErrorFromResponse(422, 'Validation failed');
      
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Validation failed');
    });

    it('should create RateLimitError for 429 status', () => {
      const error = createErrorFromResponse(429, 'Too many requests', { retryAfter: 60 });
      
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.message).toBe('Too many requests');
      expect((error as RateLimitError).retryAfter).toBe(60);
    });

    it('should create ServerError for 5xx status codes', () => {
      const error500 = createErrorFromResponse(500, 'Internal server error');
      const error502 = createErrorFromResponse(502, 'Bad gateway');
      const error503 = createErrorFromResponse(503, 'Service unavailable');
      
      expect(error500).toBeInstanceOf(ServerError);
      expect(error502).toBeInstanceOf(ServerError);
      expect(error503).toBeInstanceOf(ServerError);
    });

    it('should create generic BlogNowError for other status codes', () => {
      const error = createErrorFromResponse(418, 'I am a teapot');
      
      expect(error).toBeInstanceOf(BlogNowError);
      expect(error.code).toBe('HTTP_ERROR');
      expect(error.status).toBe(418);
    });
  });
});