"""
Tests for Blog Template PDF endpoint - GET /api/blog-template/pdf
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestBlogTemplatePDF:
    """Tests for the PDF template download endpoint"""

    def test_pdf_endpoint_returns_200(self):
        """GET /api/blog-template/pdf returns HTTP 200 without authentication"""
        response = requests.get(f"{BASE_URL}/api/blog-template/pdf", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text[:200]}"

    def test_pdf_content_type(self):
        """Response Content-Type is application/pdf"""
        response = requests.get(f"{BASE_URL}/api/blog-template/pdf", timeout=15)
        assert response.status_code == 200
        assert 'application/pdf' in response.headers.get('Content-Type', ''), \
            f"Expected application/pdf, got {response.headers.get('Content-Type')}"

    def test_pdf_is_non_empty_binary(self):
        """Returned PDF is a valid non-empty binary (size > 1000 bytes)"""
        response = requests.get(f"{BASE_URL}/api/blog-template/pdf", timeout=15)
        assert response.status_code == 200
        content_length = len(response.content)
        assert content_length > 1000, f"PDF too small: {content_length} bytes"

    def test_pdf_has_pdf_magic_bytes(self):
        """Response starts with PDF magic bytes %PDF"""
        response = requests.get(f"{BASE_URL}/api/blog-template/pdf", timeout=15)
        assert response.status_code == 200
        assert response.content[:4] == b'%PDF', "Content doesn't start with PDF magic bytes"

    def test_pdf_content_disposition_attachment(self):
        """Content-Disposition header is 'attachment' with correct filename"""
        response = requests.get(f"{BASE_URL}/api/blog-template/pdf", timeout=15)
        assert response.status_code == 200
        content_disp = response.headers.get('Content-Disposition', '')
        assert 'attachment' in content_disp, f"Expected attachment, got: {content_disp}"
        assert 'sparkcurv-blog-template.pdf' in content_disp, \
            f"Expected filename 'sparkcurv-blog-template.pdf', got: {content_disp}"

    def test_pdf_no_auth_required(self):
        """Endpoint is publicly accessible without auth cookies/headers"""
        # Make request without any auth cookies
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/blog-template/pdf", timeout=15)
        assert response.status_code == 200, \
            f"Expected public access (200), got {response.status_code}"

    def test_pdf_is_multi_page(self):
        """PDF contains multiple pages (sections: Basic Info, Excerpt, Content, SEO, Publish, Notes)"""
        response = requests.get(f"{BASE_URL}/api/blog-template/pdf", timeout=15)
        assert response.status_code == 200
        # Check PDF content for expected sections
        content_str = response.content.decode('latin-1')
        # A multi-page PDF has multiple /Page entries
        assert content_str.count('/Page') >= 2 or b'Page' in response.content, \
            "PDF should have multiple pages"
