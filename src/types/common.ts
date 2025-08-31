export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface GetPostsOptions {
  page?: number;
  size?: number;
  status?: PostStatus;
  categoryId?: string;
  authorId?: string;
  isFeatured?: boolean;
  query?: string;
  sortBy?: "created_at" | "updated_at" | "published_at";
  sortOrder?: "asc" | "desc";
}

export enum PostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  createdAt: string;
  updatedAt?: string;
}