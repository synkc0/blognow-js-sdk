import { PostsService } from "../src/services/posts";
import { HttpClient } from "../src/utils/http";
import {
  Post,
  PostSummary,
  PostStatus,
  PaginatedResponse,
} from "../src/types";

jest.mock("../src/utils/http");

const MockedHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

describe("PostsService", () => {
  let postsService: PostsService;
  let mockHttpClient: jest.Mocked<HttpClient>;

  const mockPost: Post = {
    id: "1",
    title: "Test Post",
    slug: "test-post",
    content: "This is test content",
    excerpt: "Test excerpt",
    status: PostStatus.PUBLISHED,
    published_at: "2023-01-01T00:00:00Z",
    view_count: 0,
    like_count: 0,
    comment_count: 0,
    is_featured: false,
    is_sticky: false,
    workspace_id: "workspace-1",
    author_id: "author-1",
    created_at: "2023-01-01T00:00:00Z",
  };

  // Lite item: the API omits `content`.
  const { content: _omit, ...mockSummary } = mockPost;
  const mockPostSummary: PostSummary = mockSummary;

  const mockPaginatedResponse: PaginatedResponse<Post> = {
    items: [mockPost],
    total: 1,
    page: 1,
    size: 20,
    pages: 1,
  };

  const mockSummaryResponse: PaginatedResponse<PostSummary> = {
    items: [mockPostSummary],
    total: 1,
    page: 1,
    size: 20,
    pages: 1,
  };

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      destroy: jest.fn(),
    } as any;

    MockedHttpClient.mockImplementation(() => mockHttpClient);
    postsService = new PostsService(mockHttpClient);
  });

  describe("getPublishedPosts", () => {
    it("should get published posts", async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      const result = await postsService.getPublishedPosts();

      expect(mockHttpClient.get).toHaveBeenCalledWith("posts", {});
      expect(result).toEqual(mockPaginatedResponse);
    });

    it("should get published posts with options", async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      await postsService.getPublishedPosts({
        page: 2,
        size: 10,
        sort_by: "created_at",
        sort_order: "desc",
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith("posts", {
        page: 2,
        size: 10,
        sort_by: "created_at",
        sort_order: "desc",
      });
    });
  });

  describe("getPublishedPostSummaries", () => {
    it("should call posts/lite and return summaries without content", async () => {
      mockHttpClient.get.mockResolvedValue(mockSummaryResponse);

      const result = await postsService.getPublishedPostSummaries();

      expect(mockHttpClient.get).toHaveBeenCalledWith("posts/lite", {});
      expect(result).toEqual(mockSummaryResponse);
      expect(result.items[0]).not.toHaveProperty("content");
    });

    it("should map the `query` option to the `q` param", async () => {
      mockHttpClient.get.mockResolvedValue(mockSummaryResponse);

      await postsService.getPublishedPostSummaries({
        query: "staffing",
        page: 2,
        size: 10,
        category_id: "cat-1",
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith("posts/lite", {
        q: "staffing",
        page: 2,
        size: 10,
        category_id: "cat-1",
      });
    });

    it("should omit `q` when no query is provided", async () => {
      mockHttpClient.get.mockResolvedValue(mockSummaryResponse);

      await postsService.getPublishedPostSummaries({ is_featured: true });

      expect(mockHttpClient.get).toHaveBeenCalledWith("posts/lite", {
        is_featured: true,
      });
    });
  });

  describe("iteratePublishedPostSummaries", () => {
    it("should page through all summaries", async () => {
      mockHttpClient.get
        .mockResolvedValueOnce({
          items: [mockPostSummary],
          total: 2,
          page: 1,
          size: 1,
          pages: 2,
        })
        .mockResolvedValueOnce({
          items: [{ ...mockPostSummary, id: "2" }],
          total: 2,
          page: 2,
          size: 1,
          pages: 2,
        });

      const collected: PostSummary[] = [];
      for await (const summary of postsService.iteratePublishedPostSummaries({
        size: 1,
      })) {
        collected.push(summary);
      }

      expect(collected).toHaveLength(2);
      expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
      expect(mockHttpClient.get).toHaveBeenLastCalledWith("posts/lite", {
        page: 2,
        size: 1,
      });
    });
  });

  describe("getAllPosts", () => {
    it("should get all posts", async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      const result = await postsService.getAllPosts();

      expect(mockHttpClient.get).toHaveBeenCalledWith("posts/all", undefined);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe("getPostsByAuthor", () => {
    it("should get posts by author", async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      await postsService.getPostsByAuthor("author-1");

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "posts/author/author-1",
        { authorId: "author-1" }
      );
    });
  });

  describe("getPost", () => {
    it("should get single post by slug", async () => {
      mockHttpClient.get.mockResolvedValue(mockPost);

      const result = await postsService.getPost("test-post");

      expect(mockHttpClient.get).toHaveBeenCalledWith("posts/test-post");
      expect(result).toEqual(mockPost);
    });
  });

  describe("createPost", () => {
    it("should create a new post", async () => {
      const newPostData = {
        title: "New Post",
        content: "New post content",
        status: PostStatus.DRAFT,
      };
      mockHttpClient.post.mockResolvedValue(mockPost);

      const result = await postsService.createPost(newPostData);

      expect(mockHttpClient.post).toHaveBeenCalledWith("posts", newPostData);
      expect(result).toEqual(mockPost);
    });
  });

  describe("updatePost", () => {
    it("should update a post", async () => {
      const updateData = {
        id: "1",
        title: "Updated Post",
        content: "Updated content",
      };
      mockHttpClient.put.mockResolvedValue(mockPost);

      await postsService.updatePost(updateData);

      expect(mockHttpClient.put).toHaveBeenCalledWith("posts/1", {
        title: "Updated Post",
        content: "Updated content",
      });
    });
  });

  describe("deletePost", () => {
    it("should delete a post", async () => {
      mockHttpClient.delete.mockResolvedValue(undefined);

      await postsService.deletePost("1");

      expect(mockHttpClient.delete).toHaveBeenCalledWith("posts/1");
    });
  });

  describe("getFeaturedPosts", () => {
    it("should get featured posts", async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      await postsService.getFeaturedPosts();

      expect(mockHttpClient.get).toHaveBeenCalledWith("posts", {
        isFeatured: true,
      });
    });
  });

  describe("getPostsByCategory", () => {
    it("should get posts by category", async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      await postsService.getPostsByCategory("category-1");

      expect(mockHttpClient.get).toHaveBeenCalledWith("posts", {
        categoryId: "category-1",
      });
    });
  });

  describe("getPostsByStatus", () => {
    it("should get posts by status", async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      await postsService.getPostsByStatus(PostStatus.DRAFT);

      expect(mockHttpClient.get).toHaveBeenCalledWith("posts/all", {
        status: PostStatus.DRAFT,
      });
    });
  });

  describe("getPostsWithAdvancedFiltering", () => {
    it("should use posts/all for non-published status", async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      await postsService.getPostsWithAdvancedFiltering({
        status: PostStatus.DRAFT,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith("posts/all", {
        status: PostStatus.DRAFT,
      });
    });

    it("should use posts for published status", async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      await postsService.getPostsWithAdvancedFiltering({
        status: PostStatus.PUBLISHED,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith("posts", {
        status: PostStatus.PUBLISHED,
      });
    });
  });

  describe("getPostStatistics", () => {
    it("should aggregate counts across statuses", async () => {
      mockHttpClient.get
        .mockResolvedValueOnce({ items: [], total: 100, page: 1, size: 1, pages: 100 })
        .mockResolvedValueOnce({ items: [], total: 80, page: 1, size: 1, pages: 80 })
        .mockResolvedValueOnce({ items: [], total: 15, page: 1, size: 1, pages: 15 })
        .mockResolvedValueOnce({ items: [], total: 5, page: 1, size: 1, pages: 5 });

      const result = await postsService.getPostStatistics();

      expect(result).toEqual({
        total: 100,
        published: 80,
        draft: 15,
        archived: 5,
      });
      expect(mockHttpClient.get).toHaveBeenCalledTimes(4);
    });
  });
});
