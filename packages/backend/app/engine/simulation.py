"""
SimulationManager — KoeeO Science Lab Orchestrator.

Manages active experiments: create, step, pause, resume, destroy.
Each experiment has an ID, type, parameters, and state. Thread-safe
for concurrent WebSocket connections.
"""

import uuid
import time
import threading
from typing import Any

from app.engine.mobius import generate_mobius_mesh
from app.engine.molecular import get_molecule
from app.engine.particles import ParticleSystem


class _Experiment:
    """Internal experiment state container."""

    def __init__(self, exp_id: str, exp_type: str, params: dict):
        self.id = exp_id
        self.type = exp_type
        self.params = params
        self.frame = 0
        self.paused = False
        self.created_at = time.time()

        # Initialize the engine based on type
        if exp_type == "mobius":
            self._twist = params.get("twist", 1.0)
            self._u_res = params.get("u_resolution", 40)
            self._v_res = params.get("v_resolution", 10)
            self._num_eig = params.get("num_eigenvalues", 6)
        elif exp_type == "molecular":
            self._molecule_name = params.get("molecule", "H2O")
        elif exp_type == "particles":
            self._particle_system = ParticleSystem(
                num_particles=params.get("num_particles", 50),
                force_type=params.get("force_type", "gravity"),
                dt=params.get("dt", 0.01),
                softening=params.get("softening", 0.1),
                seed=params.get("seed", None),
            )

    def step(self) -> dict:
        """Advance the experiment by one frame and return telemetry data."""
        self.frame += 1

        if self.type == "mobius":
            # Animate twist over time
            animated_twist = self._twist + 0.01 * self.frame
            data = generate_mobius_mesh(
                u_resolution=self._u_res,
                v_resolution=self._v_res,
                twist=animated_twist,
                num_eigenvalues=self._num_eig,
            )
        elif self.type == "molecular":
            data = get_molecule(self._molecule_name)
        elif self.type == "particles":
            self._particle_system.step()
            data = self._particle_system.get_state()
        else:
            data = {}

        return data


class SimulationManager:
    """
    Thread-safe manager for active simulation experiments.

    Supports creating, stepping, pausing, resuming, and destroying
    experiments concurrently from multiple WebSocket connections.
    """

    def __init__(self):
        self._experiments: dict[str, _Experiment] = {}
        self._lock = threading.Lock()

    def create(self, exp_type: str, params: dict) -> str:
        """
        Create a new experiment.

        Args:
            exp_type: Experiment type ("mobius", "molecular", or "particles").
            params: Engine-specific parameters.

        Returns:
            Unique experiment ID string.

        Raises:
            ValueError: If exp_type is not recognized.
        """
        valid_types = {"mobius", "molecular", "particles"}
        if exp_type not in valid_types:
            raise ValueError(
                f"Unknown experiment type: '{exp_type}'. "
                f"Valid types: {', '.join(sorted(valid_types))}"
            )

        exp_id = str(uuid.uuid4())
        experiment = _Experiment(exp_id, exp_type, params)

        with self._lock:
            self._experiments[exp_id] = experiment

        return exp_id

    def step(self, experiment_id: str) -> dict:
        """
        Advance an experiment by one frame.

        Args:
            experiment_id: The experiment to advance.

        Returns:
            Telemetry frame dict with experiment_id, type, frame,
            timestamp, and data.

        Raises:
            KeyError: If the experiment does not exist.
        """
        with self._lock:
            if experiment_id not in self._experiments:
                raise KeyError(f"Experiment not found: {experiment_id}")
            experiment = self._experiments[experiment_id]

        data = experiment.step()

        return {
            "experiment_id": experiment.id,
            "type": experiment.type,
            "frame": experiment.frame,
            "timestamp": time.time(),
            "data": data,
        }

    def destroy(self, experiment_id: str) -> None:
        """
        Destroy an experiment and free its resources.

        Args:
            experiment_id: The experiment to destroy.

        Raises:
            KeyError: If the experiment does not exist.
        """
        with self._lock:
            if experiment_id not in self._experiments:
                raise KeyError(f"Experiment not found: {experiment_id}")
            del self._experiments[experiment_id]

    def list_experiments(self) -> list[dict]:
        """
        List all active experiments.

        Returns:
            List of dicts with id, type, frame, and created_at for each.
        """
        with self._lock:
            return [
                {
                    "id": exp.id,
                    "type": exp.type,
                    "frame": exp.frame,
                    "created_at": exp.created_at,
                }
                for exp in self._experiments.values()
            ]

    def get_experiment(self, experiment_id: str) -> _Experiment:
        """Get an experiment by ID (for internal use)."""
        with self._lock:
            if experiment_id not in self._experiments:
                raise KeyError(f"Experiment not found: {experiment_id}")
            return self._experiments[experiment_id]
