"""
Test Google Play Billing Integration and Updated Subscription Prices
Tests for iteration 5: Google Play Billing + Price Updates

Features tested:
- Updated subscription prices ($4.99, $9.99, $19.99)
- Google Play Billing endpoints (products, verify)
- Plumbing Code regression test
- Auth flow
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "testplumber@test.com"
TEST_PASSWORD = "Test1234!"


class TestAuth:
    """Authentication tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        print(f"✓ Login successful for {TEST_EMAIL}")
        return data["access_token"]


class TestSubscriptionTiers:
    """Test updated subscription tier prices"""
    
    def test_get_subscription_tiers(self):
        """Test GET /api/subscriptions/tiers returns updated prices"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        assert response.status_code == 200, f"Failed to get tiers: {response.text}"
        
        tiers = response.json()
        
        # Verify all 3 tiers exist
        assert "basic" in tiers, "Missing basic tier"
        assert "pro" in tiers, "Missing pro tier"
        assert "enterprise" in tiers, "Missing enterprise tier"
        
        # Verify updated prices
        assert tiers["basic"]["price"] == 4.99, f"Basic price should be $4.99, got ${tiers['basic']['price']}"
        assert tiers["pro"]["price"] == 9.99, f"Pro price should be $9.99, got ${tiers['pro']['price']}"
        assert tiers["enterprise"]["price"] == 19.99, f"Enterprise price should be $19.99, got ${tiers['enterprise']['price']}"
        
        print(f"✓ Subscription tiers with correct prices: Basic ${tiers['basic']['price']}, Pro ${tiers['pro']['price']}, Enterprise ${tiers['enterprise']['price']}")


class TestGooglePlayBilling:
    """Test Google Play Billing endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_google_play_products(self):
        """Test GET /api/subscriptions/google-play/products returns 3 products with correct prices"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/google-play/products")
        assert response.status_code == 200, f"Failed to get Google Play products: {response.text}"
        
        products = response.json()
        assert len(products) == 3, f"Expected 3 products, got {len(products)}"
        
        # Create a lookup by tier
        products_by_tier = {p["tier"]: p for p in products}
        
        # Verify basic tier
        assert "basic" in products_by_tier, "Missing basic product"
        assert products_by_tier["basic"]["price"] == 4.99, f"Basic price should be $4.99"
        assert products_by_tier["basic"]["product_id"] == "com.plumbpro.fieldcompanion.basic_monthly"
        
        # Verify pro tier
        assert "pro" in products_by_tier, "Missing pro product"
        assert products_by_tier["pro"]["price"] == 9.99, f"Pro price should be $9.99"
        assert products_by_tier["pro"]["product_id"] == "com.plumbpro.fieldcompanion.pro_monthly"
        
        # Verify enterprise tier
        assert "enterprise" in products_by_tier, "Missing enterprise product"
        assert products_by_tier["enterprise"]["price"] == 19.99, f"Enterprise price should be $19.99"
        assert products_by_tier["enterprise"]["product_id"] == "com.plumbpro.fieldcompanion.enterprise_monthly"
        
        print("✓ Google Play products returned with correct prices and product IDs")
        for p in products:
            print(f"  - {p['tier']}: ${p['price']} ({p['product_id']})")
    
    def test_verify_google_play_purchase(self, auth_token):
        """Test POST /api/subscriptions/google-play/verify with test purchase token"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Test with a mock purchase token
        test_purchase = {
            "purchase_token": "test_purchase_token_12345",
            "product_id": "com.plumbpro.fieldcompanion.pro_monthly",
            "order_id": "GPA.1234-5678-9012-34567"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/google-play/verify",
            json=test_purchase,
            headers=headers
        )
        
        assert response.status_code == 200, f"Failed to verify purchase: {response.text}"
        
        data = response.json()
        assert data["status"] == "verified", f"Expected status 'verified', got '{data.get('status')}'"
        assert data["tier"] == "pro", f"Expected tier 'pro', got '{data.get('tier')}'"
        
        print(f"✓ Google Play purchase verified: {data}")
    
    def test_verify_invalid_product_id(self, auth_token):
        """Test verify endpoint rejects invalid product ID"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        test_purchase = {
            "purchase_token": "test_token_invalid",
            "product_id": "com.invalid.product",
            "order_id": "GPA.0000-0000-0000-00000"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/google-play/verify",
            json=test_purchase,
            headers=headers
        )
        
        assert response.status_code == 400, f"Expected 400 for invalid product ID, got {response.status_code}"
        print("✓ Invalid product ID correctly rejected")


class TestPlumbingCodeRegression:
    """Regression test for Plumbing Code feature"""
    
    def test_get_plumbing_code_chapters(self):
        """Test GET /api/plumbing-code returns 11 chapters"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code")
        assert response.status_code == 200, f"Failed to get plumbing code: {response.text}"
        
        chapters = response.json()
        assert len(chapters) == 11, f"Expected 11 chapters, got {len(chapters)}"
        
        print(f"✓ Plumbing Code returns {len(chapters)} chapters (regression passed)")


class TestDashboardAPIs:
    """Test dashboard-related APIs"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_user_profile(self, auth_token):
        """Test GET /api/auth/me returns user data"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        
        assert response.status_code == 200, f"Failed to get user profile: {response.text}"
        
        user = response.json()
        assert user["email"] == TEST_EMAIL
        assert "subscription_tier" in user
        assert "subscription_status" in user
        
        print(f"✓ User profile: {user['email']}, tier: {user['subscription_tier']}, status: {user['subscription_status']}")
    
    def test_get_notes(self, auth_token):
        """Test GET /api/notes"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/notes", headers=headers)
        assert response.status_code == 200, f"Failed to get notes: {response.text}"
        print(f"✓ Notes API working, returned {len(response.json())} notes")
    
    def test_get_timesheets(self, auth_token):
        """Test GET /api/timesheets"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/timesheets", headers=headers)
        assert response.status_code == 200, f"Failed to get timesheets: {response.text}"
        print(f"✓ Timesheets API working, returned {len(response.json())} entries")
    
    def test_get_formulas(self):
        """Test GET /api/formulas"""
        response = requests.get(f"{BASE_URL}/api/formulas")
        assert response.status_code == 200, f"Failed to get formulas: {response.text}"
        print(f"✓ Formulas API working, returned {len(response.json())} formulas")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
