"""
AAYU Silicon Engine Bridge — KoeeO Science Lab.

Bridges to D:\\INTENT-TO-SILICON\\bin\\aayu.exe for silicon-speed
invariant computation. Writes temporary .aayu scripts, executes
them as subprocesses, and parses JSON results.
"""

import json
import subprocess
import tempfile
import os
from pathlib import Path


# Path to the AAYU executable
AAYU_EXE = r"D:\INTENT-TO-SILICON\bin\aayu.exe"
AAYU_TIMEOUT = 5  # Maximum execution time in seconds


class AAYUBridge:
    """
    Bridge to the AAYU silicon computation engine.

    Spawns the AAYU executable with .aayu script files for heavy
    invariant checks and parses structured JSON output.
    """

    def __init__(self, exe_path: str = AAYU_EXE, timeout: int = AAYU_TIMEOUT):
        self.exe_path = exe_path
        self.timeout = timeout

    def get_version(self) -> str:
        """
        Get the AAYU engine version.

        Returns:
            Version string (e.g., "1.5.0").

        Raises:
            RuntimeError: If the AAYU executable fails.
        """
        result = subprocess.run(
            [self.exe_path, "--version"],
            capture_output=True,
            text=True,
            timeout=self.timeout,
        )
        if result.returncode != 0:
            raise RuntimeError(f"AAYU version check failed: {result.stderr}")

        try:
            data = json.loads(result.stdout)
            if isinstance(data, dict) and "version" in data:
                return data["version"]
        except (json.JSONDecodeError, KeyError):
            pass

        # Fallback to parsing text output like: AAYU Intent-to-Silicon Engine v1.5.0
        import re
        match = re.search(r"v?(\d+\.\d+\.\d+)", result.stdout)
        if match:
            return match.group(1)

        raise ValueError(f"Could not parse version from AAYU output: {result.stdout}")

    def execute(self, script_content: str) -> dict:
        """
        Execute an AAYU script and return the parsed JSON result.

        Writes the script to a temporary .aayu file, runs it via
        the AAYU executable, and returns the parsed output.

        Args:
            script_content: The AAYU script code to execute.

        Returns:
            Parsed JSON dict from AAYU stdout.

        Raises:
            TimeoutError: If execution exceeds the timeout (5 seconds).
            RuntimeError: If AAYU returns a non-zero exit code.
            ValueError: If AAYU output is not valid JSON.
        """
        # Write script to a temporary file
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".aayu",
            delete=False,
            dir=tempfile.gettempdir(),
        ) as f:
            f.write(script_content)
            script_path = f.name

        try:
            result = subprocess.run(
                [self.exe_path, script_path],
                capture_output=True,
                text=True,
                timeout=self.timeout,
            )
        except subprocess.TimeoutExpired:
            raise TimeoutError(
                f"AAYU execution timed out after {self.timeout} seconds"
            )
        finally:
            # Clean up temp file
            try:
                os.unlink(script_path)
            except OSError:
                pass

        if result.returncode != 0:
            raise RuntimeError(
                f"AAYU execution failed (exit code {result.returncode}): "
                f"{result.stderr}"
            )

        try:
            return json.loads(result.stdout)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON from AAYU output: {e}")
