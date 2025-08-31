export class BlogNowError extends Error {
  public readonly code: string;
  public readonly status?: number;
  public readonly details?: any;

  constructor(message: string, code: string, status?: number, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class APIKeyError extends BlogNowError {
  constructor(message = "Invalid or missing API key", details?: any) {
    super(message, "INVALID_API_KEY", 401, details);
  }
}

export class NotFoundError extends BlogNowError {
  constructor(message = "Resource not found", details?: any) {
    super(message, "NOT_FOUND", 404, details);
  }
}

export class ValidationError extends BlogNowError {
  constructor(message = "Request validation failed", details?: any) {
    super(message, "VALIDATION_ERROR", 422, details);
  }
}

export class RateLimitError extends BlogNowError {
  public readonly retryAfter?: number;

  constructor(message = "Rate limit exceeded", retryAfter?: number, details?: any) {
    super(message, "RATE_LIMIT_EXCEEDED", 429, details);
    this.retryAfter = retryAfter;
  }
}

export class ServerError extends BlogNowError {
  constructor(message = "Internal server error", status = 500, details?: any) {
    super(message, "SERVER_ERROR", status, details);
  }
}

export class NetworkError extends BlogNowError {
  constructor(message = "Network connectivity issue", details?: any) {
    super(message, "NETWORK_ERROR", undefined, details);
  }
}

export class TimeoutError extends BlogNowError {
  constructor(message = "Request timeout", details?: any) {
    super(message, "TIMEOUT", undefined, details);
  }
}

export class ConfigurationError extends BlogNowError {
  constructor(message = "SDK configuration error", details?: any) {
    super(message, "CONFIGURATION_ERROR", undefined, details);
  }
}

export function createErrorFromResponse(status: number, message: string, details?: any): BlogNowError {
  switch (status) {
    case 401: {
      return new APIKeyError(message, details);
    }
    case 404: {
      return new NotFoundError(message, details);
    }
    case 422: {
      return new ValidationError(message, details);
    }
    case 429: {
      const retryAfter = details?.retryAfter || details?.["retry-after"];
      return new RateLimitError(message, retryAfter, details);
    }
    case 500:
    case 502:
    case 503:
    case 504: {
      return new ServerError(message, status, details);
    }
    default: {
      return new BlogNowError(message, "HTTP_ERROR", status, details);
    }
  }
}