'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
// api.js is a plain JS module (allowJs); its exports are untyped.
import { api, assetUrl, errorMessage } from '@/lib/api';
import { ease } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { formatDate, type BlogPostSummary } from './types';

const pill = 'rounded-full border px-4 py-2 text-sm transition-colors duration-300';

/** Post grid with a tag filter kept in the URL (?tag=…). Must sit inside <Suspense>. */
export function BlogIndex() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const activeTag = useSearchParams().get('tag') ?? '';

  const setTag = (tag: string) => {
    router.replace(tag ? `${pathname}?tag=${encodeURIComponent(tag)}` : pathname, { scroll: false });
  };

  // State is only set from the request's callbacks, so the effect never sets state synchronously.
  const fetchPosts = useCallback((signal?: AbortSignal) => {
    api
      .get('/blogs', { signal })
      .then((res: { data: unknown }) => setPosts(Array.isArray(res.data) ? (res.data as BlogPostSummary[]) : []))
      .catch((err: unknown) => {
        if (signal?.aborted) return;
        setError(errorMessage(err, 'We could not load the blog posts. Please try again.'));
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPosts(controller.signal);
    return () => controller.abort();
  }, [fetchPosts]);

  const retry = () => {
    setLoading(true);
    setError('');
    fetchPosts();
  };

  const tags = [...new Set(posts.flatMap((p) => p.tags ?? []))].sort();
  const shown = activeTag ? posts.filter((p) => (p.tags ?? []).includes(activeTag)) : posts;

  return (
    <section aria-label="Posts" className="pb-24 md:pb-36">
      <div className="mx-auto max-w-site px-gutter">
        {tags.length > 0 && (
          <div role="group" aria-label="Filter by tag" className="mb-12 flex flex-wrap gap-2 border-t pt-8">
            <button type="button" aria-pressed={!activeTag} onClick={() => setTag('')} className={cn(pill, !activeTag ? 'border-bone bg-bone text-ink' : 'text-bone/70 hover:text-bone')}>
              All posts
            </button>
            {tags.map((tag) => (
              <button
                type="button"
                key={tag}
                aria-pressed={activeTag === tag}
                onClick={() => setTag(activeTag === tag ? '' : tag)}
                className={cn(pill, activeTag === tag ? 'border-bone bg-bone text-ink' : 'text-bone/70 hover:text-bone')}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <ul aria-label="Loading posts" aria-busy className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-[26rem] animate-pulse rounded-3xl bg-bone/[0.04]" />
            ))}
          </ul>
        ) : error ? (
          <div role="alert" className="glass rounded-3xl p-10 text-center md:p-16">
            <p className="text-lg text-bone-muted">{error}</p>
            <button type="button" onClick={retry} className="mt-8 rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-bone/85">
              Try again
            </button>
          </div>
        ) : shown.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center md:p-16">
            <p className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] tracking-[-0.02em] text-bone">
              {activeTag ? `No posts tagged “${activeTag}”.` : 'No blog posts yet.'}
            </p>
            <p className="mt-3 text-bone-muted">{activeTag ? 'Try another tag.' : 'Check back soon!'}</p>
            {activeTag && (
              <button type="button" onClick={() => setTag('')} className="mt-8 rounded-full border px-6 py-3 text-sm text-bone transition-colors hover:bg-bone/5">
                View all posts
              </button>
            )}
          </div>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((post, i) => (
              <motion.li
                key={post.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.9, ease: ease.out, delay: (i % 3) * 0.08 }}
              >
                <article className="glass group relative flex h-full flex-col overflow-hidden rounded-3xl">
                  {post.image_url && (
                    <div className="relative aspect-[16/10] overflow-hidden bg-ink-800">
                      <Image
                        src={assetUrl(post.image_url)}
                        alt=""
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-expo-out group-hover:scale-[1.04]"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6 md:p-8">
                    <p className="font-mono text-eyebrow uppercase text-bone/50">
                      <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                      {post.author && <> · {post.author}</>}
                    </p>
                    <h2 className="mt-4 line-clamp-3 font-display text-[clamp(1.4rem,1.9vw,1.75rem)] leading-tight tracking-[-0.015em] text-bone">
                      {/* Stretched link: the whole card is clickable; tag buttons sit above it. */}
                      <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-spark-blue">
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt && <p className="mt-3 line-clamp-3 text-base leading-relaxed text-bone-muted">{post.excerpt}</p>}
                    <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                      <div className="relative z-10 flex flex-wrap gap-1.5">
                        {(post.tags ?? []).slice(0, 3).map((tag) => (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => setTag(tag)}
                            aria-label={`Show posts tagged ${tag}`}
                            className="rounded-full border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-bone/60 transition-colors hover:text-bone"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <ArrowUpRight aria-hidden strokeWidth={1.5} className="h-5 w-5 shrink-0 text-bone/60 transition-transform duration-500 ease-expo-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-bone" />
                    </div>
                  </div>
                </article>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
