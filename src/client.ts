import { BlogNowConfig } from "./types";
import { HttpClient } from "./utils/http";
import { PostsService } from "./services/posts";
import { ConfigurationError } from "./utils/errors";

export class BlogNowClient {
  private http: HttpClient;
  
  public readonly posts: PostsService;

  constructor(config: BlogNowConfig) {
    this.validateConfig(config);
    
    this.http = new HttpClient(config);
    
    this.posts = new PostsService(this.http);
  }

  private validateConfig(config: BlogNowConfig): void {
    if (!config) {
      throw new ConfigurationError("Configuration is required");
    }

    if (!config.apiKey) {
      throw new ConfigurationError("API key is required");
    }

    if (typeof config.apiKey !== "string" || config.apiKey.trim() === "") {
      throw new ConfigurationError("API key must be a non-empty string");
    }

    if (config.baseUrl && typeof config.baseUrl !== "string") {
      throw new ConfigurationError("Base URL must be a string");
    }

    if (config.timeout && (typeof config.timeout !== "number" || config.timeout <= 0)) {
      throw new ConfigurationError("Timeout must be a positive number");
    }

    if (config.retries && (typeof config.retries !== "number" || config.retries < 0)) {
      throw new ConfigurationError("Retries must be a non-negative number");
    }

    if (config.rateLimitPerSecond && (typeof config.rateLimitPerSecond !== "number" || config.rateLimitPerSecond <= 0)) {
      throw new ConfigurationError("Rate limit must be a positive number");
    }

    if (config.debug && typeof config.debug !== "boolean") {
      throw new ConfigurationError("Debug must be a boolean");
    }

    if (config.customHeaders && (typeof config.customHeaders !== "object" || Array.isArray(config.customHeaders))) {
      throw new ConfigurationError("Custom headers must be an object");
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.http.get<{ status: string; timestamp: string }>("/api/v1/health");
  }

  getConfig(): Readonly<Required<BlogNowConfig>> {
    return Object.freeze({ ...(this.http as any).config });
  }

  destroy(): void {
    this.http.destroy();
  }
}