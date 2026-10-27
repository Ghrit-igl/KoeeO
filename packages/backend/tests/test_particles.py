"""
TDD Tests for N-Body Particle Dynamics Engine.

Tests energy conservation, momentum conservation, particle count,
and deterministic integration using Verlet method.
"""

import pytest

from app.engine.particles import ParticleSystem


class TestParticleCreation:
    """Tests for particle system initialization."""

    def test_particle_count(self):
        """System should create the requested number of particles."""
        ps = ParticleSystem(num_particles=50, force_type="gravity")
        state = ps.get_state()
        assert len(state["positions"]) == 50
        assert len(state["velocities"]) == 50

    def test_custom_particle_count(self):
        """System should support custom particle counts."""
        ps = ParticleSystem(num_particles=10, force_type="gravity")
        state = ps.get_state()
        assert len(state["positions"]) == 10

    def test_positions_are_3d(self):
        """Each particle position should be a 3D coordinate."""
        ps = ParticleSystem(num_particles=5, force_type="gravity")
        state = ps.get_state()
        for pos in state["positions"]:
            assert len(pos) == 3

    def test_velocities_are_3d(self):
        """Each particle velocity should be a 3D vector."""
        ps = ParticleSystem(num_particles=5, force_type="gravity")
        state = ps.get_state()
        for vel in state["velocities"]:
            assert len(vel) == 3


class TestEnergyConservation:
    """Tests for energy conservation in Verlet integration."""

    def test_energy_conservation_gravity(self):
        """Total energy should change less than 1% over 100 steps for gravity."""
        ps = ParticleSystem(num_particles=20, force_type="gravity", dt=0.001, softening=0.5)
        initial_state = ps.get_state()
        initial_energy = initial_state["total_energy"]

        for _ in range(100):
            ps.step()

        final_state = ps.get_state()
        final_energy = final_state["total_energy"]

        # Energy should be conserved within 1%
        if abs(initial_energy) > 1e-10:
            relative_change = abs(final_energy - initial_energy) / abs(initial_energy)
            assert relative_change < 0.01, (
                f"Energy not conserved: {initial_energy:.6f} → {final_energy:.6f} "
                f"(change: {relative_change * 100:.2f}%)"
            )

    def test_energy_conservation_electromagnetic(self):
        """Total energy should change less than 1% over 100 steps for EM."""
        ps = ParticleSystem(num_particles=20, force_type="electromagnetic", dt=0.001, softening=0.5)
        initial_state = ps.get_state()
        initial_energy = initial_state["total_energy"]

        for _ in range(100):
            ps.step()

        final_state = ps.get_state()
        final_energy = final_state["total_energy"]

        if abs(initial_energy) > 1e-10:
            relative_change = abs(final_energy - initial_energy) / abs(initial_energy)
            assert relative_change < 0.01


class TestMomentumConservation:
    """Tests for momentum conservation."""

    def test_momentum_conservation(self):
        """Total momentum should change less than 1% over 100 steps."""
        ps = ParticleSystem(num_particles=20, force_type="gravity", dt=0.001, softening=0.5)
        initial_state = ps.get_state()
        initial_momentum = initial_state["total_momentum"]

        for _ in range(100):
            ps.step()

        final_state = ps.get_state()
        final_momentum = final_state["total_momentum"]

        # Momentum magnitude should be conserved
        # Use absolute tolerance since momentum can start near zero
        for i in range(3):
            assert abs(final_momentum[i] - initial_momentum[i]) < 0.01, (
                f"Momentum component {i} not conserved: "
                f"{initial_momentum[i]:.6f} → {final_momentum[i]:.6f}"
            )


class TestVerletDeterminism:
    """Tests for deterministic behavior."""

    def test_verlet_deterministic(self):
        """Same initial conditions and seed should produce identical results."""
        ps1 = ParticleSystem(num_particles=15, force_type="gravity", dt=0.001, seed=42)
        ps2 = ParticleSystem(num_particles=15, force_type="gravity", dt=0.001, seed=42)

        for _ in range(50):
            ps1.step()
            ps2.step()

        state1 = ps1.get_state()
        state2 = ps2.get_state()

        # Positions should be identical
        for p1, p2 in zip(state1["positions"], state2["positions"]):
            for a, b in zip(p1, p2):
                assert abs(a - b) < 1e-12

    def test_result_json_serializable(self):
        """State dict must be JSON-serializable."""
        import json
        ps = ParticleSystem(num_particles=5, force_type="gravity")
        ps.step()
        state = ps.get_state()
        json.dumps(state)
