"""Check the enquiry-email setup without touching the website or the database.

    python smtp_check.py          # shows the settings, then tries the mail login
    python smtp_check.py --send   # also sends a test email to CONTACT_TO

Reads the same settings as the backend (see mailer.py): from the environment first, then from
the .env file next to this script. Passwords are never printed.
"""
import smtplib
import socket
import sys
from email.mime.text import MIMEText

import mailer


def main() -> int:
    print("Settings:")
    print(f"  SMTP_HOST      {mailer.HOST}")
    print(f"  SMTP_PORT      {mailer.PORT}  ({'SSL' if mailer.PORT == 465 else 'STARTTLS'})")
    print(f"  SMTP_USER      {mailer.USER or 'NOT SET'}")
    print(f"  SMTP_PASSWORD  {'set (%d characters)' % len(mailer.PASSWORD) if mailer.PASSWORD else 'NOT SET'}")
    print(f"  SMTP_FROM      {mailer.FROM or 'NOT SET'}")
    print(f"  CONTACT_TO     {mailer.TO or 'NOT SET'}")

    missing = mailer.missing()
    if missing:
        print(f"\nResult: not configured. {', '.join(missing)} not set, so the backend skips the email.")
        return 1
    if " " in mailer.PASSWORD:
        print("  note: the password contains spaces. Gmail shows app passwords in groups of four; remove the spaces.")

    print(f"\nConnecting to {mailer.HOST}:{mailer.PORT} ...")
    try:
        with mailer.connect() as server:
            print("  connected")
            server.login(mailer.USER, mailer.PASSWORD)
            print("  login OK")
            if "--send" in sys.argv:
                msg = MIMEText("Test email from smtp_check.py. The enquiry form can send mail from this server.")
                msg["Subject"] = "SparkCurv enquiry email test"
                msg["From"] = mailer.FROM
                msg["To"] = mailer.TO
                server.sendmail(mailer.FROM_ADDRESS, mailer.TO, msg.as_string())
                print(f"  test email sent to {mailer.TO}")
    except smtplib.SMTPAuthenticationError as e:
        print(f"\nResult: the mail server rejected the login ({e.smtp_code}). Check SMTP_USER and SMTP_PASSWORD. "
              "For Gmail it must be an app password (needs 2-Step Verification).")
        return 2
    except (socket.timeout, TimeoutError, ConnectionError, OSError) as e:
        print(f"\nResult: cannot reach {mailer.HOST}:{mailer.PORT} ({type(e).__name__}: {e}). "
              "Check SMTP_HOST and SMTP_PORT, and whether this server's firewall or provider blocks outgoing mail on that port.")
        return 3
    except smtplib.SMTPException as e:
        print(f"\nResult: the mail server answered with an error ({type(e).__name__}: {e}). "
              "A wrong SMTP_PORT for the server (465 = SSL, 587 = STARTTLS) is a common cause.")
        return 4
    except Exception as e:  # noqa: BLE001
        print(f"\nResult: failed ({type(e).__name__}: {e})")
        return 5

    print("\nResult: OK" + (" (test email sent)" if "--send" in sys.argv else " (login works; add --send to send a test email)"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
