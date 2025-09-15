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
  category_id?: string;
  author_id?: string;
  is_featured?: boolean;
  query?: string;
  sort_by?: "created_at" | "updated_at" | "published_at";
  sort_order?: "asc" | "desc";
}

export enum PostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  created_at: string;
  updated_at?: string;
}
