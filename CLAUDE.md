# SparkCurv website: notes for Claude

The marketing site and admin panel for SparkCurv Technologies (sparkcurv.com).
`spark-frontend/` is Next.js, `spark-backend/` is FastAPI + MySQL.

## Where things run (read first)

There are two copies of this repo. Check which one you are editing.

| What | Where |
|---|---|
| Git repo of record, frontend dev server | WSL: `~/projects/SparkcurvTechnologies` (frontend on `:3000`) |
| Backend (its `.venv` and `.env` live here) | Windows copy: `/mnt/c/Users/Dharun/SparkcurvTechnologies/spark-backend` (uvicorn on `:8001`) |

- The frontend proxies `/api` to **port 8001**. A backend on 8000 makes admin login return 500.
- The user usually has both servers running. Check `:3000` and `:8001` before starting anything, and leave no stray servers behind.
- When you start the backend from Windows, use `setsid nohup` inside WSL so it stays detached. Otherwise it exits with code 9.
- Edit the backend in the Windows copy, then copy the changed files into `~/projects` before committing.
- The frontend in the Windows copy is **stale**. Edit and run the frontend in `~/projects`.

### Running commands from Git Bash

- Prefix commands with `MSYS_NO_PATHCONV=1` so Git Bash doesn't rewrite paths.
- Run scripts as `wsl.exe -d Ubuntu -- bash /mnt/c/.../script.sh`. Complex quoting breaks inline `bash -c`, so write a script file instead.
- Node comes from nvm inside WSL. Load nvm first, otherwise the Windows `npx` runs instead.

## Standing rules from the user

- **Copy comes from sparkcurv.com.** Fetch the live page before writing page copy. Never invent claims, customers, testimonials or metrics.
- **Commit after each major verified change**, in `~/projects`:
  - pass the identity with `git -c user.name=Dharun -c user.email=dharun@sparkcurv.com commit ...`;
  - end the message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`;
  - there is no remote; never push unless asked.
- **Don't name CSR Interiors** (a product customer) anywhere public.
- **No AI-slop styling.** Use icons sparingly and avoid decorative tag rows. The user rejected greyscale-until-hover photos and a custom cursor; the site uses the normal system cursor.
- **The user keeps a docs folder.** Daily notes go in `C:\Users\Dharun\Documentation\YYYY-MM-DD.md` (see the global CLAUDE.md). Don't update the Google Sheets unless asked.

## Frontend (`spark-frontend/`)

Stack: Next.js 16 App Router (Turbopack), React 19, TypeScript, Tailwind 3, framer-motion, lucide-react, Lenis, Zustand. Structure and motion map: `spark-frontend/README.md`.

### Themes

| Area | Design | Class |
|---|---|---|
| Every public page | ink design | `.theme-ink` |
| `/admin` | old light design | `.theme-legacy` (`LEGACY_PREFIXES` in `lib/theme.ts`) |

How the light/dark scheme works:

- **Variables:** the scheme is CSS variables (`--ink`, `--bone`, `--hairline`, `--glass`, `--spark-gradient`). `schemes` in `lib/tokens.ts` defines them, and `tailwind.config.ts` writes them out for `:root`, `html[data-scheme='light']` and `.scheme-dark`.
- **First paint:** a boot script (`themeBootScript`) sets `data-theme` and `data-scheme` before the page paints.
- **Toggle:** `components/ThemeToggle.tsx` saves the choice to `localStorage` under `sc-scheme`.
- **Photo cards:** cards that sit on photos use `.scheme-dark`, so they stay dark in light mode.
- **Article body:** `.prose-scheme` in `globals.css` is deliberately outside `@layer`, so it beats the typography plugin.

### Shell and header

- `components/SiteFrame.tsx` is the shared shell for the `(home)` and `(site)` route groups.
- `components/HomeHeader.tsx`:
  - the full nav appears from `xl` (1280px), because nine links don't fit at 1024px;
  - it publishes `--header-h`;
  - ThemeToggle sits after Contact.
- `components/Wordmark.tsx` uses `public/images/logo/sparkcurv-{mark,wordmark}.webp`.

### Where content lives

Edit content in these files, not in the components.

| File | Content |
|---|---|
| `lib/content.ts` | home copy, partners, ticker, home FAQ |
| `lib/services.ts` | every service family and sub-page (routes and metadata are generated from it) |
| `lib/pages.ts` | about and pricing |
| `lib/products.ts` | Sitera and BuildNexa |

Other content notes:

- Single office: Nagercoil, Tamil Nadu. The Bangalore sales office was removed on purpose.
- Partners include SA Renew and RRB Construction (`public/images/partners/`). The user called the first one "SA Construction"; the label is unconfirmed.

### Products

`/products` and `/products/[slug]` cover two products:

| Product | For |
|---|---|
| Sitera | small and mid-size firms |
| BuildNexa | large firms |

- Sections live in `sections/products/*`. Previews are coded mock-ups; real screenshots come later.
- `lib/products.ts` has comments saying what must not be claimed. Respect them.
- The BuildNexa site over-claims some features; they are deliberately left off our pages.

### Blog (Markdown)

- **Editor:** posts are written in Markdown in the admin editor:
  - `components/MarkdownEditor.jsx` is the editor;
  - `lib/markdownPost.js` handles .md import and export, front matter and the template;
  - `lib/images.js` handles uploads;
  - the screen itself is `views/AdminDashboard.jsx`.
- **Preview:** comes from the server via `POST /api/blogs/preview`.
- **Old posts:** posts with HTML only show a notice in the editor.

## Backend (`spark-backend/server.py`)

- FastAPI + aiomysql. HTML is sanitised with nh3.
- Markdown is rendered by markdown-it-py (CommonMark plus tables and strikethrough, `html: True`), then cleaned by nh3.
- `blogs.content_md` (LONGTEXT NULL) is added automatically on startup if it is missing.
- Saving `content_md` re-renders `content`. Saving HTML `content` clears `content_md`.
- Tests: `spark-backend/tests/`. `test_markdown_blog.py` has 8 tests.
- **Test data:** the DB user can't create databases. Tests use the dev DB, so clean up any temporary admin users and posts afterwards.

## Checks before calling something done

- **Typecheck and lint:** `yarn typecheck`, `yarn lint` in `spark-frontend`, with nvm loaded.
- **Browser checks:**
  - Playwright scripts in the session scratchpad drive Edge: `home.js` (34 checks), `sweep.js` (every route), `mdeditor.js` (editor end to end).
  - Use stable selectors such as `#capabilities`, not position-based ones.
- **Live text:** for content changes, curl the live dev pages and grep for the old text.
- **Not run yet:** `next build` and Lighthouse; run both before deploying.

## Open items waiting on the user

- **WhatsApp number:** the button uses 90437 65028 but the site phone is +91 96774 95028. Which is right?
- **Projects and years:** the live site says both 30+ and 27+ projects, and both 2+ and 5+ years. 30+ is used; years are left out.
- **Assets:** a real CloudWatch logo (the old file was an HTML error page); real product screenshots with demo data.
- **Partner label:** "SA Renew" vs "SA Construction".
- **Security:**
  - rotate the leaked passwords;
  - set `JWT_SECRET` in production;
  - decide whether to rewrite git history.
- **Unused code:** whether to drop the unused PDF template endpoint and `fpdf2`.
- **Sitera app (separate repo):** security issues were reported but not fixed:
  - notifications go to every company's admins;
  - putting a company on hold doesn't block logins;
  - invite and password reset don't check the company;
  - some PO, subcontract and payment endpoints don't check the company.
