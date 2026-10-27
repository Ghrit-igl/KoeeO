"""
RETER Security Gate — KoeeO Science Lab.

Integrates with the RETER AST Firewall (D:\\reter\\reter_real_ast_engine.py)
to verify experiment scripts for safety before execution.
"""

import importlib.util
import sys
from pathlib import Path
from typing import Any


# Path to the RETER real AST engine
RETER_ENGINE_PATH = Path(r"D:\reter\reter_real_ast_engine.py")


def _load_reter_engine():
    """
    Dynamically load the RETER AST taint engine module.

    Returns:
        The loaded module, or None if not available.
    """
    if not RETER_ENGINE_PATH.exists():
        return None

    spec = importlib.util.spec_from_file_location(
        "reter_real_ast_engine", str(RETER_ENGINE_PATH)
    )
    if spec is None or spec.loader is None:
        return None

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def verify_code(code: str, language: str = "python") -> dict:
    """
    Verify code safety using the RETER AST Firewall.

    Analyzes the given code for potential security issues using
    real AST taint analysis.

    Args:
        code: Source code to analyze.
        language: Programming language ("python", "javascript", etc.).

    Returns:
        Dict with:
            - safe (bool): Whether the code passed security checks.
            - findings (list): List of security findings/warnings.
            - engine (str): Which engine performed the analysis.
    """
    reter = _load_reter_engine()

    if reter is None:
        # Fallback: basic safety check when RETER is not available
        return _fallback_verify(code, language)

    try:
        # Use the RealASTTaintEngine from RETER
        engine = reter.RealASTTaintEngine()
        if language == "javascript" or language == "typescript":
            diagnostics = engine.analyze_javascript("<inline>", code)
        else:
            diagnostics = engine.analyze_python("<inline>", code)

        findings = []
        for d in diagnostics:
            findings.append({
                "rule_id": getattr(d, "rule_id", "RETER_TAINT"),
                "severity": getattr(d, "severity", "ERROR"),
                "message": getattr(d, "message", str(d)),
                "line": getattr(d, "line", 1),
            })

        # Also run fallback safety rules to catch obvious dangerous operations
        fallback_res = _fallback_verify(code, language)
        if not fallback_res["safe"]:
            findings.extend(fallback_res["findings"])

        return {
            "safe": len(findings) == 0,
            "findings": findings,
            "engine": "reter_real_ast",
        }
    except Exception as e:
        # If RETER fails, fall back to basic checks
        fallback = _fallback_verify(code, language)
        fallback["engine"] = f"reter_fallback (error: {str(e)})"
        return fallback


def _fallback_verify(code: str, language: str) -> dict:
    """
    Basic fallback security check when RETER is unavailable.

    Checks for obviously dangerous patterns.
    """
    findings = []
    dangerous_patterns = [
        ("import os", "Direct OS module import detected"),
        ("subprocess", "Subprocess usage detected"),
        ("eval(", "Use of eval() detected"),
        ("exec(", "Use of exec() detected"),
        ("__import__", "Dynamic import detected"),
        ("open(", "File I/O detected"),
        ("shutil", "File manipulation detected"),
        ("sys.exit", "System exit call detected"),
    ]

    for pattern, message in dangerous_patterns:
        if pattern in code:
            findings.append(message)

    return {
        "safe": len(findings) == 0,
        "findings": findings,
        "engine": "fallback_pattern_match",
    }
