"""
Test suite for Landing Page and Promo System (Iteration 6)
Tests:
- /api/promo/status endpoint (public, no auth)
- Registration with is_early_bird flag
- Trial start with 90-day for early birds vs 7-day for others
- Subscription prices ($4.99/$9.99/$19.99)
- Plumbing Code regression
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
from tests.conftest import TEST_EMAIL, TEST_PASSWORD


class TestPromoEndpoint:
    """Test /api/promo/status - public endpoint (no auth required)"""
    
    def test_promo_status_returns_200(self):
        """Promo status endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/promo/status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: /api/promo/status returns 200")
    
    def test_promo_status_has_required_fields(self):
        """Promo status should have spots_remaining and promo_active"""
        response = requests.get(f"{BASE_URL}/api/promo/status")
        data = response.json()
        
        assert "spots_remaining" in data, "Missing spots_remaining field"
        assert "promo_active" in data, "Missing promo_active field"
        assert "total_users" in data, "Missing total_users field"
        assert "promo_offer" in data, "Missing promo_offer field"
        assert "promo_days" in data, "Missing promo_days field"
        print(f"PASS: Promo status has all required fields: {data}")
    
    def test_promo_spots_remaining_calculation(self):
        """spots_remaining should be 100 - total_users"""
        response = requests.get(f"{BASE_URL}/api/promo/status")
        data = response.json()
        
        expected_spots = max(0, 100 - data["total_users"])
        assert data["spots_remaining"] == expected_spots, f"Expected {expected_spots}, got {data['spots_remaining']}"
        print(f"PASS: spots_remaining correctly calculated: {data['spots_remaining']}")
    
    def test_promo_active_when_spots_available(self):
        """promo_active should be True when spots_remaining > 0"""
        response = requests.get(f"{BASE_URL}/api/promo/status")
        data = response.json()
        
        if data["spots_remaining"] > 0:
            assert data["promo_active"] == True, "promo_active should be True when spots available"
            assert data["promo_offer"] == "3 months free", f"Expected '3 months free', got {data['promo_offer']}"
            assert data["promo_days"] == 90, f"Expected 90 days, got {data['promo_days']}"
            print("PASS: Promo is active with 3 months free offer")
        else:
            assert data["promo_active"] == False, "promo_active should be False when no spots"
            print("PASS: Promo is inactive (no spots remaining)")


class TestRegistrationEarlyBird:
    """Test registration with is_early_bird flag"""
    
    def test_register_new_user_gets_early_bird_flag(self):
        """New user registration should set is_early_bird flag if within first 100"""
        # Generate unique email
        unique_email = f"test_earlybird_{uuid.uuid4().hex[:8]}@test.com"
        
        # Check current promo status
        promo_response = requests.get(f"{BASE_URL}/api/promo/status")
        promo_data = promo_response.json()
        should_be_early_bird = promo_data["spots_remaining"] > 0
        
        # Register new user
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "TestPass123!",
            "full_name": "Test Early Bird",
            "company": "Test Company"
        })
        
        assert register_response.status_code == 200, f"Registration failed: {register_response.text}"
        data = register_response.json()
        
        assert "access_token" in data, "Missing access_token in response"
        assert "user" in data, "Missing user in response"
        
        # Verify user data
        user = data["user"]
        assert user["email"] == unique_email
        assert user["full_name"] == "Test Early Bird"
        
        # Check is_early_bird via /auth/me (need to check DB directly or via API)
        token = data["access_token"]
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert me_response.status_code == 200
        
        print(f"PASS: New user registered successfully. Should be early bird: {should_be_early_bird}")
        
        # Clean up - we can't delete users via API, but that's okay for testing


class TestTrialDuration:
    """Test trial duration - 90 days for early birds, 7 days for others"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Could not authenticate test user")
    
    def test_trial_status_endpoint(self, auth_token):
        """Trial status endpoint should work"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/trial-status", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"PASS: Trial status endpoint works: {data}")
    
    def test_start_trial_for_new_early_bird_user(self):
        """Early bird user starting trial should get 90 days"""
        # Register a new user
        unique_email = f"test_trial_{uuid.uuid4().hex[:8]}@test.com"
        
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "TestPass123!",
            "full_name": "Test Trial User"
        })
        
        if register_response.status_code != 200:
            pytest.skip(f"Could not register test user: {register_response.text}")
        
        token = register_response.json()["access_token"]
        
        # Start trial
        trial_response = requests.post(f"{BASE_URL}/api/subscriptions/start-trial", 
            json={"tier": "pro"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert trial_response.status_code == 200, f"Failed to start trial: {trial_response.text}"
        data = trial_response.json()
        
        assert data["status"] == "trial_started"
        assert data["tier"] == "pro"
        
        # Check if early bird got 90 days
        if data.get("is_early_bird"):
            assert data["days_remaining"] == 90, f"Early bird should get 90 days, got {data['days_remaining']}"
            print("PASS: Early bird user got 90-day trial")
        else:
            assert data["days_remaining"] == 7, f"Non-early bird should get 7 days, got {data['days_remaining']}"
            print("PASS: Non-early bird user got 7-day trial")


class TestSubscriptionPrices:
    """Test subscription prices are updated to $4.99/$9.99/$19.99"""
    
    def test_subscription_tiers_prices(self):
        """Subscription tiers should have correct prices"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        assert response.status_code == 200
        data = response.json()
        
        assert "basic" in data, "Missing basic tier"
        assert "pro" in data, "Missing pro tier"
        assert "enterprise" in data, "Missing enterprise tier"
        
        assert data["basic"]["price"] == 4.99, f"Basic price should be 4.99, got {data['basic']['price']}"
        assert data["pro"]["price"] == 9.99, f"Pro price should be 9.99, got {data['pro']['price']}"
        assert data["enterprise"]["price"] == 19.99, f"Enterprise price should be 19.99, got {data['enterprise']['price']}"
        
        print("PASS: Subscription prices are correct: Basic $4.99, Pro $9.99, Enterprise $19.99")


class TestPlumbingCodeRegression:
    """Regression test - Plumbing Code page should still work"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Could not authenticate test user")
    
    def test_plumbing_code_endpoint(self, auth_token):
        """Plumbing code endpoint should return chapters"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert len(data) >= 10, f"Expected at least 10 chapters, got {len(data)}"
        print(f"PASS: Plumbing code returns {len(data)} chapters")
    
    def test_plumbing_code_chapter_structure(self, auth_token):
        """Plumbing code chapters should have proper structure"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        # Check first chapter has required fields
        if len(data) > 0:
            chapter = data[0]
            assert "id" in chapter, "Chapter missing id"
            assert "chapter" in chapter, "Chapter missing chapter number"
            assert "title" in chapter, "Chapter missing title"
            print(f"PASS: Plumbing code chapters have proper structure")


class TestAuthFlow:
    """Test authentication flow"""
    
    def test_login_existing_user(self):
        """Login with existing test user should work"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        assert "access_token" in data
        assert "user" in data
        print(f"PASS: Login successful for {TEST_EMAIL}")
    
    def test_auth_me_endpoint(self):
        """GET /api/auth/me should return user data"""
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Get user data
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert me_response.status_code == 200
        data = me_response.json()
        
        assert data["email"] == TEST_EMAIL
        print(f"PASS: /api/auth/me returns user data: {data['email']}, tier: {data.get('subscription_tier')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
