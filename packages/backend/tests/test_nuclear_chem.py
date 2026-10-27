"""
TDD Tests for Bethe-Weizsäcker Nuclear Binding & Superheavy Element Engine.
"""

import pytest
from app.engine.nuclear_chem import (
    compute_nuclear_binding,
    generate_nuclear_telemetry,
)


class TestNuclearChemistry:
    """Test SEMF, Coulomb barriers, and quantum shell stability."""

    def test_iron_56_binding_peak(self):
        """Iron-56 (Z=26, N=30) should have high binding energy per nucleon (> 8.5 MeV)."""
        res = compute_nuclear_binding(protons_z=26, neutrons_n=30)
        assert res["binding_energy_per_nucleon_mev"] > 8.5
        assert res["stability_status"] == "STABLE"

    def test_island_of_stability_unbihexium(self):
        """Element 126 (Z=126, N=184, A=310) must receive quantum shell bonus."""
        res = compute_nuclear_binding(protons_z=126, neutrons_n=184)
        assert res["is_island_of_stability"] is True
        assert res["shell_correction_mev"] > 10.0
        assert "5g" in res["electron_configuration"]

    def test_island_of_stability_unbinilium(self):
        """Element 120 (Z=120, N=184, A=304) must receive quantum shell bonus."""
        res = compute_nuclear_binding(protons_z=120, neutrons_n=184)
        assert res["is_island_of_stability"] is True
        assert res["shell_correction_mev"] > 10.0

    def test_nuclear_telemetry_generation(self):
        """Telemetry must generate 3D nucleon coordinates."""
        telem = generate_nuclear_telemetry(frame=5, protons_z=120, neutrons_n=184)
        assert telem["type"] == "nuclear"
        assert len(telem["nucleons"]) > 0
        assert telem["energy"] > 0
