'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
// api.js and sanitize.js are plain JS modules (allowJs); their exports are untyped.
import { api, assetUrl } from '@/lib/api';
import { sanitizeHtml } from '@/lib/sanitize';
import { site } from '@/lib/content';
import { ease } from '@/lib/tokens';
import { formatDate, type BlogPostFull } from './types';

const SITE_ORIGIN = 'https://sparkcurv.com';

/** SEO images must be absolute; uploaded images are relative "/api/images/<id>" paths. */
function absoluteUrl(url?: string) {
  const resolved = assetUrl(url);
  if (!resolved) return undefined;
  if (/^https?:\/\//i.test(resolved)) return resolved;
  return `${SITE_ORIGIN}${resolved.startsWith('/') ? '' : '/'}${resolved}`;
}

/**
 * Per-post <title> and meta. React 19 hoists these tags into <head> wherever they render,
 * which a client-fetched post needs (the route's static metadata can't know the post).
 */
function PostMeta({ post }: { post: BlogPostFull }) {
  const title = `${post.meta_title || post.title} | ${site.legalName}`;
  const description = post.meta_description || post.excerpt;
  const url = `${SITE_ORIGIN}/blog/${post.slug}`;
  const image = absoluteUrl(post.image_url) ?? `${SITE_ORIGIN}/images/logo/sparkcurv1.webp`;
  return (
    <>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
    </>
  );
}

const backLink = (
  <Link href="/blog" className="group inline-flex items-center gap-2 font-mono text-eyebrow uppercase text-bone/60 transition-colors hover:text-bone">
    <ArrowLeft aria-hidden strokeWidth={1.5} className="h-4 w-4 transition-transform duration-500 ease-expo-out group-hover:-translate-x-1" />
    All posts
  </Link>
);

/**
 * A single post, fetched by slug. HTML content is sanitised before rendering.
 * The page renders it with key={slug}, so a different post starts from a fresh state.
 */
export function BlogArticle({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPostFull | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    api
      .get(`/blogs/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then((res: { data: BlogPostFull }) => {
        setPost(res.data);
        setState('ready');
      })
      .catch(() => {
        if (!controller.signal.aborted) setState('missing');
      });
    return () => controller.abort();
  }, [slug]);

  if (state === 'loading') {
    return (
      <div role="status" aria-label="Loading post" className="mx-auto max-w-4xl px-gutter pb-32 pt-40">
        <div className="h-4 w-32 animate-pulse rounded-full bg-bone/10" />
        <div className="mt-10 h-16 w-full animate-pulse rounded-2xl bg-bone/[0.06]" />
        <div className="mt-4 h-16 w-2/3 animate-pulse rounded-2xl bg-bone/[0.06]" />
        <div className="mt-16 aspect-[16/9] animate-pulse rounded-3xl bg-bone/[0.04]" />
      </div>
    );
  }

  if (state === 'missing' || !post) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-4xl flex-col items-start justify-center px-gutter py-40">
        <title>{`Blog post not found | ${site.legalName}`}</title>
        <meta name="robots" content="noindex" />
        {backLink}
        <h1 className="mt-10 font-display text-display-md text-bone">
          Post <span className="text-gradient animate-gradient-pan font-light">not found.</span>
        </h1>
        <p className="mt-6 text-lg text-bone-muted">The blog post you&apos;re looking for doesn&apos;t exist or has moved.</p>
      </div>
    );
  }

  return (
    <article className="pb-24 pt-32 md:pb-36 md:pt-44">
      <PostMeta post={post} />
      <motion.header
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: ease.out }}
        className="mx-auto max-w-4xl px-gutter"
      >
        {backLink}
        {post.category && <p className="mt-10 font-mono text-eyebrow uppercase text-spark-blue">{post.category}</p>}
        <h1 className="mt-4 font-display text-[clamp(2.25rem,5.5vw,4.75rem)] leading-[1] tracking-[-0.025em] text-bone">{post.title}</h1>
        <p className="mt-8 font-mono text-eyebrow uppercase text-bone/50">
          <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
          {post.author && <> · {post.author}</>}
        </p>
        {(post.tags?.length ?? 0) > 0 && (
          <ul aria-label="Tags" className="mt-6 flex flex-wrap gap-2">
            {post.tags!.map((tag) => (
              <li key={tag}>
                <Link
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="inline-block rounded-full border px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-bone/60 transition-colors hover:text-bone"
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </motion.header>

      {post.image_url && (
        <motion.div
          initial={{ clipPath: 'inset(100% 0% 0% 0% round 1.5rem)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0% round 1.5rem)' }}
          transition={{ duration: 1.3, ease: ease.inOut, delay: 0.2 }}
          className="relative mx-auto mt-14 aspect-[16/9] max-w-6xl overflow-hidden rounded-3xl bg-ink-800 md:mt-20"
          style={{ width: 'calc(100% - 2 * clamp(1.25rem, 4vw, 3.5rem))' }}
        >
          <Image src={assetUrl(post.image_url)} alt="" fill priority unoptimized sizes="(min-width: 1200px) 1152px, 100vw" className="object-cover" />
        </motion.div>
      )}

      <div
        className="prose prose-lg prose-invert mx-auto mt-14 max-w-3xl px-gutter md:mt-20 prose-headings:font-display prose-headings:tracking-[-0.02em] prose-headings:text-bone prose-p:text-bone/80 prose-a:text-spark-blue prose-a:underline-offset-4 prose-strong:text-bone prose-blockquote:border-l-spark-blue prose-blockquote:text-bone/80 prose-pre:overflow-x-auto prose-pre:bg-ink-800 prose-img:rounded-2xl prose-hr:border-hairline"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
      />
    </article>
  );
}
