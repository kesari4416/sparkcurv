"""Check the enquiry-email setup without touching the website or the database.

    python smtp_check.py          # reports which settings are set, then tries the mail login
    python smtp_check.py --send   # also sends a test email to NOTIFY_EMAIL

Settings come from the environment first, then from a .env file next to this script. In Docker
the container environment is used, so run it inside the backend container:
    docker exec <backend-container> python smtp_check.py
Passwords are never printed.
"""
import os
import smtplib
import socket
import sys
from email.mime.text import MIMEText
from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).with_name(".env"))
except ImportError:
    pass

HOST, PORT = "smtp.gmail.com", 465  # same as server.py


def main() -> int:
    smtp_email = os.environ.get("SMTP_EMAIL", "")
    smtp_password = os.environ.get("SMTP_PASSWORD", "")
    notify_email = os.environ.get("NOTIFY_EMAIL", "")

    print("Settings:")
    print(f"  SMTP_EMAIL     {smtp_email or 'NOT SET'}")
    print(f"  SMTP_PASSWORD  {'set (%d characters)' % len(smtp_password) if smtp_password else 'NOT SET'}")
    print(f"  NOTIFY_EMAIL   {notify_email or 'NOT SET'}")
    if not (smtp_email and smtp_password and notify_email):
        print("\nResult: not configured. The backend skips the email when any of the three is missing.")
        return 1
    if " " in smtp_password:
        print("  note: the password contains spaces. Gmail shows app passwords in groups of four; remove the spaces.")

    print(f"\nConnecting to {HOST}:{PORT} ...")
    try:
        with smtplib.SMTP_SSL(HOST, PORT, timeout=20) as server:
            print("  connected")
            server.login(smtp_email, smtp_password)
            print("  login OK")
            if "--send" in sys.argv:
                msg = MIMEText("Test email from smtp_check.py. The enquiry form can send mail from this server.")
                msg["Subject"] = "SparkCurv enquiry email test"
                msg["From"] = smtp_email
                msg["To"] = notify_email
                server.sendmail(smtp_email, notify_email, msg.as_string())
                print(f"  test email sent to {notify_email}")
    except smtplib.SMTPAuthenticationError as e:
        print(f"\nResult: Gmail rejected the login ({e.smtp_code}). The app password is wrong or revoked, "
              "or the account does not allow app passwords (needs 2-Step Verification; for Google Workspace an "
              "admin may have to allow it). Or SMTP_EMAIL is not a Google account.")
        return 2
    except (socket.timeout, TimeoutError, ConnectionError, OSError) as e:
        print(f"\nResult: cannot reach {HOST}:{PORT} ({type(e).__name__}: {e}). "
              "The server or its hosting provider probably blocks outgoing mail on port 465.")
        return 3
    except Exception as e:  # noqa: BLE001
        print(f"\nResult: failed ({type(e).__name__}: {e})")
        return 4

    print("\nResult: OK" + (" (test email sent)" if "--send" in sys.argv else " (login works; add --send to send a test email)"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
