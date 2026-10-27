"""
TDD Tests for Molecular Orbital Engine.

Tests molecule definitions, bond connectivity, HOMO-LUMO gap,
and structural symmetry for predefined molecules.
"""

import pytest
import math

from app.engine.molecular import get_molecule


class TestMolecularH2O:
    """Tests for water molecule (H2O)."""

    def test_h2o_atom_count(self):
        """H2O should have exactly 3 atoms (2 H + 1 O)."""
        result = get_molecule("H2O")
        assert len(result["atoms"]) == 3

    def test_h2o_elements(self):
        """H2O should contain oxygen and hydrogen."""
        result = get_molecule("H2O")
        elements = {a["element"] for a in result["atoms"]}
        assert elements == {"H", "O"}

    def test_h2o_bond_connectivity(self):
        """H2O should have exactly 2 bonds (O-H, O-H)."""
        result = get_molecule("H2O")
        assert len(result["bonds"]) == 2

    def test_h2o_atom_positions_3d(self):
        """Each atom position should be a 3D coordinate."""
        result = get_molecule("H2O")
        for atom in result["atoms"]:
            assert len(atom["position"]) == 3

    def test_homo_lumo_gap_positive(self):
        """HOMO-LUMO gap should be a positive number."""
        result = get_molecule("H2O")
        assert result["homo_lumo_gap"] > 0.0


class TestMolecularH2:
    """Tests for diatomic hydrogen (H2)."""

    def test_h2_atom_count(self):
        """H2 should have exactly 2 atoms."""
        result = get_molecule("H2")
        assert len(result["atoms"]) == 2

    def test_h2_single_bond(self):
        """H2 should have exactly 1 bond."""
        result = get_molecule("H2")
        assert len(result["bonds"]) == 1


class TestMolecularBenzene:
    """Tests for benzene (C6H6) ring structure."""

    def test_benzene_atom_count(self):
        """Benzene should have 12 atoms (6 C + 6 H)."""
        result = get_molecule("C6H6")
        assert len(result["atoms"]) == 12

    def test_benzene_ring_symmetry(self):
        """All C-C bond lengths in benzene ring should be approximately equal."""
        result = get_molecule("C6H6")
        # Get carbon atoms
        carbons = [a for a in result["atoms"] if a["element"] == "C"]
        assert len(carbons) == 6
        # Get C-C bonds
        carbon_indices = {i for i, a in enumerate(result["atoms"]) if a["element"] == "C"}
        cc_bonds = [b for b in result["bonds"]
                     if b["from"] in carbon_indices and b["to"] in carbon_indices]
        # Calculate bond lengths
        atoms = result["atoms"]
        lengths = []
        for bond in cc_bonds:
            p1 = atoms[bond["from"]]["position"]
            p2 = atoms[bond["to"]]["position"]
            dist = math.sqrt(sum((a - b) ** 2 for a, b in zip(p1, p2)))
            lengths.append(dist)
        # All C-C bonds should be within 5% of each other
        avg_len = sum(lengths) / len(lengths)
        for length in lengths:
            assert abs(length - avg_len) / avg_len < 0.05

    def test_benzene_has_orbitals(self):
        """Benzene should have orbital data."""
        result = get_molecule("C6H6")
        assert len(result["orbitals"]) > 0

    def test_benzene_energy_levels(self):
        """Benzene should have energy levels."""
        result = get_molecule("C6H6")
        assert len(result["energy_levels"]) > 0


class TestMolecularCO2:
    """Tests for carbon dioxide (CO2)."""

    def test_co2_atom_count(self):
        """CO2 should have 3 atoms."""
        result = get_molecule("CO2")
        assert len(result["atoms"]) == 3

    def test_co2_bonds(self):
        """CO2 should have 2 bonds (C=O, C=O)."""
        result = get_molecule("CO2")
        assert len(result["bonds"]) == 2


class TestMolecularCH4:
    """Tests for methane (CH4)."""

    def test_ch4_atom_count(self):
        """CH4 should have 5 atoms."""
        result = get_molecule("CH4")
        assert len(result["atoms"]) == 5


class TestMolecularValidation:
    """Tests for input validation."""

    def test_unknown_molecule_raises(self):
        """Requesting an unknown molecule should raise ValueError."""
        with pytest.raises(ValueError, match="Unknown molecule"):
            get_molecule("XYZ999")

    def test_result_json_serializable(self):
        """Result must be JSON-serializable."""
        import json
        result = get_molecule("H2O")
        json.dumps(result)
