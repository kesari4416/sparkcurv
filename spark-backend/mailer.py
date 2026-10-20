"""Outgoing mail settings and connection, shared by server.py and smtp_check.py.

Settings (same names as the BuildNexa setup):
    SMTP_HOST      mail server, e.g. smtp.gmail.com           (default smtp.gmail.com)
    SMTP_PORT      465 = SSL from the start; anything else (587 is usual) = STARTTLS   (default 465)
    SMTP_USER      login name for the mail server
    SMTP_PASSWORD  its password (an app password for Gmail)
    SMTP_FROM      address the email is sent from; blank = SMTP_USER. "Name <a@b.com>" also works
    CONTACT_TO     where enquiries are delivered

The older names still work: SMTP_EMAIL is read as SMTP_USER and NOTIFY_EMAIL as CONTACT_TO.
"""
import os
import smtplib
from email.utils import parseaddr
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))


def _first(*names: str, default: str = "") -> str:
    for name in names:
        value = os.environ.get(name, "").strip()
        if value:
            return value
    return default


def _port() -> int:
    raw = _first("SMTP_PORT", default="465")
    try:
        return int(raw)
    except ValueError:
        return 465


HOST = _first("SMTP_HOST", default="smtp.gmail.com")
PORT = _port()
USER = _first("SMTP_USER", "SMTP_EMAIL")
PASSWORD = os.environ.get("SMTP_PASSWORD", "").strip()
FROM = _first("SMTP_FROM") or USER
FROM_ADDRESS = parseaddr(FROM)[1] or FROM  # bare address for the SMTP envelope
TO = _first("CONTACT_TO", "NOTIFY_EMAIL")


def missing() -> list[str]:
    """Names of the required settings that are empty."""
    return [name for name, value in (("SMTP_USER", USER), ("SMTP_PASSWORD", PASSWORD), ("CONTACT_TO", TO)) if not value]


def connect() -> smtplib.SMTP:
    """Open a connection to the mail server (not yet logged in). Use it in a `with` block."""
    if PORT == 465:
        return smtplib.SMTP_SSL(HOST, PORT, timeout=20)
    server = smtplib.SMTP(HOST, PORT, timeout=20)
    try:
        server.starttls()
    except Exception:
        server.close()
        raise
    return server
