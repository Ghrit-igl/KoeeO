"""
Tests for AAYU Intent-to-Silicon Quantum Engine.

Verifies Bell state entanglement, Grover 2-qubit search, Quantum Teleportation,
Cooley-Tukey FFT, and SimulationManager integration.
"""

import pytest
from app.engine.aayu_kernel import run_aayu_quantum_simulation
from app.engine.simulation import SimulationManager


def test_aayu_quantum_kernel_execution():
    """Verify AAYU Bell state and GHZ state output."""
    data = run_aayu_quantum_simulation(target_qubit=3, alpha=0.6, beta=0.8, frame=0)

    assert "engine" in data
    assert "AAYU" in data["engine"]
    assert data["silicon_nan_boxed"] is True

    # Bell state verification
    bell = data["bell_state"]
    assert bell["entangled"] is True
    probs = bell["probabilities"]
    assert probs["00"] == pytest.approx(0.5, abs=0.05)
    assert probs["11"] == pytest.approx(0.5, abs=0.05)
    assert probs["01"] == pytest.approx(0.0, abs=0.01)
    assert probs["10"] == pytest.approx(0.0, abs=0.01)

    # GHZ state
    ghz = data["ghz_state"]
    assert ghz["num_qubits"] == 3
    assert ghz["p000"] == pytest.approx(0.5, abs=0.05)
    assert ghz["p111"] == pytest.approx(0.5, abs=0.05)


def test_aayu_grover_search():
    """Verify Grover 2-qubit search achieves 100% amplitude amplification."""
    for target in [0, 1, 2, 3]:
        data = run_aayu_quantum_simulation(target_qubit=target, frame=0)
        grover = data["grover_search"]
        assert grover["target_state"] == target
        assert grover["amplified_probability_pct"] == pytest.approx(100.0, abs=1.0)
        assert grover["is_exact_match"] is True
        assert grover["distribution"][target] == pytest.approx(1.0, abs=0.01)


def test_aayu_teleportation_and_fft():
    """Verify Quantum Teleportation fidelity and Cooley-Tukey FFT."""
    data = run_aayu_quantum_simulation(target_qubit=1, alpha=0.6, beta=0.8, frame=5)
    
    # Teleportation
    tele = data["teleportation"]
    assert tele["verified"] is True
    assert tele["fidelity_pct"] == pytest.approx(100.0, abs=0.5)

    # FFT
    fft = data["scientific_fft"]
    assert "Cooley-Tukey" in fft["algorithm"]
    mags = fft["spectrum_magnitudes"]
    assert len(mags) == 4
    assert mags[0] > 0.0


def test_aayu_simulation_manager_integration():
    """Verify SimulationManager handles 'aayu_quantum' experiment type."""
    sm = SimulationManager()
    exp_id = sm.create("aayu_quantum", {"grover_target": 2, "alpha": 0.8, "beta": 0.6})
    
    frame1 = sm.step(exp_id)
    assert frame1["type"] == "aayu_quantum"
    assert frame1["data"]["engine"].startswith("AAYU")
    assert frame1["data"]["grover_search"]["target_state"] == 2
    assert frame1["data"]["grover_search"]["is_exact_match"] is True

    sm.destroy(exp_id)
    with pytest.raises(KeyError):
        sm.get_experiment(exp_id)
