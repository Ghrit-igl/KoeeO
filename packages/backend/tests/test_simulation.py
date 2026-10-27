"""
TDD Tests for SimulationManager orchestration.

Tests experiment lifecycle: creation, stepping, destruction,
and telemetry frame structure.
"""

import pytest

from app.engine.simulation import SimulationManager


class TestExperimentCreation:
    """Tests for creating experiments."""

    def test_create_experiment(self):
        """create() should return a valid experiment ID string."""
        mgr = SimulationManager()
        exp_id = mgr.create("mobius", {"u_resolution": 30, "v_resolution": 8})
        assert isinstance(exp_id, str)
        assert len(exp_id) > 0

    def test_create_multiple_experiments(self):
        """Multiple experiments should have unique IDs."""
        mgr = SimulationManager()
        id1 = mgr.create("mobius", {})
        id2 = mgr.create("molecular", {"molecule": "H2O"})
        id3 = mgr.create("particles", {"num_particles": 30})
        assert id1 != id2 != id3

    def test_create_unknown_type_raises(self):
        """Creating an experiment with unknown type should raise ValueError."""
        mgr = SimulationManager()
        with pytest.raises(ValueError, match="Unknown experiment type"):
            mgr.create("quantum_teleporter", {})


class TestExperimentStepping:
    """Tests for advancing experiments."""

    def test_step_returns_telemetry(self):
        """step() should return a dict with required telemetry keys."""
        mgr = SimulationManager()
        exp_id = mgr.create("mobius", {})
        telemetry = mgr.step(exp_id)
        assert isinstance(telemetry, dict)
        assert "experiment_id" in telemetry
        assert "type" in telemetry
        assert "frame" in telemetry
        assert "timestamp" in telemetry
        assert "data" in telemetry

    def test_step_increments_frame(self):
        """Each step should increment the frame counter."""
        mgr = SimulationManager()
        exp_id = mgr.create("particles", {"num_particles": 10})
        t1 = mgr.step(exp_id)
        t2 = mgr.step(exp_id)
        assert t2["frame"] == t1["frame"] + 1

    def test_step_nonexistent_raises(self):
        """Stepping a nonexistent experiment should raise KeyError."""
        mgr = SimulationManager()
        with pytest.raises(KeyError):
            mgr.step("nonexistent-id")


class TestExperimentDestruction:
    """Tests for destroying experiments."""

    def test_destroy_experiment(self):
        """Destroyed experiment should no longer be steppable."""
        mgr = SimulationManager()
        exp_id = mgr.create("mobius", {})
        mgr.destroy(exp_id)
        with pytest.raises(KeyError):
            mgr.step(exp_id)

    def test_destroy_nonexistent_raises(self):
        """Destroying a nonexistent experiment should raise KeyError."""
        mgr = SimulationManager()
        with pytest.raises(KeyError):
            mgr.destroy("nonexistent-id")


class TestExperimentListing:
    """Tests for listing experiments."""

    def test_list_experiments(self):
        """Should list all active experiments."""
        mgr = SimulationManager()
        mgr.create("mobius", {})
        mgr.create("particles", {})
        experiments = mgr.list_experiments()
        assert len(experiments) == 2

    def test_list_after_destroy(self):
        """Destroyed experiments should not appear in listing."""
        mgr = SimulationManager()
        id1 = mgr.create("mobius", {})
        mgr.create("particles", {})
        mgr.destroy(id1)
        experiments = mgr.list_experiments()
        assert len(experiments) == 1
