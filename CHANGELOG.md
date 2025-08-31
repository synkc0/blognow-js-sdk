# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2023-XX-XX

### Added

#### Core Features
- Initial release of BlogNow JavaScript/TypeScript SDK
- Full TypeScript support with complete type definitions
- Universal support for Node.js, browsers, and edge runtimes
- Zero dependencies implementation using native fetch API

#### Authentication & Configuration
- API key authentication system
- Configurable base URL, timeout, and retry settings
- Built-in rate limiting with configurable requests per second
- Custom headers support
- Debug logging with sensitive data redaction

#### Posts API
- `getPublishedPosts()` - Fetch published posts with pagination and filtering
- `getAllPosts()` - Fetch posts with any status
- `getPostsByAuthor()` - Fetch posts by specific author ID
- `getPost()` - Fetch single post by slug
- `createPost()` - Create new posts (with write permissions)
- `updatePost()` - Update existing posts
- `deletePost()` - Delete posts
- `searchPosts()` - Full-text search functionality
- `getFeaturedPosts()` - Fetch only featured posts
- `getPostsByCategory()` - Fetch posts by category
- `getPostsByStatus()` - Fetch posts by status (draft, published, archived)
- `getPostsWithAdvancedFiltering()` - Advanced filtering options
- `getPostStatistics()` - Get post count statistics

#### Pagination Features
- Manual pagination support with page/size parameters
- Auto-pagination with async generators:
  - `iterateAllPosts()` - Iterate through all posts
  - `iteratePublishedPosts()` - Iterate through published posts
  - `iteratePostsByAuthor()` - Iterate through posts by author
- Configurable page sizes with API limit respect

#### Error Handling
- Comprehensive error class hierarchy:
  - `APIKeyError` - Invalid or missing API key (401)
  - `NotFoundError` - Resource not found (404) 
  - `ValidationError` - Request validation failed (422)
  - `RateLimitError` - Rate limit exceeded (429) with retry-after support
  - `ServerError` - Internal server errors (5xx)
  - `NetworkError` - Network connectivity issues
  - `TimeoutError` - Request timeouts
  - `ConfigurationError` - SDK configuration errors
- Automatic error response parsing with detailed error information

#### HTTP Client Features
- Intelligent retry logic with exponential backoff
- Automatic rate limiting to respect API limits  
- Request/response timeout handling (30s default)
- Network error detection and retries
- Rate limit handling with automatic retry-after delays
- Request/response logging for debugging (with API key redaction)
- Query parameter handling including arrays
- JSON serialization/deserialization

#### Build & Distribution
- Multiple output formats:
  - CommonJS (`dist/cjs/`) for Node.js compatibility
  - ES Modules (`dist/esm/`) for modern bundlers
  - UMD (`dist/umd/`) for direct browser usage
- TypeScript declaration files (`dist/types/`)
- Source maps for debugging
- Tree-shaking support
- Side-effect free package marking

#### Developer Experience
- Complete TypeScript IntelliSense support
- Comprehensive JSDoc documentation
- Usage examples and guides
- Unit and integration tests with >90% coverage
- ESLint and Prettier configuration
- Modern development tooling setup

#### Testing
- Jest test framework setup
- Mock HTTP client for unit testing
- Test coverage reporting
- Automated test running in CI/CD

#### Documentation
- Comprehensive README with examples
- TypeScript usage examples
- Error handling guides  
- Pagination examples
- Configuration options documentation
- API reference documentation

### Technical Details
- **Bundle Size**: <50KB minified + gzipped
- **Node.js Support**: >=14.0.0
- **TypeScript**: ^5.2.2
- **Zero Runtime Dependencies**: Uses native fetch API
- **Test Coverage**: >90% code coverage
- **Performance**: <100ms overhead per API call

## [Unreleased]

### Planned Features
- Categories API service
- Tags API service  
- File upload support
- Webhook signature verification
- Response caching mechanisms
- Request deduplication
- Offline queue support
- GraphQL endpoint support
- Real-time subscriptions via WebSocket

---

## Release Notes Format

Each release entry includes:
- **Added**: New features
- **Changed**: Changes in existing functionality  
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements