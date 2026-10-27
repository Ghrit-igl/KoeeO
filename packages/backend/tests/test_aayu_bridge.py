"""
TDD Tests for AAYU Silicon Engine Bridge.

Tests subprocess spawning, version reporting, and timeout handling
for the D:\\INTENT-TO-SILICON\\bin\\aayu.exe bridge.
"""

import pytest
from unittest.mock import patch, MagicMock
import subprocess
import json

from app.engine.aayu_bridge import AAYUBridge


class TestAAYUVersion:
    """Tests for AAYU version reporting."""

    @patch("app.engine.aayu_bridge.subprocess.run")
    def test_aayu_version(self, mock_run):
        """Bridge should report AAYU v1.5.0 from the subprocess."""
        mock_run.return_value = MagicMock(
            stdout=json.dumps({"version": "1.5.0"}),
            stderr="",
            returncode=0,
        )
        bridge = AAYUBridge()
        version = bridge.get_version()
        assert version == "1.5.0"

    @patch("app.engine.aayu_bridge.subprocess.run")
    def test_aayu_version_calls_correct_exe(self, mock_run):
        """Bridge should call the correct AAYU executable path."""
        mock_run.return_value = MagicMock(
            stdout=json.dumps({"version": "1.5.0"}),
            stderr="",
            returncode=0,
        )
        bridge = AAYUBridge()
        bridge.get_version()
        call_args = mock_run.call_args
        assert r"D:\INTENT-TO-SILICON\bin\aayu.exe" in call_args[0][0]


class TestAAYUExecution:
    """Tests for AAYU script execution."""

    @patch("app.engine.aayu_bridge.subprocess.run")
    def test_aayu_execute_returns_result(self, mock_run):
        """Executing an AAYU script should return parsed JSON result."""
        expected = {"invariant": True, "eigenvalue": 3.14}
        mock_run.return_value = MagicMock(
            stdout=json.dumps(expected),
            stderr="",
            returncode=0,
        )
        bridge = AAYUBridge()
        result = bridge.execute("check_invariant(mobius_strip)")
        assert result == expected

    @patch("app.engine.aayu_bridge.subprocess.run")
    def test_aayu_execution_timeout(self, mock_run):
        """Bridge should handle timeout gracefully (max 5 seconds)."""
        mock_run.side_effect = subprocess.TimeoutExpired(cmd="aayu.exe", timeout=5)
        bridge = AAYUBridge()
        with pytest.raises(TimeoutError, match="AAYU execution timed out"):
            bridge.execute("infinite_loop()")

    @patch("app.engine.aayu_bridge.subprocess.run")
    def test_aayu_execution_failure(self, mock_run):
        """Bridge should raise RuntimeError on non-zero exit code."""
        mock_run.return_value = MagicMock(
            stdout="",
            stderr="Syntax error in script",
            returncode=1,
        )
        bridge = AAYUBridge()
        with pytest.raises(RuntimeError, match="AAYU execution failed"):
            bridge.execute("bad_script()")

    @patch("app.engine.aayu_bridge.subprocess.run")
    def test_aayu_invalid_json_output(self, mock_run):
        """Bridge should handle invalid JSON output gracefully."""
        mock_run.return_value = MagicMock(
            stdout="not valid json {{{",
            stderr="",
            returncode=0,
        )
        bridge = AAYUBridge()
        with pytest.raises(ValueError, match="Invalid JSON"):
            bridge.execute("some_script()")
