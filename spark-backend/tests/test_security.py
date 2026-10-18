"""Regression tests for the 2026-10 security audit (see AUDIT.md).

Runs against a live server with a disposable database:
  API_BASE_URL=http://127.0.0.1:8011 ADMIN_EMAIL=... ADMIN_PASSWORD=... pytest tests/test_security.py
The server must run with COOKIE_SECURE=false (plain http) and SMTP unset.
Each test sends its own X-Real-IP so rate limits don't leak between tests.
"""
import os
import uuid

import pytest
import requests

BASE_URL = os.environ.get("API_BASE_URL", os.environ.get("REACT_APP_BACKEND_URL", "")).rstrip("/")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
LEAKED_DEFAULT = ("admin@sparkcurv.com", "SparkAdmin@2024")
PNG_1PX = bytes.fromhex(
    "89504e470d0a1a0a0000000d4948445200000001000000010806000000"
    "1f15c4890000000d49444154789c6360000002000154a24f5f0000000049454e44ae426082")

pytestmark = pytest.mark.skipif(not (BASE_URL and ADMIN_EMAIL and ADMIN_PASSWORD),
                                reason="API_BASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD must be set")


def ip():
    return {"X-Real-IP": f"10.{uuid.uuid4().int % 250}.{uuid.uuid4().int % 250}.{uuid.uuid4().int % 250}"}


@pytest.fixture
def admin():
    s = requests.Session()
    s.headers.update(ip())
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return s


# ─── Auth ─────────────────────────────────────────────────────────────────────

def test_leaked_default_admin_cannot_log_in():
    r = requests.post(f"{BASE_URL}/api/auth/login", headers=ip(),
                      json={"email": LEAKED_DEFAULT[0], "password": LEAKED_DEFAULT[1]})
    assert r.status_code == 401


def test_login_sets_strict_httponly_cookie_and_no_token_in_body():
    r = requests.post(f"{BASE_URL}/api/auth/login", headers=ip(),
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    assert "token" not in r.json()
    cookie = r.headers["set-cookie"].lower()
    assert "httponly" in cookie and "samesite=strict" in cookie


def test_logout_clears_cookie(admin):
    assert admin.get(f"{BASE_URL}/api/auth/me").status_code == 200
    r = admin.post(f"{BASE_URL}/api/auth/logout")
    header = r.headers["set-cookie"].lower()
    assert "max-age=0" in header and "samesite=strict" in header
    assert admin.get(f"{BASE_URL}/api/auth/me").status_code == 401


def test_login_is_rate_limited():
    headers = ip()
    codes = [requests.post(f"{BASE_URL}/api/auth/login", headers=headers,
                           json={"email": f"nobody-{uuid.uuid4().hex[:6]}@example.com", "password": "x"}).status_code
             for _ in range(22)]
    assert codes[0] == 401 and 429 in codes


def test_garbage_token_is_401_not_500():
    r = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": "Bearer not.a.jwt"})
    assert r.status_code == 401


def test_change_password_invalidates_old_sessions(admin):
    new_pw = "Temp-Password-" + uuid.uuid4().hex[:8]
    assert admin.post(f"{BASE_URL}/api/auth/change-password",
                      json={"current_password": "wrong", "new_password": new_pw}).status_code == 400
    assert admin.post(f"{BASE_URL}/api/auth/change-password",
                      json={"current_password": ADMIN_PASSWORD, "new_password": "short"}).status_code == 400
    r = admin.post(f"{BASE_URL}/api/auth/change-password",
                   json={"current_password": ADMIN_PASSWORD, "new_password": new_pw})
    assert r.status_code == 200
    assert admin.get(f"{BASE_URL}/api/auth/me").status_code == 401  # old token no longer valid
    s = requests.Session()
    s.headers.update(ip())
    assert s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": new_pw}).status_code == 200
    # restore so other tests keep working
    assert s.post(f"{BASE_URL}/api/auth/change-password",
                  json={"current_password": new_pw, "new_password": ADMIN_PASSWORD}).status_code == 200


def test_admin_create_rules(admin):
    r = admin.post(f"{BASE_URL}/api/admin/users", json={"email": "a@b", "name": "x", "password": "y" * 12})
    assert r.status_code == 422 and isinstance(r.json()["detail"], list)
    r = admin.post(f"{BASE_URL}/api/admin/users",
                   json={"email": f"t{uuid.uuid4().hex[:6]}@example.com", "name": "x", "password": "short"})
    assert r.status_code == 400


# ─── Blogs ────────────────────────────────────────────────────────────────────

XSS = ('<p onclick="alert(1)">Hello <a href="javascript:alert(2)">bad</a> <a href="https://ok.example">ok</a>'
       '<img src="/api/images/1" onerror="alert(3)"><span style="color: red; position: fixed">c</span>'
       '<script>alert(4)</script><iframe src="https://evil.example"></iframe></p>')


def test_blog_content_is_sanitized(admin):
    r = admin.post(f"{BASE_URL}/api/blogs", json={"title": f"XSS {uuid.uuid4().hex[:6]}", "excerpt": "e", "content": XSS})
    assert r.status_code == 200, r.text
    body = r.json()["content"].lower()
    for bad in ("onclick", "onerror", "javascript:", "<script", "<iframe", "position"):
        assert bad not in body, bad
    assert 'href="https://ok.example"' in body and "color:red" in body.replace(" ", "")
    admin.delete(f"{BASE_URL}/api/blogs/{r.json()['id']}")


def test_legacy_posts_are_sanitized_and_urls_relative_on_read():
    # Seeded by the pre-fix server: absolute localhost image URLs and raw onerror/javascript:.
    r = requests.get(f"{BASE_URL}/api/blogs/legacy-post")
    if r.status_code == 404:
        pytest.skip("no legacy post seeded in this database")
    post = r.json()
    assert post["image_url"] == "/api/images/7"
    assert 'src="/api/images/7"' in post["content"]
    assert "onerror" not in post["content"] and "javascript:" not in post["content"]


def test_blog_update_slug_rules(admin):
    a = admin.post(f"{BASE_URL}/api/blogs", json={"title": f"Slug A {uuid.uuid4().hex[:6]}", "excerpt": "e", "content": "x"}).json()
    b = admin.post(f"{BASE_URL}/api/blogs", json={"title": f"Slug B {uuid.uuid4().hex[:6]}", "excerpt": "e", "content": "x"}).json()
    try:
        assert admin.put(f"{BASE_URL}/api/blogs/{b['id']}", json={"slug": a["slug"]}).status_code == 409
        assert admin.put(f"{BASE_URL}/api/blogs/{b['id']}", json={"slug": "!!!"}).status_code == 400
        # Saving unchanged data twice in the same second used to 404 (rowcount 0).
        assert admin.put(f"{BASE_URL}/api/blogs/{b['id']}", json={"excerpt": "same"}).status_code == 200
        assert admin.put(f"{BASE_URL}/api/blogs/{b['id']}", json={"excerpt": "same"}).status_code == 200
        assert admin.put(f"{BASE_URL}/api/blogs/99999999", json={"excerpt": "x"}).status_code == 404
        # The slug is kept when only the title changes.
        r = admin.put(f"{BASE_URL}/api/blogs/{b['id']}", json={"title": "Renamed"})
        assert r.status_code == 200 and r.json()["slug"] == b["slug"]
    finally:
        admin.delete(f"{BASE_URL}/api/blogs/{a['id']}")
        admin.delete(f"{BASE_URL}/api/blogs/{b['id']}")


def test_blog_rejects_script_image_url(admin):
    r = admin.post(f"{BASE_URL}/api/blogs", json={"title": "img", "excerpt": "e", "content": "x",
                                                  "image_url": "javascript:alert(1)"})
    assert r.status_code == 422


# ─── Images ───────────────────────────────────────────────────────────────────

def test_upload_checks_bytes_not_content_type(admin):
    r = admin.post(f"{BASE_URL}/api/upload/image", files={"file": ("x.png", b"<svg onload=alert(1)>", "image/png")})
    assert r.status_code == 400
    r = admin.post(f"{BASE_URL}/api/upload/image", files={"file": ("../../dot.png", PNG_1PX, "text/plain")})
    assert r.status_code == 200, r.text
    url = r.json()["url"]
    assert url.startswith("/api/images/")
    img = requests.get(f"{BASE_URL}{url}")
    assert img.headers["content-type"] == "image/png"
    assert "immutable" in img.headers["cache-control"]
    assert img.headers["x-content-type-options"] == "nosniff"
    admin.delete(f"{BASE_URL}{url}")


def test_upload_size_limit(admin):
    big = PNG_1PX + b"\0" * (5 * 1024 * 1024)
    r = admin.post(f"{BASE_URL}/api/upload/image", files={"file": ("big.png", big, "image/png")})
    assert r.status_code == 413


# ─── Contact ──────────────────────────────────────────────────────────────────

def contact(**over):
    data = {"name": "Test", "email": "test@example.com", "mobile": "+91 98765 43210",
            "whatsapp": "+91 98765 43210", "services": "Digital Growth", "description": "Hello there"}
    data.update(over)
    return data


def test_contact_honeypot_is_not_stored(admin):
    marker = uuid.uuid4().hex
    r = requests.post(f"{BASE_URL}/api/contact", headers=ip(),
                      json=contact(description=marker, company_website="http://spam.example"))
    assert r.status_code == 200
    assert all(marker not in c["description"] for c in admin.get(f"{BASE_URL}/api/contact").json())


def test_contact_field_limits():
    r = requests.post(f"{BASE_URL}/api/contact", headers=ip(), json=contact(mobile="1" * 60))
    assert r.status_code == 422
    r = requests.post(f"{BASE_URL}/api/contact", headers=ip(), json=contact(description="word " * 201))
    assert r.status_code == 400


def test_contact_rate_limit():
    headers = ip()
    codes = [requests.post(f"{BASE_URL}/api/contact", headers=headers, json=contact()).status_code for _ in range(6)]
    assert codes[:5] == [200] * 5 and codes[5] == 429


# ─── Misc ─────────────────────────────────────────────────────────────────────

def test_health_ok():
    r = requests.get(f"{BASE_URL}/api/health")
    assert r.status_code == 200 and "error" not in r.json()


def test_no_cors_for_unknown_origin():
    r = requests.get(f"{BASE_URL}/api/blogs", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in r.headers


# ─── Quick enquiry (home page CTA) ────────────────────────────────────────────

def test_quick_enquiry_stores_lead(admin):
    email = f"lead-{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{BASE_URL}/api/quick-enquiry", headers=ip(), json={"email": email})
    assert r.status_code == 200
    leads = admin.get(f"{BASE_URL}/api/contact").json()
    assert any(c["email"] == email and c["services"] == "Quick enquiry (home page)" for c in leads)


def test_quick_enquiry_validation_and_honeypot(admin):
    assert requests.post(f"{BASE_URL}/api/quick-enquiry", headers=ip(), json={"email": "nope"}).status_code == 422
    email = f"bot-{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{BASE_URL}/api/quick-enquiry", headers=ip(), json={"email": email, "company_website": "x"})
    assert r.status_code == 200
    assert all(c["email"] != email for c in admin.get(f"{BASE_URL}/api/contact").json())
