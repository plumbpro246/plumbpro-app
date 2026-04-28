"""
Iteration 12: Tests for Voice Notes, Weather, and Suppliers features.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://plumb-ops-suite.preview.emergentagent.com").rstrip("/")

from tests.conftest import OWNER_EMAIL, OWNER_PASSWORD


@pytest.fixture(scope="module")
def auth_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD},
                      timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("token") or data.get("access_token")
    assert token, f"No token in login response: {data}"
    return token


@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


# ==================== SUPPLIERS ====================

class TestSuppliers:
    def test_get_all_suppliers_returns_12(self):
        r = requests.get(f"{BASE_URL}/api/suppliers", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 12, f"Expected 12 suppliers, got {len(data)}"
        # schema check
        first = data[0]
        for k in ["name", "type", "website", "phone", "specialties"]:
            assert k in first, f"Missing key {k}"
        assert isinstance(first["specialties"], list)

    def test_supplier_search_pex(self):
        r = requests.get(f"{BASE_URL}/api/suppliers", params={"search": "PEX"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1
        # SupplyHouse.com has PEX
        names = [s["name"] for s in data]
        assert any("SupplyHouse" in n for n in names)

    def test_supplier_search_by_name(self):
        r = requests.get(f"{BASE_URL}/api/suppliers", params={"search": "Ferguson"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 1
        assert data[0]["name"] == "Ferguson Enterprises"

    def test_supplier_filter_by_type_wholesale(self):
        r = requests.get(f"{BASE_URL}/api/suppliers", params={"type": "Wholesale"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 5
        for s in data:
            assert "wholesale" in s["type"].lower()

    def test_supplier_filter_by_type_online(self):
        r = requests.get(f"{BASE_URL}/api/suppliers", params={"type": "Online"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        for s in data:
            assert "online" in s["type"].lower()

    def test_suppliers_no_auth_required(self):
        # public endpoint - no auth should still work
        r = requests.get(f"{BASE_URL}/api/suppliers", timeout=30)
        assert r.status_code == 200


# ==================== WEATHER ====================

class TestWeather:
    def test_weather_by_location_name(self):
        r = requests.get(f"{BASE_URL}/api/weather", params={"location": "New York"}, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "location" in data
        assert "current" in data
        assert "forecast" in data
        assert "alerts" in data
        assert "New York" in data["location"]
        # current weather structure
        cur = data["current"]
        assert "temp" in cur
        assert "condition" in cur
        assert isinstance(cur["temp"], (int, float))
        # forecast has 7 days
        assert len(data["forecast"]) == 7
        for d in data["forecast"]:
            assert "date" in d and "high" in d and "low" in d and "condition" in d

    def test_weather_by_lat_lon(self):
        r = requests.get(f"{BASE_URL}/api/weather", params={"lat": 40.71, "lon": -74.0}, timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert data["current"]["temp"] is not None
        assert len(data["forecast"]) == 7

    def test_weather_invalid_location(self):
        r = requests.get(f"{BASE_URL}/api/weather", params={"location": "xyznoplace12345zzz"}, timeout=30)
        assert r.status_code == 404

    def test_weather_missing_params(self):
        r = requests.get(f"{BASE_URL}/api/weather", timeout=30)
        assert r.status_code == 400

    def test_weather_no_auth_required(self):
        r = requests.get(f"{BASE_URL}/api/weather", params={"location": "Chicago"}, timeout=60)
        assert r.status_code == 200


# ==================== VOICE NOTES ====================

class TestVoiceNotes:
    def test_voice_notes_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/voice-notes", timeout=30)
        assert r.status_code in [401, 403]

    def test_voice_notes_list_authenticated(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/voice-notes", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # entries should not expose audio_data or _id
        for n in data:
            assert "_id" not in n
            assert "audio_data" not in n

    def test_voice_note_audio_no_token(self):
        r = requests.get(f"{BASE_URL}/api/voice-notes/fake-id/audio", timeout=30)
        assert r.status_code == 401

    def test_voice_note_audio_invalid_token(self):
        r = requests.get(f"{BASE_URL}/api/voice-notes/fake-id/audio",
                         params={"t": "bogus.invalid.token"}, timeout=30)
        assert r.status_code == 401

    def test_voice_note_create_without_audio(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/voice-notes", headers=auth_headers,
                          data={"job_name": "TEST_job"}, timeout=30)
        # should fail with 400 because audio file missing
        assert r.status_code in [400, 422]

    def test_voice_note_delete_nonexistent(self, auth_headers):
        r = requests.delete(f"{BASE_URL}/api/voice-notes/nonexistent-id-xyz",
                            headers=auth_headers, timeout=30)
        assert r.status_code == 404
