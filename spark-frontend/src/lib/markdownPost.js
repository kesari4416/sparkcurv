/**
 * Blog posts as Markdown files: a front matter block for the post's fields, then the body.
 *
 *   ---
 *   title: "Why we moved to Kubernetes"
 *   excerpt: "Two sentences for the blog listing."
 *   category: "Cloud"
 *   tags: [kubernetes, devops]
 *   cover: "/api/images/12"
 *   published: true
 *   ---
 *
 *   ## The problem
 *   ...
 *
 * Used by the admin editor's Import .md / Download .md buttons and the Template download.
 * The parser understands the simple YAML people write by hand (key: value, inline [a, b]
 * lists and "- item" lists); anything else is ignored rather than guessed at.
 */

const unquote = (v) => {
  const s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    if (s.startsWith('"')) {
      try {
        return JSON.parse(s);
      } catch {
        return s.slice(1, -1);
      }
    }
    return s.slice(1, -1).replace(/''/g, "'");
  }
  return s;
};

const FRONT_MATTER = /^﻿?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/;

/** Splits a Markdown file into { meta, body }. `meta` keys are lower-cased. */
export function parseMarkdownFile(text) {
  const m = text.match(FRONT_MATTER);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  let listKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    const item = line.match(/^\s+-\s+(.*)$|^-\s+(.*)$/);
    if (item && listKey) {
      meta[listKey].push(unquote(item[1] ?? item[2]));
      continue;
    }
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1].toLowerCase();
    const raw = kv[2].trim();
    if (raw === '') {
      meta[key] = [];
      listKey = key;
    } else if (/^\[.*\]$/.test(raw)) {
      meta[key] = raw.slice(1, -1).split(',').map((s) => unquote(s)).filter(Boolean);
      listKey = null;
    } else {
      meta[key] = unquote(raw);
      listKey = null;
    }
  }
  return { meta, body: m[2].replace(/^\s*\n/, '') };
}

const pick = (meta, ...keys) => {
  for (const k of keys) if (meta[k] !== undefined && meta[k] !== '' && !(Array.isArray(meta[k]) && !meta[k].length)) return meta[k];
  return undefined;
};

const asBool = (v) => (typeof v === 'boolean' ? v : /^(true|yes|1)$/i.test(String(v)));

/**
 * Maps a parsed file onto the editor's form fields. Only fields the file provides are
 * returned. With no `title` in the front matter, a leading "# Heading" becomes the title
 * and is removed from the body (how most Markdown documents start).
 */
export function fileToPost(text) {
  const { meta, body } = parseMarkdownFile(text);
  const post = {};
  let content = body;

  const title = pick(meta, 'title');
  if (title) post.title = String(title);
  else {
    const h1 = content.match(/^#\s+(.+?)\s*#*\s*(?:\r?\n|$)/);
    if (h1) {
      post.title = h1[1];
      content = content.slice(h1[0].length).replace(/^\s*\n/, '');
    }
  }
  const map = {
    slug: ['slug'],
    excerpt: ['excerpt', 'description', 'summary'],
    author: ['author'],
    category: ['category'],
    image_url: ['cover', 'image', 'image_url', 'cover_image'],
    meta_title: ['meta_title', 'seo_title'],
    meta_description: ['meta_description', 'seo_description'],
  };
  for (const [field, keys] of Object.entries(map)) {
    const v = pick(meta, ...keys);
    if (v !== undefined) post[field] = String(v);
  }
  const tags = pick(meta, 'tags', 'keywords');
  if (tags !== undefined) post.tags = (Array.isArray(tags) ? tags : String(tags).split(',')).map((t) => String(t).trim()).filter(Boolean);
  const published = pick(meta, 'published');
  const draft = pick(meta, 'draft');
  if (published !== undefined) post.published = asBool(published);
  else if (draft !== undefined) post.published = !asBool(draft);

  post.content_md = content;
  return post;
}

const yamlString = (v) => JSON.stringify(v ?? '');

/** Serialises the editor's form as a Markdown file with front matter. */
export function postToFile(form) {
  const lines = [
    '---',
    `title: ${yamlString(form.title)}`,
    form.slug ? `slug: ${yamlString(form.slug)}` : null,
    `excerpt: ${yamlString(form.excerpt)}`,
    `author: ${yamlString(form.author)}`,
    `category: ${yamlString(form.category)}`,
    `tags: [${(form.tags || []).map(yamlString).join(', ')}]`,
    form.image_url ? `cover: ${yamlString(form.image_url)}` : null,
    form.meta_title ? `meta_title: ${yamlString(form.meta_title)}` : null,
    form.meta_description ? `meta_description: ${yamlString(form.meta_description)}` : null,
    `published: ${form.published ? 'true' : 'false'}`,
    '---',
    '',
  ].filter((l) => l !== null);
  return `${lines.join('\n')}${(form.content_md || '').trimEnd()}\n`;
}

/** A starter file for writing a post outside the admin panel, then importing it. */
export const TEMPLATE_MD = `---
title: "Your post title"
excerpt: "Two or three sentences shown on the blog listing and in search results."
author: "SparkCurv Team"
category: "Technology"
tags: [cloud, devops]
# cover: "https://example.com/cover.jpg"   (or upload a cover in the admin panel)
# meta_title: "SEO title, up to 60 characters"
# meta_description: "SEO description, up to 160 characters"
published: false
---

Start with a short introduction: who this post is for and what they'll learn.

## First section

Write in plain paragraphs. Use **bold** for key terms, *italics* for emphasis and
[links](https://sparkcurv.com) where they help.

- Bullet points for lists
- One idea per bullet

## Second section

1. Numbered steps
2. For anything done in order

> A quote or a key takeaway.

| Option | When to use it |
|:--|:--|
| Tables | Comparing a few things side by side |

\`\`\`bash
# Code blocks keep their formatting
kubectl get pods
\`\`\`

![Describe the image](https://example.com/diagram.png)

## Conclusion

Sum up, and tell the reader what to do next.
`;

/** Starts a browser download of `text` as a .md file. */
export function downloadMarkdown(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
