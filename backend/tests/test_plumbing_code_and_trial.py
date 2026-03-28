"""
Backend tests for PlumbPro Field Companion - Plumbing Code and Trial Features
Tests the new 2015 UPC Plumbing Code endpoint and 7-day free trial functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://plumb-ops-suite.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "testplumber@test.com"
TEST_PASSWORD = "Test1234!"


class TestPlumbingCodeAPI:
    """Tests for the /api/plumbing-code endpoint (unauthenticated)"""
    
    def test_get_all_chapters(self):
        """GET /api/plumbing-code returns all 11 chapters"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 11, f"Expected 11 chapters, got {len(data)}"
        
        # Verify chapter structure
        for chapter in data:
            assert "id" in chapter
            assert "chapter" in chapter
            assert "title" in chapter
            assert "description" in chapter
            assert "sections" in chapter
            assert isinstance(chapter["sections"], list)
        
        print(f"SUCCESS: Retrieved {len(data)} plumbing code chapters")
    
    def test_chapter_ids_present(self):
        """Verify all expected chapter IDs are present"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code")
        assert response.status_code == 200
        
        data = response.json()
        chapter_ids = [ch["id"] for ch in data]
        
        expected_ids = ["ch1", "ch3", "ch4", "ch5", "ch6", "ch7", "ch9", "ch10", "ch11", "ch12", "tables"]
        for expected_id in expected_ids:
            assert expected_id in chapter_ids, f"Missing chapter: {expected_id}"
        
        print(f"SUCCESS: All expected chapter IDs present: {expected_ids}")
    
    def test_search_trap(self):
        """GET /api/plumbing-code?search=trap returns filtered results"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code?search=trap")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Search for 'trap' should return results"
        
        # Verify search results contain trap-related content
        found_trap_content = False
        for chapter in data:
            for section in chapter.get("sections", []):
                if "trap" in section.get("title", "").lower() or "trap" in section.get("content", "").lower():
                    found_trap_content = True
                    break
        
        assert found_trap_content, "Search results should contain trap-related content"
        print(f"SUCCESS: Search 'trap' returned {len(data)} chapters with trap content")
    
    def test_search_vent(self):
        """GET /api/plumbing-code?search=vent returns filtered results"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code?search=vent")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Search for 'vent' should return results"
        
        print(f"SUCCESS: Search 'vent' returned {len(data)} chapters")
    
    def test_search_slope(self):
        """GET /api/plumbing-code?search=slope returns filtered results"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code?search=slope")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Search for 'slope' should return results"
        
        print(f"SUCCESS: Search 'slope' returned {len(data)} chapters")
    
    def test_search_no_results(self):
        """GET /api/plumbing-code?search=xyz123 returns empty list"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code?search=xyz123nonexistent")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0, "Search for nonexistent term should return empty list"
        
        print("SUCCESS: Search for nonexistent term returns empty list")


class TestAuthFlow:
    """Tests for authentication flow"""
    
    def test_login_success(self):
        """POST /api/auth/login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        assert "subscription_tier" in data["user"]
        assert "subscription_status" in data["user"]
        
        print(f"SUCCESS: Login successful for {TEST_EMAIL}")
        return data["access_token"]
    
    def test_login_invalid_credentials(self):
        """POST /api/auth/login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@test.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        
        print("SUCCESS: Invalid credentials correctly rejected")
    
    def test_get_me_with_token(self):
        """GET /api/auth/me with valid token"""
        # First login to get token
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        token = login_response.json()["access_token"]
        
        # Get user info
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["email"] == TEST_EMAIL
        assert "subscription_tier" in data
        assert "trial_started" in data
        
        print(f"SUCCESS: /api/auth/me returned user data for {TEST_EMAIL}")


class TestTrialStatus:
    """Tests for trial status endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        return response.json()["access_token"]
    
    def test_get_trial_status(self, auth_token):
        """GET /api/subscriptions/trial-status returns trial info"""
        response = requests.get(
            f"{BASE_URL}/api/subscriptions/trial-status",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        # User should have trial info
        assert "has_trial" in data or "trial_started" in data
        
        if data.get("has_trial"):
            assert "tier" in data
            assert "trial_ends_at" in data
            assert "days_remaining" in data
            print(f"SUCCESS: User has active trial - {data['days_remaining']} days remaining")
        else:
            print(f"SUCCESS: Trial status retrieved - has_trial: {data.get('has_trial')}")
    
    def test_trial_status_requires_auth(self):
        """GET /api/subscriptions/trial-status without token returns 403"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/trial-status")
        assert response.status_code == 403
        
        print("SUCCESS: Trial status endpoint requires authentication")


class TestSubscriptionTiers:
    """Tests for subscription tiers endpoint"""
    
    def test_get_subscription_tiers(self):
        """GET /api/subscriptions/tiers returns tier info"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        assert response.status_code == 200
        
        data = response.json()
        assert "basic" in data
        assert "pro" in data
        assert "enterprise" in data
        
        # Verify tier structure
        for tier_id, tier_info in data.items():
            assert "name" in tier_info
            assert "price" in tier_info
            assert "features" in tier_info
            assert "trial_days" in tier_info
        
        print(f"SUCCESS: Retrieved {len(data)} subscription tiers")


class TestDashboardAPIs:
    """Tests for dashboard-related APIs"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        return response.json()["access_token"]
    
    def test_get_notes(self, auth_token):
        """GET /api/notes returns user notes"""
        response = requests.get(
            f"{BASE_URL}/api/notes",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("SUCCESS: Notes endpoint working")
    
    def test_get_timesheets(self, auth_token):
        """GET /api/timesheets returns user timesheets"""
        response = requests.get(
            f"{BASE_URL}/api/timesheets",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("SUCCESS: Timesheets endpoint working")
    
    def test_get_bids(self, auth_token):
        """GET /api/bids returns user bids"""
        response = requests.get(
            f"{BASE_URL}/api/bids",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("SUCCESS: Bids endpoint working")
    
    def test_get_materials(self, auth_token):
        """GET /api/materials returns user materials"""
        response = requests.get(
            f"{BASE_URL}/api/materials",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("SUCCESS: Materials endpoint working")
    
    def test_get_safety_talk_today(self, auth_token):
        """GET /api/safety-talks/today returns today's safety talk"""
        response = requests.get(
            f"{BASE_URL}/api/safety-talks/today",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "title" in data
        assert "content" in data
        assert "topic" in data
        print(f"SUCCESS: Today's safety talk: {data['title']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
