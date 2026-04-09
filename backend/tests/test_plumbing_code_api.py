"""
Test suite for Plumbing Code API endpoints
Tests UPC/IPC code types, editions (2015/2018/2021/2024), and search functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPlumbingCodeTypes:
    """Test /api/plumbing-code/types endpoint"""
    
    def test_get_code_types_returns_both_upc_and_ipc(self):
        """Verify both UPC and IPC code types are returned"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code/types")
        assert response.status_code == 200
        
        data = response.json()
        assert "upc" in data
        assert "ipc" in data
        
        # Verify UPC details
        assert data["upc"]["name"] == "Uniform Plumbing Code"
        assert data["upc"]["publisher"] == "IAPMO"
        
        # Verify IPC details
        assert data["ipc"]["name"] == "International Plumbing Code"
        assert data["ipc"]["publisher"] == "ICC"
    
    def test_code_types_have_four_editions(self):
        """Verify each code type has 2015, 2018, 2021, 2024 editions"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code/types")
        assert response.status_code == 200
        
        data = response.json()
        expected_editions = ["2015", "2018", "2021", "2024"]
        
        assert sorted(data["upc"]["editions"]) == expected_editions
        assert sorted(data["ipc"]["editions"]) == expected_editions


class TestPlumbingCodeUPC:
    """Test UPC plumbing code endpoints"""
    
    def test_upc_2024_returns_13_chapters(self):
        """UPC 2024 should return 13 chapters including Ch15 and Ch16"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code?code_type=upc&edition=2024")
        assert response.status_code == 200
        
        chapters = response.json()
        assert len(chapters) == 13
        
        # Verify chapter IDs
        chapter_ids = [ch["id"] for ch in chapters]
        assert "ch2" in chapter_ids  # Definitions
        assert "ch15" in chapter_ids  # Alternate Water Sources (2015+)
        assert "ch16" in chapter_ids  # Rainwater Catchment (2021+)
        assert "tables" in chapter_ids
    
    def test_upc_2015_returns_12_chapters(self):
        """UPC 2015 should return 12 chapters (no Ch16)"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code?code_type=upc&edition=2015")
        assert response.status_code == 200
        
        chapters = response.json()
        assert len(chapters) == 12
        
        chapter_ids = [ch["id"] for ch in chapters]
        assert "ch15" in chapter_ids  # Alternate Water Sources exists in 2015
        assert "ch16" not in chapter_ids  # Rainwater Catchment not in 2015
    
    def test_upc_chapter_2_definitions_structure(self):
        """Verify Chapter 2 Definitions has correct structure"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code?code_type=upc&edition=2024")
        assert response.status_code == 200
        
        chapters = response.json()
        ch2 = next((ch for ch in chapters if ch["id"] == "ch2"), None)
        
        assert ch2 is not None
        assert ch2["chapter"] == 2
        assert ch2["title"] == "Definitions"
        assert "sections" in ch2
        assert len(ch2["sections"]) > 0
        
        # Check section structure
        first_section = ch2["sections"][0]
        assert "code" in first_section
        assert "title" in first_section
        assert "content" in first_section


class TestPlumbingCodeIPC:
    """Test IPC plumbing code endpoints"""
    
    def test_ipc_2024_returns_10_chapters(self):
        """IPC 2024 should return 10 chapters"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code?code_type=ipc&edition=2024")
        assert response.status_code == 200
        
        chapters = response.json()
        assert len(chapters) == 10
    
    def test_ipc_2021_returns_10_chapters(self):
        """IPC 2021 should return 10 chapters"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code?code_type=ipc&edition=2021")
        assert response.status_code == 200
        
        chapters = response.json()
        assert len(chapters) == 10
    
    def test_ipc_chapter_2_definitions_different_from_upc(self):
        """IPC Chapter 2 should have different section codes than UPC"""
        upc_response = requests.get(f"{BASE_URL}/api/plumbing-code?code_type=upc&edition=2024")
        ipc_response = requests.get(f"{BASE_URL}/api/plumbing-code?code_type=ipc&edition=2024")
        
        assert upc_response.status_code == 200
        assert ipc_response.status_code == 200
        
        upc_chapters = upc_response.json()
        ipc_chapters = ipc_response.json()
        
        upc_ch2 = next((ch for ch in upc_chapters if ch["id"] == "ch2"), None)
        ipc_ch2 = next((ch for ch in ipc_chapters if ch["id"] == "ch2"), None)
        
        # UPC uses 201.0, 202.0-A format
        # IPC uses 201.1, 202-A format
        upc_codes = [s["code"] for s in upc_ch2["sections"]]
        ipc_codes = [s["code"] for s in ipc_ch2["sections"]]
        
        assert "201.0" in upc_codes
        assert "201.1" in ipc_codes


class TestPlumbingCodeSearch:
    """Test search functionality"""
    
    def test_search_trap_returns_filtered_results(self):
        """Search for 'trap' should return chapters with trap-related content"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code?code_type=upc&edition=2024&search=trap")
        assert response.status_code == 200
        
        chapters = response.json()
        assert len(chapters) > 0
        assert len(chapters) < 13  # Should be filtered, not all chapters
        
        # Verify Chapter 10 (Traps & Interceptors) is included
        chapter_ids = [ch["id"] for ch in chapters]
        assert "ch10" in chapter_ids
    
    def test_search_slope_returns_drainage_chapters(self):
        """Search for 'slope' should return drainage-related chapters"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code?code_type=upc&edition=2024&search=slope")
        assert response.status_code == 200
        
        chapters = response.json()
        assert len(chapters) > 0
        
        # Should include Chapter 7 (Sanitary Drainage) or tables
        chapter_ids = [ch["id"] for ch in chapters]
        assert "ch7" in chapter_ids or "tables" in chapter_ids
    
    def test_search_nonexistent_term_returns_empty(self):
        """Search for non-existent term should return empty or minimal results"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code?code_type=upc&edition=2024&search=xyznonexistent123")
        assert response.status_code == 200
        
        chapters = response.json()
        assert len(chapters) == 0


class TestPlumbingCodeChapterEndpoint:
    """Test /api/plumbing-code/{chapter_id} endpoint"""
    
    def test_get_specific_chapter_by_id(self):
        """Get a specific chapter by ID"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code/ch2?code_type=upc&edition=2024")
        assert response.status_code == 200
        
        chapter = response.json()
        assert chapter["id"] == "ch2"
        assert chapter["title"] == "Definitions"
    
    def test_get_nonexistent_chapter_returns_404(self):
        """Request for non-existent chapter should return 404"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code/ch99?code_type=upc&edition=2024")
        assert response.status_code == 404


class TestPlumbingCodeEditionDifferences:
    """Test edition-specific content differences"""
    
    def test_upc_2024_has_4_dfu_water_closet(self):
        """UPC 2024 should show 4 DFU for water closet (updated from 3)"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code?code_type=upc&edition=2024")
        assert response.status_code == 200
        
        chapters = response.json()
        ch7 = next((ch for ch in chapters if ch["id"] == "ch7"), None)
        
        assert ch7 is not None
        # Check that content mentions 4 DFU for water closet
        ch7_content = str(ch7)
        assert "4 DFU" in ch7_content or "= 4 DFU" in ch7_content
    
    def test_upc_2015_has_3_dfu_water_closet(self):
        """UPC 2015 should show 3 DFU for water closet"""
        response = requests.get(f"{BASE_URL}/api/plumbing-code?code_type=upc&edition=2015")
        assert response.status_code == 200
        
        chapters = response.json()
        ch7 = next((ch for ch in chapters if ch["id"] == "ch7"), None)
        
        assert ch7 is not None
        ch7_content = str(ch7)
        assert "3 DFU" in ch7_content


class TestHealthAndBasicEndpoints:
    """Test basic API health"""
    
    def test_api_health(self):
        """API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_api_root(self):
        """API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        
        data = response.json()
        assert "PlumbPro" in data["message"]
