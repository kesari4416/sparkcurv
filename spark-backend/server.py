from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, BackgroundTasks, Query
from fastapi.responses import JSONResponse, Response as FastAPIResponse, StreamingResponse
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import aiomysql
import pymysql
import bcrypt
import jwt
import re
import secrets
import base64
import hashlib
import html
import io
import ipaddress
import json
from contextlib import asynccontextmanager
from types import SimpleNamespace
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
import nh3
from markdown_it import MarkdownIt
import mailer
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

MYSQL_HOST     = os.environ.get("MYSQL_HOST", "localhost")
MYSQL_PORT     = int(os.environ.get("MYSQL_PORT", 3306))
MYSQL_USER     = os.environ.get("MYSQL_USER", "spark")
MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.environ.get("MYSQL_DATABASE", "spark_db")
JWT_SECRET     = os.environ.get("JWT_SECRET", "")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is not set. Add it to spark-backend/.env (see .env.example).")
JWT_ALGORITHM  = "HS256"
SESSION_HOURS  = 8
COOKIE_SECURE  = os.environ.get("COOKIE_SECURE", "true").lower() != "false"

# Cross-origin callers allowed to use the API. Not needed when the site and /api share
# an origin (nginx.conf). FRONTEND_URL is still honoured for older .env files.
CORS_ORIGINS = sorted({o.strip().rstrip("/") for o in
                       os.environ.get("CORS_ORIGINS", "").split(",") + [os.environ.get("FRONTEND_URL", "")]
                       if o.strip()})

# The default admin password that shipped in this repo's history. Any account still
# using it is locked on startup (see revoke_leaked_passwords).
LEAKED_DEFAULT_PASSWORDS = ("SparkAdmin@2024",)

pool = None

api_router = APIRouter(prefix="/api")


# ─── DB Pool ──────────────────────────────────────────────────────────────────

async def get_conn():
    return await pool.acquire()

async def release(conn):
    pool.release(conn)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except ValueError:  # locked account ("!") or malformed hash
        return False

# Used so a login for an unknown email costs the same bcrypt time as a real one.
_DUMMY_HASH = hash_password(secrets.token_urlsafe(16))

def password_fingerprint(password_hash: str) -> str:
    # Binds a token to the current password: changing it signs out every session.
    return hashlib.sha256(f"{JWT_SECRET}:{password_hash}".encode()).hexdigest()[:16]

def create_access_token(user: dict) -> str:
    payload = {
        "sub": str(user["id"]), "email": user["email"], "pwf": password_fingerprint(user["password_hash"]),
        "exp": datetime.now(timezone.utc) + timedelta(hours=SESSION_HOURS),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def set_auth_cookie(response: Response, token: str):
    # Same-origin admin panel: Strict blocks the cookie on cross-site requests (CSRF).
    response.set_cookie(key="access_token", value=token, httponly=True, secure=COOKIE_SECURE,
                        samesite="strict", max_age=SESSION_HOURS * 3600, path="/")

def clear_auth_cookie(response: Response):
    # Attributes must match set_auth_cookie or browsers ignore the deletion.
    response.delete_cookie("access_token", path="/", secure=COOKIE_SECURE, httponly=True, samesite="strict")

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')[:200]

def is_duplicate_key(e: Exception) -> bool:
    return isinstance(e, pymysql.err.IntegrityError) and e.args and e.args[0] == 1062


# ─── Rate limiting ────────────────────────────────────────────────────────────
# Sliding window stored in MySQL so every uvicorn worker shares the same counters.
# Only used on low-volume endpoints (login, contact, password change).

def client_ip(request: Request) -> str:
    peer = request.client.host if request.client else ""
    try:
        trusted = ipaddress.ip_address(peer).is_private or ipaddress.ip_address(peer).is_loopback
    except ValueError:
        trusted = False
    # Only trust X-Real-IP when the request came through a local reverse proxy (nginx).
    return (request.headers.get("x-real-ip") if trusted else None) or peer or "unknown"

def _bucket(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()  # fixed length; keeps emails out of the table

async def record_hit(key: str):
    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            await cur.execute("INSERT INTO rate_limits (bucket) VALUES (%s)", (_bucket(key),))
    finally:
        await release(conn)

async def rate_limit(key: str, limit: int, window_seconds: int, record: bool = True):
    """Raise 429 when `key` has `limit` hits in the window. record=False only checks."""
    bucket = _bucket(key)
    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            await cur.execute("SELECT COUNT(*) FROM rate_limits WHERE bucket=%s "
                              "AND created_at > NOW(3) - INTERVAL %s SECOND", (bucket, window_seconds))
            (count,) = await cur.fetchone()
            if count >= limit:
                raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
            if record:
                await cur.execute("INSERT INTO rate_limits (bucket) VALUES (%s)", (bucket,))
            if secrets.randbelow(100) == 0:  # occasional cleanup instead of a cron job
                await cur.execute("DELETE FROM rate_limits WHERE created_at < NOW(3) - INTERVAL 1 DAY")
    finally:
        await release(conn)


# ─── HTML sanitizing ──────────────────────────────────────────────────────────

_ALLOWED_TAGS = {"p", "br", "div", "span", "font", "b", "strong", "i", "em", "u", "s", "strike",
                 "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "pre", "code",
                 "a", "img", "hr", "table", "thead", "tbody", "tr", "th", "td", "sub", "sup"}
_ALLOWED_ATTRS = {
    "a": {"href", "title", "target"},
    "img": {"src", "alt", "title", "width", "height"},
    "span": {"style"}, "p": {"style"}, "div": {"style"}, "li": {"style"},
    "h1": {"style"}, "h2": {"style"}, "h3": {"style"}, "h4": {"style"},
    "font": {"color", "size"},  # legacy execCommand output in existing posts
    "td": {"colspan", "rowspan", "style"}, "th": {"colspan", "rowspan", "style"},  # style: Markdown table alignment
    "ol": {"start"},
}

def sanitize_html(content: str) -> str:
    return nh3.clean(content or "", tags=_ALLOWED_TAGS, attributes=_ALLOWED_ATTRS,
                     url_schemes={"http", "https", "mailto", "tel"},
                     filter_style_properties={"color", "background-color", "font-size", "font-weight",
                                              "font-style", "text-align", "text-decoration"},
                     link_rel="noopener noreferrer nofollow")

# Blog posts are written in Markdown (CommonMark plus tables and ~~strikethrough~~) and
# stored twice: the source in content_md, for editing, and the rendered HTML in content,
# for readers. Raw HTML inside the Markdown is allowed (old posts were HTML) because the
# output always goes through sanitize_html; markdown-it itself refuses javascript: links.
_markdown = MarkdownIt("commonmark", {"html": True}).enable(["table", "strikethrough"])

def render_markdown(source: str) -> str:
    return sanitize_html(_markdown.render(source or ""))

# Older builds stored uploads as absolute URLs with whatever API host the build had
# (e.g. http://localhost:8000/api/images/3). Store and serve them as relative paths.
_ABS_IMAGE_URL = re.compile(r'https?://[^/"\'\s]+(/api/images/\d+)')

def relative_image_urls(text: str) -> str:
    return _ABS_IMAGE_URL.sub(r'\1', text) if text else text

async def get_current_admin(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        conn = await get_conn()
        try:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT * FROM users WHERE id=%s AND role='admin'", (int(payload["sub"]),))
                user = await cur.fetchone()
        finally:
            await release(conn)
        if not user:
            raise HTTPException(status_code=403, detail="Admin access required")
        if payload.get("pwf") != password_fingerprint(user["password_hash"]):
            raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")


# ─── Models ───────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(max_length=200)

class ContactCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    mobile: str = Field(min_length=1, max_length=20)
    whatsapp: str = Field(min_length=1, max_length=20)
    services: str = Field(min_length=1, max_length=120)
    description: str = Field(min_length=1, max_length=2000)
    company_website: Optional[str] = None  # honeypot: humans never see or fill it

def _validate_image_url(v: Optional[str]) -> Optional[str]:
    if not v:
        return v
    v = relative_image_urls(v.strip())
    if not (v.startswith("/api/images/") or re.match(r"^https?://", v)):
        raise ValueError("must be an uploaded image or an http(s) URL")
    return v

def _validate_tags(v: Optional[List[str]]) -> Optional[List[str]]:
    if v is None:
        return v
    tags = [t.strip()[:50] for t in v if t and t.strip()]
    if len(tags) > 30:
        raise ValueError("at most 30 tags")
    return tags

class BlogCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    slug: Optional[str] = Field(None, max_length=200)
    excerpt: str = Field(max_length=2000)
    # Markdown source (the admin editor). `content` (HTML) is still accepted for older clients.
    content_md: Optional[str] = Field(None, max_length=2_000_000)
    content: Optional[str] = Field(None, max_length=2_000_000)
    image_url: Optional[str] = Field("", max_length=2000)
    author: str = Field("SparkCurv Team", max_length=255)
    category: str = Field("Technology", max_length=255)
    tags: Optional[List[str]] = []
    published: bool = True
    meta_title: Optional[str] = Field("", max_length=255)
    meta_description: Optional[str] = Field("", max_length=1000)

    _image = field_validator("image_url")(_validate_image_url)
    _tags = field_validator("tags")(_validate_tags)

    @model_validator(mode="after")
    def _needs_content(self):
        if not (self.content_md or "").strip() and not (self.content or "").strip():
            raise ValueError("content_md is required")
        return self

class BlogUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    slug: Optional[str] = Field(None, max_length=200)
    excerpt: Optional[str] = Field(None, max_length=2000)
    content_md: Optional[str] = Field(None, max_length=2_000_000)
    content: Optional[str] = Field(None, max_length=2_000_000)
    image_url: Optional[str] = Field(None, max_length=2000)
    author: Optional[str] = Field(None, max_length=255)
    category: Optional[str] = Field(None, max_length=255)
    tags: Optional[List[str]] = None
    published: Optional[bool] = None
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = Field(None, max_length=1000)

    _image = field_validator("image_url")(_validate_image_url)
    _tags = field_validator("tags")(_validate_tags)

class MarkdownPreview(BaseModel):
    markdown: str = Field("", max_length=2_000_000)

class AdminUserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=255)
    password: str = Field(max_length=200)

class PasswordChange(BaseModel):
    current_password: str = Field(max_length=200)
    new_password: str = Field(max_length=200)

MIN_PASSWORD_LENGTH = 10


# ─── Auth ─────────────────────────────────────────────────────────────────────

@api_router.post("/auth/login")
async def login(data: LoginRequest, request: Request, response: Response):
    email = data.email.lower()
    # Only failed attempts count, so a valid admin is never throttled by their own logins.
    ip_key, email_key = f"login-ip:{client_ip(request)}", f"login-email:{email}"
    await rate_limit(ip_key, limit=20, window_seconds=900, record=False)
    await rate_limit(email_key, limit=10, window_seconds=900, record=False)
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM users WHERE email=%s AND role='admin'", (email,))
            user = await cur.fetchone()
    finally:
        await release(conn)
    if not verify_password(data.password, user["password_hash"] if user else _DUMMY_HASH) or not user:
        await record_hit(ip_key)
        await record_hit(email_key)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    set_auth_cookie(response, create_access_token(user))
    return {"id": user["id"], "email": user["email"], "name": user.get("name", ""), "role": user["role"]}

@api_router.post("/auth/logout")
async def logout(response: Response):
    clear_auth_cookie(response)
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def me(admin=Depends(get_current_admin)):
    return {"id": admin["id"], "email": admin["email"],
            "name": admin.get("name", ""), "role": admin["role"]}

@api_router.post("/auth/change-password")
async def change_password(data: PasswordChange, request: Request, admin=Depends(get_current_admin)):
    # Throttles guessing the current password with a stolen session; only wrong guesses count.
    key = f"change-pw:{admin['id']}"
    await rate_limit(key, limit=10, window_seconds=900, record=False)
    if not verify_password(data.current_password, admin["password_hash"]):
        await record_hit(key)
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(data.new_password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(status_code=400, detail=f"New password must be at least {MIN_PASSWORD_LENGTH} characters")
    if data.new_password == data.current_password or data.new_password in LEAKED_DEFAULT_PASSWORDS:
        raise HTTPException(status_code=400, detail="Choose a different password")
    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            await cur.execute("UPDATE users SET password_hash=%s WHERE id=%s",
                              (hash_password(data.new_password), admin["id"]))
            await conn.commit()
    finally:
        await release(conn)
    return {"message": "Password updated"}


# ─── Blogs ────────────────────────────────────────────────────────────────────

def row_to_blog(row: dict) -> dict:
    if row:
        row["image_url"] = relative_image_urls(row.get("image_url") or "")
        # Also sanitized on read: posts saved before sanitizing existed are still raw in the DB.
        row["content"] = sanitize_html(relative_image_urls(row.get("content") or ""))
        # NULL for posts written before the Markdown editor; the editor then opens their HTML.
        if row.get("content_md") is not None:
            row["content_md"] = relative_image_urls(row["content_md"])
    if row and isinstance(row.get("tags"), str):
        try:
            row["tags"] = json.loads(row["tags"])
        except Exception:
            row["tags"] = []
    if row and row.get("created_at"):
        row["created_at"] = row["created_at"].isoformat() if hasattr(row["created_at"], "isoformat") else str(row["created_at"])
    if row and row.get("updated_at"):
        row["updated_at"] = row["updated_at"].isoformat() if hasattr(row["updated_at"], "isoformat") else str(row["updated_at"])
    return row

@api_router.get("/blogs")
async def get_blogs():
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM blogs WHERE published=1 ORDER BY created_at DESC")
            rows = await cur.fetchall()
    finally:
        await release(conn)
    return [row_to_blog(dict(r)) for r in rows]

@api_router.get("/blogs/all")
async def get_all_blogs(admin=Depends(get_current_admin)):
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM blogs ORDER BY created_at DESC")
            rows = await cur.fetchall()
    finally:
        await release(conn)
    return [row_to_blog(dict(r)) for r in rows]

@api_router.post("/blogs/preview")
async def preview_markdown(data: MarkdownPreview, admin=Depends(get_current_admin)):
    """Renders Markdown exactly as a saved post would be, for the editor's live preview."""
    return {"html": render_markdown(relative_image_urls(data.markdown))}

@api_router.get("/blogs/{slug}")
async def get_blog(slug: str):
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM blogs WHERE slug=%s AND published=1", (slug,))
            row = await cur.fetchone()
    finally:
        await release(conn)
    if not row:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return row_to_blog(dict(row))

@api_router.post("/blogs")
async def create_blog(data: BlogCreate, admin=Depends(get_current_admin)):
    slug = slugify(data.slug or "") or slugify(data.title)
    if not slug:
        raise HTTPException(status_code=400, detail="Title or slug must contain letters or numbers")
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT id FROM blogs WHERE slug=%s", (slug,))
            if await cur.fetchone():
                slug = f"{slug}-{secrets.token_hex(3)}"
            if (data.content_md or "").strip():
                content_md = relative_image_urls(data.content_md)
                content = render_markdown(content_md)
            else:  # older clients send HTML
                content_md, content = None, sanitize_html(data.content)
            try:
                await cur.execute("""
                    INSERT INTO blogs (title, slug, excerpt, content, content_md, image_url, author, category,
                        tags, published, meta_title, meta_description)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, (data.title, slug, data.excerpt, content, content_md, data.image_url or "",
                      data.author, data.category, json.dumps(data.tags or []),
                      int(data.published), data.meta_title or "", data.meta_description or ""))
            except pymysql.err.IntegrityError as e:
                if is_duplicate_key(e):
                    raise HTTPException(status_code=409, detail="A post with this slug already exists")
                raise
            await conn.commit()
            blog_id = cur.lastrowid
            await cur.execute("SELECT * FROM blogs WHERE id=%s", (blog_id,))
            row = await cur.fetchone()
    finally:
        await release(conn)
    return row_to_blog(dict(row))

@api_router.put("/blogs/{blog_id}")
async def update_blog(blog_id: int, data: BlogUpdate, admin=Depends(get_current_admin)):
    fields, values = [], []
    updates = data.model_dump(exclude_none=True)
    if "content_md" in updates:
        # The Markdown source is the truth: store it and the HTML rendered from it.
        updates["content_md"] = relative_image_urls(updates["content_md"])
        updates["content"] = render_markdown(updates["content_md"])
    elif "content" in updates:
        # HTML from an older client: the stored Markdown no longer matches, so drop it.
        updates["content"] = sanitize_html(updates["content"])
        fields.append("content_md=NULL")
    for k, v in updates.items():
        if k == "tags":
            v = json.dumps(v)
        elif k == "published":
            v = int(v)
        elif k == "slug":
            v = slugify(v)
            if not v:
                raise HTTPException(status_code=400, detail="Slug must contain letters or numbers")
        fields.append(f"{k}=%s"); values.append(v)  # k comes from the BlogUpdate schema, not the client
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    values.append(blog_id)
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            try:
                await cur.execute(f"UPDATE blogs SET {', '.join(fields)}, updated_at=NOW() WHERE id=%s", values)
            except pymysql.err.IntegrityError as e:
                if is_duplicate_key(e):
                    raise HTTPException(status_code=409, detail="A post with this slug already exists")
                raise
            await conn.commit()
            # rowcount is 0 when nothing changed, so check existence with a read instead.
            await cur.execute("SELECT * FROM blogs WHERE id=%s", (blog_id,))
            row = await cur.fetchone()
    finally:
        await release(conn)
    if not row:
        raise HTTPException(status_code=404, detail="Blog not found")
    return row_to_blog(dict(row))

@api_router.delete("/blogs/{blog_id}")
async def delete_blog(blog_id: int, admin=Depends(get_current_admin)):
    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM blogs WHERE id=%s", (blog_id,))
            await conn.commit()
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Blog not found")
    finally:
        await release(conn)
    return {"message": "Blog deleted"}


# ─── Images ───────────────────────────────────────────────────────────────────

MAX_IMAGE_SIZE = 5 * 1024 * 1024

def sniff_image_type(data: bytes) -> Optional[str]:
    # Trust the file's bytes, not the client-supplied Content-Type.
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    data = await file.read(MAX_IMAGE_SIZE + 1)
    if len(data) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=413, detail="Image must be under 5 MB")
    content_type = sniff_image_type(data)
    if not content_type:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, GIF, and WebP images are allowed")
    filename = os.path.basename(file.filename or "image")[:255]
    b64 = base64.b64encode(data).decode("utf-8")
    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO images (filename, content_type, data) VALUES (%s,%s,%s)",
                (filename, content_type, b64)
            )
            await conn.commit()
            image_id = cur.lastrowid
    finally:
        await release(conn)
    return {"url": f"/api/images/{image_id}", "id": image_id}

@api_router.get("/images/{image_id}")
async def get_image(image_id: int):
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM images WHERE id=%s", (image_id,))
            row = await cur.fetchone()
    finally:
        await release(conn)
    if not row:
        raise HTTPException(status_code=404, detail="Image not found")
    image_data = base64.b64decode(row["data"])
    # An image id never changes content, so it can be cached for good.
    return FastAPIResponse(content=image_data, media_type=row["content_type"], headers={
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
    })

@api_router.get("/images")
async def list_images(admin=Depends(get_current_admin),
                      limit: int = Query(500, ge=1, le=2000), offset: int = Query(0, ge=0)):
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT id, filename, content_type, created_at FROM images "
                              "ORDER BY created_at DESC LIMIT %s OFFSET %s", (limit, offset))
            rows = await cur.fetchall()
    finally:
        await release(conn)
    return [{"id": r["id"], "filename": r["filename"], "content_type": r["content_type"],
             "created_at": r["created_at"].isoformat() if hasattr(r["created_at"], "isoformat") else str(r["created_at"]),
             "url": f"/api/images/{r['id']}"} for r in rows]

@api_router.delete("/images/{image_id}")
async def delete_image(image_id: int, admin=Depends(get_current_admin)):
    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM images WHERE id=%s", (image_id,))
            await conn.commit()
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Image not found")
    finally:
        await release(conn)
    return {"message": "Image deleted"}


# ─── Admin Users ──────────────────────────────────────────────────────────────

@api_router.get("/admin/users")
async def list_admin_users(admin=Depends(get_current_admin)):
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT id, email, name, created_at FROM users WHERE role='admin' ORDER BY created_at ASC")
            rows = await cur.fetchall()
    finally:
        await release(conn)
    return [{"id": r["id"], "email": r["email"], "name": r.get("name", ""),
             "created_at": r["created_at"].isoformat() if hasattr(r["created_at"], "isoformat") else str(r["created_at"])} for r in rows]

@api_router.post("/admin/users")
async def create_admin_user(data: AdminUserCreate, admin=Depends(get_current_admin)):
    if len(data.password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(status_code=400, detail=f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
    if data.password in LEAKED_DEFAULT_PASSWORDS:
        raise HTTPException(status_code=400, detail="Choose a different password")
    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            await cur.execute("SELECT id FROM users WHERE email=%s", (data.email.lower(),))
            if await cur.fetchone():
                raise HTTPException(status_code=400, detail="A user with this email already exists")
            try:
                await cur.execute(
                    "INSERT INTO users (email, name, password_hash, role) VALUES (%s,%s,%s,'admin')",
                    (data.email.lower(), data.name, hash_password(data.password))
                )
            except pymysql.err.IntegrityError as e:
                if is_duplicate_key(e):
                    raise HTTPException(status_code=400, detail="A user with this email already exists")
                raise
            await conn.commit()
            user_id = cur.lastrowid
    finally:
        await release(conn)
    return {"id": user_id, "email": data.email.lower(), "name": data.name}

@api_router.delete("/admin/users/{user_id}")
async def delete_admin_user(user_id: int, admin=Depends(get_current_admin)):
    if admin["id"] == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM users WHERE id=%s AND role='admin'", (user_id,))
            await conn.commit()
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Admin user not found")
    finally:
        await release(conn)
    return {"message": "Admin user deleted"}


# ─── Contact ──────────────────────────────────────────────────────────────────

@api_router.post("/contact")
async def submit_contact(data: ContactCreate, request: Request, background_tasks: BackgroundTasks):
    await rate_limit(f"contact:{client_ip(request)}", limit=5, window_seconds=600)
    if data.company_website:
        # Honeypot filled in: almost certainly a bot. Pretend it worked, store nothing.
        logger.info("Contact honeypot triggered from %s", client_ip(request))
        return {"id": 0, "message": "Enquiry submitted successfully"}
    word_count = len(data.description.strip().split())
    if word_count > 200:
        raise HTTPException(status_code=400, detail="Description must be 200 words or less")
    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            await cur.execute("""
                INSERT INTO contacts (name, email, mobile, whatsapp, services, description)
                VALUES (%s,%s,%s,%s,%s,%s)
            """, (data.name.strip(), data.email, data.mobile.strip(), data.whatsapp.strip(),
                  data.services.strip(), data.description.strip()))
            await conn.commit()
            contact_id = cur.lastrowid
    finally:
        await release(conn)
    # smtplib blocks; run it after the response instead of stalling the event loop.
    background_tasks.add_task(send_enquiry_email, data)
    return {"id": contact_id, "message": "Enquiry submitted successfully"}

class QuickEnquiry(BaseModel):
    email: EmailStr
    company_website: Optional[str] = None  # honeypot, same as the contact form


@api_router.post("/quick-enquiry")
async def quick_enquiry(data: QuickEnquiry, request: Request, background_tasks: BackgroundTasks):
    """Email-only lead from the home page CTA. Stored as a contact so it shows in the admin Leads tab."""
    await rate_limit(f"contact:{client_ip(request)}", limit=5, window_seconds=600)
    if data.company_website:
        logger.info("Quick-enquiry honeypot triggered from %s", client_ip(request))
        return {"message": "Thanks! We'll be in touch shortly."}
    lead = SimpleNamespace(
        name="Website visitor", email=data.email, mobile="", whatsapp="",
        services="Quick enquiry (home page)",
        description="Left their email on the home page and asked to be contacted.",
    )
    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            await cur.execute("""
                INSERT INTO contacts (name, email, mobile, whatsapp, services, description)
                VALUES (%s,%s,%s,%s,%s,%s)
            """, (lead.name, lead.email, lead.mobile, lead.whatsapp, lead.services, lead.description))
    finally:
        await release(conn)
    background_tasks.add_task(send_enquiry_email, lead)
    return {"message": "Thanks! We'll be in touch shortly."}


@api_router.get("/contact")
async def get_contacts(admin=Depends(get_current_admin),
                       limit: int = Query(1000, ge=1, le=5000), offset: int = Query(0, ge=0)):
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM contacts ORDER BY created_at DESC LIMIT %s OFFSET %s", (limit, offset))
            rows = await cur.fetchall()
    finally:
        await release(conn)
    return [{"id": r["id"], "name": r["name"], "email": r["email"],
             "mobile": r["mobile"], "whatsapp": r["whatsapp"],
             "services": r["services"], "description": r["description"],
             "created_at": r["created_at"].isoformat() if hasattr(r["created_at"], "isoformat") else str(r["created_at"])} for r in rows]


# ─── Blog Template PDF ────────────────────────────────────────────────────────

@api_router.get("/blog-template/pdf")
async def download_blog_template():
    from fpdf import FPDF

    class PDF(FPDF):
        def header(self):
            self.set_fill_color(2, 2, 139)
            self.rect(0, 0, 210, 18, 'F')
            self.set_font('Helvetica', 'B', 13)
            self.set_text_color(255, 255, 255)
            self.set_xy(0, 4)
            self.cell(0, 10, 'SparkCurv  |  Blog Post Template', align='C')
            self.set_text_color(0, 0, 0)
            self.ln(16)

        def footer(self):
            self.set_y(-14)
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(150, 150, 150)
            self.cell(0, 10, f'sparkcurv.com  |  Page {self.page_no()}', align='C')

    def section_title(pdf, title):
        pdf.set_fill_color(240, 242, 255)
        pdf.set_draw_color(180, 180, 220)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(2, 2, 139)
        pdf.cell(0, 8, f'  {title}', border=1, fill=True, ln=True)
        pdf.set_text_color(0, 0, 0)

    def label(pdf, text, hint=''):
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(55, 65, 81)
        pdf.cell(0, 6, text, ln=True)
        if hint:
            pdf.set_font('Helvetica', 'I', 7.5)
            pdf.set_text_color(120, 120, 120)
            pdf.cell(0, 4, hint, ln=True)
        pdf.set_text_color(0, 0, 0)

    def write_box(pdf, height=10):
        pdf.set_fill_color(250, 250, 252)
        pdf.set_draw_color(210, 214, 220)
        pdf.rect(pdf.get_x(), pdf.get_y(), 190, height, 'DF')
        pdf.ln(height + 2)

    def write_lines(pdf, n_lines=4, line_height=8):
        x0, y0 = pdf.get_x(), pdf.get_y()
        pdf.set_fill_color(250, 250, 252)
        pdf.set_draw_color(210, 214, 220)
        total_h = n_lines * line_height
        pdf.rect(x0, y0, 190, total_h, 'DF')
        pdf.set_draw_color(220, 225, 235)
        for i in range(1, n_lines):
            pdf.line(x0, y0 + i * line_height, x0 + 190, y0 + i * line_height)
        pdf.ln(total_h + 2)

    def checkbox_row(pdf, options, cols=3):
        col_w = 190 / cols
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(55, 65, 81)
        for i, opt in enumerate(options):
            if i % cols == 0 and i > 0:
                pdf.ln(7)
            bx = 10 + (i % cols) * col_w
            by = pdf.get_y()
            pdf.set_draw_color(140, 140, 180)
            pdf.rect(bx, by + 0.5, 4, 4)
            pdf.set_xy(bx + 6, by)
            pdf.cell(col_w - 6, 5, opt)
        pdf.ln(8)

    pdf = PDF(orientation='P', unit='mm', format='A4')
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.add_page()
    pdf.set_margins(10, 22, 10)

    pdf.set_fill_color(254, 243, 199)
    pdf.set_draw_color(245, 158, 11)
    pdf.set_font('Helvetica', '', 8.5)
    pdf.set_text_color(120, 80, 0)
    pdf.multi_cell(0, 5,
        'INSTRUCTIONS: Fill in each section below. Once complete, log in to the SparkCurv Admin Panel '
        '(/admin/login) and use the "New Post" button to enter your content. Fields marked * are required.',
        border=1, fill=True)
    pdf.ln(4)
    pdf.set_text_color(0, 0, 0)

    section_title(pdf, '1.  BASIC INFORMATION')
    pdf.ln(2)
    label(pdf, 'Post Title  *', 'The main headline of your blog post')
    write_box(pdf, 10)
    label(pdf, 'URL Slug', 'Leave blank to auto-generate  e.g.  my-blog-post')
    write_box(pdf, 10)
    label(pdf, 'Author Name', 'Default: SparkCurv Team')
    write_box(pdf, 10)
    label(pdf, 'Category  *', 'Tick one:')
    checkbox_row(pdf, ['Technology','AI & Technology','DevOps','Mobile Development','Web Development','Cloud','Digital Marketing','Business'], cols=3)
    label(pdf, 'Tags', 'Comma-separated keywords  e.g.  ai, automation, cloud')
    write_box(pdf, 10)
    label(pdf, 'Cover Image URL', 'Paste full URL or upload in admin')
    write_box(pdf, 10)
    pdf.ln(2)

    section_title(pdf, '2.  EXCERPT / SUMMARY  *')
    pdf.ln(2)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 5, '2-3 sentences shown on the blog listing page', ln=True)
    pdf.set_text_color(0, 0, 0)
    write_lines(pdf, n_lines=3)
    pdf.ln(2)

    section_title(pdf, '3.  BLOG CONTENT  *')
    pdf.ln(2)
    for sub in ['Introduction', 'Section 1  (add heading)', 'Section 2  (add heading)', 'Section 3  (add heading)', 'Conclusion']:
        pdf.set_font('Helvetica', 'B', 8.5)
        pdf.set_text_color(2, 2, 139)
        pdf.cell(0, 5, sub, ln=True)
        pdf.set_text_color(0, 0, 0)
        write_lines(pdf, n_lines=5)
        pdf.ln(1)

    section_title(pdf, '4.  SEO SETTINGS  (optional)')
    pdf.ln(2)
    label(pdf, 'Meta Title', 'max 60 characters')
    write_box(pdf, 10)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(130, 130, 130)
    pdf.cell(0, 4, '____________ / 60 characters', ln=True)
    pdf.ln(1)
    pdf.set_text_color(0, 0, 0)
    label(pdf, 'Meta Description', 'max 160 characters')
    write_lines(pdf, n_lines=3)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(130, 130, 130)
    pdf.cell(0, 4, '____________ / 160 characters', ln=True)
    pdf.ln(2)
    pdf.set_text_color(0, 0, 0)

    section_title(pdf, '5.  PUBLISH STATUS')
    pdf.ln(2)
    checkbox_row(pdf, ['Publish immediately', 'Save as Draft'], cols=2)
    pdf.ln(2)

    section_title(pdf, '6.  NOTES')
    pdf.ln(2)
    write_lines(pdf, n_lines=3)

    buf = io.BytesIO(bytes(pdf.output()))
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="sparkcurv-blog-template.pdf"'})


# ─── Health ────────────────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "SparkCurv API", "database": "MySQL"}

@api_router.get("/health")
async def health():
    try:
        conn = await get_conn()
        try:
            async with conn.cursor() as cur:
                await cur.execute("SELECT 1")
        finally:
            await release(conn)
        return {"status": "healthy", "database": "MySQL connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(status_code=503, content={"status": "unhealthy"})


# ─── Email ────────────────────────────────────────────────────────────────────

def send_enquiry_email(contact):
    missing = mailer.missing()
    if missing:
        logger.warning("Enquiry saved but no email sent: %s not set in the backend environment", ", ".join(missing))
        return
    try:
        # Everything here is visitor input: escape it for HTML and keep it on one line in headers.
        safe = {k: html.escape(str(getattr(contact, k)).strip())
             for k in ("name", "email", "mobile", "whatsapp", "services", "description")}
        one_line = lambda s: re.sub(r"[\r\n]+", " ", str(s)).strip()[:150]
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'New Enquiry from {one_line(contact.name)} - {one_line(contact.services)}'
        msg['From'] = mailer.FROM
        msg['To'] = mailer.TO
        msg['Reply-To'] = one_line(contact.email)
        body = f"""<html><body style="font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:auto;background:white;border-radius:12px;">
                <div style="background:#02028B;padding:24px;text-align:center;">
                    <h1 style="color:white;margin:0;font-size:22px;">New Enquiry Received</h1>
                </div>
                <div style="padding:24px;">
                    <p><strong>Name:</strong> {safe['name']}</p>
                    <p><strong>Email:</strong> {safe['email']}</p>
                    <p><strong>Mobile:</strong> {safe['mobile']}</p>
                    <p><strong>WhatsApp:</strong> {safe['whatsapp']}</p>
                    <p><strong>Service:</strong> {safe['services']}</p>
                    <p><strong>Description:</strong> {safe['description'].replace(chr(10), '<br>')}</p>
                </div>
            </div>
        </body></html>"""
        msg.attach(MIMEText(body, 'html'))
        with mailer.connect() as server:
            server.login(mailer.USER, mailer.PASSWORD)
            server.sendmail(mailer.FROM_ADDRESS, mailer.TO, msg.as_string())
        logger.info("Enquiry email sent to %s via %s:%s", mailer.TO, mailer.HOST, mailer.PORT)
    except Exception as e:
        # The visitor already got a success response; this line is the only trace of a failed email.
        logger.error("Enquiry email FAILED (%s): %s", type(e).__name__, e)


# ─── App Setup ────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # No try/except: if the database is unreachable the process should exit and be
    # restarted, rather than serve 500s while looking alive.
    global pool
    pool = await aiomysql.create_pool(
        host=MYSQL_HOST, port=MYSQL_PORT,
        user=MYSQL_USER, password=MYSQL_PASSWORD,
        # autocommit: with it off, a pooled connection that only ran SELECTs keeps its
        # REPEATABLE READ snapshot open and keeps returning stale rows (old password
        # hashes, missing new posts). No endpoint needs a multi-statement transaction.
        db=MYSQL_DATABASE, autocommit=True,
        minsize=2, maxsize=10, charset='utf8mb4'
    )
    logger.info("MySQL connected")
    await create_tables()
    await revoke_leaked_passwords()
    await seed_admin()
    yield
    pool.close()
    await pool.wait_closed()

app = FastAPI(lifespan=lifespan)
app.include_router(api_router)

if CORS_ORIGINS:
    app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=CORS_ORIGINS,
        allow_methods=["GET", "POST", "PUT", "DELETE"], allow_headers=["Content-Type"])


async def create_tables():
    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    name VARCHAR(255),
                    role VARCHAR(50) DEFAULT 'admin',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4
            """)
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS blogs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(500) NOT NULL,
                    slug VARCHAR(500) UNIQUE NOT NULL,
                    excerpt TEXT,
                    content LONGTEXT,
                    content_md LONGTEXT NULL,
                    image_url LONGTEXT,
                    author VARCHAR(255) DEFAULT 'SparkCurv Team',
                    category VARCHAR(255) DEFAULT 'Technology',
                    tags JSON,
                    published TINYINT(1) DEFAULT 1,
                    meta_title VARCHAR(255),
                    meta_description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4
            """)
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS contacts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255),
                    email VARCHAR(255),
                    mobile VARCHAR(50),
                    whatsapp VARCHAR(50),
                    services VARCHAR(255),
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4
            """)
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS images (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    filename VARCHAR(500),
                    content_type VARCHAR(100),
                    data LONGTEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4
            """)
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS rate_limits (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    bucket CHAR(64) NOT NULL,
                    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                    INDEX idx_bucket_time (bucket, created_at)
                ) CHARACTER SET utf8mb4
            """)
            # Databases created before the Markdown editor: add the source column once.
            await cur.execute("""
                SELECT COUNT(*) FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'blogs' AND COLUMN_NAME = 'content_md'
            """)
            (has_md,) = await cur.fetchone()
            if not has_md:
                await cur.execute("ALTER TABLE blogs ADD COLUMN content_md LONGTEXT NULL AFTER content")
                logger.info("Added blogs.content_md")
            await conn.commit()
        logger.info("Tables ready")
    finally:
        await release(conn)


async def seed_admin():
    """Create the first admin from ADMIN_EMAIL/ADMIN_PASSWORD when no usable admin exists.

    Never overwrites a working password, so passwords changed in the admin panel stick.
    The one exception is recovery: if ADMIN_EMAIL is an account locked by
    revoke_leaked_passwords and it was the last admin, its password is set from env.
    """
    admin_email    = os.environ.get("ADMIN_EMAIL", "").strip().lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            await cur.execute("SELECT COUNT(*) FROM users WHERE role='admin' AND password_hash<>'!'")
            (admin_count,) = await cur.fetchone()
            if admin_count:
                if admin_password:
                    logger.info("Admin already exists; ADMIN_PASSWORD is ignored and can be removed from .env")
                return
            if not admin_email or not admin_password:
                logger.warning("No usable admin exists. Set ADMIN_EMAIL and ADMIN_PASSWORD to create one.")
                return
            if len(admin_password) < MIN_PASSWORD_LENGTH or admin_password in LEAKED_DEFAULT_PASSWORDS:
                logger.error(f"ADMIN_PASSWORD rejected: use at least {MIN_PASSWORD_LENGTH} characters, not a known default")
                return
            password_hash = hash_password(admin_password)
            await cur.execute("UPDATE users SET password_hash=%s WHERE email=%s AND password_hash='!'",
                              (password_hash, admin_email))
            if not cur.rowcount:
                # INSERT IGNORE: several uvicorn workers run this at the same time.
                await cur.execute(
                    "INSERT IGNORE INTO users (email, name, password_hash, role) VALUES (%s,'Admin',%s,'admin')",
                    (admin_email, password_hash)
                )
            await conn.commit()
            if cur.rowcount:
                logger.info(f"Admin seeded: {admin_email}")
    finally:
        await release(conn)


async def revoke_leaked_passwords():
    """Lock any account still using a password that was published in this repo."""
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT id, email, password_hash FROM users WHERE password_hash<>'!'")
            for user in await cur.fetchall():
                if any(verify_password(p, user["password_hash"]) for p in LEAKED_DEFAULT_PASSWORDS):
                    # "!" is not a valid bcrypt hash, so no password can match it.
                    await cur.execute("UPDATE users SET password_hash='!' WHERE id=%s", (user["id"],))
                    logger.warning(f"Locked {user['email']}: it used a leaked default password. "
                                   "Delete it from the admin panel's Team tab.")
            await conn.commit()
    finally:
        await release(conn)
