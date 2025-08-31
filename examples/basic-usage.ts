import { BlogNowClient, PostStatus } from "@blognow/sdk";

async function basicUsageExample() {
  // Initialize the client
  const client = new BlogNowClient({
    apiKey: process.env.BLOGNOW_API_KEY || "your-api-key",
    baseUrl: "https://api.blognow.com",
    debug: true,
  });

  try {
    // Health check
    console.log("🔍 Checking API health...");
    const health = await client.healthCheck();
    console.log("✅ API Status:", health.status);

    // Get published posts
    console.log("\n📄 Fetching published posts...");
    const publishedPosts = await client.posts.getPublishedPosts({
      page: 1,
      size: 5,
      sortBy: "published_at",
      sortOrder: "desc",
    });

    console.log(`Found ${publishedPosts.total} published posts`);
    publishedPosts.items.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title} (${post.viewCount} views)`);
    });

    // Search for posts
    console.log("\n🔍 Searching for posts...");
    const searchResults = await client.posts.searchPosts("javascript", {
      size: 3,
    });

    console.log(`Found ${searchResults.total} posts matching "javascript"`);
    searchResults.items.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
    });

    // Get featured posts
    console.log("\n⭐ Fetching featured posts...");
    const featuredPosts = await client.posts.getFeaturedPosts({
      size: 3,
    });

    console.log(`Found ${featuredPosts.total} featured posts`);
    featuredPosts.items.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title} ⭐`);
    });

    // Demonstrate pagination with async generator
    console.log("\n📖 Iterating through all posts (first 10)...");
    let count = 0;
    for await (const post of client.posts.iterateAllPosts({ size: 5 })) {
      console.log(`${count + 1}. ${post.title} (${post.status})`);
      count++;
      if (count >= 10) break; // Limit to first 10 posts
    }

    // Get post statistics
    console.log("\n📊 Getting post statistics...");
    const stats = await client.posts.getPostStatistics();
    console.log(`Total: ${stats.total}`);
    console.log(`Published: ${stats.published}`);
    console.log(`Draft: ${stats.draft}`);
    console.log(`Archived: ${stats.archived}`);

    // Get a single post by slug (this might fail if the slug doesn't exist)
    try {
      console.log("\n📄 Fetching single post...");
      const singlePost = await client.posts.getPost("example-post-slug");
      console.log(`Post: ${singlePost.title}`);
      console.log(`Author ID: ${singlePost.authorId}`);
      console.log(`Views: ${singlePost.viewCount}`);
      console.log(`Likes: ${singlePost.likeCount}`);
    } catch (error) {
      console.log("❌ Could not fetch post (slug might not exist)");
    }

  } catch (error) {
    console.error("❌ Error occurred:", error.message);
    
    // Demonstrate specific error handling
    if (error.code === "INVALID_API_KEY") {
      console.log("💡 Make sure to set a valid API key");
    } else if (error.code === "RATE_LIMIT_EXCEEDED") {
      console.log(`💡 Rate limited. Retry after ${error.retryAfter}s`);
    } else if (error.code === "NETWORK_ERROR") {
      console.log("💡 Check your internet connection");
    }
  } finally {
    // Clean up resources
    client.destroy();
  }
}

// Example with error handling
async function errorHandlingExample() {
  const client = new BlogNowClient({
    apiKey: "invalid-key", // Intentionally invalid
  });

  try {
    await client.posts.getPublishedPosts();
  } catch (error) {
    console.log("Error Name:", error.name);
    console.log("Error Code:", error.code);
    console.log("Error Status:", error.status);
    console.log("Error Message:", error.message);
    
    // You can check error types
    if (error.code === "INVALID_API_KEY") {
      console.log("🔑 Please provide a valid API key");
    }
  } finally {
    client.destroy();
  }
}

// Example of creating a post (requires write permissions)
async function createPostExample() {
  const client = new BlogNowClient({
    apiKey: process.env.BLOGNOW_API_KEY || "your-api-key",
  });

  try {
    const newPost = await client.posts.createPost({
      title: "My New Blog Post",
      content: "This is the content of my new blog post. It's written using the BlogNow SDK!",
      excerpt: "A post created with the BlogNow SDK",
      status: PostStatus.DRAFT,
      isFeatured: false,
      metaTitle: "My New Blog Post - SEO Title",
      metaDescription: "SEO description for my new blog post",
    });

    console.log("✅ Post created successfully!");
    console.log(`Post ID: ${newPost.id}`);
    console.log(`Post Title: ${newPost.title}`);
    console.log(`Post Slug: ${newPost.slug}`);
    console.log(`Post Status: ${newPost.status}`);

  } catch (error) {
    console.error("❌ Failed to create post:", error.message);
    
    if (error.code === "VALIDATION_ERROR") {
      console.log("Validation details:", error.details);
    }
  } finally {
    client.destroy();
  }
}

// Run the examples
if (require.main === module) {
  console.log("🚀 BlogNow SDK Basic Usage Examples\n");
  
  basicUsageExample()
    .then(() => {
      console.log("\n" + "=".repeat(50));
      console.log("🚀 Error Handling Example\n");
      return errorHandlingExample();
    })
    .then(() => {
      console.log("\n" + "=".repeat(50));
      console.log("🚀 Create Post Example\n");
      return createPostExample();
    })
    .then(() => {
      console.log("\n✅ All examples completed!");
    })
    .catch(console.error);
}