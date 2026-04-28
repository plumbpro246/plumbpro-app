"""
Test Push Notifications and Team Management APIs - Iteration 11
Tests for:
- Push Notifications: GET /api/push/vapid-key, POST /api/push/subscribe, /unsubscribe, /send
- Team Management: POST/GET/DELETE /api/teams, POST /api/teams/invite, DELETE /api/teams/members/{id}, GET /api/teams/timesheets
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
from tests.conftest import OWNER_EMAIL, OWNER_PASSWORD
TEST_USER_EMAIL = "testplumber@test.com"
TEST_USER_PASSWORD = "Test1234!"


@pytest.fixture(scope="module")
def owner_token():
    """Get auth token for owner account (Enterprise tier)"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": OWNER_EMAIL,
        "password": OWNER_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip(f"Owner login failed: {response.status_code} - {response.text}")
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def test_user_token():
    """Get auth token for test user (Pro tier)"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip(f"Test user login failed: {response.status_code} - {response.text}")
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def owner_headers(owner_token):
    return {"Authorization": f"Bearer {owner_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def test_user_headers(test_user_token):
    return {"Authorization": f"Bearer {test_user_token}", "Content-Type": "application/json"}


# ==================== PUSH NOTIFICATION TESTS ====================

class TestPushNotifications:
    """Push Notification endpoint tests"""
    
    def test_get_vapid_key(self):
        """GET /api/push/vapid-key returns public key"""
        response = requests.get(f"{BASE_URL}/api/push/vapid-key")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "public_key" in data, "Response should contain 'public_key'"
        assert data["public_key"] is not None, "public_key should not be None"
        assert len(data["public_key"]) > 50, "public_key should be a valid VAPID key"
        print(f"✓ VAPID public key returned: {data['public_key'][:30]}...")
    
    def test_push_subscribe_requires_auth(self):
        """POST /api/push/subscribe requires authentication"""
        response = requests.post(f"{BASE_URL}/api/push/subscribe", json={
            "subscription": {"endpoint": "https://test.com", "keys": {"p256dh": "test", "auth": "test"}}
        })
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("✓ Push subscribe requires authentication")
    
    def test_push_subscribe_with_auth(self, owner_headers):
        """POST /api/push/subscribe stores subscription"""
        test_subscription = {
            "endpoint": f"https://fcm.googleapis.com/fcm/send/test_{uuid.uuid4().hex[:8]}",
            "keys": {
                "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
                "auth": "tBHItJI5svbpez7KI4CCXg"
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/push/subscribe",
            headers=owner_headers,
            json={"subscription": test_subscription}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "subscribed", f"Expected status 'subscribed', got {data}"
        print("✓ Push subscription stored successfully")
    
    def test_push_subscribe_missing_subscription(self, owner_headers):
        """POST /api/push/subscribe returns 400 if subscription missing"""
        response = requests.post(
            f"{BASE_URL}/api/push/subscribe",
            headers=owner_headers,
            json={}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Push subscribe returns 400 for missing subscription")
    
    def test_push_unsubscribe(self, owner_headers):
        """POST /api/push/unsubscribe removes subscription"""
        response = requests.post(
            f"{BASE_URL}/api/push/unsubscribe",
            headers=owner_headers,
            json={"endpoint": "https://fcm.googleapis.com/fcm/send/test_endpoint"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "unsubscribed", f"Expected status 'unsubscribed', got {data}"
        print("✓ Push unsubscribe works")
    
    def test_push_send(self, owner_headers):
        """POST /api/push/send sends push notification"""
        response = requests.post(
            f"{BASE_URL}/api/push/send",
            headers=owner_headers,
            json={
                "title": "Test Push",
                "message": "This is a test push notification",
                "url": "/dashboard"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "sent" in data, "Response should contain 'sent' count"
        print(f"✓ Push send endpoint works, sent to {data['sent']} subscriptions")


# ==================== TEAM MANAGEMENT TESTS ====================

class TestTeamManagement:
    """Team Management endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def cleanup_team(self, owner_headers):
        """Cleanup any existing team before tests"""
        # Try to delete existing team first
        requests.delete(f"{BASE_URL}/api/teams", headers=owner_headers)
        yield
        # Cleanup after tests
        requests.delete(f"{BASE_URL}/api/teams", headers=owner_headers)
    
    def test_get_team_no_team(self, owner_headers):
        """GET /api/teams returns null when no team exists"""
        response = requests.get(f"{BASE_URL}/api/teams", headers=owner_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        # Should return null/None when no team
        data = response.json()
        assert data is None, f"Expected null when no team, got {data}"
        print("✓ GET /api/teams returns null when no team exists")
    
    def test_create_team(self, owner_headers):
        """POST /api/teams creates a team"""
        team_name = f"TEST_Team_{uuid.uuid4().hex[:6]}"
        response = requests.post(
            f"{BASE_URL}/api/teams",
            headers=owner_headers,
            json={"name": team_name}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain team 'id'"
        assert data["name"] == team_name, f"Team name mismatch: expected {team_name}, got {data['name']}"
        assert "owner_id" in data, "Response should contain 'owner_id'"
        assert "members" in data, "Response should contain 'members' array"
        assert data["members"] == [], "New team should have empty members array"
        print(f"✓ Team created: {team_name}")
        return data
    
    def test_create_team_missing_name(self, owner_headers):
        """POST /api/teams returns 400 if name missing"""
        response = requests.post(
            f"{BASE_URL}/api/teams",
            headers=owner_headers,
            json={}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Create team returns 400 for missing name")
    
    def test_create_team_duplicate(self, owner_headers):
        """POST /api/teams returns 409 if user already has a team"""
        # First create a team
        requests.post(f"{BASE_URL}/api/teams", headers=owner_headers, json={"name": "First Team"})
        
        # Try to create another
        response = requests.post(
            f"{BASE_URL}/api/teams",
            headers=owner_headers,
            json={"name": "Second Team"}
        )
        assert response.status_code == 409, f"Expected 409 for duplicate team, got {response.status_code}"
        print("✓ Create team returns 409 for duplicate")
    
    def test_get_team_after_create(self, owner_headers):
        """GET /api/teams returns user's team"""
        # Create team first
        team_name = f"TEST_GetTeam_{uuid.uuid4().hex[:6]}"
        requests.post(f"{BASE_URL}/api/teams", headers=owner_headers, json={"name": team_name})
        
        # Get team
        response = requests.get(f"{BASE_URL}/api/teams", headers=owner_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data is not None, "Team should not be null after creation"
        assert data["name"] == team_name, f"Team name mismatch"
        assert "owner_name" in data, "Response should contain 'owner_name'"
        assert "owner_email" in data, "Response should contain 'owner_email'"
        print(f"✓ GET /api/teams returns team: {team_name}")
    
    def test_invite_member(self, owner_headers):
        """POST /api/teams/invite adds member to team"""
        # Create team first
        requests.post(f"{BASE_URL}/api/teams", headers=owner_headers, json={"name": "Invite Test Team"})
        
        # Invite a member
        invite_email = f"test_invite_{uuid.uuid4().hex[:6]}@test.com"
        response = requests.post(
            f"{BASE_URL}/api/teams/invite",
            headers=owner_headers,
            json={"email": invite_email, "role": "plumber"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain member 'id'"
        assert data["email"] == invite_email, f"Email mismatch"
        assert data["role"] == "plumber", f"Role mismatch"
        assert data["status"] in ["pending", "active"], f"Invalid status: {data['status']}"
        print(f"✓ Member invited: {invite_email}")
    
    def test_invite_member_duplicate(self, owner_headers):
        """POST /api/teams/invite returns 409 for duplicate"""
        # Create team first
        requests.post(f"{BASE_URL}/api/teams", headers=owner_headers, json={"name": "Duplicate Invite Test"})
        
        # Invite same member twice
        invite_email = f"dup_invite_{uuid.uuid4().hex[:6]}@test.com"
        requests.post(f"{BASE_URL}/api/teams/invite", headers=owner_headers, json={"email": invite_email, "role": "plumber"})
        
        response = requests.post(
            f"{BASE_URL}/api/teams/invite",
            headers=owner_headers,
            json={"email": invite_email, "role": "foreman"}
        )
        assert response.status_code == 409, f"Expected 409 for duplicate invite, got {response.status_code}"
        print("✓ Invite returns 409 for duplicate member")
    
    def test_invite_member_no_team(self, test_user_headers):
        """POST /api/teams/invite returns 404 if user has no team"""
        # Test user doesn't own a team
        response = requests.post(
            f"{BASE_URL}/api/teams/invite",
            headers=test_user_headers,
            json={"email": "someone@test.com", "role": "plumber"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Invite returns 404 when user has no team")
    
    def test_remove_member(self, owner_headers):
        """DELETE /api/teams/members/{id} removes member"""
        # Create team and invite member
        requests.post(f"{BASE_URL}/api/teams", headers=owner_headers, json={"name": "Remove Test Team"})
        
        invite_email = f"remove_test_{uuid.uuid4().hex[:6]}@test.com"
        invite_response = requests.post(
            f"{BASE_URL}/api/teams/invite",
            headers=owner_headers,
            json={"email": invite_email, "role": "plumber"}
        )
        member_id = invite_response.json()["id"]
        
        # Remove member
        response = requests.delete(
            f"{BASE_URL}/api/teams/members/{member_id}",
            headers=owner_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "removed", f"Expected status 'removed', got {data}"
        
        # Verify member is removed
        team_response = requests.get(f"{BASE_URL}/api/teams", headers=owner_headers)
        team = team_response.json()
        member_emails = [m["email"] for m in team.get("members", [])]
        assert invite_email not in member_emails, "Member should be removed from team"
        print(f"✓ Member removed: {member_id}")
    
    def test_get_team_timesheets(self, owner_headers):
        """GET /api/teams/timesheets returns team member timesheets"""
        # Create team first
        requests.post(f"{BASE_URL}/api/teams", headers=owner_headers, json={"name": "Timesheet Test Team"})
        
        response = requests.get(f"{BASE_URL}/api/teams/timesheets", headers=owner_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Team timesheets returned: {len(data)} entries")
    
    def test_get_team_timesheets_no_team(self, test_user_headers):
        """GET /api/teams/timesheets returns 404 if user has no team"""
        response = requests.get(f"{BASE_URL}/api/teams/timesheets", headers=test_user_headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Team timesheets returns 404 when user has no team")
    
    def test_delete_team(self, owner_headers):
        """DELETE /api/teams deletes the team"""
        # Create team first
        requests.post(f"{BASE_URL}/api/teams", headers=owner_headers, json={"name": "Delete Test Team"})
        
        response = requests.delete(f"{BASE_URL}/api/teams", headers=owner_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "deleted", f"Expected status 'deleted', got {data}"
        
        # Verify team is deleted
        get_response = requests.get(f"{BASE_URL}/api/teams", headers=owner_headers)
        assert get_response.json() is None, "Team should be null after deletion"
        print("✓ Team deleted successfully")
    
    def test_delete_team_not_found(self, owner_headers):
        """DELETE /api/teams returns 404 if no team exists"""
        # Make sure no team exists
        requests.delete(f"{BASE_URL}/api/teams", headers=owner_headers)
        
        response = requests.delete(f"{BASE_URL}/api/teams", headers=owner_headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Delete team returns 404 when no team exists")


# ==================== AUTH REGRESSION TEST ====================

class TestAuthRegression:
    """Auth flow regression tests"""
    
    def test_login_owner(self):
        """Login with owner credentials still works"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert response.status_code == 200, f"Owner login failed: {response.status_code}"
        
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        assert "user" in data, "Response should contain user"
        assert data["user"]["email"] == OWNER_EMAIL
        print(f"✓ Owner login works: {OWNER_EMAIL}")
    
    def test_login_test_user(self):
        """Login with test user credentials still works"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200, f"Test user login failed: {response.status_code}"
        
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        print(f"✓ Test user login works: {TEST_USER_EMAIL}")
    
    def test_auth_me(self, owner_headers):
        """GET /api/auth/me returns user info"""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=owner_headers)
        assert response.status_code == 200, f"Auth me failed: {response.status_code}"
        
        data = response.json()
        assert data["email"] == OWNER_EMAIL
        assert "subscription_tier" in data
        print(f"✓ Auth me works, tier: {data['subscription_tier']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
