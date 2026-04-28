"""
Regression test for server.py refactoring into /app/backend/routes/.
Validates that all endpoints still behave identically after the split.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://plumb-ops-suite.preview.emergentagent.com").rstrip("/")
from tests.conftest import OWNER_EMAIL
from tests.conftest import OWNER_PASSWORD as OWNER_PASS


# -------- Fixtures --------
@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": OWNER_EMAIL, "password": OWNER_PASS})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# -------- Health --------
class TestHealth:
    def test_health(self, api):
        r = api.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        assert r.json().get("status") == "healthy"


# -------- Auth --------
class TestAuth:
    def test_login_success(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login", json={"email": OWNER_EMAIL, "password": OWNER_PASS})
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data and isinstance(data["access_token"], str)

    def test_me_enterprise(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data.get("email") == OWNER_EMAIL
        tier = data.get("tier") or data.get("subscription_tier") or data.get("subscription", {}).get("tier")
        assert tier == "enterprise", f"expected enterprise, got {tier} from {data}"

    def test_register_duplicate(self, api):
        r = api.post(f"{BASE_URL}/api/auth/register", json={
            "email": OWNER_EMAIL, "password": "whatever", "full_name": "dup"
        })
        assert r.status_code in (400, 409), f"expected rejection, got {r.status_code} {r.text}"


# -------- Subscriptions --------
class TestSubscriptions:
    def test_tiers(self, api):
        r = api.get(f"{BASE_URL}/api/subscriptions/tiers")
        assert r.status_code == 200
        data = r.json()
        # Server returns a dict keyed by tier id (basic/pro/enterprise)
        if isinstance(data, dict):
            if "tiers" in data:
                tiers = data["tiers"]
                count = len(tiers)
            else:
                tiers = list(data.keys())
                count = len(tiers)
                assert {"basic", "pro", "enterprise"}.issubset(set(tiers)), f"missing expected tiers: {tiers}"
        else:
            count = len(data)
        assert count == 3, f"expected 3 tiers, got {count}: {data}"


# -------- CRUD endpoints return arrays --------
@pytest.mark.parametrize("endpoint", [
    "/api/notes",
    "/api/timesheets",
    "/api/materials",
    "/api/bids",
    "/api/calendar",
])
def test_crud_list_returns_array(api, auth_headers, endpoint):
    r = api.get(f"{BASE_URL}{endpoint}", headers=auth_headers)
    assert r.status_code == 200, f"{endpoint}: {r.status_code} {r.text}"
    assert isinstance(r.json(), list), f"{endpoint} did not return a list"


# -------- Reference --------
class TestReference:
    def test_safety_talk_today(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/safety-talks/today", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert "title" in data or "topic" in data or "talk" in data, f"no talk keys: {data}"

    def test_formulas_list(self, api):
        r = api.get(f"{BASE_URL}/api/formulas")
        assert r.status_code == 200
        data = r.json()
        formulas = data if isinstance(data, list) else data.get("formulas", [])
        assert len(formulas) == 10, f"expected 10 formulas got {len(formulas)}"
        ids = [f.get("id") for f in formulas]
        assert "offset-45" in ids
        assert "offset-22" in ids

    def test_formula_calculate_offset_45(self, api):
        r = api.post(f"{BASE_URL}/api/formulas/calculate?formula_id=offset-45", json={"Offset": 12})
        assert r.status_code == 200, f"{r.status_code} {r.text}"
        data = r.json()
        # Response: {"result": 16.9706, "formula_id": "offset-45", "extras": {"travel": 16.9706, "set": 12.0}}
        extras = data.get("extras") or {}
        travel = extras.get("travel", data.get("travel"))
        set_val = extras.get("set", data.get("set"))
        assert travel is not None and abs(float(travel) - 16.9706) < 0.01, f"travel={travel} data={data}"
        assert set_val is not None and abs(float(set_val) - 12.0) < 0.01, f"set={set_val} data={data}"

    def test_osha(self, api):
        r = api.get(f"{BASE_URL}/api/osha")
        assert r.status_code == 200
        data = r.json()
        items = data if isinstance(data, list) else data.get("requirements", [])
        assert len(items) == 8, f"expected 8 osha items got {len(items)}"

    def test_sds(self, api):
        r = api.get(f"{BASE_URL}/api/sds")
        assert r.status_code == 200
        data = r.json()
        items = data if isinstance(data, list) else data.get("entries", [])
        assert len(items) == 5, f"expected 5 sds got {len(items)}"

    def test_total_station(self, api):
        r = api.get(f"{BASE_URL}/api/total-station")
        assert r.status_code == 200
        data = r.json()
        assert data and (isinstance(data, (list, dict)))


# -------- Services --------
class TestServices:
    def test_weather_ny(self, api):
        r = api.get(f"{BASE_URL}/api/weather", params={"location": "New York"})
        assert r.status_code == 200
        data = r.json()
        assert "current" in data or "temperature" in data or "forecast" in data

    def test_suppliers_all(self, api):
        r = api.get(f"{BASE_URL}/api/suppliers")
        assert r.status_code == 200
        data = r.json()
        items = data if isinstance(data, list) else data.get("suppliers", [])
        assert len(items) == 12, f"expected 12 suppliers got {len(items)}"

    def test_suppliers_search_pex(self, api):
        r = api.get(f"{BASE_URL}/api/suppliers", params={"search": "PEX"})
        assert r.status_code == 200
        data = r.json()
        items = data if isinstance(data, list) else data.get("suppliers", [])
        names = [i.get("name", "") for i in items]
        assert any("SupplyHouse" in n for n in names), f"no SupplyHouse in {names}"

    def test_push_vapid(self, api):
        r = api.get(f"{BASE_URL}/api/push/vapid-key")
        assert r.status_code == 200
        assert "public_key" in r.json()

    def test_voice_notes_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/voice-notes")
        assert r.status_code in (401, 403)

    def test_support_ticket(self, api, auth_headers):
        r = api.post(f"{BASE_URL}/api/support/ticket", headers=auth_headers, json={
            "subject": "TEST_regression_ticket",
            "message": "Refactor regression test ticket",
            "priority": "low",
            "category": "other"
        })
        assert r.status_code in (200, 201), f"{r.status_code} {r.text}"


# -------- Plumbing Code --------
class TestPlumbingCode:
    def test_types(self, api):
        r = api.get(f"{BASE_URL}/api/plumbing-code/types")
        assert r.status_code == 200
        data = r.json()
        # Server returns a dict keyed by code type (upc/ipc) with name, publisher, editions
        if isinstance(data, dict):
            keys = set(data.keys())
        else:
            keys = set(data)
        assert "upc" in keys and "ipc" in keys, f"upc/ipc missing: {data}"

    def test_upc_2024(self, api):
        r = api.get(f"{BASE_URL}/api/plumbing-code", params={"code_type": "upc", "edition": "2024"})
        assert r.status_code == 200
        data = r.json()
        chapters = data.get("chapters") if isinstance(data, dict) else None
        if chapters is None and isinstance(data, list):
            chapters = data
        assert chapters and len(chapters) > 0, f"no chapters: {data}"
