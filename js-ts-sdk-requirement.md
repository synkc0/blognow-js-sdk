# JavaScript/TypeScript SDK/NPM Package Requirements Document

## Overview

This document outlines the requirements for creating a JavaScript/TypeScript SDK that allows developers to integrate with the BlogNow backend API using API key authentication. The SDK should provide a simple, type-safe interface for all third-party API endpoints.

## Development Approach

### Manual Implementation (Recommended)

- **Full control**: Custom implementation tailored to our specific API requirements
- **Type safety**: Native TypeScript support with exact schema matching
- **Zero dependencies**: Lightweight bundle with minimal external dependencies
- **Custom optimizations**: Implement specific features like auto-pagination and intelligent retry logic

### Alternative: Code Generation

- Could use OpenAPI/Swagger generators as a starting point, but manual refinement will be needed
- Generated code often lacks the polish and developer experience of hand-crafted SDKs
- Our current API structure is well-defined enough for manual implementation

## Project Structure

```
blognow-js-sdk/
├── src/
│   ├── index.ts                 # Main export file
│   ├── client.ts               # Main SDK client class
│   ├── types/                  # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── posts.ts
│   │   ├── categories.ts
│   │   ├── tags.ts
│   │   └── common.ts
│   ├── services/               # Service classes for different endpoints
│   │   ├── posts.ts
│   │   ├── categories.ts
│   │   └── tags.ts
│   └── utils/
│       ├── http.ts             # HTTP client utilities
│       └── errors.ts           # Custom error classes
├── dist/                       # Compiled JavaScript output
├── tests/                      # Test files
├── examples/                   # Usage examples
├── package.json
├── tsconfig.json
├── README.md
└── CHANGELOG.md
```

## Core Requirements

### 1. SDK Client Initialization

- **Primary constructor**: Accept API key and base URL
- **Configuration options**: Timeout, retry logic, custom headers
- **Environment support**: Browser, Node.js, and edge runtime compatibility
- **Authentication**: API key passed via headers for all requests

### 2. API Coverage

The SDK must cover all third-party API endpoints from `/api/v1/posts/` router:

#### Posts API (`/api/v1/posts/`)

- `GET /api/v1/posts/` - Get published posts with pagination and filters
- `GET /api/v1/posts/all` - Get all posts (any status) with pagination and filters
- `GET /api/v1/posts/author/{author_id}` - Get posts by specific author
- `GET /api/v1/posts/{post_slug}` - Get single post by slug
- `POST /api/v1/posts/` - Create new post (if write access available)

#### Additional API endpoints (if exposed via API keys):

- Categories management
- Tags management
- Search functionality

### 3. Type Safety

- **Full TypeScript support**: Complete type definitions for all API responses
- **Request/Response types**: Match the Pydantic schemas from the backend
- **Generic types**: Support for pagination, filtering, and common patterns
- **Enum types**: For status values, filter options, etc.

### 4. Error Handling

- **Custom error classes**: Map HTTP status codes to meaningful errors
- **Error types**:
  - `APIKeyError` - Invalid or missing API key
  - `NotFoundError` - Resource not found (404)
  - `ValidationError` - Request validation failed (422)
  - `RateLimitError` - Rate limit exceeded (429)
  - `ServerError` - Internal server errors (5xx)
  - `NetworkError` - Network connectivity issues

### 5. HTTP Client Features

- **HTTP Library Choice**: Use `fetch` API (native) or `axios` for HTTP requests
- **Automatic retries**: Configurable retry logic with exponential backoff for network failures and 5xx errors
- **Request timeout**: Configurable timeout with default values (30s default)
- **Rate limiting**: Built-in rate limiting to respect API limits (honor 429 responses)
- **Request/Response interceptors**: Allow custom middleware for logging, debugging, or custom headers
- **JSON handling**: Automatic JSON serialization/deserialization
- **Logging**: Optional debug logging for requests/responses (exclude sensitive data like API keys)

### 6. Pagination Support

- **Built-in pagination**: Easy methods to navigate pages
- **Auto-pagination**: Optional iterator/generator for all results
- **Page size configuration**: Respect API limits while allowing customization

### 7. Filtering and Querying

- **Type-safe filters**: Builder pattern or typed filter objects
- **Search functionality**: Full-text search capabilities
- **Sorting options**: Support for different sort orders
- **Status filtering**: Filter by post status (published, draft, archived)
- **Category/Tag filtering**: Filter by categories and tags

## API Methods Structure

### Posts Service

```typescript
class PostsService {
  // Get published posts with pagination
  async getPublishedPosts(
    options?: GetPostsOptions
  ): Promise<PaginatedResponse<Post>>;

  // Get all posts (any status)
  async getAllPosts(
    options?: GetPostsOptions
  ): Promise<PaginatedResponse<Post>>;

  // Get posts by author
  async getPostsByAuthor(
    authorId: string,
    options?: GetPostsOptions
  ): Promise<PaginatedResponse<Post>>;

  // Get single post by slug
  async getPost(slug: string): Promise<Post>;

  // Create new post (if write permissions)
  async createPost(postData: CreatePostRequest): Promise<Post>;

  // Pagination helpers
  async *iterateAllPosts(options?: GetPostsOptions): AsyncGenerator<Post>;
}
```

### Client Configuration

```typescript
interface BlogNowConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  rateLimitPerSecond?: number;
  debug?: boolean;
  customHeaders?: Record<string, string>;
}

class BlogNowClient {
  constructor(config: BlogNowConfig);

  // Service accessors
  posts: PostsService;
  // categories: CategoriesService (if exposed)
  // tags: TagsService (if exposed)
}
```

## Type Definitions Requirements

### 1. Core Types

- Match all Pydantic schemas from backend exactly
- Support for UUID types
- DateTime string formatting
- Optional/nullable field handling

### 2. Request/Response Types

```typescript
interface GetPostsOptions {
  page?: number;
  size?: number;
  status?: PostStatus;
  categoryId?: string;
  authorId?: string;
  isFeatured?: boolean;
  query?: string; // search query
  sortBy?: "created_at" | "updated_at" | "published_at";
  sortOrder?: "asc" | "desc";
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  status: PostStatus;
  publishedAt?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isFeatured: boolean;
  isSticky: boolean;
  workspaceId: string;
  authorId: string;
  categoryId?: string;
  createdAt: string;
  updatedAt?: string;
  author?: User;
  category?: Category;
  tags?: Tag[];
}

enum PostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}
```

## Usage Examples to Support

### 1. Basic Usage

```typescript
import { BlogNowClient } from "@blognow/js-sdk";

const client = new BlogNowClient({
  apiKey: "your-api-key",
  baseUrl: "https://api.blognow.com", // optional
});

// Get published posts
const posts = await client.posts.getPublishedPosts({
  page: 1,
  size: 10,
});

// Get single post
const post = await client.posts.getPost("my-post-slug");
```

### 2. Advanced Filtering

```typescript
// Search and filter
const filteredPosts = await client.posts.getAllPosts({
  query: "javascript tutorial",
  status: PostStatus.PUBLISHED,
  isFeatured: true,
  sortBy: "published_at",
  sortOrder: "desc",
});

// Get posts by author
const authorPosts = await client.posts.getPostsByAuthor("author-uuid", {
  size: 50,
});
```

### 3. Pagination Handling

```typescript
// Manual pagination
let page = 1;
do {
  const response = await client.posts.getPublishedPosts({ page, size: 20 });
  console.log(`Page ${page}: ${response.items.length} posts`);
  page++;
} while (page <= response.pages);

// Auto-pagination with generator
for await (const post of client.posts.iterateAllPosts()) {
  console.log(post.title);
}
```

### 4. Error Handling

```typescript
import { APIKeyError, NotFoundError, RateLimitError } from "@blognow/js-sdk";

try {
  const post = await client.posts.getPost("non-existent-slug");
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log("Post not found");
  } else if (error instanceof APIKeyError) {
    console.log("Invalid API key");
  } else if (error instanceof RateLimitError) {
    console.log("Rate limit exceeded, retry after:", error.retryAfter);
  }
}
```

## Package Requirements

### 1. Package.json Configuration

- **Name**: `@blognow/js-sdk` (scoped package for organization)
- **Version**: Follow semantic versioning (semver) strictly
- **Main exports**: Modern exports field for optimal module resolution
  ```json
  {
    "main": "./dist/cjs/index.js",
    "module": "./dist/esm/index.js",
    "types": "./dist/types/index.d.ts",
    "exports": {
      ".": {
        "import": "./dist/esm/index.js",
        "require": "./dist/cjs/index.js",
        "types": "./dist/types/index.d.ts"
      }
    }
  }
  ```
- **Files**: Include only necessary files in the published package
- **Engines**: Specify Node.js version compatibility
- **Keywords**: Relevant keywords for discoverability
- **Repository**: Link to source code repository
- **Homepage**: Link to documentation/project homepage
- **Bugs**: Link to issue tracker
- **License**: MIT or appropriate open source license
- **Author/Contributors**: Proper attribution
- **Dependencies**: Minimize or eliminate runtime dependencies
- **DevDependencies**: Build tools, testing frameworks, etc.
- **Scripts**: Standard NPM scripts (build, test, lint, etc.)

### 2. Build Process

- **TypeScript compilation**: Generate JavaScript and declaration files (.d.ts)
- **Multiple formats**: 
  - CommonJS (dist/cjs/) for Node.js compatibility
  - ES Modules (dist/esm/) for modern bundlers
  - UMD (dist/umd/) for direct browser usage
- **Bundling**: Use tools like Rollup, tsup, or microbundle for optimal output
- **Minification**: Production builds minified with source maps
- **Tree-shaking**: Ensure all builds support tree-shaking
- **Side-effects**: Mark package as side-effect free in package.json
- **Output structure**:
  ```
  dist/
  ├── cjs/           # CommonJS build
  ├── esm/           # ES Modules build  
  ├── umd/           # UMD build for browsers
  └── types/         # TypeScript declarations
  ```

### 3. Publishing & NPM Registry

- **NPM Registry**: Publish to public npm registry under `@blognow` scope
- **Registry Authentication**: Use npm tokens for CI/CD publishing
- **Pre-publish Hooks**: Run tests, linting, and type checking before publish
- **Package Size**: Monitor and optimize bundle size (aim for < 50KB)
- **Provenance**: Enable npm provenance for supply chain security
- **Access Control**: Configure appropriate access levels for scoped package

### 4. Documentation & Metadata

- **README.md**: Comprehensive usage guide with installation and examples
- **CHANGELOG.md**: Detailed changelog following Keep a Changelog format
- **LICENSE**: MIT or appropriate license file
- **API documentation**: Generated from TypeScript types using TypeDoc
- **Migration guides**: Clear upgrade guides for breaking changes
- **Examples directory**: Real-world usage examples and tutorials
- **Package badges**: npm version, downloads, build status, coverage

## Testing Requirements

### 1. Unit Tests

- **Service methods**: Test all service methods with mocked HTTP responses
- **Error handling**: Test all error scenarios (network errors, API errors, validation errors)
- **Type checking**: Ensure TypeScript types work correctly
- **HTTP mocking**: Use libraries like `nock` or `msw` to mock HTTP requests
- **Utility functions**: Test pagination helpers, retry logic, and data formatting

### 2. Integration Tests

- **Real API calls**: Test against actual API using a test workspace with sandbox environment
- **Authentication**: Test API key authentication and error handling for invalid keys
- **Pagination**: Test pagination edge cases and auto-pagination generators
- **Rate limiting**: Test rate limit handling and retry mechanisms
- **End-to-end workflows**: Test complete user scenarios from SDK initialization to data retrieval

### 3. Environment Testing

- **Node.js compatibility**: Test across Node.js versions (14, 16, 18, 20)
- **Browser compatibility**: Test in Chrome, Firefox, Safari, Edge
- **Bundle analysis**: Verify bundle size and ensure tree-shaking works
- **Performance testing**: Test with large datasets and concurrent requests
- **Memory leak detection**: Ensure no memory leaks in long-running applications

## Non-Functional Requirements

### 1. Performance

- **Bundle size**: Keep under 50KB minified + gzipped
- **Memory usage**: Efficient memory usage for large datasets
- **Response time**: Minimal overhead over raw HTTP requests

### 2. Security

- **API key handling**: Secure storage recommendations
- **No sensitive data logging**: Avoid logging API keys or sensitive content
- **HTTPS only**: Enforce HTTPS for all requests

### 3. Developer Experience

- **IntelliSense support**: Full autocomplete and type checking
- **Clear error messages**: Helpful error messages with suggestions
- **Consistent API**: Follow JavaScript/TypeScript conventions
- **Zero config**: Work out of the box with minimal configuration

## Version and Release Strategy

### 1. Versioning

- **Semantic versioning**: Follow semver strictly
- **Breaking changes**: Clear migration guides
- **Deprecation warnings**: Advance notice for deprecated features

### 2. Release Process & CI/CD

- **Automated releases**: GitHub Actions or similar for automated publishing
- **Release workflow**:
  1. Version bump (patch/minor/major)
  2. Generate changelog from commits
  3. Run full test suite
  4. Build all distribution formats
  5. Publish to npm registry
  6. Create GitHub release with notes
- **Pre-release channels**: 
  - `alpha` - bleeding edge features
  - `beta` - feature complete, testing phase
  - `rc` - release candidate
- **Branch protection**: Require PR reviews and passing CI for main branch
- **Automated dependency updates**: Dependabot or Renovate for maintenance

## Implementation Phases

### Phase 1: Core Foundation

1. **HTTP Client**: Implement base HTTP client with fetch/axios
2. **Authentication**: API key handling and header management
3. **Error Handling**: Custom error classes and HTTP status mapping
4. **Basic Types**: Core TypeScript interfaces matching API schemas

### Phase 2: Posts API Implementation

1. **Posts Service**: Implement all posts endpoints
2. **Pagination**: Built-in pagination support and helpers
3. **Filtering**: Type-safe filtering and search functionality
4. **Validation**: Request validation and response parsing

### Phase 3: Advanced Features

1. **Auto-pagination**: Async generators for iterating all results
2. **Retry Logic**: Intelligent retry with exponential backoff
3. **Rate Limiting**: Built-in rate limit handling
4. **Caching**: Optional response caching mechanisms

### Phase 4: Developer Experience

1. **Comprehensive Testing**: Unit, integration, and environment tests
2. **Documentation**: Complete API docs and usage examples
3. **Build Pipeline**: Multi-format builds and publishing
4. **Examples**: Real-world usage examples and tutorials

## Success Metrics

### Technical Metrics

- **Bundle Size**: < 50KB minified + gzipped
- **Test Coverage**: > 90% code coverage
- **Performance**: < 100ms overhead per API call
- **Compatibility**: Support Node.js 14+ and modern browsers

### Developer Experience Metrics

- **Time to First Success**: < 5 minutes from install to first API call
- **Documentation Completeness**: All public methods documented with examples
- **Type Safety**: 100% TypeScript coverage with no `any` types
- **Error Messages**: Clear, actionable error messages for all failure scenarios

## NPM Package Checklist

### Pre-Publication Checklist
- [ ] Package name available and follows naming conventions
- [ ] Scoped package properly configured (`@blognow/js-sdk`)
- [ ] All build outputs generated and tested
- [ ] TypeScript declarations included and working
- [ ] README with clear installation and usage examples
- [ ] License file included
- [ ] Keywords and description set for discoverability
- [ ] Repository and homepage URLs configured
- [ ] Version follows semantic versioning
- [ ] Changelog updated for release
- [ ] All tests passing
- [ ] Bundle size within acceptable limits
- [ ] No security vulnerabilities in dependencies

### Post-Publication Checklist
- [ ] Package installs correctly (`npm install @blognow/js-sdk`)
- [ ] All module formats work (CommonJS, ESM, UMD)
- [ ] TypeScript types work in consuming projects
- [ ] Documentation site updated
- [ ] GitHub release created
- [ ] Social media/community announcements
- [ ] Monitor for issues and feedback

## Package.json Example Structure

```json
{
  "name": "@blognow/js-sdk",
  "version": "1.0.0",
  "description": "Official JavaScript/TypeScript SDK for BlogNow API",
  "keywords": ["blognow", "blog", "cms", "api", "sdk", "typescript"],
  "homepage": "https://github.com/blognow/js-sdk#readme",
  "bugs": {
    "url": "https://github.com/blognow/js-sdk/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/blognow/js-sdk.git"
  },
  "license": "MIT",
  "author": "BlogNow Team",
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "types": "./dist/types/index.d.ts"
    }
  },
  "files": ["dist", "README.md", "CHANGELOG.md", "LICENSE"],
  "engines": {
    "node": ">=14.0.0"
  },
  "scripts": {
    "build": "npm run clean && npm run build:types && npm run build:cjs && npm run build:esm && npm run build:umd",
    "build:types": "tsc --emitDeclarationOnly --outDir dist/types",
    "build:cjs": "tsc --module commonjs --outDir dist/cjs",
    "build:esm": "tsc --module es2015 --outDir dist/esm",
    "build:umd": "rollup -c rollup.config.js",
    "clean": "rimraf dist",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "prepublishOnly": "npm run build && npm test"
  },
  "devDependencies": {
    "@types/jest": "^29.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "rimraf": "^5.0.0",
    "rollup": "^3.0.0",
    "typescript": "^5.0.0"
  },
  "sideEffects": false
}
```

This requirement document provides a comprehensive foundation for building a robust, type-safe, and developer-friendly JavaScript/TypeScript SDK for the BlogNow API, following modern NPM package standards and industry best practices for JavaScript SDK development and distribution.
