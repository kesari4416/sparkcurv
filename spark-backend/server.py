from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.responses import Response as FastAPIResponse, StreamingResponse
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Annotated
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import re
import secrets
import base64
import io

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "sparkcurv_db")
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
SMTP_EMAIL = os.environ.get("SMTP_EMAIL", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
NOTIFY_EMAIL = os.environ.get("NOTIFY_EMAIL", "")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ─── Helpers ──────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, "email": email,
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
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user or user.get("role") != "admin":
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

class ContactSubmissionCreate(BaseModel):
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


# ─── Auth Endpoints ───────────────────────────────────────────────────────────

@api_router.post("/auth/login")
async def login(data: LoginRequest, response: Response):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]), user["email"])
    response.set_cookie(
        key="access_token", value=token,
        httponly=True, secure=True, samesite="none", max_age=28800, path="/"
    )
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user["role"],
        "token": token
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/", samesite="none")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def me(admin=Depends(get_current_admin)):
    return {"id": str(admin["_id"]), "email": admin["email"], "name": admin.get("name", ""), "role": admin["role"]}


# ─── Blog Endpoints ───────────────────────────────────────────────────────────

@api_router.get("/blogs")
async def get_blogs(published_only: bool = True):
    query = {"published": True} if published_only else {}
    cursor = db.blogs.find(query).sort("created_at", -1)
    posts = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        posts.append(doc)
    return posts

@api_router.get("/blogs/all")
async def get_all_blogs(admin=Depends(get_current_admin)):
    cursor = db.blogs.find({}).sort("created_at", -1)
    posts = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        posts.append(doc)
    return posts

@api_router.get("/blogs/{slug}")
async def get_blog(slug: str):
    doc = await db.blogs.find_one({"slug": slug, "published": True})
    if not doc:
        raise HTTPException(status_code=404, detail="Blog post not found")
    doc["id"] = str(doc.pop("_id"))
    return doc

@api_router.post("/blogs")
async def create_blog(data: BlogCreate, admin=Depends(get_current_admin)):
    slug = data.slug or slugify(data.title)
    existing = await db.blogs.find_one({"slug": slug})
    if existing:
        slug = f"{slug}-{secrets.token_hex(3)}"
    doc = {
        "title": data.title,
        "slug": slug,
        "excerpt": data.excerpt,
        "content": data.content,
        "image_url": data.image_url or "",
        "author": data.author,
        "category": data.category,
        "tags": data.tags or [],
        "published": data.published,
        "meta_title": data.meta_title or "",
        "meta_description": data.meta_description or "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.blogs.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc

@api_router.put("/blogs/{blog_id}")
async def update_blog(blog_id: str, data: BlogUpdate, admin=Depends(get_current_admin)):
    try:
        oid = ObjectId(blog_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid blog ID")
    raw = data.model_dump()
    update_data = {}
    for k, v in raw.items():
        if v is None:
            continue
        # Allow empty list for tags (clearing all tags)
        if k == "tags":
            update_data[k] = v
        elif v != "":
            update_data[k] = v
        else:
            update_data[k] = v
    if "title" in update_data and "slug" not in update_data:
        update_data["slug"] = slugify(update_data["title"])
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.blogs.update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    doc = await db.blogs.find_one({"_id": oid})
    doc["id"] = str(doc.pop("_id"))
    return doc

@api_router.delete("/blogs/{blog_id}")
async def delete_blog(blog_id: str, admin=Depends(get_current_admin)):
    try:
        oid = ObjectId(blog_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid blog ID")
    result = await db.blogs.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"message": "Blog deleted"}


# ─── Image Upload Endpoints ───────────────────────────────────────────────────

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, GIF, and WebP images are allowed")
    data = await file.read()
    if len(data) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image must be under 5 MB")
    b64 = base64.b64encode(data).decode("utf-8")
    doc = {
        "filename": file.filename,
        "content_type": file.content_type,
        "data": b64,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.images.insert_one(doc)
    image_id = str(result.inserted_id)
    return {"url": f"/api/images/{image_id}", "id": image_id}

@api_router.get("/images/{image_id}")
async def get_image(image_id: str):
    try:
        oid = ObjectId(image_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image ID")
    doc = await db.images.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Image not found")
    image_data = base64.b64decode(doc["data"])
    return FastAPIResponse(content=image_data, media_type=doc["content_type"])

@api_router.get("/images")
async def list_images(admin=Depends(get_current_admin)):
    cursor = db.images.find({}, {"data": 0}).sort("created_at", -1)
    items = []
    async for doc in cursor:
        image_id = str(doc.pop("_id"))
        items.append({
            "id": image_id,
            "filename": doc.get("filename", ""),
            "content_type": doc.get("content_type", ""),
            "created_at": doc.get("created_at", ""),
            "url": f"/api/images/{image_id}",
        })
    return items

@api_router.delete("/images/{image_id}")
async def delete_image(image_id: str, admin=Depends(get_current_admin)):
    try:
        oid = ObjectId(image_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image ID")
    result = await db.images.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted"}


# ─── Admin User Management ────────────────────────────────────────────────────

@api_router.get("/admin/users")
async def list_admin_users(admin=Depends(get_current_admin)):
    cursor = db.users.find({"role": "admin"}).sort("created_at", 1)
    users = []
    async for doc in cursor:
        users.append({
            "id": str(doc["_id"]),
            "email": doc["email"],
            "name": doc.get("name", ""),
            "created_at": doc.get("created_at", ""),
        })
    return users

@api_router.post("/admin/users")
async def create_admin_user(data: AdminUserCreate, admin=Depends(get_current_admin)):
    email = data.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists")
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    result = await db.users.insert_one({
        "email": email,
        "name": data.name,
        "password_hash": hash_password(data.password),
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"id": str(result.inserted_id), "email": email, "name": data.name}

@api_router.delete("/admin/users/{user_id}")
async def delete_admin_user(user_id: str, admin=Depends(get_current_admin)):
    if str(admin["_id"]) == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    result = await db.users.delete_one({"_id": oid, "role": "admin"})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin user not found")
    return {"message": "Admin user deleted"}


# ─── Contact Endpoints ────────────────────────────────────────────────────────

@api_router.post("/contact")
async def submit_contact(data: ContactSubmissionCreate):
    word_count = len(data.description.strip().split())
    if word_count > 200:
        raise HTTPException(status_code=400, detail="Description must be 200 words or less")
    doc = {
        "name": data.name, "email": data.email, "mobile": data.mobile,
        "whatsapp": data.whatsapp, "services": data.services, "description": data.description,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.contacts.insert_one(doc)
    try:
        send_enquiry_email(data)
    except Exception as e:
        logger.error(f"Email failed: {e}")
    return {"id": str(result.inserted_id), "message": "Enquiry submitted successfully"}

@api_router.get("/contact")
async def get_contacts(admin=Depends(get_current_admin)):
    cursor = db.contacts.find({}).sort("created_at", -1)
    items = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        items.append(doc)
    return items


# ─── Blog Template PDF ────────────────────────────────────────────────────────

@api_router.get("/blog-template/pdf")
async def download_blog_template():
    from fpdf import FPDF

    class PDF(FPDF):
        def header(self):
            self.set_fill_color(2, 2, 139)  # SparkCurv brand blue
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
        """Ruled lines for handwriting."""
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
            pdf.set_x(10)
            # box
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

    # ── Instructions ────────────────────────────────────────────────────────
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

    # ── SECTION 1: Basic Info ──────────────────────────────────────────────
    section_title(pdf, '1.  BASIC INFORMATION')
    pdf.ln(2)

    label(pdf, 'Post Title  *', 'The main headline of your blog post')
    write_box(pdf, 10)

    label(pdf, 'URL Slug', 'Leave blank to auto-generate from title  e.g.  my-blog-post')
    write_box(pdf, 10)

    label(pdf, 'Author Name', 'Default: SparkCurv Team')
    write_box(pdf, 10)

    label(pdf, 'Category  *', 'Tick one:')
    checkbox_row(pdf, [
        'Technology', 'AI & Technology', 'DevOps',
        'Mobile Development', 'Web Development', 'Cloud',
        'Digital Marketing', 'Business',
    ], cols=3)
    pdf.ln(1)

    label(pdf, 'Tags', 'Comma-separated keywords  e.g.  ai, automation, cloud')
    write_box(pdf, 10)

    label(pdf, 'Cover Image URL', 'Paste full URL of the cover image (or upload in admin)')
    write_box(pdf, 10)
    pdf.ln(2)

    # ── SECTION 2: Excerpt ────────────────────────────────────────────────
    section_title(pdf, '2.  EXCERPT / SUMMARY  *')
    pdf.ln(2)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 5, '2-3 sentences shown on the blog listing page (max ~300 characters recommended)', ln=True)
    pdf.set_text_color(0, 0, 0)
    write_lines(pdf, n_lines=3)
    pdf.ln(2)

    # ── SECTION 3: Content ────────────────────────────────────────────────
    section_title(pdf, '3.  BLOG CONTENT  *')
    pdf.ln(2)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 5, 'Write your full article below. Use the sub-sections for structure.', ln=True)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(1)

    for sub in ['Introduction', 'Section 1  (add heading)', 'Section 2  (add heading)', 'Section 3  (add heading)', 'Conclusion']:
        pdf.set_font('Helvetica', 'B', 8.5)
        pdf.set_text_color(2, 2, 139)
        pdf.cell(0, 5, sub, ln=True)
        pdf.set_text_color(0, 0, 0)
        write_lines(pdf, n_lines=5)
        pdf.ln(1)

    # ── SECTION 4: SEO ────────────────────────────────────────────────────
    section_title(pdf, '4.  SEO SETTINGS  (optional)')
    pdf.ln(2)

    label(pdf, 'Meta Title', 'Appears in browser tab and Google results  |  max 60 characters')
    write_box(pdf, 10)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(130, 130, 130)
    pdf.cell(0, 4, '____________ / 60 characters', ln=True)
    pdf.ln(1)
    pdf.set_text_color(0, 0, 0)

    label(pdf, 'Meta Description', 'Short description in Google snippet  |  max 160 characters')
    write_lines(pdf, n_lines=3)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(130, 130, 130)
    pdf.cell(0, 4, '____________ / 160 characters', ln=True)
    pdf.ln(2)
    pdf.set_text_color(0, 0, 0)

    # ── SECTION 5: Publish ────────────────────────────────────────────────
    section_title(pdf, '5.  PUBLISH STATUS')
    pdf.ln(2)
    checkbox_row(pdf, ['Publish immediately', 'Save as Draft'], cols=2)
    pdf.ln(2)

    # ── Notes ─────────────────────────────────────────────────────────────
    section_title(pdf, '6.  NOTES & REMINDERS')
    pdf.ln(2)
    write_lines(pdf, n_lines=3)

    # ── Footer tip ────────────────────────────────────────────────────────
    pdf.ln(4)
    pdf.set_fill_color(240, 242, 255)
    pdf.set_draw_color(180, 180, 220)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(60, 60, 140)
    pdf.multi_cell(0, 5,
        'TIP: After filling this form, go to  /admin/login  with your admin credentials, '
        'click "New Post", and copy each section into the editor. '
        'Use the toolbar for bold, headings, lists, and image embeds.',
        border=1, fill=True)

    # ── Output ─────────────────────────────────────────────────────────────
    buf = io.BytesIO(bytes(pdf.output()))
    buf.seek(0)
    filename = f"sparkcurv-blog-template.pdf"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


# ─── Health ────────────────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "SparkCurv API", "database": "MongoDB"}

@api_router.get("/health")
async def health():
    try:
        await client.admin.command("ping")
        return {"status": "healthy", "database": "MongoDB connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


# ─── Email Helper ─────────────────────────────────────────────────────────────

def send_enquiry_email(contact):
    if not SMTP_EMAIL or not SMTP_PASSWORD or not NOTIFY_EMAIL:
        logger.warning("Email not configured")
        return
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'New Enquiry from {contact.name} - {contact.services}'
        msg['From'] = SMTP_EMAIL
        msg['To'] = NOTIFY_EMAIL
        html = f"""<html><body style="font-family:Arial,sans-serif;background:#f4f6f8;padding:20px;">
            <div style="max-width:600px;margin:auto;background:white;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
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
        logger.info(f"Email sent to {NOTIFY_EMAIL}")
    except Exception as e:
        logger.error(f"Email error: {e}")


# ─── App Setup ────────────────────────────────────────────────────────────────

app.include_router(api_router)

cors_origins = [FRONTEND_URL, "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        await client.admin.command("ping")
        logger.info("MongoDB connected")
        await db.users.create_index("email", unique=True)
        await db.blogs.create_index("slug", unique=True)
        await seed_admin()
    except Exception as e:
        logger.error(f"Startup error: {e}")


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@sparkcurv.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "SparkAdmin@2024")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin seeded: {admin_email}")
    else:
        if not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"password_hash": hash_password(admin_password)}}
            )
            logger.info("Admin password updated")
