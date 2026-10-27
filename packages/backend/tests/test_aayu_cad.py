"""
Tests for AAYU Dynamic CAD & Mechanical Stress Physics Engine.

Verifies multi-part assembly generation, finite element stress invariants,
material upgrades (Titanium, Forged Carbon), and SimulationManager integration.
"""

import pytest
from app.engine.aayu_cad_driver import run_aayu_cad_simulation
from app.engine.simulation import SimulationManager


def test_aayu_cad_kawasaki_execution():
    """Verify AAYU execution of Kawasaki Ninja H2R supercharged engine."""
    data = run_aayu_cad_simulation(
        prompt="Kawasaki Ninja H2R Supercharged 998cc",
        rpm=14000.0,
        boost_bar=2.4,
        piston_material="titanium_ti6al4v",
        supercharger_material="forged_carbon",
        exploded_factor=0.5,
        frame=0,
    )

    assert "AAYU" in data["engine"]
    assert "Kawasaki" in data["model_name"]
    assert len(data["parts"]) >= 7

    telem = data["telemetry"]
    assert telem["rpm"] == 14000.0
    assert telem["boost_bar"] == 2.4
    assert telem["horsepower"] > 400.0
    assert telem["impeller_rpm"] > 100000.0
    assert telem["mach_number"] > 1.0  # Supersonic impeller tip speed!
    assert telem["yield_mpa"] == 950.0  # Ti-6Al-4V


def test_aayu_cad_material_upgrade_safety():
    """Verify material swap to forged carbon increases yield strength and safety factor."""
    stock = run_aayu_cad_simulation(
        prompt="Twin Turbo V8",
        rpm=8500.0,
        boost_bar=2.2,
        piston_material="forged_aluminum_7075",
    )

    upgraded = run_aayu_cad_simulation(
        prompt="Twin Turbo V8",
        rpm=8500.0,
        boost_bar=2.2,
        piston_material="forged_carbon",
    )

    # Forged carbon yield is 1200 MPa vs Aluminum 505 MPa
    assert upgraded["telemetry"]["yield_mpa"] > stock["telemetry"]["yield_mpa"]
    assert upgraded["telemetry"]["safety_factor"] > stock["telemetry"]["safety_factor"]


def test_aayu_cad_simulation_manager():
    """Verify SimulationManager supports 'dynamic_cad' experiment type."""
    sm = SimulationManager()
    exp_id = sm.create(
        "dynamic_cad",
        {
            "prompt": "Pratt & Whitney J58 Afterburning Turbo-Ramjet",
            "rpm": 7200.0,
            "boost_bar": 3.5,
            "exploded_factor": 0.3,
        },
    )

    step_data = sm.step(exp_id)
    assert step_data["type"] == "dynamic_cad"
    assert "AAYU" in step_data["data"]["engine"]
    assert len(step_data["data"]["parts"]) >= 4

    sm.destroy(exp_id)
