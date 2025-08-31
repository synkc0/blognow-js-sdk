import { HttpClient } from '../src/utils/http';
import { 
  ConfigurationError, 
  APIKeyError, 
  TimeoutError,
  NetworkError 
} from '../src/utils/errors';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('HttpClient', () => {
  const validConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.test.com',
    timeout: 5000,
    retries: 2,
    rateLimitPerSecond: 1000, // High rate limit for testing
    debug: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create HttpClient with valid config', () => {
      expect(() => new HttpClient(validConfig)).not.toThrow();
    });

    it('should throw ConfigurationError when apiKey is missing', () => {
      expect(() => new HttpClient({ ...validConfig, apiKey: '' })).toThrow(ConfigurationError);
    });

    it('should use default values for optional config', () => {
      const client = new HttpClient({ apiKey: 'test-key' });
      expect(client).toBeDefined();
    });
  });

  describe('HTTP Methods', () => {
    let client: HttpClient;

    beforeEach(() => {
      client = new HttpClient(validConfig);
    });

    afterEach(() => {
      client.destroy();
    });

    it('should make GET request successfully', async () => {
      const mockResponse = { data: { id: 1, title: 'Test Post' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await client.get('/api/posts');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/posts',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should make POST request with body', async () => {
      const requestBody = { title: 'New Post', content: 'Post content' };
      const mockResponse = { data: { id: 1, ...requestBody } };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await client.post('/api/posts', requestBody);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/posts',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await client.get('/api/posts', { page: 1, size: 10, status: 'published' });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/posts?page=1&size=10&status=published',
        expect.any(Object)
      );
    });

    it('should handle array query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await client.get('/api/posts', { tags: ['javascript', 'typescript'] });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/posts?tags=javascript&tags=typescript',
        expect.any(Object)
      );
    });

    it('should throw APIKeyError for 401 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Invalid API key' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await expect(client.get('/api/posts')).rejects.toThrow(APIKeyError);
    });

    it('should handle timeout', async () => {
      const client = new HttpClient({ ...validConfig, timeout: 100 });
      
      mockFetch.mockImplementation(() => new Promise((resolve) => {
        // Never resolve to simulate timeout
      }));

      await expect(client.get('/api/posts')).rejects.toThrow(TimeoutError);
      client.destroy();
    }, 10000);

    it('should retry on network error', async () => {
      const client = new HttpClient({ ...validConfig, retries: 2 });
      
      mockFetch
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' }),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);

      const result = await client.get('/api/posts');
      
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toBe('success');
      client.destroy();
    });

    it('should retry on server error', async () => {
      const client = new HttpClient({ ...validConfig, retries: 2 });
      
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ message: 'Server error' }),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' }),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);

      const result = await client.get('/api/posts');
      
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toBe('success');
      client.destroy();
    });

    it('should handle rate limiting with retry-after header', async () => {
      const client = new HttpClient({ ...validConfig, retries: 2 });
      
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: new Headers({ 
            'content-type': 'application/json',
            'retry-after': '0' // No delay for testing
          }),
          json: async () => ({ message: 'Rate limited' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' }),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);

      const result = await client.get('/api/posts');
      
      expect(result).toBe('success');
      client.destroy();
    });

    it('should throw NetworkError after max retries', async () => {
      const client = new HttpClient({ ...validConfig, retries: 1 });
      
      mockFetch
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockRejectedValueOnce(new TypeError('Network error'));

      await expect(client.get('/api/posts')).rejects.toThrow(NetworkError);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      client.destroy();
    });
  });

  describe('Rate Limiting', () => {
    it('should create client with rate limit configuration', () => {
      const client = new HttpClient({ 
        ...validConfig, 
        rateLimitPerSecond: 2 
      });

      expect(client).toBeDefined();
      client.destroy();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on destroy', () => {
      const client = new HttpClient(validConfig);
      expect(() => client.destroy()).not.toThrow();
    });
  });
});