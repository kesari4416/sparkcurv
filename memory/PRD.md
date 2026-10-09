# SparkCurv — Admin Panel PRD

## Original Problem Statement
"In github I have connect the frontend and backend https://github.com/kesari4416/sparkcurv.git in this I need admin panel for add the blogs"

## Architecture

### Stack
- **Frontend:** React 19, Tailwind CSS, Framer Motion, craco (at /app/spark-frontend)
- **Backend:** FastAPI, MySQL (aiomysql), bcrypt, PyJWT (at /app/spark-backend)
- **Database:** MySQL (production, user's own server) — NOT available in preview container
- **Auth:** JWT-based using localStorage + Authorization: Bearer header (axios interceptor)

### Directory
- Backend: /app/backend (symlink → /app/spark-backend), port 8001
- Frontend: /app/frontend (symlink → /app/spark-frontend), port 3000

## Core Requirements (Static)
1. Admin panel at /admin route (separate from main site)
2. JWT login (email/password)
3. Blog CRUD: Create, Edit, Delete with Rich Text Editor
4. Image upload for cover photos + gallery
5. Published/Draft toggle
6. Published blogs visible on public /blog page
7. SEO Fields (meta title/description)
8. Blog Search & Filter
9. Contact Leads View
10. Rich Text Color & Font Size controls
11. Blog Tags with filter bar
12. Multiple Admin Users (Team tab)
13. PDF Template generation

## What's Been Implemented

### Backend (server.py — MySQL)
- MySQL connection pool (aiomysql) with auto table creation on startup
- JWT auth: /api/auth/login (returns token), /api/auth/logout, /api/auth/me
- Admin seeding on startup from ADMIN_EMAIL/ADMIN_PASSWORD env vars (safe — no longer deletes other admins)
- Blog CRUD: GET /api/blogs (public), GET /api/blogs/all (admin), GET /api/blogs/:slug (public), POST/PUT/DELETE /api/blogs (admin)
- Image upload as base64 LONGTEXT: POST /api/upload/image, GET /api/images/:id, GET/DELETE /api/images
- Admin users: GET/POST/DELETE /api/admin/users
- Contact form: POST /api/contact, GET /api/contact (admin)
- PDF template: GET /api/blog-template/pdf (fpdf2)
- Email notification on contact submit (SMTP Gmail)

### Frontend
- AuthContext: localStorage token + axios interceptor (Bearer header on all requests)
- AdminLogin.jsx (/admin/login)
- AdminDashboard.jsx (/admin/dashboard): Blog list, editor modal, contacts, media library, team management
- RichTextEditor.jsx: contentEditable toolbar with bold/italic/underline/lists/links/image embed/color/font-size
- CoverImageUploader: drag-drop file upload or URL paste, with gallery picker
- Blog.js: public blog listing with tag filter bar
- BlogPost.js: single post view with SEO, tags, rich content render

## MySQL Tables
- users: id, email, password_hash, name, role, created_at
- blogs: id, title, slug, excerpt, content, image_url, author, category, tags (JSON), published, meta_title, meta_description, created_at, updated_at
- contacts: id, name, email, mobile, whatsapp, services, description, created_at
- images: id, filename, content_type, data (LONGTEXT base64), created_at

## Server .env (required on production server)
```
MYSQL_HOST=your-db-host
MYSQL_PORT=3306
MYSQL_USER=your-db-user
MYSQL_PASSWORD=your-db-password
MYSQL_DATABASE=spark_db
JWT_SECRET=<long random string>
ADMIN_EMAIL=ponish.jino@sparkcurv.com
ADMIN_PASSWORD=Aiden@1996
FRONTEND_URL=https://sparkcurv.com
SMTP_EMAIL=sales@sparkcurv.com
SMTP_PASSWORD=<gmail app password>
NOTIFY_EMAIL=sales@sparkcurv.com
```

## Admin Credentials (Production)
- Email: ponish.jino@sparkcurv.com
- Password: Aiden@1996

## Bug Fixes Applied
- Fixed: seed_admin() was deleting ALL other admin accounts on every server restart (removed the dangerous DELETE statement)

## Status
- Preview environment: Backend unavailable (MySQL not installed in preview container)
- Production (sparkcurv.com): Ready to deploy — configure MySQL env vars and run
