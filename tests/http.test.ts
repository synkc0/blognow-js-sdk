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

  let clients: HttpClient[] = [];

  const createClient = (config = validConfig) => {
    const client = new HttpClient(config);
    clients.push(client);
    return client;
  };

  afterEach(() => {
    // Clean up all created clients
    clients.forEach(client => client.destroy());
    clients = [];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create HttpClient with valid config', () => {
      expect(() => createClient()).not.toThrow();
    });

    it('should throw ConfigurationError when apiKey is missing', () => {
      expect(() => createClient({ ...validConfig, apiKey: '' })).toThrow(ConfigurationError);
    });

    it('should use default values for optional config', () => {
      const client = createClient({ apiKey: 'test-key' });
      expect(client).toBeDefined();
    });
  });

  describe('HTTP Methods', () => {
    let client: HttpClient;

    beforeEach(() => {
      client = createClient();
    });

    afterEach(() => {
      // Client will be destroyed in afterEach
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
      const client = createClient({ ...validConfig, timeout: 100 });
      
      // Mock fetch to simulate a hanging request that gets aborted
      mockFetch.mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const error = new Error('AbortError');
            error.name = 'AbortError';
            reject(error);
          }, 50); // Abort before timeout
        });
      });

      await expect(client.get('/api/posts')).rejects.toThrow(TimeoutError);
      // Client will be destroyed in afterEach
    }, 1000);

    it('should retry on network error', async () => {
      const client = createClient({ ...validConfig, retries: 2 });
      
      const networkError = new TypeError('fetch failed');
      
      mockFetch
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' }),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);

      const result = await client.get('/api/posts');
      
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toBe('success');
      // Client will be destroyed in afterEach
    });

    it('should retry on server error', async () => {
      const client = createClient({ ...validConfig, retries: 2 });
      
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
      // Client will be destroyed in afterEach
    });

    it('should handle rate limiting with retry-after header', async () => {
      const client = createClient({ ...validConfig, retries: 2 });
      
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
      // Client will be destroyed in afterEach
    });

    it('should throw NetworkError after max retries', async () => {
      const client = createClient({ ...validConfig, retries: 1 });
      
      const networkError = new TypeError('fetch failed');
      
      mockFetch
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError);

      await expect(client.get('/api/posts')).rejects.toThrow(NetworkError);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      // Client will be destroyed in afterEach
    });
  });

  describe('Rate Limiting', () => {
    it('should create client with rate limit configuration', () => {
      const client = createClient({ 
        ...validConfig, 
        rateLimitPerSecond: 2 
      });

      expect(client).toBeDefined();
      // Client will be destroyed in afterEach
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on destroy', () => {
      const client = createClient();
      expect(() => client.destroy()).not.toThrow();
    });
  });
});