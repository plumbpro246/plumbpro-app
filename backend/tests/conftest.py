"""Shared test configuration — credentials from environment."""
import os

TEST_EMAIL = os.getenv("TEST_EMAIL", "testplumber@test.com")
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "Test1234!")
OWNER_EMAIL = os.getenv("OWNER_EMAIL", "plumbpro246@gmail.com")
OWNER_PASSWORD = os.getenv("OWNER_PASSWORD", "PlumbPro2025!")
