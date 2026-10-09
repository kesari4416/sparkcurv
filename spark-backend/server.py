from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.responses import Response as FastAPIResponse
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
    published: Optional[bool] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None


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
    return {"id": str(user["_id"]), "email": user["email"], "name": user.get("name", ""), "role": user["role"]}

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
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
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
