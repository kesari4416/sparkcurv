# SparkCurv repo audit — 2026-10-17

Scope: everything tracked at `4348bea` (spark-backend, spark-frontend, root files, git history).
Method: full read of backend and frontend source; findings spot-verified; backend import and endpoints exercised with FastAPI TestClient (no DB); frontend `yarn install --frozen-lockfile` + `craco build` run.
Not tested: anything needing MySQL (login, blog CRUD, contact insert), real browsers, the production server.

Baseline: **backend does not start** with the committed `.env` (`KeyError: 'JWT_SECRET'`). **Frontend builds** (3 eslint warnings, 201 KB gzip single bundle).

> No secret values are reproduced in this file. Do not commit this file if the GitHub repo is public.

## Status after fixes (same day)

All code items in sections 1–3 were fixed except the ones listed under "still open". Nothing is committed.

**Verified**
- Backend: 59/59 tests (18 new security regression tests + Emergent's 41, credentials moved to env) pass 3× in a row against a real MariaDB 10.11, including an upgrade from a database seeded by the *old* server (the backdoor admin gets locked; legacy posts are sanitized on read; absolute `localhost:8000` image URLs are served relative).
- Frontend: `CI=true` production build, zero warnings. Served through the real `nginx.conf` (nginx 1.26) with the API proxied: headers, caching, SPA routing and a 3 MB upload checked.
- Headless Edge: 15/15 checks — login, httpOnly/SameSite=Strict cookie, no token in localStorage, 422 error shown without crash, Media tab, blog grid visible, stored XSS not executed, unknown subpage + 404 handled, logout really ends the session, no uncaught errors.

**Found while fixing (also fixed)**
- DB pool used `autocommit=False` and never committed reads, so pooled connections served stale snapshots (an old password kept working, new posts could stay invisible).
- Rate limits are stored in MySQL so they hold across uvicorn workers; login and password-change limits only count *failed* attempts.

**You must do (cannot be done in code)**
1. Rotate: MySQL password (it is the *same* string as the admin password), Gmail app password, admin password (Team tab → Change Password; sessions are signed out on change).
2. Add `JWT_SECRET` to the production `.env` (the backend refuses to start without it).
3. Delete the locked `admin@sparkcurv.com` account in the Team tab after the first deploy.
4. Docker: `.env` is no longer baked into the image — run with `--env-file .env`.
5. Decide on git history rewrite (secrets are still in old commits).

**Still open / needs a decision**
- Emergent removal (section 4). `emergentintegrations` is **not on public PyPI**: `pip install -r requirements.txt` and the Docker build fail outside Emergent. `requirements-app.txt` is the working install until removal.
- CSP is report-only in `nginx.conf` until checked in a browser with GA4 + Tawk.to live.
- GA4 and Tawk.to load without a consent banner (legal/business decision).
- Copy conflicts left as-is: "30+" vs "27+" projects, "2+" vs "5+" years. WhatsApp button (hidden, number differed from the site phone) was removed and the FAQ line referring to it reworded.
- Still large: `aiml3.mp4` (3.7 MB, 58 s) and `application2.mp4` — re-encoding made them bigger; they now load only when scrolled into view. Partner logos 2 and 3 are SVGs wrapping big bitmaps.
- Not tested: real SMTP sending, Safari/iOS, the production server itself. On Windows, uvicorn with 2+ workers intermittently hangs requests (dev-only; production is Linux).
- Rate-limit trade-off: 10 failed logins in 15 min locks that admin email for 15 min (someone who knows the email can trigger it).

---

## 0. Secrets and credentials (act on these first)

| # | Where | Problem |
|---|---|---|
| S1 | `spark-backend/.env` (tracked) | Live MySQL password and Gmail SMTP app password committed. In history since the first Emergent commit. |
| S2 | `memory/test_credentials.md`, `memory/PRD.md` ("Admin Credentials (Production)" + example `.env`), `test_reports/iteration_5.json` | Production admin email + password in plaintext. MySQL password appears to share the same prefix as the admin password (likely reuse). |
| S3 | `server.py:753-754`, `spark-backend/tests/*.py` | Hard-coded fallback admin `admin@sparkcurv.com` / `SparkAdmin@2024` — the password is published in 4 test files. If `ADMIN_PASSWORD` is unset in prod, that account exists and works. `test_reports/iteration_5.json` records the old admin **still working** after the switch. |
| S4 | `server.py:767-772` | `seed_admin()` **resets** the admin password to the env/default value on every boot, silently reverting any password change. With `--workers 4` (Dockerfile) it runs 4× concurrently (possible duplicate-insert race). |
| S5 | `spark-frontend/.gitignore:2-5` | `.env/`, `package.json/`, `package-lock.json/`, `components.json/` — trailing slash means "directory only", so they ignore nothing. That is why `.env` got committed. |

Mitigation: rotate MySQL password, Gmail app password, and the admin password (and anywhere else that password is reused); delete the `admin@sparkcurv.com` user in prod DB; untrack env/credential files; decide on history rewrite (only meaningful after rotation; required if the repo is/was public).

---

## 1. Backend — `spark-backend/`

### Critical
- **B1 `server.py:32`** — `os.environ["JWT_SECRET"]` but `.env` has no `JWT_SECRET` → import crashes. Verified.
- **B2** — S3/S4 above (default admin + password reset on boot).
- **B3 Stored XSS pipeline** — `content` stored raw (`server.py:242`), rendered with `dangerouslySetInnerHTML` (`BlogPost.js:87`, `AdminDashboard.jsx:200`); editor allows `javascript:` links (`RichTextEditor.jsx:71-74`) and unescaped `alt` (`:106-108`); JWT lives in `localStorage` (`AuthContext.jsx:6,41`) so XSS = admin account takeover.

### High
- **B4 `server.py:171`** — logout `delete_cookie(samesite="none")` without `secure=True`; browsers reject it, auth cookie is never cleared (verified header: `SameSite=none`, no `Secure`). Cookie is checked *before* the Bearer header (`:77`), so the session survives logout up to 8 h.
- **B5 `server.py:34,665`** — CORS uses `FRONTEND_URL` (unset → `http://localhost:3000`); the `.env` sets `CORS_ORIGINS`, which the code never reads. `localhost:3000` is always allowed in prod.
- **B6 `server.py:683-684`** — startup swallows DB failure; app runs with `pool=None`, every route 500s. `/api/health` returns **200** `{"status":"unhealthy","error":"'NoneType'…"}` (verified) — leaks internals and fools health checks. Also leaks a connection if `SELECT 1` raises (`:619-622`, release not in `finally`).
- **B7 `server.py:417-437`, `:630-658`** — public contact endpoint: no rate-limit/captcha (spam + email flood), no length limits (`mobile`/`whatsapp` are `VARCHAR(50)` → strict-mode 500), user input interpolated unescaped into the HTML email (`:644-649`) and subject (`:635`), and blocking `smtplib` call inside an async handler stalls the event loop per submission.
- **B8 `server.py:303-309`** — upload reads the whole body before the 5 MB check (memory DoS); `content_type` is client-supplied, not sniffed; images stored as base64 `LONGTEXT` (+33 %) and served without cache headers (`:336`).
- **B9 CSRF** — cookie is `SameSite=None`; `multipart/form-data` POST is a "simple" request, so a third-party page can upload images as a logged-in admin.

### Medium
- **B10 `server.py:266`** — `"slug" not in raw` is always False (`model_dump` includes every key; verified) → dead branch. Setting a duplicate or empty slug on update hits the UNIQUE index → unhandled 500.
- **B11** — no login rate-limit / lockout; token returned in body *and* cookie (two auth mechanisms).
- **B12 `rag.py`, `ingest.py`, `ingest_websites.py`, `crawler.py`, `redis_memory.py`** — not imported by `server.py`; depend on chromadb, sentence-transformers, langchain, redis, bs4 — none in `requirements.txt`. Dead/broken (the chat backend the frontend ChatBot expects was never wired).
- **B13 `requirements.txt`** — 131 pins from Emergent's base image; server needs ~11. Includes unused mongo (motor/pymongo), stripe, boto3, google-*, openai, pandas/numpy, litellm, dev tools (black/flake8/mypy/pytest) and two JWT libs (PyJWT + python-jose) — slow, large image and a wide CVE surface.
- **B14 `Dockerfile`** — installs `gcc` + `default-libmysqlclient-dev` (not needed; aiomysql is pure Python), runs as root, copies `.env` and `__pycache__` into the image (no `.dockerignore`), `--workers 4` multiplies the startup seeding.

### Low
- `@app.on_event` deprecated; `__pycache__/server.cpython-314.pyc` committed; `README.md` is the GitLab template; tests hit a live URL with hard-coded creds and no DB fixtures; `/api/images` list unpaginated; `/api/contact` GET unpaginated.

---

## 2. Frontend — `spark-frontend/`

### Critical
- **F1 `Blog.js:95` + `PageTransition.js:36-39`** — blog cards use `reveal-on-scroll` (opacity 0) but the observer scans the DOM once, 100 ms after navigation, before posts arrive → **blog grid invisible**.
- **F2** — XSS (see B3).

### High
- **F3 `spark-frontend/.env`** (tracked) — `REACT_APP_BACKEND_URL=http://localhost:8000`; backend is on **8001** and nginx proxies `/api`. A build from this file calls the visitor's own machine. Uploaded image URLs get this host baked into the DB (`AdminDashboard.jsx:43,272`, `RichTextEditor.jsx:123`).
- **F4 `ApplicationDevelopment.js:152`** — `data.seo` read before `if (!data)` → any unknown `/application-development/x` white-screens. No ErrorBoundary anywhere.
- **F5 `AdminDashboard.jsx:436,468,478`** — renders `err.response.data.detail`; FastAPI 422 `detail` is an array → "Objects are not valid as a React child" → admin white-screens (e.g. add admin with `a@b`).
- **F6 `AdminDashboard.jsx:729-735`** — Media tab renders the gallery *modal* with `onSelect={null}`; clicking an image throws, closing jumps to Blogs; real `MediaLibrary` (`:948-958`) is hidden behind it.
- **F7 `ManagedCloudService.js:112,286`** — `bitbucket.png` / `dynamodb.png` vs files `Bitbucket.png` / `DynamoDB.png` → 404 on Linux.
- **F8 canonicals point at non-existent routes** — `ManagedCloudService.js:88,173,214,258,303`, `Pricing.js:103`.
- **F9 nginx.conf** — no `client_max_body_size` (1 MB default vs 5 MB app limit → uploads 1–5 MB fail with 413); no security headers (CSP, XFO, nosniff, HSTS, Referrer-Policy); unhashed `/images/*` cached `immutable` 30 d; listens on 80 only.
- **F10 Page weight** — home page ≈ 21 MB: 4 autoplay videos (10.5 MB), hero video without poster, all 5 slideshow images mounted at once (`gitlab.jpg` 2.6 MB…), 2.1 MB nav logo shown at 140 px on every page, 2.2 MB team photo at 192 px.

### Medium
- **F11** — no 401/expiry handling (`AuthContext.jsx`); any `/auth/me` failure (even network) logs out; global axios interceptor attaches the Bearer token to *every* axios request on any host.
- **F12 `App.js:105-109`** — 2.5 s splash blocks every hard load incl. deep links (LCP/SEO).
- **F13 `FAQSection.js:11-32`** — JSON-LD script re-inserted ~45×/s on Home (inline array prop + 22 ms typing re-render).
- **F14 `BlogPost.js:86`** — `prose` classes with no `@tailwindcss/typography` → post body unstyled.
- **F15 WhatsApp** — button hidden by `App.css:6`, yet FAQ copy says "click the WhatsApp button"; its number differs from the site phone (`WhatsAppButton.js:2` vs `Footer.js:103`).
- **F16 `ThankYou.js:14`** — `navigate()` inside a state updater (side effect in render; double-navigates in StrictMode).
- **F17 Contact** — required fields shown without asterisk (`Contact.js:225,265`), phone `pattern` likely invalid under `v` flag (untested), >200-word paste silently rejected, backend error detail dropped, "Digital Grouth" typo stored in DB/emails.
- **F18** — `Blog.js:17` swallows fetch errors as "no posts yet"; `MediaLibrary` load has no catch (infinite spinner); failing cover image `onError` wipes `image_url` (`AdminDashboard.jsx:54`).
- **F19 SEO** — no `*` route / 404 page; `/digital-growth`, `/thank-you` have no SEO; titles double-suffixed ("| SparkCurv | SparkCurv Technologies"); no `og:image`/`og:url`; no fallback meta description.
- **F20 ChatBot.jsx** — imported (`App.js:21`) but never rendered; calls `/api/chat`, `/api/escalate`, `/api/escalate/poll` which don't exist; plus focus-loss bug, leaking intervals, `crypto.randomUUID` needs HTTPS. Live chat is actually Tawk.to.
- **F21 Build** — `npm install` fails ERESOLVE (react-day-picker 8 vs React 19); both `yarn.lock` and `package-lock.json`; CRA 5 is deprecated; `CI=true` build would fail on unused-var warnings; no code-splitting (admin + editor shipped to every visitor).

### Low
- `index.html`: missing `/favicon.png`, duplicate preconnects, Inter loaded 3×, Manrope used for headings but only partly loaded, GA4 + Tawk.to load without consent, Emergent-preview `DataCloneError` suppressor script (line 24).
- Undefined classes: `font-clash` (font never loaded), `animate-blob`, `animation-delay-*`, `scrollbar-hide`.
- Platform card overlay darkens the text (`ApplicationDevelopment.js:376`, `Services.js:436`).
- A11y: mobile menu toggle lacks `aria-label`/`aria-expanded` (`Navigation.js:319`), dropdown/FAQ toggles lack `aria-expanded`, hero h1 split into per-letter spans, "Partner n" alt text, clickable `<span>` inside `<Link>` (`Blog.js:121`).
- `BlogPost.js:71` tag links to `/blog?tag=` which Blog never reads; slug effect never resets state.
- Admin: overlapping toasts close each other, unsaved editor work lost on close, uneven upload validation, empty slug saved as `''`, Enquiries stat shows "—" until tab opened, `execCommand` emits `<font>`, raw clipboard HTML pasted.
- Inconsistent copy: 30+ vs 27+ projects; 2+ vs 5+ years; Team.js roles contradict About.js.

### Dead weight
- `src/components/ui/` — all 45 shadcn files unused → 27 `@radix-ui/*`, cmdk, embla, input-otp, next-themes, react-day-picker, react-hook-form, react-resizable-panels, vaul, cva, clsx, tailwind-merge unused. Also unused: @hookform/resolvers, @tawk.to/tawk-messenger-react, cra-template, date-fns, recharts, zod.
- `Team.js` (unrouted), `ChatBot.jsx`, `use-toast.js`, `useScrollAnimation.js` (observes a class nobody uses), 6 unreachable `Services.js` sub-pages with 9 broken asset refs.
- `public/`: 49 unused files ≈ 36 MB (list: scratchpad `unused.txt`); identical duplicates (3 copies of the 1 MB logo incl. "ChatGPT Image Jun 17…png", 9 home/services/blog jpg pairs, ahrefs/semrush/hootsuite SVGs identical, 19 tools in both svg+png, 6 logo variants).
- `plugins/health-check/` — dev-only Emergent scaffolding, exposes stack traces when enabled.

---

## 3. Repository structure
- **R1** `backend`, `frontend` — git symlinks to `/app/spark-backend`, `/app/spark-frontend` (Emergent container paths); on Windows they check out as 18-byte text files.
- **R2** `cloned_repo` — gitlink (submodule) to `0775a32` with no `.gitmodules` → empty, un-initialisable folder. It is the original pre-Emergent commit already in this history.
- **R3** `.gitconfig` at repo root commits identity `emergent-agent-e1 <github@emergent.sh>`; all 15 Emergent commits use it.
- **R4** `memory/`, `test_reports/`, `.emergent/` — Emergent agent scratch state, not project code.
- **R5** root `.gitignore` covers only env/keys — no `node_modules`, `build`, `__pycache__`.
- **R6** No CI, no root README, no `.dockerignore`, no frontend Dockerfile despite `nginx.conf` expecting a `backend` service.

---

## 4. Emergent dependency inventory — REMOVED (2026-10-17)

**Status:** everything below has been removed. The frontend was migrated from Create React App/craco to
Next.js, which dropped `@emergentbase/visual-edits`, the craco wrapper, the health-check plugin, the
`#emergent-badge` CSS and the `index.html` error-swallowing script. `requirements.txt` now lists only the
13 packages `server.py` uses, so `pip install` and the Docker build work outside Emergent. `.emergent/`,
`.gitconfig`, the `/app/...` symlinks, the `cloned_repo` gitlink, `memory/` and `test_reports/` were
deleted. Remaining trace: the 15 historical commits authored by `emergent-agent-e1` (changing that needs
a history rewrite). The table is kept as a record of what was there.

Line numbers as of the fixes above. All of these were left in place on purpose.

| Where | What | Impact today |
|---|---|---|
| `spark-backend/requirements.txt:8` | `emergentintegrations==0.2.2` | **Not on public PyPI**: `pip install -r requirements.txt` and the Docker build fail outside Emergent. Not imported by the code. |
| `spark-backend/requirements.txt:9` | `litellm` wheel from `customer-assets.emergentagent.com` | Not imported; install breaks if that URL goes away (it answered 200 today) |
| `spark-backend/Dockerfile` | installs `requirements.txt` (so it pulls the two lines above) | Switch to `requirements-app.txt` when removing |
| `spark-frontend/package.json:38` | `@emergentbase/visual-edits` from `https://assets.emergent.sh/npm/…-1.0.8.tgz` | `yarn install` fails if that URL goes away; dev-only babel plugin + overlay |
| `spark-frontend/yarn.lock:1230-1233` | resolved tarball entry | goes away with the package |
| `spark-frontend/craco.config.js:85-98` | `withVisualEdits` wrapper | dev server only |
| `spark-frontend/craco.config.js:9-23, 65-83` + `plugins/health-check/*` | Emergent dev-server health plugin | dev only, when `ENABLE_HEALTH_CHECK=true`; exposes stack traces |
| `spark-frontend/src/index.css:13-15` | `#emergent-badge { display:none }` | cosmetic |
| `spark-frontend/public/index.html:21` | inline script that swallows `DataCloneError`/`PerformanceServerTiming` errors from Emergent's preview iframe | hides real errors; also needs `'unsafe-inline'` in the CSP |
| `.emergent/` | `emergent.yml` (job_id), `system_deps.txt` | none |
| `.gitconfig` (repo root) | identity `emergent-agent-e1 <github@emergent.sh>` | any commit made with it is attributed to Emergent |
| `backend`, `frontend` (root) | git symlinks to `/app/spark-backend`, `/app/spark-frontend` (Emergent container paths) | checked out as 18-byte text files on Windows |
| `cloned_repo` | gitlink to `0775a32` with no `.gitmodules` | empty folder that can't be initialised |
| `memory/PRD.md`, `memory/test_credentials.md` (untracked now), `test_reports/` | Emergent agent state (passwords redacted / untracked) | none |
| `spark-backend/tests/test_sparkcurv.py`, `test_iteration*.py`, `test_pdf_template.py` | Emergent-generated tests (credentials now from env) | keep or rewrite — they pass |
| git history | 15 commits authored by `emergent-agent-e1` | identity only |

Already gone as a side effect of other fixes: `package-lock.json` (duplicate lockfile; held 3 copies of the visual-edits URL) and the Emergent base-image pins in `requirements.txt` (mongo, stripe, google, openai… — unused).
