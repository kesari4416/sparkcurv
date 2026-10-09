"""SparkCurv backend API tests - Auth and Blog endpoints"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def auth_cookies():
    """Login and get auth cookies"""
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@sparkcurv.com",
        "password": "SparkAdmin@2024"
    })
    if resp.status_code == 200:
        return resp.cookies
    pytest.skip(f"Login failed: {resp.status_code} {resp.text}")

# Auth tests
class TestAuth:
    def test_login_success(self):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@sparkcurv.com",
            "password": "SparkAdmin@2024"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "admin@sparkcurv.com"
        assert data["role"] == "admin"
        assert "access_token" in resp.cookies

    def test_login_invalid_credentials(self):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@sparkcurv.com",
            "password": "wrongpassword"
        })
        assert resp.status_code == 401
        assert "detail" in resp.json()

    def test_me_authenticated(self, auth_cookies):
        resp = requests.get(f"{BASE_URL}/api/auth/me", cookies=auth_cookies)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "admin@sparkcurv.com"

    def test_me_unauthenticated(self):
        resp = requests.get(f"{BASE_URL}/api/auth/me")
        assert resp.status_code == 401

    def test_logout(self, auth_cookies):
        resp = requests.post(f"{BASE_URL}/api/auth/logout", cookies=auth_cookies)
        assert resp.status_code == 200


# Blog tests
class TestBlogs:
    created_id = None

    def test_get_public_blogs(self):
        resp = requests.get(f"{BASE_URL}/api/blogs")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_all_blogs_requires_auth(self):
        resp = requests.get(f"{BASE_URL}/api/blogs/all")
        assert resp.status_code == 401

    def test_get_all_blogs_admin(self, auth_cookies):
        resp = requests.get(f"{BASE_URL}/api/blogs/all", cookies=auth_cookies)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_create_blog_requires_auth(self):
        resp = requests.post(f"{BASE_URL}/api/blogs", json={
            "title": "Test", "excerpt": "Test", "content": "Test"
        })
        assert resp.status_code == 401

    def test_create_blog(self, auth_cookies):
        resp = requests.post(f"{BASE_URL}/api/blogs", json={
            "title": "TEST_Blog Post Automation",
            "excerpt": "Test excerpt for automation",
            "content": "<p>Test content for automation testing</p>",
            "category": "Technology",
            "author": "Test Author",
            "published": True
        }, cookies=auth_cookies)
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "TEST_Blog Post Automation"
        assert "id" in data
        assert "slug" in data
        TestBlogs.created_id = data["id"]

    def test_update_blog(self, auth_cookies):
        if not TestBlogs.created_id:
            pytest.skip("No blog created")
        resp = requests.put(f"{BASE_URL}/api/blogs/{TestBlogs.created_id}",
            json={"title": "TEST_Blog Post Automation Updated"},
            cookies=auth_cookies)
        assert resp.status_code == 200
        assert resp.json()["title"] == "TEST_Blog Post Automation Updated"

    def test_toggle_publish(self, auth_cookies):
        if not TestBlogs.created_id:
            pytest.skip("No blog created")
        resp = requests.put(f"{BASE_URL}/api/blogs/{TestBlogs.created_id}",
            json={"published": False},
            cookies=auth_cookies)
        assert resp.status_code == 200
        assert resp.json()["published"] == False

    def test_get_blog_by_slug_published(self, auth_cookies):
        # First publish a blog, then access by slug
        if not TestBlogs.created_id:
            pytest.skip("No blog created")
        # Re-publish
        put_resp = requests.put(f"{BASE_URL}/api/blogs/{TestBlogs.created_id}",
            json={"published": True},
            cookies=auth_cookies)
        slug = put_resp.json().get("slug")
        resp = requests.get(f"{BASE_URL}/api/blogs/{slug}")
        assert resp.status_code == 200

    def test_delete_blog(self, auth_cookies):
        if not TestBlogs.created_id:
            pytest.skip("No blog created")
        resp = requests.delete(f"{BASE_URL}/api/blogs/{TestBlogs.created_id}", cookies=auth_cookies)
        assert resp.status_code == 200
        # Verify deleted
        get_resp = requests.get(f"{BASE_URL}/api/blogs/all", cookies=auth_cookies)
        ids = [b["id"] for b in get_resp.json()]
        assert TestBlogs.created_id not in ids

    def test_delete_nonexistent_blog(self, auth_cookies):
        resp = requests.delete(f"{BASE_URL}/api/blogs/000000000000000000000000", cookies=auth_cookies)
        assert resp.status_code == 404

# Health
def test_health():
    resp = requests.get(f"{BASE_URL}/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"
