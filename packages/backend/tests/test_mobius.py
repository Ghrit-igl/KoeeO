"""
TDD Tests for Möbius Strip Topological Engine.

Tests mathematical correctness of mesh generation, eigenvalue spectral
analysis, twist deformation, and energy computation.
"""

import numpy as np
import pytest

from app.engine.mobius import generate_mobius_mesh


class TestMobiusMeshGeneration:
    """Tests for Möbius strip mesh vertex generation."""

    def test_mesh_generation_shape(self):
        """Vertices should be (N*M, 3) array — 3D coordinates for every grid point."""
        result = generate_mobius_mesh(u_resolution=40, v_resolution=10)
        vertices = result["vertices"]
        # Should be a list of [x, y, z] triplets
        assert isinstance(vertices, list)
        assert len(vertices) == 40 * 10
        # Each vertex is a 3-element list
        for v in vertices[:5]:
            assert len(v) == 3

    def test_normals_shape_matches_vertices(self):
        """Normals array should have the same shape as vertices."""
        result = generate_mobius_mesh(u_resolution=30, v_resolution=8)
        assert len(result["normals"]) == len(result["vertices"])
        for n in result["normals"][:5]:
            assert len(n) == 3

    def test_eigenvalue_count(self):
        """Should return the requested number of eigenvalues from the discrete Laplacian."""
        result = generate_mobius_mesh(u_resolution=20, v_resolution=6, num_eigenvalues=10)
        eigenvalues = result["eigenvalues"]
        assert isinstance(eigenvalues, list)
        assert len(eigenvalues) == 10

    def test_eigenvalues_are_real(self):
        """All eigenvalues of the discrete Laplacian should be real numbers."""
        result = generate_mobius_mesh(u_resolution=20, v_resolution=6, num_eigenvalues=5)
        for ev in result["eigenvalues"]:
            assert isinstance(ev, float)

    def test_twist_deformation(self):
        """Changing the twist factor should produce a different mesh."""
        result_a = generate_mobius_mesh(u_resolution=20, v_resolution=6, twist=1.0)
        result_b = generate_mobius_mesh(u_resolution=20, v_resolution=6, twist=2.0)
        # Vertices must differ when twist changes
        assert result_a["vertices"] != result_b["vertices"]
        assert result_a["twist_angle"] != result_b["twist_angle"]

    def test_energy_positive(self):
        """Total spectral energy (sum of eigenvalues) should be a positive real number."""
        result = generate_mobius_mesh(u_resolution=20, v_resolution=6, num_eigenvalues=5)
        energy = result["energy"]
        assert isinstance(energy, float)
        assert energy > 0.0

    def test_result_json_serializable(self):
        """Result should be fully JSON-serializable (no numpy types)."""
        import json
        result = generate_mobius_mesh(u_resolution=15, v_resolution=5)
        # Should not raise
        json.dumps(result)
