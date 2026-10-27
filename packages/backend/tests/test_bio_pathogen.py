"""
TDD Tests for Acinetobacter baumannii LpxC Pathogen Enzyme Kinetics.
"""

import pytest
from app.engine.bio_pathogen import (
    compute_lpxc_kinetics,
    generate_pathogen_telemetry,
)


class TestBioPathogen:
    """Test enzyme kinetics, competitive inhibition, and endotoxin mitigation."""

    def test_inhibitor_reduces_catalytic_rate(self):
        """Inhibitor presence must decrease enzymatic reaction velocity."""
        uninhibited = compute_lpxc_kinetics(inhibitor_conc_um=0.0)
        inhibited = compute_lpxc_kinetics(inhibitor_conc_um=1.0)
        assert inhibited["catalytic_velocity_nmol_min"] < uninhibited["catalytic_velocity_nmol_min"]
        assert inhibited["inhibition_efficacy_percent"] > 50.0

    def test_gibbs_free_energy_negative(self):
        """Spontaneous binding must yield negative Gibbs free energy (Delta G < 0)."""
        res = compute_lpxc_kinetics(inhibitor_conc_um=0.5, k_i_um=0.05)
        assert res["gibbs_free_energy_dG_kj_mol"] < 0.0

    def test_pathogen_telemetry_contains_zinc_active_site(self):
        """Telemetry must map the catalytic Zinc ion and active site residues."""
        telem = generate_pathogen_telemetry(frame=1, inhibitor_uM=0.5)
        assert telem["type"] == "pathogen"
        assert len(telem["active_site_atoms"]) >= 5
        elements = [a["element"] for a in telem["active_site_atoms"]]
        assert "Zn" in elements
