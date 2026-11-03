use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum MaterialCategory {
    MetalAlloy,
    RefractoryMetal,
    Ceramic,
    Composite,
    OrganicWood,
    Biomaterial,
    PreciousConductive,
    Polymer,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Material {
    pub id: String,
    pub name: String,
    pub category: MaterialCategory,
    pub density_g_cm3: f64,
    pub yield_strength_mpa: f64,
    pub ultimate_strength_mpa: f64,
    pub youngs_modulus_gpa: f64,
    pub thermal_conductivity_w_mk: f64,
    pub thermal_expansion_ppm_k: f64,
    pub max_service_temp_c: f64,
    pub melting_point_c: f64,
    pub pyrolysis_temp_c: Option<f64>,
    pub market_rate_inr_per_kg: f64,
    pub biocompatible: bool,
    pub machining_difficulty_factor: f64,
    pub primary_use_case: String,
}

impl Material {
    pub fn is_temperature_safe(&self, target_temp_c: f64) -> Result<(), String> {
        if let Some(pyro) = self.pyrolysis_temp_c {
            if target_temp_c >= pyro {
                return Err(format!(
                    "FATAL THERMAL VIOLATION: '{}' undergoes chemical pyrolysis and combustion at {}°C. Operating at {}°C is physically impossible.",
                    self.name, pyro, target_temp_c
                ));
            }
        }
        if target_temp_c >= self.melting_point_c {
            return Err(format!(
                "FATAL THERMAL VIOLATION: '{}' melts at {}°C. Operating at {}°C will cause total liquid phase transition.",
                self.name, self.melting_point_c, target_temp_c
            ));
        }
        if target_temp_c > self.max_service_temp_c {
            return Err(format!(
                "STRUCTURAL WARNING: Operating at {}°C exceeds maximum continuous service temperature of {}°C for '{}'. Accelerated creep and rapid yield loss will occur.",
                target_temp_c, self.max_service_temp_c, self.name
            ));
        }
        Ok(())
    }

    pub fn degraded_yield_strength(&self, temp_c: f64) -> f64 {
        if temp_c <= 20.0 {
            return self.yield_strength_mpa;
        }
        if temp_c >= self.melting_point_c {
            return 0.0;
        }
        let homologous = (temp_c - 20.0) / (self.melting_point_c - 20.0);
        let factor = (1.0 - homologous.powf(1.6)).clamp(0.02, 1.0);
        self.yield_strength_mpa * factor
    }
}

pub struct MaterialDatabase;

impl MaterialDatabase {
    pub fn get_all() -> Vec<Material> {
        vec![
            // 1. Aerospace Titanium
            Material {
                id: "titanium_gr5".to_string(),
                name: "Ti-6Al-4V Grade 5 Titanium".to_string(),
                category: MaterialCategory::MetalAlloy,
                density_g_cm3: 4.43,
                yield_strength_mpa: 880.0,
                ultimate_strength_mpa: 950.0,
                youngs_modulus_gpa: 114.0,
                thermal_conductivity_w_mk: 6.7,
                thermal_expansion_ppm_k: 8.6,
                max_service_temp_c: 400.0,
                melting_point_c: 1660.0,
                pyrolysis_temp_c: None,
                market_rate_inr_per_kg: 3800.0,
                biocompatible: true,
                machining_difficulty_factor: 2.2,
                primary_use_case: "High strength-to-weight connecting rods, valves, aerospace airframes, orthopedic implants".to_string(),
            },
            // 2. High-Temperature Superalloy
            Material {
                id: "inconel_718".to_string(),
                name: "Inconel 718 Nickel Superalloy".to_string(),
                category: MaterialCategory::MetalAlloy,
                density_g_cm3: 8.19,
                yield_strength_mpa: 1100.0,
                ultimate_strength_mpa: 1375.0,
                youngs_modulus_gpa: 205.0,
                thermal_conductivity_w_mk: 11.4,
                thermal_expansion_ppm_k: 13.0,
                max_service_temp_c: 700.0,
                melting_point_c: 1336.0,
                pyrolysis_temp_c: None,
                market_rate_inr_per_kg: 6500.0,
                biocompatible: false,
                machining_difficulty_factor: 3.5,
                primary_use_case: "Gas turbine disks, turbocharger turbine housings, rocket combustion chambers".to_string(),
            },
            // 3. Ultra High Temperature Ceramic
            Material {
                id: "silicon_nitride".to_string(),
                name: "Silicon Nitride (Si3N4) Ceramic".to_string(),
                category: MaterialCategory::Ceramic,
                density_g_cm3: 3.20,
                yield_strength_mpa: 1400.0,
                ultimate_strength_mpa: 1600.0,
                youngs_modulus_gpa: 310.0,
                thermal_conductivity_w_mk: 30.0,
                thermal_expansion_ppm_k: 3.2,
                max_service_temp_c: 1200.0,
                melting_point_c: 1900.0,
                pyrolysis_temp_c: None,
                market_rate_inr_per_kg: 12500.0,
                biocompatible: true,
                machining_difficulty_factor: 5.0,
                primary_use_case: "Ultra-high RPM ceramic ball bearings, turbocharger turbine wheels, glow plugs, thermal barriers".to_string(),
            },
            // 4. Forged Aluminum
            Material {
                id: "forged_al_2618".to_string(),
                name: "2618-T61 Forged Racing Aluminum".to_string(),
                category: MaterialCategory::MetalAlloy,
                density_g_cm3: 2.76,
                yield_strength_mpa: 420.0,
                ultimate_strength_mpa: 470.0,
                youngs_modulus_gpa: 73.0,
                thermal_conductivity_w_mk: 146.0,
                thermal_expansion_ppm_k: 22.3,
                max_service_temp_c: 260.0,
                melting_point_c: 638.0,
                pyrolysis_temp_c: None,
                market_rate_inr_per_kg: 950.0,
                biocompatible: false,
                machining_difficulty_factor: 0.6,
                primary_use_case: "High boost forged pistons, supercharger impeller blanks, cylinder heads".to_string(),
            },
            // 5. Cast Aluminum
            Material {
                id: "cast_al_a356".to_string(),
                name: "A356-T6 Cast Aluminum".to_string(),
                category: MaterialCategory::MetalAlloy,
                density_g_cm3: 2.68,
                yield_strength_mpa: 240.0,
                ultimate_strength_mpa: 310.0,
                youngs_modulus_gpa: 70.0,
                thermal_conductivity_w_mk: 151.0,
                thermal_expansion_ppm_k: 23.0,
                max_service_temp_c: 200.0,
                melting_point_c: 615.0,
                pyrolysis_temp_c: None,
                market_rate_inr_per_kg: 480.0,
                biocompatible: false,
                machining_difficulty_factor: 0.4,
                primary_use_case: "Standard production engine blocks, transmission cases, intake manifolds".to_string(),
            },
            // 6. Carbon Composite Matrix
            Material {
                id: "forged_carbon".to_string(),
                name: "Forged Carbon Fiber Composite".to_string(),
                category: MaterialCategory::Composite,
                density_g_cm3: 1.55,
                yield_strength_mpa: 1250.0,
                ultimate_strength_mpa: 1450.0,
                youngs_modulus_gpa: 150.0,
                thermal_conductivity_w_mk: 5.5,
                thermal_expansion_ppm_k: 1.2,
                max_service_temp_c: 300.0,
                melting_point_c: 350.0, // Resin degradation
                pyrolysis_temp_c: Some(360.0),
                market_rate_inr_per_kg: 5200.0,
                biocompatible: false,
                machining_difficulty_factor: 2.4,
                primary_use_case: "Ultra-lightweight aerodynamic wings, chassis monocoques, suspension pushrods".to_string(),
            },
            // 7. Wood (Oak) - The Crucial Reality Test Case!
            Material {
                id: "oak_wood".to_string(),
                name: "English Oak Wood (Quercus robur)".to_string(),
                category: MaterialCategory::OrganicWood,
                density_g_cm3: 0.75,
                yield_strength_mpa: 45.0,
                ultimate_strength_mpa: 85.0,
                youngs_modulus_gpa: 12.5,
                thermal_conductivity_w_mk: 0.17,
                thermal_expansion_ppm_k: 5.0,
                max_service_temp_c: 90.0,
                melting_point_c: 320.0, // Sublimation / Char point
                pyrolysis_temp_c: Some(300.0), // Auto-ignition / combustion
                market_rate_inr_per_kg: 180.0,
                biocompatible: true,
                machining_difficulty_factor: 0.2,
                primary_use_case: "Carpentry, structural timber, marine hulls (low temperature only)".to_string(),
            },
            // 8. Balsa Wood
            Material {
                id: "balsa_wood".to_string(),
                name: "Balsa Wood (Ochroma pyramidale)".to_string(),
                category: MaterialCategory::OrganicWood,
                density_g_cm3: 0.16,
                yield_strength_mpa: 12.0,
                ultimate_strength_mpa: 24.0,
                youngs_modulus_gpa: 3.5,
                thermal_conductivity_w_mk: 0.05,
                thermal_expansion_ppm_k: 4.2,
                max_service_temp_c: 75.0,
                melting_point_c: 280.0,
                pyrolysis_temp_c: Some(260.0),
                market_rate_inr_per_kg: 650.0,
                biocompatible: true,
                machining_difficulty_factor: 0.1,
                primary_use_case: "Model aircraft, wind turbine blade core laminates".to_string(),
            },
            // 9. Biomedical Grade PEEK
            Material {
                id: "peek_optima".to_string(),
                name: "PEEK-OPTIMA Medical Grade".to_string(),
                category: MaterialCategory::Biomaterial,
                density_g_cm3: 1.32,
                yield_strength_mpa: 100.0,
                ultimate_strength_mpa: 130.0,
                youngs_modulus_gpa: 4.0,
                thermal_conductivity_w_mk: 0.25,
                thermal_expansion_ppm_k: 45.0,
                max_service_temp_c: 260.0,
                melting_point_c: 343.0,
                pyrolysis_temp_c: Some(450.0),
                market_rate_inr_per_kg: 18000.0,
                biocompatible: true,
                machining_difficulty_factor: 1.2,
                primary_use_case: "Spinal implants, orthopedic fusion cages, artificial heart valves".to_string(),
            },
            // 10. Refractory Tungsten
            Material {
                id: "tungsten_pure".to_string(),
                name: "Pure Tungsten (W)".to_string(),
                category: MaterialCategory::RefractoryMetal,
                density_g_cm3: 19.3,
                yield_strength_mpa: 750.0,
                ultimate_strength_mpa: 980.0,
                youngs_modulus_gpa: 411.0,
                thermal_conductivity_w_mk: 173.0,
                thermal_expansion_ppm_k: 4.5,
                max_service_temp_c: 1650.0,
                melting_point_c: 3422.0,
                pyrolysis_temp_c: None,
                market_rate_inr_per_kg: 4200.0,
                biocompatible: false,
                machining_difficulty_factor: 4.8,
                primary_use_case: "Fusion reactor divertor tiles, rocket engine throat liners, kinetic penetrators".to_string(),
            },
            // 11. High-Tensile 4340 Alloy Steel
            Material {
                id: "steel_4340".to_string(),
                name: "AISI 4340 Nickel-Chromium-Moly Steel".to_string(),
                category: MaterialCategory::MetalAlloy,
                density_g_cm3: 7.85,
                yield_strength_mpa: 860.0,
                ultimate_strength_mpa: 1110.0,
                youngs_modulus_gpa: 210.0,
                thermal_conductivity_w_mk: 44.5,
                thermal_expansion_ppm_k: 12.3,
                max_service_temp_c: 400.0,
                melting_point_c: 1427.0,
                pyrolysis_temp_c: None,
                market_rate_inr_per_kg: 320.0,
                biocompatible: false,
                machining_difficulty_factor: 1.4,
                primary_use_case: "Heavy-duty crankshafts, transmission gears, aircraft landing gear".to_string(),
            },
            // 12. High Conductivity Rocket Liner Copper Alloy
            Material {
                id: "copper_cucrzr".to_string(),
                name: "CuCrZr Copper-Chromium-Zirconium Alloy".to_string(),
                category: MaterialCategory::MetalAlloy,
                density_g_cm3: 8.90,
                yield_strength_mpa: 380.0,
                ultimate_strength_mpa: 450.0,
                youngs_modulus_gpa: 128.0,
                thermal_conductivity_w_mk: 320.0,
                thermal_expansion_ppm_k: 17.5,
                max_service_temp_c: 450.0,
                melting_point_c: 1080.0,
                pyrolysis_temp_c: None,
                market_rate_inr_per_kg: 1850.0,
                biocompatible: false,
                machining_difficulty_factor: 1.1,
                primary_use_case: "Regeneratively cooled liquid rocket combustion chamber liners, continuous casting molds".to_string(),
            },
            // 13. Spacecraft Refractory Niobium
            Material {
                id: "niobium_c103".to_string(),
                name: "Niobium C-103 Refractory Superalloy".to_string(),
                category: MaterialCategory::RefractoryMetal,
                density_g_cm3: 8.85,
                yield_strength_mpa: 345.0,
                ultimate_strength_mpa: 480.0,
                youngs_modulus_gpa: 90.0,
                thermal_conductivity_w_mk: 42.0,
                thermal_expansion_ppm_k: 7.2,
                max_service_temp_c: 1370.0,
                melting_point_c: 2350.0,
                pyrolysis_temp_c: None,
                market_rate_inr_per_kg: 14500.0,
                biocompatible: false,
                machining_difficulty_factor: 3.8,
                primary_use_case: "Radiation-cooled liquid rocket engine expansion nozzles, hypersonic leading edges".to_string(),
            },
            // 14. Biomedical Tactile Silicone Elastomer
            Material {
                id: "medical_silicone".to_string(),
                name: "USP Class VI Medical Silicone Elastomer".to_string(),
                category: MaterialCategory::Polymer,
                density_g_cm3: 1.12,
                yield_strength_mpa: 18.0,
                ultimate_strength_mpa: 25.0,
                youngs_modulus_gpa: 0.05,
                thermal_conductivity_w_mk: 0.22,
                thermal_expansion_ppm_k: 250.0,
                max_service_temp_c: 200.0,
                melting_point_c: 260.0,
                pyrolysis_temp_c: Some(350.0),
                market_rate_inr_per_kg: 2400.0,
                biocompatible: true,
                machining_difficulty_factor: 0.3,
                primary_use_case: "Bionic prosthetic tactile fingertip pads, soft robotic skin, biocompatible fluid seals".to_string(),
            },
        ]
    }

    pub fn find_by_id(id: &str) -> Option<Material> {
        Self::get_all().into_iter().find(|m| m.id == id)
    }

    pub fn find_viable_alternatives(target_temp_c: f64, min_yield_mpa: f64) -> Vec<Material> {
        Self::get_all()
            .into_iter()
            .filter(|m| {
                m.max_service_temp_c >= target_temp_c
                    && m.melting_point_c > target_temp_c + 150.0
                    && m.degraded_yield_strength(target_temp_c) >= min_yield_mpa
            })
            .collect()
    }
}
