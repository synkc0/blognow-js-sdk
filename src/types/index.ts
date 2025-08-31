export * from "./common";
export * from "./posts";

export interface BlogNowConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  rateLimitPerSecond?: number;
  debug?: boolean;
  customHeaders?: Record<string, string>;
}

export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
}