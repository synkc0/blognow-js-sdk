import { BlogNowConfig, RequestOptions } from "../types";
import {
  createErrorFromResponse,
  NetworkError,
  TimeoutError,
  ConfigurationError,
} from "./errors";

export class HttpClient {
  private config: Required<BlogNowConfig>;
  private rateLimitQueue: Array<() => void> = [];
  private rateLimitTimer?: ReturnType<typeof setInterval>;

  constructor(config: BlogNowConfig) {
    if (!config.apiKey) {
      throw new ConfigurationError("API key is required");
    }

    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || "https://api.blognow.com",
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      rateLimitPerSecond: config.rateLimitPerSecond || 10,
      debug: config.debug || false,
      customHeaders: config.customHeaders || {},
    };

    this.setupRateLimit();
  }

  private setupRateLimit(): void {
    if (this.rateLimitTimer) {
      clearInterval(this.rateLimitTimer);
    }

    const interval = 1000 / this.config.rateLimitPerSecond;
    this.rateLimitTimer = setInterval(() => {
      const next = this.rateLimitQueue.shift();
      if (next) {
        next();
      }
    }, interval);
  }

  private async waitForRateLimit(): Promise<void> {
    return new Promise((resolve) => {
      this.rateLimitQueue.push(resolve);
    });
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(path, this.config.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    return url.toString();
  }

  private getHeaders(
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
      "User-Agent": "@blognow/sdk/1.0.0",
      ...this.config.customHeaders,
      ...customHeaders,
    };
  }

  private async makeRequest<T>(
    options: RequestOptions,
    attempt = 1
  ): Promise<T> {
    await this.waitForRateLimit();

    const url = this.buildUrl(options.path, options.params);
    const headers = this.getHeaders(options.headers);

    if (this.config.debug) {
      console.log(`[BlogNow SDK] ${options.method} ${url}`, {
        headers: this.sanitizeHeaders(headers),
        body: options.body,
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (this.config.debug) {
        console.log(`[BlogNow SDK] Response ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          headers: this.headersToObject(response.headers),
        });
      }

      if (!response.ok) {
        await this.handleErrorResponse(response, options, attempt);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data.data || data;
      }

      return response.text() as unknown as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new TimeoutError(
          `Request timed out after ${this.config.timeout}ms`
        );
      }

      if (error instanceof TypeError && error.message.includes("fetch")) {
        if (attempt <= this.config.retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.makeRequest<T>(options, attempt + 1);
        }
        throw new NetworkError("Network request failed", error);
      }

      throw error;
    }
  }

  private async handleErrorResponse(
    response: Response,
    options: RequestOptions,
    attempt: number
  ): Promise<never> {
    let errorData: any;

    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        errorData = await response.text();
      }
    } catch {
      errorData = null;
    }

    const message =
      errorData?.message || errorData?.error || response.statusText;

    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after");
      if (retryAfter && attempt <= this.config.retries) {
        const delay = parseInt(retryAfter) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.makeRequest(options, attempt + 1) as never;
      }
    }

    if (response.status >= 500 && attempt <= this.config.retries) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.makeRequest(options, attempt + 1) as never;
    }

    throw createErrorFromResponse(response.status, message, errorData);
  }

  private headersToObject(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private sanitizeHeaders(
    headers: Record<string, string>
  ): Record<string, string> {
    const sanitized = { ...headers };
    if (sanitized.Authorization) {
      sanitized.Authorization = "Bearer [REDACTED]";
    }
    return sanitized;
  }

  public async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    return this.makeRequest<T>({ method: "GET", path, params });
  }

  public async post<T>(
    path: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.makeRequest<T>({ method: "POST", path, body, headers });
  }

  public async put<T>(
    path: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.makeRequest<T>({ method: "PUT", path, body, headers });
  }

  public async patch<T>(
    path: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.makeRequest<T>({ method: "PATCH", path, body, headers });
  }

  public async delete<T>(
    path: string,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.makeRequest<T>({ method: "DELETE", path, headers });
  }

  public destroy(): void {
    if (this.rateLimitTimer) {
      clearInterval(this.rateLimitTimer);
    }
    this.rateLimitQueue.length = 0;
  }
}
