"""Blog posts written in Markdown (content_md): rendering, sanitising, editing, preview.

Runs against a live server with a disposable database, like test_security.py:
  API_BASE_URL=http://127.0.0.1:8011 ADMIN_EMAIL=... ADMIN_PASSWORD=... pytest tests/test_markdown_blog.py
"""
import os
import uuid

import pytest
import requests

BASE_URL = os.environ.get("API_BASE_URL", "").rstrip("/")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")

pytestmark = pytest.mark.skipif(not (BASE_URL and ADMIN_EMAIL and ADMIN_PASSWORD),
                                reason="API_BASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD must be set")

MD = """## Why it matters

Some **bold**, some *italics* and ~~struck~~ text, plus a [link](https://sparkcurv.com).

- one
- two

| Plan | Price |
|:--|--:|
| Starter | 349 |

```python
print("hi")
```

<script>alert(1)</script>
[bad](javascript:alert(1))
![diagram](http://localhost:8000/api/images/7)
"""


@pytest.fixture
def admin():
    s = requests.Session()
    s.headers.update({"X-Real-IP": f"10.9.{uuid.uuid4().int % 250}.{uuid.uuid4().int % 250}"})
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    # With COOKIE_SECURE=true the session cookie is Secure, which requests won't send over
    # plain http (browsers do, for localhost). Re-add it without the flag.
    for c in list(s.cookies):
        if c.secure:
            s.cookies.set(c.name, c.value)
    return s


@pytest.fixture
def post(admin):
    r = admin.post(f"{BASE_URL}/api/blogs", json={
        "title": f"Markdown {uuid.uuid4().hex[:6]}", "excerpt": "e", "content_md": MD})
    assert r.status_code == 200, r.text
    data = r.json()
    yield data
    admin.delete(f"{BASE_URL}/api/blogs/{data['id']}")


def test_markdown_is_stored_and_rendered(post):
    html = post["content"]
    assert "<h2>Why it matters</h2>" in html
    assert "<strong>bold</strong>" in html and "<em>italics</em>" in html and "<s>struck</s>" in html
    assert "<table>" in html and 'style="text-align:right"' in html
    assert "<pre><code" in html and "print(" in html
    assert '<a href="https://sparkcurv.com"' in html
    # The source is kept for editing, with image URLs made relative.
    assert post["content_md"].startswith("## Why it matters")
    assert "(/api/images/7)" in post["content_md"]
    assert '<img src="/api/images/7"' in html


def test_markdown_output_is_sanitised(post):
    html = post["content"]
    assert "<script" not in html
    # The unsafe link is left as plain text, never turned into a link.
    assert 'href="javascript' not in html
    assert "[bad](javascript:alert(1))" in html


def test_update_rerenders_from_markdown(admin, post):
    r = admin.put(f"{BASE_URL}/api/blogs/{post['id']}", json={"content_md": "# New\n\nBody"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["content_md"] == "# New\n\nBody"
    assert "<h1>New</h1>" in data["content"] and "Body" in data["content"]


def test_html_update_clears_markdown_source(admin, post):
    r = admin.put(f"{BASE_URL}/api/blogs/{post['id']}", json={"content": "<p>legacy</p>"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["content_md"] is None
    assert data["content"] == "<p>legacy</p>"


def test_public_post_serves_rendered_html(post):
    r = requests.get(f"{BASE_URL}/api/blogs/{post['slug']}")
    assert r.status_code == 200
    assert "<h2>Why it matters</h2>" in r.json()["content"]


def test_content_is_required(admin):
    r = admin.post(f"{BASE_URL}/api/blogs", json={"title": "Empty", "excerpt": "e", "content_md": "   "})
    assert r.status_code == 422


def test_preview_matches_saved_render(admin, post):
    r = admin.post(f"{BASE_URL}/api/blogs/preview", json={"markdown": MD})
    assert r.status_code == 200
    assert r.json()["html"] == post["content"]


def test_preview_requires_admin():
    r = requests.post(f"{BASE_URL}/api/blogs/preview", json={"markdown": "# x"})
    assert r.status_code == 401
