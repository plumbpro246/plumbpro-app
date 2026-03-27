#!/usr/bin/env python3

import requests
import sys
import json
import uuid
from datetime import datetime
import base64

class PlumbProAPITester:
    def __init__(self, base_url="https://plumb-pro-app.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        if not files:
            headers['Content-Type'] = 'application/json'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, headers={k: v for k, v in headers.items() if k != 'Content-Type'}, data=data, files=files)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_result(name, success, details if not success else "")
            
            if success:
                try:
                    return response.json()
                except:
                    return {"status": "success"}
            return None

        except Exception as e:
            self.log_result(name, False, f"Exception: {str(e)}")
            return None

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        self.run_test("Health Check", "GET", "", 200)
        self.run_test("API Health", "GET", "health", 200)

    def test_auth_flow(self):
        """Test authentication flow"""
        print("\n🔍 Testing Authentication...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        test_email = f"test_user_{timestamp}@example.com"
        test_password = "TestPass123!"
        test_name = f"Test User {timestamp}"
        test_company = "Test Plumbing Co"

        # Test registration
        register_data = {
            "email": test_email,
            "password": test_password,
            "full_name": test_name,
            "company": test_company
        }
        
        result = self.run_test("User Registration", "POST", "auth/register", 200, register_data)
        if result:
            self.token = result.get("access_token")
            self.user_id = result.get("user", {}).get("id")
            print(f"   Registered user: {test_email}")

        # Test login
        login_data = {
            "email": test_email,
            "password": test_password
        }
        
        result = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        if result:
            self.token = result.get("access_token")
            self.user_id = result.get("user", {}).get("id")

        # Test get current user
        self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_subscription_endpoints(self):
        """Test subscription related endpoints"""
        print("\n🔍 Testing Subscription Endpoints...")
        
        # Get subscription tiers
        self.run_test("Get Subscription Tiers", "GET", "subscriptions/tiers", 200)

    def test_notes_crud(self):
        """Test notes CRUD operations"""
        print("\n🔍 Testing Notes CRUD...")
        
        # Create note
        note_data = {
            "title": "Test Note",
            "content": "This is a test note for plumbing job",
            "tags": ["test", "plumbing"]
        }
        
        result = self.run_test("Create Note", "POST", "notes", 200, note_data)
        note_id = result.get("id") if result else None

        # Get all notes
        self.run_test("Get All Notes", "GET", "notes", 200)

        # Update note
        if note_id:
            update_data = {
                "title": "Updated Test Note",
                "content": "Updated content"
            }
            self.run_test("Update Note", "PUT", f"notes/{note_id}", 200, update_data)

        # Delete note
        if note_id:
            self.run_test("Delete Note", "DELETE", f"notes/{note_id}", 200)

    def test_timesheet_operations(self):
        """Test timesheet operations"""
        print("\n🔍 Testing Timesheet Operations...")
        
        # Create timesheet entry
        timesheet_data = {
            "job_name": "Test Plumbing Job",
            "date": "2025-01-15",
            "start_time": "08:00",
            "end_time": "17:00",
            "break_minutes": 60,
            "notes": "Installed new pipes"
        }
        
        result = self.run_test("Create Timesheet", "POST", "timesheets", 200, timesheet_data)
        timesheet_id = result.get("id") if result else None

        # Get all timesheets
        self.run_test("Get All Timesheets", "GET", "timesheets", 200)

        # Delete timesheet
        if timesheet_id:
            self.run_test("Delete Timesheet", "DELETE", f"timesheets/{timesheet_id}", 200)

    def test_material_lists(self):
        """Test material list operations"""
        print("\n🔍 Testing Material Lists...")
        
        # Create material list
        material_data = {
            "job_name": "Test Job Materials",
            "items": [
                {
                    "name": "PVC Pipe 4 inch",
                    "quantity": 10,
                    "unit": "feet",
                    "unit_price": 5.50,
                    "notes": "For main drain line"
                },
                {
                    "name": "Pipe Fittings",
                    "quantity": 5,
                    "unit": "pieces",
                    "unit_price": 12.00
                }
            ]
        }
        
        result = self.run_test("Create Material List", "POST", "materials", 200, material_data)
        material_id = result.get("id") if result else None

        # Get all material lists
        self.run_test("Get All Material Lists", "GET", "materials", 200)

        # Delete material list
        if material_id:
            self.run_test("Delete Material List", "DELETE", f"materials/{material_id}", 200)

    def test_job_bidding(self):
        """Test job bidding operations"""
        print("\n🔍 Testing Job Bidding...")
        
        # Create bid
        bid_data = {
            "job_name": "Bathroom Renovation",
            "client_name": "John Smith",
            "client_contact": "john@example.com",
            "description": "Complete bathroom plumbing renovation",
            "labor_hours": 40,
            "hourly_rate": 75.00,
            "material_cost": 1500.00,
            "markup_percent": 20.0,
            "notes": "Includes all fixtures and connections"
        }
        
        result = self.run_test("Create Job Bid", "POST", "bids", 200, bid_data)
        bid_id = result.get("id") if result else None

        # Get all bids
        self.run_test("Get All Bids", "GET", "bids", 200)

        # Update bid status
        if bid_id:
            self.run_test("Update Bid Status", "PUT", f"bids/{bid_id}/status?status=sent", 200)

        # Delete bid
        if bid_id:
            self.run_test("Delete Bid", "DELETE", f"bids/{bid_id}", 200)

    def test_calendar_events(self):
        """Test calendar operations"""
        print("\n🔍 Testing Calendar Events...")
        
        # Create calendar event
        event_data = {
            "title": "Site Visit",
            "description": "Initial site inspection",
            "date": "2025-01-20",
            "start_time": "10:00",
            "end_time": "11:00",
            "event_type": "inspection"
        }
        
        result = self.run_test("Create Calendar Event", "POST", "calendar", 200, event_data)
        event_id = result.get("id") if result else None

        # Get all events
        self.run_test("Get All Calendar Events", "GET", "calendar", 200)

        # Delete event
        if event_id:
            self.run_test("Delete Calendar Event", "DELETE", f"calendar/{event_id}", 200)

    def test_safety_talks(self):
        """Test safety talks (AI generated)"""
        print("\n🔍 Testing Safety Talks...")
        
        # Get today's safety talk (AI generated)
        self.run_test("Get Today's Safety Talk", "GET", "safety-talks/today", 200)
        
        # Get safety talk history
        self.run_test("Get Safety Talk History", "GET", "safety-talks/history", 200)

    def test_formulas(self):
        """Test plumbing formulas"""
        print("\n🔍 Testing Plumbing Formulas...")
        
        # Get all formulas
        self.run_test("Get All Formulas", "GET", "formulas", 200)
        
        # Test formula calculation - pipe volume
        calc_data = {
            "r": 2.0,  # radius in inches
            "L": 10.0  # length in feet
        }
        self.run_test("Calculate Pipe Volume", "POST", "formulas/calculate?formula_id=pipe-volume", 200, calc_data)
        
        # Test another formula - head pressure
        calc_data = {
            "H": 50.0  # height in feet
        }
        self.run_test("Calculate Head Pressure", "POST", "formulas/calculate?formula_id=head-pressure", 200, calc_data)

    def test_osha_requirements(self):
        """Test OSHA requirements"""
        print("\n🔍 Testing OSHA Requirements...")
        
        # Get all OSHA requirements
        self.run_test("Get All OSHA Requirements", "GET", "osha", 200)
        
        # Get specific OSHA requirement
        self.run_test("Get Specific OSHA Requirement", "GET", "osha/ppe", 200)

    def test_safety_data_sheets(self):
        """Test Safety Data Sheets"""
        print("\n🔍 Testing Safety Data Sheets...")
        
        # Get all SDS
        self.run_test("Get All Safety Data Sheets", "GET", "sds", 200)
        
        # Get specific SDS
        self.run_test("Get Specific SDS", "GET", "sds/pvc-cement", 200)

    def test_total_station_info(self):
        """Test Total Station reference info"""
        print("\n🔍 Testing Total Station Info...")
        
        # Get total station information
        self.run_test("Get Total Station Info", "GET", "total-station", 200)

    def test_blueprints(self):
        """Test blueprint operations"""
        print("\n🔍 Testing Blueprints...")
        
        # Get all blueprints
        self.run_test("Get All Blueprints", "GET", "blueprints", 200)
        
        # Note: File upload test would require actual PDF file
        # For now, just test the GET endpoints

    def test_photos_api(self):
        """Test photo upload and management (NEW FEATURE)"""
        print("\n🔍 Testing Photos API (NEW FEATURE)...")
        
        # Get all photos
        self.run_test("Get All Photos", "GET", "photos", 200)
        
        # Get photos filtered by type
        self.run_test("Get Photos by Type", "GET", "photos?linked_type=note", 200)
        
        # Note: File upload test would require actual image file
        # For now, just test the GET endpoints

    def test_notification_settings(self):
        """Test notification settings (NEW FEATURE)"""
        print("\n🔍 Testing Notification Settings (NEW FEATURE)...")
        
        # Get notification settings
        self.run_test("Get Notification Settings", "GET", "notifications/settings", 200)
        
        # Update notification settings
        settings_data = {
            "calendar_reminders": True,
            "reminder_minutes_before": 30,
            "daily_safety_talk": True,
            "safety_talk_time": "07:00",
            "browser_notifications": True
        }
        self.run_test("Update Notification Settings", "PUT", "notifications/settings", 200, settings_data)
        
        # Get upcoming notifications
        self.run_test("Get Upcoming Notifications", "GET", "notifications/upcoming", 200)

    def test_export_endpoints(self):
        """Test PDF export endpoints (NEW FEATURE)"""
        print("\n🔍 Testing Export Endpoints (NEW FEATURE)...")
        
        # Create a timesheet first for export testing
        timesheet_data = {
            "job_name": "Export Test Job",
            "date": "2025-01-15",
            "start_time": "08:00",
            "end_time": "17:00",
            "break_minutes": 60,
            "notes": "Test entry for export"
        }
        
        timesheet_result = self.run_test("Create Timesheet for Export", "POST", "timesheets", 200, timesheet_data)
        
        # Test timesheet export
        self.run_test("Export Timesheets", "GET", "export/timesheets", 200)
        self.run_test("Export Timesheets with Date Range", "GET", "export/timesheets?start_date=2025-01-01&end_date=2025-01-31", 200)
        
        # Create a bid for export testing
        bid_data = {
            "job_name": "Export Test Bid",
            "client_name": "Test Client",
            "client_contact": "test@example.com",
            "description": "Test bid for export",
            "labor_hours": 10,
            "hourly_rate": 75.00,
            "material_cost": 500.00,
            "markup_percent": 15.0
        }
        
        bid_result = self.run_test("Create Bid for Export", "POST", "bids", 200, bid_data)
        bid_id = bid_result.get("id") if bid_result else None
        
        # Test bid export
        if bid_id:
            self.run_test("Export Bid", "GET", f"export/bids/{bid_id}", 200)

    def test_offline_sync(self):
        """Test offline sync endpoints (NEW FEATURE)"""
        print("\n🔍 Testing Offline Sync (NEW FEATURE)...")
        
        # Get sync data
        self.run_test("Get Sync Data", "GET", "sync/data", 200)
        
        # Test sync pending data (empty for now)
        sync_data = {
            "pending_notes": [],
            "pending_timesheets": [],
            "pending_events": []
        }
        self.run_test("Sync Pending Data", "POST", "sync/pending", 200, sync_data)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting PlumbPro API Tests...")
        print(f"Testing against: {self.base_url}")
        
        try:
            # Basic health checks
            self.test_health_check()
            
            # Authentication flow (must be first to get token)
            self.test_auth_flow()
            
            if not self.token:
                print("❌ Authentication failed - cannot continue with protected endpoints")
                return False
            
            # Test all protected endpoints
            self.test_subscription_endpoints()
            self.test_notes_crud()
            self.test_timesheet_operations()
            self.test_material_lists()
            self.test_job_bidding()
            self.test_calendar_events()
            self.test_safety_talks()
            self.test_formulas()
            self.test_osha_requirements()
            self.test_safety_data_sheets()
            self.test_total_station_info()
            self.test_blueprints()
            
            # Test NEW FEATURES
            self.test_photos_api()
            self.test_notification_settings()
            self.test_export_endpoints()
            self.test_offline_sync()
            
            return True
            
        except Exception as e:
            print(f"❌ Test suite failed with exception: {e}")
            return False

    def print_summary(self):
        """Print test summary"""
        print(f"\n📊 Test Summary:")
        print(f"   Tests Run: {self.tests_run}")
        print(f"   Tests Passed: {self.tests_passed}")
        print(f"   Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "   Success Rate: 0%")
        
        if self.tests_passed != self.tests_run:
            print(f"\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   - {result['test']}: {result['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = PlumbProAPITester()
    
    success = tester.run_all_tests()
    all_passed = tester.print_summary()
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())