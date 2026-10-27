"""
WebSocket Telemetry Manager — KoeeO Science Lab.

Manages WebSocket connections per experiment and broadcasts
simulation telemetry frames at 30Hz as JSON.
"""

import asyncio
import json
from typing import Any
from fastapi import WebSocket


class ConnectionManager:
    """
    Manages WebSocket connections grouped by experiment ID.

    Tracks active connections, handles connect/disconnect gracefully,
    and broadcasts telemetry frames to all clients of an experiment.
    """

    def __init__(self):
        # experiment_id → set of active WebSocket connections
        self._connections: dict[str, set[WebSocket]] = {}

    async def connect(self, experiment_id: str, websocket: WebSocket) -> None:
        """
        Accept and register a WebSocket connection for an experiment.

        Args:
            experiment_id: The experiment to subscribe to.
            websocket: The WebSocket connection to register.
        """
        await websocket.accept()
        if experiment_id not in self._connections:
            self._connections[experiment_id] = set()
        self._connections[experiment_id].add(websocket)

    async def disconnect(self, experiment_id: str, websocket: WebSocket) -> None:
        """
        Remove a WebSocket connection from an experiment's subscriber list.

        Args:
            experiment_id: The experiment to unsubscribe from.
            websocket: The WebSocket connection to remove.
        """
        if experiment_id in self._connections:
            self._connections[experiment_id].discard(websocket)
            if not self._connections[experiment_id]:
                del self._connections[experiment_id]

    async def broadcast(self, experiment_id: str, data: dict) -> None:
        """
        Broadcast a telemetry frame to all connected clients of an experiment.

        Disconnected clients are automatically cleaned up.

        Args:
            experiment_id: The experiment whose clients should receive the data.
            data: The telemetry frame dict to send as JSON.
        """
        if experiment_id not in self._connections:
            return

        dead_connections = set()
        for ws in self._connections[experiment_id]:
            try:
                await ws.send_json(data)
            except Exception:
                dead_connections.add(ws)

        # Clean up dead connections
        for ws in dead_connections:
            self._connections[experiment_id].discard(ws)

    def get_connection_count(self, experiment_id: str) -> int:
        """Get the number of active connections for an experiment."""
        return len(self._connections.get(experiment_id, set()))

    def get_all_experiment_ids(self) -> list[str]:
        """Get all experiment IDs with active connections."""
        return list(self._connections.keys())
