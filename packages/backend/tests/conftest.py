"""
KoeeO Test Configuration — Shared fixtures for the test suite.

Provides FastAPI test client, async client, and common test utilities.
"""

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.fixture
def client():
    """Synchronous FastAPI test client for HTTP endpoint testing."""
    with TestClient(app) as c:
        yield c


@pytest.fixture
async def async_client():
    """Async HTTP client for testing async endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


@pytest.fixture
def ws_client():
    """WebSocket test client."""
    return TestClient(app)
