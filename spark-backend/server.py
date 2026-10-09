from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.responses import Response as FastAPIResponse, StreamingResponse
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import aiomysql
import bcrypt
import jwt
import re
import secrets
import base64
import io
import json
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

MYSQL_HOST     = os.environ.get("MYSQL_HOST", "localhost")
MYSQL_PORT     = int(os.environ.get("MYSQL_PORT", 3306))
MYSQL_USER     = os.environ.get("MYSQL_USER", "spark")
MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.environ.get("MYSQL_DATABASE", "spark_db")
JWT_SECRET     = os.environ["JWT_SECRET"]
JWT_ALGORITHM  = "HS256"
FRONTEND_URL   = os.environ.get("FRONTEND_URL", "http://localhost:3000")
SMTP_EMAIL     = os.environ.get("SMTP_EMAIL", "")
SMTP_PASSWORD  = os.environ.get("SMTP_PASSWORD", "")
NOTIFY_EMAIL   = os.environ.get("NOTIFY_EMAIL", "")

pool = None

app = FastAPI()
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
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_access_token(user_id: int, email: str) -> str:
    payload = {
        "sub": str(user_id), "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text

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
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ─── Models ───────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    mobile: str
    whatsapp: str
    services: str
    description: str

class BlogCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    excerpt: str
    content: str
    image_url: Optional[str] = ""
    author: str = "SparkCurv Team"
    category: str = "Technology"
    tags: Optional[List[str]] = []
    published: bool = True
    meta_title: Optional[str] = ""
    meta_description: Optional[str] = ""

class BlogUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class AdminUserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str


# ─── Auth ─────────────────────────────────────────────────────────────────────

@api_router.post("/auth/login")
async def login(data: LoginRequest, response: Response):
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM users WHERE email=%s", (data.email.lower(),))
            user = await cur.fetchone()
    finally:
        await release(conn)
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(key="access_token", value=token,
        httponly=True, secure=True, samesite="none", max_age=28800, path="/")
    return {"id": user["id"], "email": user["email"], "name": user.get("name", ""),
            "role": user["role"], "token": token}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/", samesite="none")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def me(admin=Depends(get_current_admin)):
    return {"id": admin["id"], "email": admin["email"],
            "name": admin.get("name", ""), "role": admin["role"]}


# ─── Blogs ────────────────────────────────────────────────────────────────────

def row_to_blog(row: dict) -> dict:
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
    slug = data.slug or slugify(data.title)
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT id FROM blogs WHERE slug=%s", (slug,))
            if await cur.fetchone():
                slug = f"{slug}-{secrets.token_hex(3)}"
            await cur.execute("""
                INSERT INTO blogs (title, slug, excerpt, content, image_url, author, category,
                    tags, published, meta_title, meta_description)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (data.title, slug, data.excerpt, data.content, data.image_url or "",
                  data.author, data.category, json.dumps(data.tags or []),
                  int(data.published), data.meta_title or "", data.meta_description or ""))
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
    raw = data.model_dump()
    for k, v in raw.items():
        if v is None:
            continue
        if k == "tags":
            fields.append("tags=%s"); values.append(json.dumps(v))
        elif k == "published":
            fields.append("published=%s"); values.append(int(v))
        else:
            fields.append(f"{k}=%s"); values.append(v)
    if "title" in raw and raw["title"] and "slug" not in raw:
        fields.append("slug=%s"); values.append(slugify(raw["title"]))
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    values.append(blog_id)
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(f"UPDATE blogs SET {', '.join(fields)}, updated_at=NOW() WHERE id=%s", values)
            await conn.commit()
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Blog not found")
            await cur.execute("SELECT * FROM blogs WHERE id=%s", (blog_id,))
            row = await cur.fetchone()
    finally:
        await release(conn)
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

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, GIF, and WebP images are allowed")
    data = await file.read()
    if len(data) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image must be under 5 MB")
    b64 = base64.b64encode(data).decode("utf-8")
    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO images (filename, content_type, data) VALUES (%s,%s,%s)",
                (file.filename, file.content_type, b64)
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
    return FastAPIResponse(content=image_data, media_type=row["content_type"])

@api_router.get("/images")
async def list_images(admin=Depends(get_current_admin)):
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT id, filename, content_type, created_at FROM images ORDER BY created_at DESC")
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
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            await cur.execute("SELECT id FROM users WHERE email=%s", (data.email.lower(),))
            if await cur.fetchone():
                raise HTTPException(status_code=400, detail="A user with this email already exists")
            await cur.execute(
                "INSERT INTO users (email, name, password_hash, role) VALUES (%s,%s,%s,'admin')",
                (data.email.lower(), data.name, hash_password(data.password))
            )
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
async def submit_contact(data: ContactCreate):
    word_count = len(data.description.strip().split())
    if word_count > 200:
        raise HTTPException(status_code=400, detail="Description must be 200 words or less")
    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            await cur.execute("""
                INSERT INTO contacts (name, email, mobile, whatsapp, services, description)
                VALUES (%s,%s,%s,%s,%s,%s)
            """, (data.name, data.email, data.mobile, data.whatsapp, data.services, data.description))
            await conn.commit()
            contact_id = cur.lastrowid
    finally:
        await release(conn)
    try:
        send_enquiry_email(data)
    except Exception as e:
        logger.error(f"Email failed: {e}")
    return {"id": contact_id, "message": "Enquiry submitted successfully"}

@api_router.get("/contact")
async def get_contacts(admin=Depends(get_current_admin)):
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM contacts ORDER BY created_at DESC")
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
        async with conn.cursor() as cur:
            await cur.execute("SELECT 1")
        await release(conn)
        return {"status": "healthy", "database": "MySQL connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


# ─── Email ────────────────────────────────────────────────────────────────────

def send_enquiry_email(contact):
    if not SMTP_EMAIL or not SMTP_PASSWORD or not NOTIFY_EMAIL:
        return
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'New Enquiry from {contact.name} - {contact.services}'
        msg['From'] = SMTP_EMAIL
        msg['To'] = NOTIFY_EMAIL
        html = f"""<html><body style="font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:auto;background:white;border-radius:12px;">
                <div style="background:#02028B;padding:24px;text-align:center;">
                    <h1 style="color:white;margin:0;font-size:22px;">New Enquiry Received</h1>
                </div>
                <div style="padding:24px;">
                    <p><strong>Name:</strong> {contact.name}</p>
                    <p><strong>Email:</strong> {contact.email}</p>
                    <p><strong>Mobile:</strong> {contact.mobile}</p>
                    <p><strong>WhatsApp:</strong> {contact.whatsapp}</p>
                    <p><strong>Service:</strong> {contact.services}</p>
                    <p><strong>Description:</strong> {contact.description}</p>
                </div>
            </div>
        </body></html>"""
        msg.attach(MIMEText(html, 'html'))
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, NOTIFY_EMAIL, msg.as_string())
    except Exception as e:
        logger.error(f"Email error: {e}")


# ─── App Setup ────────────────────────────────────────────────────────────────

app.include_router(api_router)

cors_origins = [FRONTEND_URL, "http://localhost:3000"]
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=cors_origins,
    allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
async def startup():
    global pool
    try:
        pool = await aiomysql.create_pool(
            host=MYSQL_HOST, port=MYSQL_PORT,
            user=MYSQL_USER, password=MYSQL_PASSWORD,
            db=MYSQL_DATABASE, autocommit=False,
            minsize=2, maxsize=10, charset='utf8mb4'
        )
        logger.info("MySQL connected")
        await create_tables()
        await seed_admin()
    except Exception as e:
        logger.error(f"Startup error: {e}")

@app.on_event("shutdown")
async def shutdown():
    if pool:
        pool.close()
        await pool.wait_closed()


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
            await conn.commit()
        logger.info("Tables ready")
    finally:
        await release(conn)


async def seed_admin():
    admin_email    = os.environ.get("ADMIN_EMAIL", "admin@sparkcurv.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "SparkAdmin@2024")
    conn = await get_conn()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM users WHERE email=%s", (admin_email,))
            existing = await cur.fetchone()
            if not existing:
                await cur.execute(
                    "INSERT INTO users (email, name, password_hash, role) VALUES (%s,'Admin',%s,'admin')",
                    (admin_email, hash_password(admin_password))
                )
                logger.info(f"Admin seeded: {admin_email}")
            else:
                if not verify_password(admin_password, existing["password_hash"]):
                    await cur.execute(
                        "UPDATE users SET password_hash=%s WHERE email=%s",
                        (hash_password(admin_password), admin_email)
                    )
                    logger.info("Admin password updated")
            await conn.commit()
    finally:
        await release(conn)
