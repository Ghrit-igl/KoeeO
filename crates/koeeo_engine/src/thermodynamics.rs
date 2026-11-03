use crate::materials::Material;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThermalAnalysisResult {
    pub is_valid: bool,
    pub operating_temp_c: f64,
    pub max_service_temp_c: f64,
    pub melting_point_c: f64,
    pub thermal_expansion_pct: f64,
    pub thermal_stress_mpa: f64,
    pub degraded_yield_mpa: f64,
    pub violation_reason: Option<String>,
}

pub struct ThermodynamicsEngine;

impl ThermodynamicsEngine {
    pub fn analyze(
        material: &Material,
        ambient_temp_c: f64,
        operating_temp_c: f64,
        length_mm: f64,
    ) -> ThermalAnalysisResult {
        let delta_t = operating_temp_c - ambient_temp_c;

        // 1. Pyrolysis check (e.g. Wood, Plastics)
        if let Some(pyro) = material.pyrolysis_temp_c {
            if operating_temp_c >= pyro {
                return ThermalAnalysisResult {
                    is_valid: false,
                    operating_temp_c,
                    max_service_temp_c: material.max_service_temp_c,
                    melting_point_c: material.melting_point_c,
                    thermal_expansion_pct: 0.0,
                    thermal_stress_mpa: 0.0,
                    degraded_yield_mpa: 0.0,
                    violation_reason: Some(format!(
                        "CRITICAL PYROLYSIS: '{}' auto-ignites/decomposes at {}°C. Operating at {}°C will burn into ash.",
                        material.name, pyro, operating_temp_c
                    )),
                };
            }
        }

        // 2. Melting phase transition check
        if operating_temp_c >= material.melting_point_c {
            return ThermalAnalysisResult {
                is_valid: false,
                operating_temp_c,
                max_service_temp_c: material.max_service_temp_c,
                melting_point_c: material.melting_point_c,
                thermal_expansion_pct: 0.0,
                thermal_stress_mpa: 0.0,
                degraded_yield_mpa: 0.0,
                violation_reason: Some(format!(
                    "CRITICAL PHASE MELTING: '{}' melts at {}°C. Operating at {}°C causes complete structural liquidation.",
                    material.name, material.melting_point_c, operating_temp_c
                )),
            };
        }

        // 3. Service limit warning
        let violation_reason = if operating_temp_c > material.max_service_temp_c {
            Some(format!(
                "SERVICE TEMPERATURE EXCEEDED: Operating at {}°C exceeds rated {}°C. Severe thermal creep and rapid fatigue failure will occur.",
                operating_temp_c, material.max_service_temp_c
            ))
        } else {
            None
        };

        // Linear thermal expansion: delta_L = L * alpha * delta_T
        let alpha = material.thermal_expansion_ppm_k * 1e-6;
        let delta_l_mm = length_mm * alpha * delta_t;
        let expansion_pct = (delta_l_mm / length_mm) * 100.0;

        // Thermal stress if constrained: sigma = E * alpha * delta_T
        let thermal_stress_mpa = (material.youngs_modulus_gpa * 1000.0) * alpha * delta_t.max(0.0);
        let degraded_yield_mpa = material.degraded_yield_strength(operating_temp_c);

        ThermalAnalysisResult {
            is_valid: violation_reason.is_none(),
            operating_temp_c,
            max_service_temp_c: material.max_service_temp_c,
            melting_point_c: material.melting_point_c,
            thermal_expansion_pct: expansion_pct,
            thermal_stress_mpa,
            degraded_yield_mpa,
            violation_reason,
        }
    }
}
