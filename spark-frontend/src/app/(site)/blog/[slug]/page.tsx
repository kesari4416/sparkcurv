import { BlogArticle } from '@/sections/blog/BlogArticle';

type Props = { params: Promise<{ slug: string }> };

/** Posts are fetched in the browser; BlogArticle also sets the post's title and meta tags. */
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  return <BlogArticle key={slug} slug={slug} />;
}
