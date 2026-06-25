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

// Options for GET /v1/posts/lite (lite endpoint exposes no sort params).
export interface GetPostSummariesOptions {
  page?: number;
  size?: number;
  max_size?: number;
  query?: string; // mapped to `q` by the service
  status?: PostStatus;
  category_id?: string;
  author_id?: string;
  is_featured?: boolean;
  is_published?: boolean;
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
