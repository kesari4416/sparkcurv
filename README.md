# SparkCurv website

The SparkCurv marketing site with a blog and an admin panel.

| Folder | What it is | Tech |
|---|---|---|
| `spark-frontend/` | The website people visit, plus the admin panel at `/admin` | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS |
| `spark-backend/` | The API: blog posts, image uploads, contact form, admin login | Python, FastAPI |
| MariaDB / MySQL | Stores posts, images, enquiries and admin users | (installed separately) |

When it's running you have **three things running at once**: the database, the backend (port 8001)
and the frontend (port 3000). The frontend forwards every `/api/...` call to the backend for you.

The commands below are for **Ubuntu** (including Ubuntu on Windows / WSL, opened from the VS Code
terminal). The project folder on Windows is `/mnt/c/Users/<you>/SparkcurvTechnologies` in Ubuntu.

---

## 1. Install the tools (once)

| Tool | Check it with | Install |
|---|---|---|
| Node.js 20+ | `node -v` | [nvm](https://github.com/nvm-sh/nvm): `nvm install --lts` |
| Yarn 1.22 | `yarn -v` | `corepack enable` (comes with Node) |
| Python 3.11+ with venv | `python3 --version` | `sudo apt install -y python3-venv python3-pip` |
| MariaDB | `sudo mariadb -e "SELECT VERSION();"` | `sudo apt install -y mariadb-server` then `sudo service mariadb start` |

---

## 2. Create the database (once)

```bash
sudo mariadb
```

Then paste this, replacing `choose-a-db-password` with a password of your own (no quote marks in it):

```sql
CREATE DATABASE spark_db CHARACTER SET utf8mb4;
CREATE USER 'spark'@'127.0.0.1' IDENTIFIED BY 'choose-a-db-password';
GRANT ALL PRIVILEGES ON spark_db.* TO 'spark'@'127.0.0.1';
EXIT;
```

Check it: `mariadb -u spark -p -h 127.0.0.1 spark_db -e "SELECT 'connected';"`.
You don't create any tables; the backend creates them the first time it starts.

---

## 3. Start the backend

```bash
cd spark-backend
python3 -m venv .venv                  # once
source .venv/bin/activate              # every time: your prompt now starts with (.venv)
pip install -r requirements.txt        # once, and again when requirements change
cp .env.example .env                   # once
```

Open `spark-backend/.env` in VS Code and fill it in (**not** `.env.example`, which is the template
that gets committed):

| Setting | What to put |
|---|---|
| `MYSQL_PASSWORD` | the database password from step 2 |
| `JWT_SECRET` | a long random string: `python3 -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | the first admin login (10+ characters). Only used when no admin exists yet |
| `CORS_ORIGINS` | leave empty for local development |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `CONTACT_TO` | optional; leave `SMTP_USER`, `SMTP_PASSWORD` and `CONTACT_TO` empty and enquiry emails are simply skipped. Test with `python smtp_check.py --send` |

Start it:

```bash
uvicorn server:app --reload --port 8001
```

It's working when you see `Application startup complete` and
http://localhost:8001/api/health shows `{"status":"healthy",...}`. Leave this terminal open.

> On Ubuntu-on-Windows, `--reload` may not notice file edits made from Windows. If a backend
> change doesn't take effect, stop it with `Ctrl + C` and start it again.

---

## 4. Start the website

Open a **second** terminal:

```bash
cd spark-frontend
yarn install            # once (takes a few minutes)
cp .env.example .env    # once; the defaults are right for local development
yarn dev
```

Open **http://localhost:3000**. Edits to files in `src/` show up in the browser automatically.

**Admin panel:** http://localhost:3000/admin/login with the `ADMIN_EMAIL` / `ADMIN_PASSWORD`
from step 3. After the first start you can delete `ADMIN_PASSWORD` from `.env`; change the password
in the admin panel (Team tab → Change Password), and add more admins there.

---

## 5. Every day after that

1. `sudo service mariadb start` (if the database isn't running already).
2. Terminal 1: `cd spark-backend && source .venv/bin/activate && uvicorn server:app --reload --port 8001`
3. Terminal 2: `cd spark-frontend && yarn dev`
4. Stop either one with `Ctrl + C`.

---

## 6. Where things live (frontend)

```
spark-frontend/src/
  app/                  Next.js routes
    (home)/             the home page (shared shell + preloader)
    (site)/             every other public page: services, pricing, about, contact, blog, thank-you
    admin/              admin panel (login, dashboard), still on the original light theme
    globals.css         Tailwind + both themes (.theme-ink = public site, .theme-legacy = admin)
  sections/             page sections: home (Hero, PinnedStory, Stats, CTASlab, Footer…) and
                        inner pages (page/, service/, pricing/, about/, contact/, blog/)
  components/           shared UI (SiteFrame, HomeHeader, SectionIntro, Magnetic, RevealText…)
  hooks/                useClock, useScramble, useRenderMode, useMediaQuery
  lib/
    tokens.ts           design tokens: colours, easing, durations (Tailwind + shaders + motion read these)
    content.ts          home page copy
    services.ts         every service page (AI & ML, cloud, apps, growth and their sub-pages)
    pages.ts            about and pricing copy
    api.js              API client (cookie auth, same-origin /api)
    router.jsx          react-router compatibility, used by the admin views only
  views/                the admin views (AdminLogin, AdminDashboard)
tailwind.config.ts      Tailwind theme built from lib/tokens.ts
```

**Change the look:** edit `src/lib/tokens.ts` (brand colours, gradient, easing). Tailwind classes,
the 3D hero shader and the animations all follow.
**Change the words:** home in `src/lib/content.ts`, service pages in `src/lib/services.ts`,
about and pricing in `src/lib/pages.ts`.
**Motion:** smooth scroll + GSAP sync in `components/SmoothScroll.tsx`; the preloader in
`sections/Preloader.tsx`; the 3D hero in `sections/hero/` (shader in `shaders.ts`); the pinned
scroll story in `sections/PinnedStory.tsx`. Everything respects the OS "reduce motion" setting.

---

## 7. Tests and checks

Frontend (type check, lint, production build):

```bash
cd spark-frontend
yarn typecheck && yarn lint && yarn build
```

Backend tests call a running backend, so point them at a **separate, throwaway database** (they create
and delete posts and admin users). Start that backend with `COOKIE_SECURE=false`, then:

```bash
cd spark-backend && source .venv/bin/activate
pip install -r requirements-dev.txt
API_BASE_URL=http://127.0.0.1:8001 ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=your-test-password pytest tests
```

---

## 8. Going live (production)

- **Frontend:** `spark-frontend/Dockerfile` builds a self-contained Next.js server (port 3000).
- **Backend:** `spark-backend/Dockerfile` (port 8001). The `.env` file is deliberately not copied into
  the image: run it with `docker run --env-file .env ...`.
- **nginx:** `spark-frontend/nginx.conf` sends `/api/` to the backend (`backend:8001`, uploads up to 6 MB)
  and everything else to the frontend (`frontend:3000`), with security headers. Its
  Content-Security-Policy is report-only; check the browser console after going live, then enforce it
  (instructions in the file).
- Serve the site over **https**: the admin login cookie is `Secure`.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Backend: `JWT_SECRET is not set` | Fill in `JWT_SECRET` in `spark-backend/.env` |
| Backend: `Access denied` / `Can't connect to MySQL` | MariaDB isn't running (`sudo service mariadb start`), or the `MYSQL_*` values don't match step 2 |
| Log says `No usable admin exists` | Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` and restart the backend |
| Admin login says "Too many requests" | 10 wrong passwords in 15 minutes locks that account for 15 minutes |
| Website shows network errors on blog/contact | The backend isn't running on port 8001 |
| `Port 3000 is in use` | Another `yarn dev` is still running; stop it, or run `yarn dev -p 3001` |
| Edits don't show up in `yarn dev` (Ubuntu-on-Windows) | Run `WATCHPACK_POLLING=true yarn dev --webpack` |

## More

- `AUDIT.md` / `AUDIT_SUMMARY.md`: the October 2026 audit, what was fixed, and what still needs a decision.
