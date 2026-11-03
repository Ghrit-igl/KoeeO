use crate::materials::Material;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MechanicsAnalysisResult {
    pub applied_load_n: f64,
    pub mechanical_stress_mpa: f64,
    pub von_mises_stress_mpa: f64,
    pub degraded_yield_mpa: f64,
    pub safety_factor: f64,
    pub fatigue_life_cycles: f64,
    pub is_infinite_life: bool,
    pub catastrophic_relapse_risk_pct: f64,
    pub status: String,
}

pub struct MechanicsEngine;

impl MechanicsEngine {
    pub fn analyze(
        material: &Material,
        applied_load_n: f64,
        cross_section_area_mm2: f64,
        shear_load_n: f64,
        thermal_stress_mpa: f64,
        operating_temp_c: f64,
    ) -> MechanicsAnalysisResult {
        // Direct normal stress
        let sigma_mech = applied_load_n / cross_section_area_mm2.max(0.1);
        let tau = shear_load_n / cross_section_area_mm2.max(0.1);

        // Total combined normal stress
        let total_normal = sigma_mech + thermal_stress_mpa;

        // von Mises equivalent stress: sqrt(sigma^2 + 3*tau^2)
        let von_mises = (total_normal.powi(2) + 3.0 * tau.powi(2)).sqrt();

        // Effective yield strength at operating temperature
        let degraded_yield = material.degraded_yield_strength(operating_temp_c);

        // Safety factor: S_f = sigma_y / sigma_v
        let safety_factor = if von_mises <= 0.001 {
            100.0
        } else {
            degraded_yield / von_mises
        };

        // Wöhler S-N Fatigue life calculation (Basquin rule)
        // S_e endurance limit is approx 0.45 * ultimate_strength for steels/titanium
        let endurance_limit = material.ultimate_strength_mpa * 0.45;
        let fatigue_life_cycles = if von_mises <= endurance_limit {
            1.0e8 // Infinite life (> 10 million cycles)
        } else {
            // S_a = sigma_f' * (2*N_f)^b  =>  N_f = 0.5 * (S_a / S_ut)^(1 / -0.09)
            let ratio = (von_mises / material.ultimate_strength_mpa).clamp(0.1, 1.5);
            let n_f = 0.5 * (1.0 / ratio).powf(11.0);
            n_f.clamp(100.0, 1.0e8)
        };
        let is_infinite_life = fatigue_life_cycles >= 1.0e7;

        // Catastrophic Relapse Risk Percentage:
        // P_relapse = 100 / (1 + exp(4.5 * (S_f - 1.25)))
        let relapse_pct = (100.0 / (1.0 + (4.5 * (safety_factor - 1.25)).exp())).clamp(0.1, 99.9);

        let status = if safety_factor >= 2.0 {
            "AERONAUTICAL_SAFE".to_string()
        } else if safety_factor >= 1.2 {
            "STRAIN_WARNING".to_string()
        } else {
            "CRITICAL_FRACTURE_RISK".to_string()
        };

        MechanicsAnalysisResult {
            applied_load_n,
            mechanical_stress_mpa: sigma_mech,
            von_mises_stress_mpa: von_mises,
            degraded_yield_mpa: degraded_yield,
            safety_factor,
            fatigue_life_cycles,
            is_infinite_life,
            catastrophic_relapse_risk_pct: relapse_pct,
            status,
        }
    }
}
