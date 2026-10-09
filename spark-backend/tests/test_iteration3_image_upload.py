"""
Iteration 3 Backend Tests: Image Upload endpoints
- POST /api/upload/image (requires admin auth)
- GET /api/images/{id}
- Validation: file size, file type
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def admin_session():
    session = requests.Session()
    resp = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@sparkcurv.com",
        "password": "SparkAdmin@2024"
    })
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return session

def make_small_png():
    """Minimal valid 1x1 PNG bytes"""
    import base64
    # 1x1 red pixel PNG
    png_b64 = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8"
        "/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg=="
    )
    return base64.b64decode(png_b64)

class TestImageUpload:

    def test_upload_image_success(self, admin_session):
        """POST /api/upload/image returns {url, id}"""
        png_data = make_small_png()
        files = {"file": ("test.png", io.BytesIO(png_data), "image/png")}
        resp = admin_session.post(f"{BASE_URL}/api/upload/image", files=files)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert "url" in data, "Response missing 'url'"
        assert "id" in data, "Response missing 'id'"
        assert data["url"].startswith("/api/images/"), f"URL format wrong: {data['url']}"
        print(f"Upload success: id={data['id']}, url={data['url']}")
        # Store for next test
        TestImageUpload.uploaded_id = data["id"]
        TestImageUpload.uploaded_url = data["url"]

    def test_get_image_by_id(self, admin_session):
        """GET /api/images/{id} returns correct content-type"""
        if not hasattr(TestImageUpload, 'uploaded_id'):
            pytest.skip("No uploaded image ID available")
        img_id = TestImageUpload.uploaded_id
        resp = requests.get(f"{BASE_URL}/api/images/{img_id}")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        assert resp.headers.get("content-type", "").startswith("image/"), \
            f"Wrong content-type: {resp.headers.get('content-type')}"
        print(f"GET image success, content-type: {resp.headers.get('content-type')}")

    def test_upload_requires_auth(self):
        """POST /api/upload/image without auth returns 401"""
        png_data = make_small_png()
        files = {"file": ("test.png", io.BytesIO(png_data), "image/png")}
        resp = requests.post(f"{BASE_URL}/api/upload/image", files=files)
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
        print("Auth check passed: 401 returned for unauthenticated upload")

    def test_upload_rejects_non_image(self, admin_session):
        """POST /api/upload/image rejects non-image file with 400"""
        files = {"file": ("test.txt", io.BytesIO(b"hello world"), "text/plain")}
        resp = admin_session.post(f"{BASE_URL}/api/upload/image", files=files)
        assert resp.status_code == 400, f"Expected 400, got {resp.status_code}: {resp.text}"
        print(f"Non-image rejection passed: {resp.json()}")

    def test_upload_rejects_oversized_file(self, admin_session):
        """POST /api/upload/image rejects files over 5MB with 400"""
        # Create a 6MB fake JPEG
        big_data = b'\xff\xd8\xff' + b'\x00' * (6 * 1024 * 1024)
        files = {"file": ("big.jpg", io.BytesIO(big_data), "image/jpeg")}
        resp = admin_session.post(f"{BASE_URL}/api/upload/image", files=files)
        assert resp.status_code == 400, f"Expected 400, got {resp.status_code}: {resp.text}"
        print(f"Oversize rejection passed: {resp.json()}")

    def test_get_image_invalid_id(self):
        """GET /api/images/invalid returns 400"""
        resp = requests.get(f"{BASE_URL}/api/images/invalid-id")
        assert resp.status_code == 400, f"Expected 400, got {resp.status_code}"
        print("Invalid ID check passed")

    def test_get_image_not_found(self):
        """GET /api/images/{nonexistent} returns 404"""
        resp = requests.get(f"{BASE_URL}/api/images/507f1f77bcf86cd799439011")
        assert resp.status_code == 404, f"Expected 404, got {resp.status_code}"
        print("Not found check passed")
