/** Shape of a post as returned by GET /api/blogs and /api/blogs/{slug}. */
export type BlogPostSummary = {
  id: string | number;
  slug: string;
  title: string;
  excerpt?: string;
  author?: string;
  created_at: string;
  image_url?: string;
  tags?: string[];
  category?: string;
};

export type BlogPostFull = BlogPostSummary & {
  content: string;
  meta_title?: string;
  meta_description?: string;
};

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
