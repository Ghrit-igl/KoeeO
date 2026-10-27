"""
N-Body Particle Dynamics Engine — KoeeO Science Lab.

Simulates gravitational or electromagnetic N-body interactions using
velocity Verlet integration for stable, energy-conserving dynamics.

Features:
    - Configurable particle count, force type, timestep, and softening
    - Velocity Verlet integrator (symplectic, time-reversible)
    - Conservation law verification (energy + momentum)
    - Deterministic seeded initialization
"""

import numpy as np
from typing import Literal


class ParticleSystem:
    """
    N-body particle dynamics simulator with Verlet integration.

    Args:
        num_particles: Number of particles in the system.
        force_type: Type of force ("gravity" or "electromagnetic").
        dt: Integration timestep.
        softening: Softening length to prevent divergence at small separations.
        seed: Random seed for deterministic initialization.
    """

    def __init__(
        self,
        num_particles: int = 50,
        force_type: Literal["gravity", "electromagnetic"] = "gravity",
        dt: float = 0.01,
        softening: float = 0.1,
        seed: int | None = None,
    ):
        self.num_particles = num_particles
        self.force_type = force_type
        self.dt = dt
        self.softening = softening
        self._rng = np.random.default_rng(seed)

        # Initialize positions in a unit cube, centered at origin
        self.positions = self._rng.uniform(-1, 1, size=(num_particles, 3))
        # Small random initial velocities
        self.velocities = self._rng.uniform(-0.01, 0.01, size=(num_particles, 3))
        # Unit masses
        self.masses = np.ones(num_particles)

        # For electromagnetic simulation, assign random charges ±1
        if force_type == "electromagnetic":
            self.charges = self._rng.choice([-1.0, 1.0], size=num_particles)
        else:
            self.charges = np.ones(num_particles)

        # Pre-compute initial accelerations for Verlet
        self._accelerations = self._compute_accelerations()

    def _compute_accelerations(self) -> np.ndarray:
        """
        Compute accelerations on all particles from pairwise forces.

        Uses softened force law to avoid singularities:
            F_ij = G * m_i * m_j / (r_ij^2 + ε^2)^(3/2) * r_hat_ij

        For electromagnetic: uses Coulomb's law with charge signs.
        """
        acc = np.zeros_like(self.positions)
        eps2 = self.softening ** 2

        for i in range(self.num_particles):
            for j in range(i + 1, self.num_particles):
                r_vec = self.positions[j] - self.positions[i]
                r2 = np.dot(r_vec, r_vec) + eps2
                r_inv3 = r2 ** (-1.5)

                if self.force_type == "gravity":
                    # Gravitational: always attractive
                    force_mag = self.masses[i] * self.masses[j] * r_inv3
                    force = force_mag * r_vec
                else:
                    # Electromagnetic: like charges repel, opposite attract
                    # F = k * q1 * q2 / r^3 * r_vec (sign handled by charges)
                    force_mag = -self.charges[i] * self.charges[j] * r_inv3
                    force = force_mag * r_vec

                acc[i] += force / self.masses[i]
                acc[j] -= force / self.masses[j]

        return acc

    def step(self) -> None:
        """
        Advance the simulation by one timestep using velocity Verlet.

        The velocity Verlet algorithm:
            1. x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt^2
            2. a(t+dt) = F(x(t+dt)) / m
            3. v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
        """
        dt = self.dt
        # Step 1: Update positions
        self.positions += self.velocities * dt + 0.5 * self._accelerations * dt * dt

        # Step 2: Compute new accelerations
        new_acc = self._compute_accelerations()

        # Step 3: Update velocities
        self.velocities += 0.5 * (self._accelerations + new_acc) * dt

        self._accelerations = new_acc

    def _kinetic_energy(self) -> float:
        """Total kinetic energy: sum(0.5 * m * v^2)."""
        ke = 0.5 * np.sum(self.masses[:, np.newaxis] * self.velocities ** 2)
        return float(ke)

    def _potential_energy(self) -> float:
        """Total potential energy from pairwise interactions."""
        pe = 0.0
        eps2 = self.softening ** 2
        for i in range(self.num_particles):
            for j in range(i + 1, self.num_particles):
                r_vec = self.positions[j] - self.positions[i]
                r = np.sqrt(np.dot(r_vec, r_vec) + eps2)
                if self.force_type == "gravity":
                    pe -= self.masses[i] * self.masses[j] / r
                else:
                    pe += self.charges[i] * self.charges[j] / r
        return float(pe)

    def _total_momentum(self) -> np.ndarray:
        """Total momentum vector: sum(m * v)."""
        return np.sum(self.masses[:, np.newaxis] * self.velocities, axis=0)

    def get_state(self) -> dict:
        """
        Get the current state of the particle system.

        Returns:
            JSON-serializable dict with positions, velocities,
            total_energy, and total_momentum.
        """
        ke = self._kinetic_energy()
        pe = self._potential_energy()
        momentum = self._total_momentum()

        return {
            "positions": self.positions.tolist(),
            "velocities": self.velocities.tolist(),
            "total_energy": float(ke + pe),
            "kinetic_energy": float(ke),
            "potential_energy": float(pe),
            "total_momentum": momentum.tolist(),
            "num_particles": self.num_particles,
            "force_type": self.force_type,
        }
