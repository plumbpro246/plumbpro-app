"""
Test suite for Plumbing Code Bookmarks API (Iteration 9)
Tests: POST/GET/DELETE /api/plumbing-code/bookmarks
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
from tests.conftest import TEST_EMAIL, TEST_PASSWORD


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    return response.json().get("access_token")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


@pytest.fixture
def cleanup_test_bookmarks(auth_headers):
    """Cleanup test bookmarks after each test"""
    created_ids = []
    yield created_ids
    # Teardown: delete all test bookmarks
    for bookmark_id in created_ids:
        try:
            requests.delete(f"{BASE_URL}/api/plumbing-code/bookmarks/{bookmark_id}", headers=auth_headers)
        except:
            pass


class TestBookmarksCRUD:
    """Test bookmark CRUD operations"""

    def test_get_bookmarks_requires_auth(self):
        """GET /api/plumbing-code/bookmarks without auth returns 401/403"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code/bookmarks")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ GET bookmarks without auth returns {response.status_code}")

    def test_post_bookmark_requires_auth(self):
        """POST /api/plumbing-code/bookmarks without auth returns 401/403"""
        response = requests.post(f"{BASE_URL}/api/plumbing-code/bookmarks", json={
            "code_type": "upc",
            "edition": "2024",
            "section_code": "TEST_201.0"
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ POST bookmark without auth returns {response.status_code}")

    def test_get_bookmarks_authenticated(self, auth_headers):
        """GET /api/plumbing-code/bookmarks with auth returns list"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code/bookmarks", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"✓ GET bookmarks returns list with {len(data)} items")

    def test_create_bookmark_success(self, auth_headers, cleanup_test_bookmarks):
        """POST /api/plumbing-code/bookmarks creates a bookmark"""
        unique_code = f"TEST_{uuid.uuid4().hex[:8]}"
        payload = {
            "code_type": "upc",
            "edition": "2024",
            "section_code": unique_code,
            "section_title": "Test Section Title",
            "chapter_title": "Test Chapter",
            "chapter_id": "ch2"
        }
        response = requests.post(f"{BASE_URL}/api/plumbing-code/bookmarks", headers=auth_headers, json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain bookmark id"
        assert data["section_code"] == unique_code
        assert data["code_type"] == "upc"
        assert data["edition"] == "2024"
        assert data["section_title"] == "Test Section Title"
        assert "created_at" in data
        
        cleanup_test_bookmarks.append(data["id"])
        print(f"✓ Created bookmark with id: {data['id']}")

    def test_create_bookmark_missing_section_code(self, auth_headers):
        """POST /api/plumbing-code/bookmarks without section_code returns 400"""
        payload = {
            "code_type": "upc",
            "edition": "2024"
            # Missing section_code
        }
        response = requests.post(f"{BASE_URL}/api/plumbing-code/bookmarks", headers=auth_headers, json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✓ POST bookmark without section_code returns 400")

    def test_create_duplicate_bookmark_returns_409(self, auth_headers, cleanup_test_bookmarks):
        """POST duplicate bookmark returns 409 Conflict"""
        unique_code = f"TEST_DUP_{uuid.uuid4().hex[:8]}"
        payload = {
            "code_type": "upc",
            "edition": "2024",
            "section_code": unique_code,
            "section_title": "Duplicate Test"
        }
        
        # First create
        response1 = requests.post(f"{BASE_URL}/api/plumbing-code/bookmarks", headers=auth_headers, json=payload)
        assert response1.status_code == 200, f"First create failed: {response1.status_code}"
        cleanup_test_bookmarks.append(response1.json()["id"])
        
        # Second create (duplicate)
        response2 = requests.post(f"{BASE_URL}/api/plumbing-code/bookmarks", headers=auth_headers, json=payload)
        assert response2.status_code == 409, f"Expected 409 for duplicate, got {response2.status_code}"
        print(f"✓ Duplicate bookmark returns 409 Conflict")

    def test_delete_bookmark_success(self, auth_headers):
        """DELETE /api/plumbing-code/bookmarks/{id} removes bookmark"""
        # First create a bookmark
        unique_code = f"TEST_DEL_{uuid.uuid4().hex[:8]}"
        create_response = requests.post(f"{BASE_URL}/api/plumbing-code/bookmarks", headers=auth_headers, json={
            "code_type": "upc",
            "edition": "2024",
            "section_code": unique_code
        })
        assert create_response.status_code == 200
        bookmark_id = create_response.json()["id"]
        
        # Delete it
        delete_response = requests.delete(f"{BASE_URL}/api/plumbing-code/bookmarks/{bookmark_id}", headers=auth_headers)
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        assert delete_response.json().get("status") == "deleted"
        
        # Verify it's gone - check bookmarks list
        get_response = requests.get(f"{BASE_URL}/api/plumbing-code/bookmarks", headers=auth_headers)
        bookmarks = get_response.json()
        assert not any(b["id"] == bookmark_id for b in bookmarks), "Bookmark should be deleted"
        print(f"✓ Deleted bookmark {bookmark_id} successfully")

    def test_delete_nonexistent_bookmark_returns_404(self, auth_headers):
        """DELETE /api/plumbing-code/bookmarks/{id} with invalid id returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(f"{BASE_URL}/api/plumbing-code/bookmarks/{fake_id}", headers=auth_headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ Delete nonexistent bookmark returns 404")

    def test_bookmark_persists_in_get(self, auth_headers, cleanup_test_bookmarks):
        """Created bookmark appears in GET /api/plumbing-code/bookmarks"""
        unique_code = f"TEST_PERSIST_{uuid.uuid4().hex[:8]}"
        
        # Create
        create_response = requests.post(f"{BASE_URL}/api/plumbing-code/bookmarks", headers=auth_headers, json={
            "code_type": "ipc",
            "edition": "2021",
            "section_code": unique_code,
            "section_title": "Persistence Test",
            "chapter_title": "Chapter Test",
            "chapter_id": "ch3"
        })
        assert create_response.status_code == 200
        created = create_response.json()
        cleanup_test_bookmarks.append(created["id"])
        
        # Verify in GET
        get_response = requests.get(f"{BASE_URL}/api/plumbing-code/bookmarks", headers=auth_headers)
        assert get_response.status_code == 200
        bookmarks = get_response.json()
        
        found = next((b for b in bookmarks if b["id"] == created["id"]), None)
        assert found is not None, "Created bookmark not found in GET response"
        assert found["section_code"] == unique_code
        assert found["code_type"] == "ipc"
        assert found["edition"] == "2021"
        print(f"✓ Bookmark persists and appears in GET response")


class TestBookmarkDataIntegrity:
    """Test bookmark data structure and integrity"""

    def test_bookmark_has_required_fields(self, auth_headers, cleanup_test_bookmarks):
        """Bookmark response contains all required fields"""
        unique_code = f"TEST_FIELDS_{uuid.uuid4().hex[:8]}"
        response = requests.post(f"{BASE_URL}/api/plumbing-code/bookmarks", headers=auth_headers, json={
            "code_type": "upc",
            "edition": "2024",
            "section_code": unique_code,
            "section_title": "Field Test",
            "chapter_title": "Chapter Field Test",
            "chapter_id": "ch5"
        })
        assert response.status_code == 200
        data = response.json()
        cleanup_test_bookmarks.append(data["id"])
        
        required_fields = ["id", "user_id", "code_type", "edition", "section_code", "created_at"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        print(f"✓ Bookmark contains all required fields: {required_fields}")

    def test_bookmark_stores_optional_fields(self, auth_headers, cleanup_test_bookmarks):
        """Bookmark stores optional fields correctly"""
        unique_code = f"TEST_OPT_{uuid.uuid4().hex[:8]}"
        response = requests.post(f"{BASE_URL}/api/plumbing-code/bookmarks", headers=auth_headers, json={
            "code_type": "ipc",
            "edition": "2018",
            "section_code": unique_code,
            "section_title": "Optional Field Test",
            "chapter_title": "Optional Chapter",
            "chapter_id": "ch7"
        })
        assert response.status_code == 200
        data = response.json()
        cleanup_test_bookmarks.append(data["id"])
        
        assert data.get("section_title") == "Optional Field Test"
        assert data.get("chapter_title") == "Optional Chapter"
        assert data.get("chapter_id") == "ch7"
        print(f"✓ Bookmark stores optional fields correctly")


class TestAuthRegression:
    """Auth flow regression tests"""

    def test_login_works(self):
        """Login with test credentials works"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.status_code}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        print(f"✓ Login works for {TEST_EMAIL}")

    def test_invalid_login_returns_401(self):
        """Invalid credentials return 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print(f"✓ Invalid login returns 401")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
