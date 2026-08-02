from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import aiomysql
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MySQL config
MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))
MYSQL_USER = os.environ.get('MYSQL_USER', 'spark')
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE', 'spark_db')

# Email config
SMTP_EMAIL = os.environ.get('SMTP_EMAIL', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
NOTIFY_EMAIL = os.environ.get('NOTIFY_EMAIL', '')

# Connection pool
pool = None

app = FastAPI()
api_router = APIRouter(prefix="/api")


# Models
class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: int = 0
    name: str = ""
    email: str = ""
    mobile: str = ""
    whatsapp: str = ""
    services: str = ""
    description: str = ""
    created_at: str = ""

class ContactSubmissionCreate(BaseModel):
    name: str
    email: EmailStr
    mobile: str
    whatsapp: str
    services: str
    description: str


# Database helpers
async def get_pool():
    global pool
    if pool is None:
        pool = await aiomysql.create_pool(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            db=MYSQL_DATABASE,
            autocommit=True,
            minsize=1,
            maxsize=10,
        )
    return pool


@api_router.get("/")
async def root():
    return {"message": "SparkCurv API", "database": "MySQL"}


def send_enquiry_email(contact):
    if not SMTP_EMAIL or not SMTP_PASSWORD or not NOTIFY_EMAIL:
        logger.warning("Email not configured, skipping notification")
        return

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'New Enquiry from {contact.name} - {contact.services}'
        msg['From'] = SMTP_EMAIL
        msg['To'] = NOTIFY_EMAIL

        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="background: #02028B; padding: 24px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 22px;">New Enquiry Received</h1>
                </div>
                <div style="padding: 24px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 12px 8px; font-weight: bold; color: #333; width: 140px;">Name</td>
                            <td style="padding: 12px 8px; color: #555;">{contact.name}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 12px 8px; font-weight: bold; color: #333;">Email</td>
                            <td style="padding: 12px 8px; color: #555;"><a href="mailto:{contact.email}">{contact.email}</a></td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 12px 8px; font-weight: bold; color: #333;">Mobile</td>
                            <td style="padding: 12px 8px; color: #555;"><a href="tel:{contact.mobile}">{contact.mobile}</a></td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 12px 8px; font-weight: bold; color: #333;">WhatsApp</td>
                            <td style="padding: 12px 8px; color: #555;"><a href="https://wa.me/{contact.whatsapp.replace('+','')}">{contact.whatsapp}</a></td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 12px 8px; font-weight: bold; color: #333;">Service</td>
                            <td style="padding: 12px 8px; color: #555;">{contact.services}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 8px; font-weight: bold; color: #333; vertical-align: top;">Description</td>
                            <td style="padding: 12px 8px; color: #555;">{contact.description}</td>
                        </tr>
                    </table>
                </div>
                <div style="background: #f4f6f8; padding: 16px; text-align: center; font-size: 12px; color: #888;">
                    SparkCurv Technologies - Enquiry Notification
                </div>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html, 'html'))

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, NOTIFY_EMAIL, msg.as_string())

        logger.info(f"Enquiry email sent to {NOTIFY_EMAIL}")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")


# Contact Form Endpoints
@api_router.post("/contact")
async def submit_contact_form(input: ContactSubmissionCreate):
    # Validate word count
    word_count = len(input.description.strip().split())
    if word_count > 200:
        raise HTTPException(status_code=400, detail="Description must be 200 words or less")

    p = await get_pool()
    async with p.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO contacts (name, email, mobile, whatsapp, services, description) VALUES (%s, %s, %s, %s, %s, %s)",
                (input.name, input.email, input.mobile, input.whatsapp, input.services, input.description)
            )
            last_id = cur.lastrowid

    # Send email notification
    try:
        send_enquiry_email(input)
    except Exception as e:
        logger.error(f"Email notification failed: {e}")

    return {
        "id": last_id,
        "name": input.name,
        "email": input.email,
        "mobile": input.mobile,
        "whatsapp": input.whatsapp,
        "services": input.services,
        "description": input.description,
        "message": "Enquiry submitted successfully"
    }


@api_router.get("/contact")
async def get_contact_submissions():
    p = await get_pool()
    async with p.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT id, name, email, mobile, whatsapp, services, description, created_at FROM contacts ORDER BY created_at DESC")
            rows = await cur.fetchall()

    results = []
    for row in rows:
        row['created_at'] = row['created_at'].isoformat() if row['created_at'] else ''
        results.append(row)

    return results


# Health check
@api_router.get("/health")
async def health():
    try:
        p = await get_pool()
        async with p.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT 1")
        return {"status": "healthy", "database": "MySQL connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    try:
        await get_pool()
        logger.info("MySQL connection pool created successfully")
    except Exception as e:
        logger.error(f"Failed to connect to MySQL: {e}")


@app.on_event("shutdown")
async def shutdown():
    global pool
    if pool:
        pool.close()
        await pool.wait_closed()
        logger.info("MySQL connection pool closed")
