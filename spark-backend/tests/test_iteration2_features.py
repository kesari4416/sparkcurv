"""Tests for iteration 2 features: SEO fields, blog search/filter, contact leads"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')

@pytest.fixture(scope="module")
def auth_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@sparkcurv.com", "password": "SparkAdmin@2024"})
    assert r.status_code == 200, f"Login failed: {r.text}"
    return s

# ── SEO Fields ────────────────────────────────────────────────────────────────

class TestSEOFields:
    """Test meta_title and meta_description fields on blog create/update"""

    created_blog_id = None
    created_blog_slug = None

    def test_create_blog_with_seo_fields(self, auth_session):
        payload = {
            "title": "TEST_SEO Blog Post",
            "excerpt": "Test excerpt for SEO",
            "content": "<p>Test content</p>",
            "author": "SparkCurv Team",
            "category": "Technology",
            "published": True,
            "meta_title": "SEO Custom Title",
            "meta_description": "SEO custom description for search results"
        }
        r = auth_session.post(f"{BASE_URL}/api/blogs", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data["meta_title"] == "SEO Custom Title"
        assert data["meta_description"] == "SEO custom description for search results"
        assert "id" in data
        TestSEOFields.created_blog_id = data["id"]
        TestSEOFields.created_blog_slug = data["slug"]

    def test_get_blog_returns_seo_fields(self):
        if not TestSEOFields.created_blog_slug:
            pytest.skip("No blog created")
        r = requests.get(f"{BASE_URL}/api/blogs/{TestSEOFields.created_blog_slug}")
        assert r.status_code == 200
        data = r.json()
        assert data["meta_title"] == "SEO Custom Title"
        assert data["meta_description"] == "SEO custom description for search results"

    def test_update_blog_seo_fields(self, auth_session):
        if not TestSEOFields.created_blog_id:
            pytest.skip("No blog created")
        r = auth_session.put(f"{BASE_URL}/api/blogs/{TestSEOFields.created_blog_id}",
                             json={"meta_title": "Updated SEO Title", "meta_description": "Updated meta desc"})
        assert r.status_code == 200
        data = r.json()
        assert data["meta_title"] == "Updated SEO Title"
        assert data["meta_description"] == "Updated meta desc"

    def test_create_blog_without_seo_fields(self, auth_session):
        r = auth_session.post(f"{BASE_URL}/api/blogs", json={
            "title": "TEST_No SEO Blog",
            "excerpt": "No SEO excerpt",
            "content": "<p>content</p>",
            "author": "SparkCurv Team",
            "category": "Technology",
            "published": False,
        })
        assert r.status_code == 200
        data = r.json()
        # meta fields should default to empty string
        assert data.get("meta_title", "") == ""
        assert data.get("meta_description", "") == ""
        # cleanup
        auth_session.delete(f"{BASE_URL}/api/blogs/{data['id']}")

    def test_cleanup_seo_test_blog(self, auth_session):
        if TestSEOFields.created_blog_id:
            r = auth_session.delete(f"{BASE_URL}/api/blogs/{TestSEOFields.created_blog_id}")
            assert r.status_code == 200


# ── Blog All Endpoint ─────────────────────────────────────────────────────────

class TestBlogAllEndpoint:
    """Test /api/blogs/all endpoint (admin only)"""

    def test_get_all_blogs_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/blogs/all")
        assert r.status_code == 401

    def test_get_all_blogs_authenticated(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/blogs/all")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)


# ── Contact Leads ─────────────────────────────────────────────────────────────

class TestContactLeads:
    """Test contact leads endpoint"""

    created_contact_id = None

    def test_get_contacts_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/contact")
        assert r.status_code == 401

    def test_get_contacts_authenticated(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/contact")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # Verify each item has required fields (if any exist)
        for item in data:
            assert "id" in item
            assert "name" in item
            assert "email" in item

    def test_submit_contact_form(self):
        payload = {
            "name": "TEST_Contact User",
            "email": "test.contact@example.com",
            "mobile": "1234567890",
            "whatsapp": "1234567890",
            "services": "Web Development",
            "description": "Test enquiry description"
        }
        r = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert "id" in data
        TestContactLeads.created_contact_id = data["id"]

    def test_contact_appears_in_admin_list(self, auth_session):
        if not TestContactLeads.created_contact_id:
            pytest.skip("No contact created")
        r = auth_session.get(f"{BASE_URL}/api/contact")
        assert r.status_code == 200
        ids = [c["id"] for c in r.json()]
        assert TestContactLeads.created_contact_id in ids
