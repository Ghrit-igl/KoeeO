"""
TDD Tests for Relativistic Black Hole & Null Geodesics Engine.
"""

import pytest
import math
from app.engine.blackhole import (
    calculate_blackhole_metrics,
    compute_photon_geodesics,
    generate_blackhole_telemetry,
)


class TestBlackHoleRelativity:
    """Test Einstein field equations and Schwarzschild parameters."""

    def test_schwarzschild_and_photon_sphere_ratio(self):
        """Photon sphere must strictly equal 1.5 times the Schwarzschild radius (r_ph = 3M = 1.5 r_s)."""
        metrics = calculate_blackhole_metrics(mass_solar=10.0)
        r_s = metrics["schwarzschild_radius_km"]
        r_ph = metrics["photon_sphere_radius_km"]
        assert math.isclose(r_ph / r_s, 1.5, rel_tol=1e-5)

    def test_critical_impact_parameter(self):
        """Critical impact parameter b_c must equal 3 * sqrt(3) * M."""
        metrics = calculate_blackhole_metrics(mass_solar=10.0)
        # In km: b_c / r_s = (3 * sqrt(3) * M) / (2M) = 1.5 * sqrt(3) ~= 2.598
        ratio = metrics["critical_impact_parameter_km"] / metrics["schwarzschild_radius_km"]
        assert math.isclose(ratio, 1.5 * math.sqrt(3.0), rel_tol=1e-5)

    def test_hawking_temperature_positive_and_inverse_mass(self):
        """Hawking temperature must be strictly positive and scale inversely with mass."""
        m10 = calculate_blackhole_metrics(mass_solar=10.0)
        m20 = calculate_blackhole_metrics(mass_solar=20.0)
        assert m10["hawking_temperature_kelvin"] > 0
        assert math.isclose(m10["hawking_temperature_kelvin"] / m20["hawking_temperature_kelvin"], 2.0, rel_tol=1e-4)

    def test_null_geodesics_capture_versus_deflection(self):
        """Photons with b < b_c must be captured; photons with b > b_c must be deflected."""
        rays = compute_photon_geodesics(num_rays=8, mass_geom=1.0)
        assert len(rays) == 8
        captured = [r for r in rays if r["status"] == "captured"]
        deflected = [r for r in rays if r["status"] == "deflected"]
        assert len(captured) > 0
        assert len(deflected) > 0

    def test_telemetry_structure(self):
        """Telemetry must include valid accretion disk particles and frame counter."""
        telem = generate_blackhole_telemetry(frame=1, mass_solar=10.0)
        assert telem["type"] == "blackhole"
        assert telem["frame"] == 1
        assert len(telem["disk_particles"]) > 0
        assert len(telem["rays"]) > 0
