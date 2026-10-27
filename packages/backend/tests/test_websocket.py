"""
TDD Tests for WebSocket telemetry streaming.

Tests WebSocket connectivity and telemetry frame delivery
using FastAPI's TestClient WebSocket support.
"""

import json
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.engine.simulation import SimulationManager


class TestWebSocketConnect:
    """Tests for WebSocket connection lifecycle."""

    def test_ws_connect(self):
        """WebSocket connection to a valid experiment should succeed."""
        client = TestClient(app)
        # Create an experiment first via HTTP
        response = client.post(
            "/api/experiments",
            json={"type": "particles", "parameters": {"num_particles": 5}}
        )
        exp_id = response.json()["experiment_id"]

        with client.websocket_connect(f"/ws/telemetry/{exp_id}") as ws:
            # Connection established — receive at least one frame
            data = ws.receive_json()
            assert "experiment_id" in data
            assert data["experiment_id"] == exp_id

    def test_ws_receives_telemetry(self):
        """Client should receive telemetry JSON frames with simulation data."""
        client = TestClient(app)
        response = client.post(
            "/api/experiments",
            json={"type": "mobius", "parameters": {}}
        )
        exp_id = response.json()["experiment_id"]

        with client.websocket_connect(f"/ws/telemetry/{exp_id}") as ws:
            data = ws.receive_json()
            # Telemetry frame should have required fields
            assert "type" in data
            assert "frame" in data
            assert "data" in data
            assert "timestamp" in data

    def test_ws_invalid_experiment_closes(self):
        """WebSocket to a nonexistent experiment should close with error."""
        client = TestClient(app)
        with pytest.raises(Exception):
            with client.websocket_connect("/ws/telemetry/nonexistent-id") as ws:
                ws.receive_json()
