import { PostStatus, User, Category, Tag } from "./common";

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  og_image_url?: string;
  status: PostStatus;
  published_at?: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_featured: boolean;
  is_sticky: boolean;
  workspace_id: string;
  category_id?: string;
  created_at: string;
  updated_at?: string;
  author_id?: string;
  author?: User;
  category?: Category;
  tags?: Tag[];
}

// Lite listing item — every Post field except the HTML body.
export type PostSummary = Omit<Post, "content">;

export interface CreatePostRequest {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  og_image_url?: string;
  status?: PostStatus;
  published_at?: string;
  is_featured?: boolean;
  is_sticky?: boolean;
  category_id?: string;
  tag_ids?: string[];
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: string;
}

export interface PostsFilterParams {
  status?: PostStatus;
  category_id?: string;
  author_id?: string;
  is_featured?: boolean;
  is_sticky?: boolean;
  query?: string;
  tags?: string[];
  date_from?: string;
  date_to?: string;
}
