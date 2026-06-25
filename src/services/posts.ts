import { HttpClient } from "../utils/http";
import {
  Post,
  PostSummary,
  PaginatedResponse,
  GetPostsOptions,
  GetPostSummariesOptions,
  CreatePostRequest,
  UpdatePostRequest,
  PostsFilterParams,
  PostStatus,
} from "../types";

export class PostsService {
  constructor(private http: HttpClient) {}

  async getPublishedPosts(
    options?: GetPostsOptions
  ): Promise<PaginatedResponse<Post>> {
    const params = {
      ...options,
    };

    return this.http.get<PaginatedResponse<Post>>("posts", params);
  }

  // Lite listing: same filters as getPublishedPosts but the API omits `content`.
  async getPublishedPostSummaries(
    options?: GetPostSummariesOptions
  ): Promise<PaginatedResponse<PostSummary>> {
    return this.http.get<PaginatedResponse<PostSummary>>(
      "posts/lite",
      this.toLiteParams(options)
    );
  }

  async *iteratePublishedPostSummaries(
    options?: GetPostSummariesOptions
  ): AsyncGenerator<PostSummary, void, unknown> {
    let page = options?.page || 1;
    const size = options?.size || 20;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getPublishedPostSummaries({
        ...options,
        page,
        size,
      });

      for (const post of response.items) {
        yield post;
      }

      hasMore = page < response.pages;
      page++;
    }
  }

  // The lite endpoint names the search param `q`, not `query`.
  private toLiteParams(
    options?: GetPostSummariesOptions
  ): Record<string, unknown> {
    if (!options) {
      return {};
    }

    const { query, ...rest } = options;
    return query !== undefined ? { ...rest, q: query } : { ...rest };
  }

  async getAllPosts(
    options?: GetPostsOptions
  ): Promise<PaginatedResponse<Post>> {
    return this.http.get<PaginatedResponse<Post>>("posts/all", options);
  }

  async getPostsByAuthor(
    authorId: string,
    options?: Omit<GetPostsOptions, "authorId">
  ): Promise<PaginatedResponse<Post>> {
    const params = {
      ...options,
      authorId,
    };

    return this.http.get<PaginatedResponse<Post>>(
      `posts/author/${authorId}`,
      params
    );
  }

  async getPost(slug: string): Promise<Post> {
    return this.http.get<Post>(`posts/${slug}`);
  }

  async createPost(postData: CreatePostRequest): Promise<Post> {
    return this.http.post<Post>("posts", postData);
  }

  async updatePost(postData: UpdatePostRequest): Promise<Post> {
    const { id, ...updateData } = postData;
    return this.http.put<Post>(`posts/${id}`, updateData);
  }

  async deletePost(id: string): Promise<void> {
    await this.http.delete<void>(`posts/${id}`);
  }

  async getFeaturedPosts(
    options?: Omit<GetPostsOptions, "isFeatured">
  ): Promise<PaginatedResponse<Post>> {
    const params = {
      ...options,
      isFeatured: true,
    };

    return this.http.get<PaginatedResponse<Post>>("posts", params);
  }

  async getPostsByCategory(
    categoryId: string,
    options?: Omit<GetPostsOptions, "categoryId">
  ): Promise<PaginatedResponse<Post>> {
    const params = {
      ...options,
      categoryId,
    };

    return this.http.get<PaginatedResponse<Post>>("posts", params);
  }

  async getPostsByStatus(
    status: PostStatus,
    options?: Omit<GetPostsOptions, "status">
  ): Promise<PaginatedResponse<Post>> {
    const params = {
      ...options,
      status,
    };

    return this.http.get<PaginatedResponse<Post>>("posts/all", params);
  }

  // async *iterateAllPosts(
  //   options?: GetPostsOptions
  // ): AsyncGenerator<Post, void, unknown> {
  //   let page = options?.page || 1;
  //   const size = options?.size || 20;
  //   let hasMore = true;

  //   while (hasMore) {
  //     const response = await this.getAllPosts({
  //       ...options,
  //       page,
  //       size,
  //     });

  //     for (const post of response.items) {
  //       yield post;
  //     }

  //     hasMore = page < response.pages;
  //     page++;
  //   }
  // }

  async *iteratePublishedPosts(
    options?: GetPostsOptions
  ): AsyncGenerator<Post, void, unknown> {
    let page = options?.page || 1;
    const size = options?.size || 20;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getPublishedPosts({
        ...options,
        page,
        size,
      });

      for (const post of response.items) {
        yield post;
      }

      hasMore = page < response.pages;
      page++;
    }
  }

  // async *iteratePostsByAuthor(
  //   authorId: string,
  //   options?: Omit<GetPostsOptions, "authorId">
  // ): AsyncGenerator<Post, void, unknown> {
  //   let page = options?.page || 1;
  //   const size = options?.size || 20;
  //   let hasMore = true;

  //   while (hasMore) {
  //     const response = await this.getPostsByAuthor(authorId, {
  //       ...options,
  //       page,
  //       size,
  //     });

  //     for (const post of response.items) {
  //       yield post;
  //     }

  //     hasMore = page < response.pages;
  //     page++;
  //   }
  // }

  async getPostsWithAdvancedFiltering(
    filters: PostsFilterParams & GetPostsOptions
  ): Promise<PaginatedResponse<Post>> {
    const endpoint =
      filters.status && filters.status !== PostStatus.PUBLISHED
        ? "posts/all"
        : "posts";

    return this.http.get<PaginatedResponse<Post>>(endpoint, filters);
  }

  async getPostStatistics(): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
  }> {
    const [totalResponse, publishedResponse, draftResponse, archivedResponse] =
      await Promise.all([
        this.getAllPosts({ page: 1, size: 1 }),
        this.getPostsByStatus(PostStatus.PUBLISHED, { page: 1, size: 1 }),
        this.getPostsByStatus(PostStatus.DRAFT, { page: 1, size: 1 }),
        this.getPostsByStatus(PostStatus.ARCHIVED, { page: 1, size: 1 }),
      ]);

    return {
      total: totalResponse.total,
      published: publishedResponse.total,
      draft: draftResponse.total,
      archived: archivedResponse.total,
    };
  }
}
