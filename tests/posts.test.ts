import { PostsService } from '../src/services/posts';
import { HttpClient } from '../src/utils/http';
import { Post, PostStatus, PaginatedResponse } from '../src/types';

jest.mock('../src/utils/http');

const MockedHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

describe('PostsService', () => {
  let postsService: PostsService;
  let mockHttpClient: jest.Mocked<HttpClient>;

  const mockPost: Post = {
    id: '1',
    title: 'Test Post',
    slug: 'test-post',
    content: 'This is test content',
    excerpt: 'Test excerpt',
    status: PostStatus.PUBLISHED,
    publishedAt: '2023-01-01T00:00:00Z',
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    isFeatured: false,
    isSticky: false,
    workspaceId: 'workspace-1',
    authorId: 'author-1',
    createdAt: '2023-01-01T00:00:00Z',
  };

  const mockPaginatedResponse: PaginatedResponse<Post> = {
    items: [mockPost],
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

  describe('getPublishedPosts', () => {
    it('should get published posts', async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      const result = await postsService.getPublishedPosts();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/', {
        status: PostStatus.PUBLISHED,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should get published posts with options', async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      await postsService.getPublishedPosts({
        page: 2,
        size: 10,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/', {
        page: 2,
        size: 10,
        sortBy: 'created_at',
        sortOrder: 'desc',
        status: PostStatus.PUBLISHED,
      });
    });
  });

  describe('getAllPosts', () => {
    it('should get all posts', async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      const result = await postsService.getAllPosts();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/all', undefined);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should get all posts with options', async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      await postsService.getAllPosts({
        status: PostStatus.DRAFT,
        isFeatured: true,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/all', {
        status: PostStatus.DRAFT,
        isFeatured: true,
      });
    });
  });

  describe('getPostsByAuthor', () => {
    it('should get posts by author', async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      const result = await postsService.getPostsByAuthor('author-1');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/posts/author/author-1',
        { authorId: 'author-1' }
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should get posts by author with options', async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      await postsService.getPostsByAuthor('author-1', {
        page: 1,
        size: 10,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/posts/author/author-1',
        {
          authorId: 'author-1',
          page: 1,
          size: 10,
        }
      );
    });
  });

  describe('getPost', () => {
    it('should get single post by slug', async () => {
      mockHttpClient.get.mockResolvedValue(mockPost);

      const result = await postsService.getPost('test-post');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/test-post');
      expect(result).toEqual(mockPost);
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const newPostData = {
        title: 'New Post',
        content: 'New post content',
        status: PostStatus.DRAFT,
      };
      mockHttpClient.post.mockResolvedValue(mockPost);

      const result = await postsService.createPost(newPostData);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/posts/', newPostData);
      expect(result).toEqual(mockPost);
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      const updateData = {
        id: '1',
        title: 'Updated Post',
        content: 'Updated content',
      };
      mockHttpClient.put.mockResolvedValue(mockPost);

      const result = await postsService.updatePost(updateData);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/api/v1/posts/1', {
        title: 'Updated Post',
        content: 'Updated content',
      });
      expect(result).toEqual(mockPost);
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      mockHttpClient.delete.mockResolvedValue(undefined);

      await postsService.deletePost('1');

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/api/v1/posts/1');
    });
  });

  describe('searchPosts', () => {
    it('should search posts', async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      const result = await postsService.searchPosts('test query');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/search', {
        query: 'test query',
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should search posts with options', async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      await postsService.searchPosts('test query', {
        page: 1,
        size: 10,
        status: PostStatus.PUBLISHED,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/search', {
        query: 'test query',
        page: 1,
        size: 10,
        status: PostStatus.PUBLISHED,
      });
    });
  });

  describe('getFeaturedPosts', () => {
    it('should get featured posts', async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      const result = await postsService.getFeaturedPosts();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/', {
        isFeatured: true,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('getPostsByCategory', () => {
    it('should get posts by category', async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      const result = await postsService.getPostsByCategory('category-1');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/', {
        categoryId: 'category-1',
      });
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('getPostsByStatus', () => {
    it('should get posts by status', async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      const result = await postsService.getPostsByStatus(PostStatus.DRAFT);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/all', {
        status: PostStatus.DRAFT,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('Pagination Generators', () => {
    describe('iterateAllPosts', () => {
      it('should iterate through all posts', async () => {
        const page1Response = {
          items: [mockPost],
          total: 2,
          page: 1,
          size: 1,
          pages: 2,
        };
        const page2Response = {
          items: [{ ...mockPost, id: '2' }],
          total: 2,
          page: 2,
          size: 1,
          pages: 2,
        };

        mockHttpClient.get
          .mockResolvedValueOnce(page1Response)
          .mockResolvedValueOnce(page2Response);

        const posts = [];
        for await (const post of postsService.iterateAllPosts({ size: 1 })) {
          posts.push(post);
        }

        expect(posts).toHaveLength(2);
        expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
      });
    });

    describe('iteratePublishedPosts', () => {
      it('should iterate through published posts', async () => {
        const response = {
          items: [mockPost],
          total: 1,
          page: 1,
          size: 20,
          pages: 1,
        };

        mockHttpClient.get.mockResolvedValue(response);

        const posts = [];
        for await (const post of postsService.iteratePublishedPosts()) {
          posts.push(post);
        }

        expect(posts).toHaveLength(1);
        expect(posts[0]).toEqual(mockPost);
      });
    });

    describe('iteratePostsByAuthor', () => {
      it('should iterate through posts by author', async () => {
        const response = {
          items: [mockPost],
          total: 1,
          page: 1,
          size: 20,
          pages: 1,
        };

        mockHttpClient.get.mockResolvedValue(response);

        const posts = [];
        for await (const post of postsService.iteratePostsByAuthor('author-1')) {
          posts.push(post);
        }

        expect(posts).toHaveLength(1);
        expect(posts[0]).toEqual(mockPost);
      });
    });
  });

  describe('getPostsWithAdvancedFiltering', () => {
    it('should use correct endpoint based on status', async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      await postsService.getPostsWithAdvancedFiltering({
        status: PostStatus.DRAFT,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/all', {
        status: PostStatus.DRAFT,
      });
    });

    it('should use published endpoint for published status', async () => {
      mockHttpClient.get.mockResolvedValue(mockPaginatedResponse);

      await postsService.getPostsWithAdvancedFiltering({
        status: PostStatus.PUBLISHED,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/', {
        status: PostStatus.PUBLISHED,
      });
    });
  });

  describe('getPostStatistics', () => {
    it('should get post statistics', async () => {
      const totalResponse = { items: [], total: 100, page: 1, size: 1, pages: 100 };
      const publishedResponse = { items: [], total: 80, page: 1, size: 1, pages: 80 };
      const draftResponse = { items: [], total: 15, page: 1, size: 1, pages: 15 };
      const archivedResponse = { items: [], total: 5, page: 1, size: 1, pages: 5 };

      mockHttpClient.get
        .mockResolvedValueOnce(totalResponse)
        .mockResolvedValueOnce(publishedResponse)
        .mockResolvedValueOnce(draftResponse)
        .mockResolvedValueOnce(archivedResponse);

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