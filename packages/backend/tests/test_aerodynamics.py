"""
TDD Tests for Butterfly Aerodynamics & Navier-Stokes LEV Engine.
"""

import pytest
import math
from app.engine.aerodynamics import (
    calculate_air_properties,
    compute_butterfly_forces,
    generate_aerodynamics_telemetry,
)


class TestAerodynamics:
    """Test thermodynamics and unsteady vortex lift augmentation."""

    def test_sutherland_viscosity_increases_with_temp(self):
        """Dynamic viscosity of air must increase with temperature via Sutherland's law."""
        air_cold = calculate_air_properties(temperature_c=0.0)
        air_hot = calculate_air_properties(temperature_c=35.0)
        assert air_hot["dynamic_viscosity_pa_s"] > air_cold["dynamic_viscosity_pa_s"]
        assert air_cold["density_kg_m3"] > air_hot["density_kg_m3"]

    def test_butterfly_reynolds_number_range(self):
        """Butterfly flapping Reynolds number must reside in biological range (100 - 5000)."""
        forces = compute_butterfly_forces(time_s=0.02, flapping_freq_hz=12.0)
        assert 100.0 <= forces["reynolds_number"] <= 5000.0

    def test_lev_lift_enhancement_positive(self):
        """Leading-Edge Vortex must produce positive lift contribution."""
        forces = compute_butterfly_forces(time_s=0.02, flapping_freq_hz=12.0)
        assert forces["cl_lev_contribution"] > 0
        assert forces["lift_coefficient_cl"] > 0

    def test_aerodynamics_telemetry(self):
        """Telemetry must include streamlines and valid physical units."""
        telem = generate_aerodynamics_telemetry(frame=10, temperature_c=25.0)
        assert telem["type"] == "aerodynamics"
        assert len(telem["lev_streamlines"]) > 0
        assert telem["reynolds_number"] > 0
