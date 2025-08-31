import { PostStatus, User, Category, Tag } from "./common";

export interface Post {
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

export interface CreatePostRequest {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  status?: PostStatus;
  publishedAt?: string;
  isFeatured?: boolean;
  isSticky?: boolean;
  categoryId?: string;
  tagIds?: string[];
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: string;
}

export interface PostsFilterParams {
  status?: PostStatus;
  categoryId?: string;
  authorId?: string;
  isFeatured?: boolean;
  isSticky?: boolean;
  query?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
}