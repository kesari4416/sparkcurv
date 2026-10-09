# SparkCurv - Admin Panel PRD

## Original Problem Statement
"In github i have connect the frontend and backend https://github.com/kesari4416/sparkcurv.git in this i need admin panel for add the blogs"

## Architecture

### Stack
- **Frontend:** React 19, Tailwind CSS, Framer Motion, craco (at /app/spark-frontend)
- **Backend:** FastAPI, MongoDB (Motor), bcrypt, PyJWT (at /app/spark-backend)
- **Database:** MongoDB (sparkcurv_db)
- **Auth:** JWT-based with httpOnly cookies

### Supervisor Config
- Backend: /app/backend (symlink → /app/spark-backend), port 8001
- Frontend: /app/frontend (symlink → /app/spark-frontend), port 3000

## Core Requirements (Static)
1. Admin panel at /admin route (separate from main site)
2. JWT login (email/password)
3. Blog CRUD: Create, Edit, Delete with Rich Text Editor
4. Image URL for cover photos
5. Published/Draft toggle
6. Published blogs visible on public /blog page

## What's Been Implemented (Oct 9, 2026)

### Backend (server.py - full rewrite to MongoDB)
- MongoDB connection (motor) replacing MySQL (aiomysql)
- JWT auth: /api/auth/login, /api/auth/logout, /api/auth/me
- Admin seeding on startup from .env
- Blog CRUD: GET /api/blogs (public), GET /api/blogs/all (admin), GET /api/blogs/:slug (public), POST/PUT/DELETE /api/blogs (admin)
- Contact form migrated to MongoDB
- Symlinks: /app/backend → /app/spark-backend, /app/frontend → /app/spark-frontend

### Frontend
- AuthContext (JWT state management)
- AdminLogin.jsx (/admin/login)
- AdminDashboard.jsx (/admin/dashboard) with stats, blog list, inline editor modal
- RichTextEditor.jsx (contentEditable with toolbar)
- Blog.js - updated to fetch from /api/blogs
- BlogPost.js - updated to fetch from /api/blogs/:slug
- App.js - admin routes added with ProtectedAdmin guard

## Test Results
- 13/13 E2E tests passing (100%)
- Backend: 16/16 API tests passing

## Admin Credentials
- Email: admin@sparkcurv.com
- Password: SparkAdmin@2024

## Prioritized Backlog

### P0 - Must Have (Done)
- [x] Admin login
- [x] Blog CRUD
- [x] Rich text editor
- [x] Published/Draft toggle
- [x] Public blog listing

### Completed in Session 4 (Oct 9, 2026)
- [x] PDF Blog Template download (GET /api/blog-template/pdf via fpdf2)
  - Sections: Basic Info, Excerpt, Content (5 sub-sections), SEO, Publish Status, Notes
  - "Template" button in admin header downloads sparkcurv-blog-template.pdf
- [x] Rich Text Color picker (16-color popover palette)
- [x] Rich Text Font Size selector (Small / Normal / Large / X-Large / Huge)
- [x] Image Gallery (Media tab + gallery modal shared across cover uploader and RTE)
- [x] Blog Tags (add/remove tags, tag filter bar on public /blog, tag badges on post page)
- [x] Multiple Admin Users (Team tab — add/remove admins, protected self-delete)

### P1 - Should Have (Next)
- [ ] Multiple admin users / user management
- [ ] Blog tags/labels for better categorization
- [ ] Rich text color picker / font size controls
