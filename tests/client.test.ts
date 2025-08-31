import { BlogNowClient } from '../src/client';
import { ConfigurationError } from '../src/utils/errors';
import { PostsService } from '../src/services/posts';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('BlogNowClient', () => {
  const validConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.test.com',
    timeout: 5000,
    retries: 2,
    debug: false,
  };

  let clients: BlogNowClient[] = [];

  const createClient = (config = validConfig) => {
    const client = new BlogNowClient(config);
    clients.push(client);
    return client;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up all created clients
    clients.forEach(client => client.destroy());
    clients = [];
  });

  describe('Constructor', () => {
    it('should create client with valid config', () => {
      const client = createClient();
      
      expect(client).toBeDefined();
      expect(client.posts).toBeInstanceOf(PostsService);
    });

    it('should throw ConfigurationError for missing config', () => {
      expect(() => new BlogNowClient(null as any)).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError for missing apiKey', () => {
      expect(() => new BlogNowClient({ apiKey: '' })).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError for non-string apiKey', () => {
      expect(() => new BlogNowClient({ apiKey: 123 as any })).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError for invalid baseUrl', () => {
      expect(() => new BlogNowClient({ 
        apiKey: 'test', 
        baseUrl: 123 as any 
      })).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError for invalid timeout', () => {
      expect(() => new BlogNowClient({ 
        apiKey: 'test', 
        timeout: -1 
      })).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError for invalid retries', () => {
      expect(() => new BlogNowClient({ 
        apiKey: 'test', 
        retries: -1 
      })).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError for invalid rateLimitPerSecond', () => {
      expect(() => new BlogNowClient({ 
        apiKey: 'test', 
        rateLimitPerSecond: -1 
      })).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError for invalid debug flag', () => {
      expect(() => new BlogNowClient({ 
        apiKey: 'test', 
        debug: 'true' as any 
      })).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError for invalid customHeaders', () => {
      expect(() => new BlogNowClient({ 
        apiKey: 'test', 
        customHeaders: [] as any 
      })).toThrow(ConfigurationError);
    });

    it('should use default values when not provided', () => {
      const client = createClient({ apiKey: 'test-key' });
      
      expect(client).toBeDefined();
      expect(client.posts).toBeInstanceOf(PostsService);
    });
  });

  describe('Health Check', () => {
    it('should perform health check successfully', async () => {
      const client = createClient();
      const mockResponse = { 
        status: 'healthy', 
        timestamp: '2023-01-01T00:00:00Z' 
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await client.healthCheck();
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/health',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Configuration', () => {
    it('should return frozen configuration', () => {
      const client = createClient();
      const config = client.getConfig();
      
      expect(config).toBeDefined();
      expect(config.apiKey).toBe(validConfig.apiKey);
      expect(config.baseUrl).toBe(validConfig.baseUrl);
      expect(Object.isFrozen(config)).toBe(true);
    });

    it('should not allow modification of returned config', () => {
      const client = createClient();
      const config = client.getConfig();
      
      expect(() => {
        (config as any).apiKey = 'modified';
      }).toThrow();
    });
  });

  describe('Services', () => {
    it('should initialize posts service', () => {
      const client = createClient();
      
      expect(client.posts).toBeInstanceOf(PostsService);
      expect(client.posts).toBeDefined();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on destroy', () => {
      const client = createClient();
      
      expect(() => client.destroy()).not.toThrow();
    });
  });
});