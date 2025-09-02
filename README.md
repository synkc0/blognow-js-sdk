# BlogNow JavaScript/TypeScript SDK

[![npm version](https://badge.fury.io/js/%40blognow%2Fsdk.svg)](https://badge.fury.io/js/%40blognow%2Fsdk)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official JavaScript/TypeScript SDK for the BlogNow API. This SDK provides a simple, type-safe interface for integrating with BlogNow's backend API using API key authentication.

## Features

- 🔒 **Type-safe**: Full TypeScript support with complete type definitions
- 🌐 **Universal**: Works in Node.js, browsers, and edge runtimes
- 📄 **Auto-pagination**: Built-in pagination support with async generators
- 🔄 **Automatic retries**: Intelligent retry logic with exponential backoff
- 🚦 **Rate limiting**: Built-in rate limiting to respect API limits
- ❌ **Error handling**: Comprehensive error classes for different scenarios
- 🪶 **Lightweight**: Zero dependencies, minimal bundle size
- 🔧 **Configurable**: Flexible configuration options

## Installation

```bash
npm install @blognow/sdk
```

## Quick Start

```typescript
import { BlogNowClient } from "@blognow/sdk";

const client = new BlogNowClient({
  apiKey: "your-api-key",
  baseUrl: "https://api.blognow.tech", // optional
});

// Get published posts
const posts = await client.posts.getPublishedPosts({
  page: 1,
  size: 10,
});

console.log(`Found ${posts.total} posts`);
posts.items.forEach((post) => {
  console.log(`- ${post.title}`);
});
```

## Configuration

### Basic Configuration

```typescript
import { BlogNowClient } from "@blognow/sdk";

const client = new BlogNowClient({
  apiKey: "your-api-key",
});
```

### Advanced Configuration

```typescript
const client = new BlogNowClient({
  apiKey: "your-api-key",
  baseUrl: "https://api.blognow.tech", // API base URL
  timeout: 30000, // Request timeout (30s)
  retries: 3, // Max retry attempts
  rateLimitPerSecond: 10, // Rate limit (10 req/sec)
  debug: false, // Debug logging
  customHeaders: {
    // Custom headers
    "X-Custom-Header": "value",
  },
});
```

## API Reference

### Posts API

#### Get Published Posts

```typescript
const posts = await client.posts.getPublishedPosts({
  page: 1,
  size: 20,
  sortBy: "published_at",
  sortOrder: "desc",
});
```

#### Get All Posts (Any Status)

```typescript
const posts = await client.posts.getAllPosts({
  status: PostStatus.DRAFT,
  isFeatured: true,
});
```

#### Get Single Post

```typescript
const post = await client.posts.getPost("my-post-slug");
```

#### Get Posts by Author

```typescript
const posts = await client.posts.getPostsByAuthor("author-uuid", {
  size: 50,
});
```

#### Search Posts

```typescript
const posts = await client.posts.searchPosts("javascript tutorial", {
  status: PostStatus.PUBLISHED,
  sortBy: "created_at",
});
```

#### Create Post

```typescript
const newPost = await client.posts.createPost({
  title: "My New Post",
  content: "This is the content of my post",
  status: PostStatus.PUBLISHED,
  isFeatured: true,
});
```

#### Update Post

```typescript
const updatedPost = await client.posts.updatePost({
  id: "post-id",
  title: "Updated Title",
  content: "Updated content",
});
```

#### Delete Post

```typescript
await client.posts.deletePost("post-id");
```

### Filtering and Querying

#### Advanced Filtering

```typescript
const posts = await client.posts.getPostsWithAdvancedFiltering({
  status: PostStatus.PUBLISHED,
  categoryId: "category-uuid",
  isFeatured: true,
  query: "search term",
  sortBy: "published_at",
  sortOrder: "desc",
  page: 1,
  size: 20,
});
```

#### Get Featured Posts

```typescript
const featuredPosts = await client.posts.getFeaturedPosts({
  size: 5,
});
```

#### Get Posts by Category

```typescript
const categoryPosts = await client.posts.getPostsByCategory("category-uuid");
```

#### Get Posts by Status

```typescript
const draftPosts = await client.posts.getPostsByStatus(PostStatus.DRAFT);
```

### Pagination

#### Manual Pagination

```typescript
let page = 1;
const allPosts = [];

do {
  const response = await client.posts.getPublishedPosts({
    page,
    size: 20,
  });

  allPosts.push(...response.items);
  page++;

  console.log(`Loaded page ${page - 1}/${response.pages}`);
} while (page <= response.pages);
```

#### Auto-Pagination with Generators

```typescript
// Iterate through all posts
for await (const post of client.posts.iterateAllPosts()) {
  console.log(post.title);

  // Break after processing 100 posts
  if (post.viewCount > 1000) break;
}

// Iterate through published posts only
for await (const post of client.posts.iteratePublishedPosts({ size: 50 })) {
  console.log(`Published: ${post.title}`);
}

// Iterate through posts by specific author
for await (const post of client.posts.iteratePostsByAuthor("author-uuid")) {
  console.log(`By Author: ${post.title}`);
}
```

### Statistics

```typescript
const stats = await client.posts.getPostStatistics();
console.log(
  `Total: ${stats.total}, Published: ${stats.published}, Draft: ${stats.draft}`
);
```

## Error Handling

The SDK provides specific error classes for different scenarios:

```typescript
import {
  APIKeyError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  NetworkError,
  TimeoutError,
} from "@blognow/sdk";

try {
  const post = await client.posts.getPost("non-existent-slug");
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log("Post not found");
  } else if (error instanceof APIKeyError) {
    console.log("Invalid API key");
  } else if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after: ${error.retryAfter}s`);
  } else if (error instanceof ValidationError) {
    console.log("Validation failed:", error.details);
  } else if (error instanceof ServerError) {
    console.log(`Server error (${error.status}): ${error.message}`);
  } else if (error instanceof NetworkError) {
    console.log("Network error:", error.message);
  } else if (error instanceof TimeoutError) {
    console.log("Request timed out");
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and includes complete type definitions:

```typescript
import {
  BlogNowClient,
  Post,
  PostStatus,
  CreatePostRequest,
  GetPostsOptions,
  PaginatedResponse,
} from "@blognow/sdk";

// Type-safe configuration
const client = new BlogNowClient({
  apiKey: "your-key",
});

// Type-safe API calls
const posts: PaginatedResponse<Post> = await client.posts.getPublishedPosts({
  status: PostStatus.PUBLISHED, // Enum with auto-complete
  sortBy: "created_at", // Only valid sort fields allowed
  sortOrder: "desc", // "asc" | "desc"
});

// Type-safe post creation
const newPost: CreatePostRequest = {
  title: "My Post",
  content: "Content here",
  status: PostStatus.DRAFT,
  isFeatured: false,
};

const createdPost: Post = await client.posts.createPost(newPost);
```

## Environment Support

### Node.js

```typescript
// CommonJS
const { BlogNowClient } = require("@blognow/sdk");

// ES Modules
import { BlogNowClient } from "@blognow/sdk";
```

### Browser

```html
<!-- UMD Build -->
<script src="https://unpkg.com/@blognow/sdk@latest/dist/umd/index.js"></script>
<script>
  const client = new BlogNowSDK.BlogNowClient({
    apiKey: "your-api-key",
  });
</script>
```

### Modern Bundlers

The SDK supports tree-shaking and works with all modern bundlers (Webpack, Rollup, Vite, etc.):

```typescript
// Only imports what you need
import { BlogNowClient, PostStatus } from "@blognow/sdk";
```

## Examples

### Blog Homepage

```typescript
async function loadHomepage() {
  const [featuredPosts, recentPosts] = await Promise.all([
    client.posts.getFeaturedPosts({ size: 3 }),
    client.posts.getPublishedPosts({
      size: 10,
      sortBy: "published_at",
      sortOrder: "desc",
    }),
  ]);

  return {
    featured: featuredPosts.items,
    recent: recentPosts.items,
  };
}
```

### Search Results

```typescript
async function searchBlog(query: string, page = 1) {
  const results = await client.posts.searchPosts(query, {
    page,
    size: 10,
    status: PostStatus.PUBLISHED,
  });

  return {
    posts: results.items,
    totalPages: results.pages,
    currentPage: results.page,
    totalResults: results.total,
  };
}
```

### Author Profile

```typescript
async function loadAuthorProfile(authorId: string) {
  const posts = [];
  let totalViews = 0;

  for await (const post of client.posts.iteratePostsByAuthor(authorId)) {
    posts.push(post);
    totalViews += post.viewCount;
  }

  return {
    posts,
    totalPosts: posts.length,
    totalViews,
    averageViews: Math.round(totalViews / posts.length),
  };
}
```

### Batch Operations

```typescript
async function publishDrafts(authorId: string) {
  const drafts = await client.posts.getPostsByStatus(PostStatus.DRAFT);
  const authorDrafts = drafts.items.filter(
    (post) => post.authorId === authorId
  );

  const publishedPosts = [];
  for (const draft of authorDrafts) {
    try {
      const published = await client.posts.updatePost({
        id: draft.id,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date().toISOString(),
      });
      publishedPosts.push(published);
    } catch (error) {
      console.error(`Failed to publish ${draft.title}:`, error);
    }
  }

  return publishedPosts;
}
```

## Rate Limiting

The SDK automatically handles rate limiting:

```typescript
const client = new BlogNowClient({
  apiKey: "your-key",
  rateLimitPerSecond: 5, // Max 5 requests per second
});

// These will be automatically queued and spaced out
const promises = Array.from({ length: 20 }, (_, i) =>
  client.posts.getPost(`post-${i}`)
);

const results = await Promise.all(promises);
```

## Debugging

Enable debug logging to see HTTP requests and responses:

```typescript
const client = new BlogNowClient({
  apiKey: "your-key",
  debug: true,
});

// Will log all HTTP requests and responses (API keys are redacted)
const posts = await client.posts.getPublishedPosts();
```

## Health Check

Check API connectivity:

```typescript
try {
  const health = await client.healthCheck();
  console.log("API Status:", health.status);
} catch (error) {
  console.error("API is not accessible:", error.message);
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `npm test`
6. Submit a pull request

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the package
npm run build

# Run linting
npm run lint

# Type checking
npm run typecheck
```

## License

MIT License. See [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://docs.blognow.tech)
- 🐛 [Report Issues](https://github.com/synkc0/blognow-js-sdk/issues)
<!-- - 💬 [Community Discord](https://discord.gg/blognow) -->
- 📧 [Email Support](mailto:info@synk.consulting)

---

Made with ❤️ by the BlogNow Team
