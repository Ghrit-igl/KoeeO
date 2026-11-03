use crate::materials::Material;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManufacturingReport {
    pub part_name: String,
    pub material_name: String,
    pub volume_cm3: f64,
    pub mass_grams: f64,
    pub raw_material_cost_inr: f64,
    pub primary_process: String,
    pub machining_cycle_time_mins: f64,
    pub machining_cost_inr: f64,
    pub tooling_cost_inr: f64,
    pub prototype_unit_cost_inr: f64,
    pub mass_production_unit_cost_inr: f64,
    pub iso_fit_tolerance: String,
    pub surface_finish_ra_um: f64,
}

pub struct ManufacturingEngine;

impl ManufacturingEngine {
    pub fn estimate_cost(
        part_name: &str,
        material: &Material,
        volume_cm3: f64,
        is_high_precision: bool,
    ) -> ManufacturingReport {
        let mass_grams = volume_cm3 * material.density_g_cm3;
        let mass_kg = mass_grams / 1000.0;

        // Raw material stock cost
        let raw_material_cost_inr = (mass_kg * material.market_rate_inr_per_kg).max(25.0);

        // Machining time and process determination
        let (primary_process, base_cycle_mins, hourly_rate_inr) = if material.id.contains("ceramic") {
            ("Hot Isostatic Pressing + Diamond Grinding", 75.0, 3200.0)
        } else if material.id.contains("carbon") {
            ("High-Pressure Autoclave Compression Molding", 45.0, 2400.0)
        } else if material.category == crate::materials::MaterialCategory::OrganicWood {
            ("3-Axis CNC Wood Router", 12.0, 800.0)
        } else if is_high_precision || material.id.contains("titanium") || material.id.contains("inconel") {
            ("5-Axis High-Speed CNC Milling", 55.0, 2200.0)
        } else {
            ("4-Axis CNC Milling / Turning", 25.0, 1600.0)
        };

        // Adjust cycle time by material difficulty
        let machining_cycle_time_mins = base_cycle_mins * material.machining_difficulty_factor;
        let machining_cost_inr = (machining_cycle_time_mins / 60.0) * hourly_rate_inr;

        // Tooling setup amortization
        let tooling_cost_inr = if is_high_precision { 4500.0 } else { 1500.0 };

        let prototype_unit_cost_inr = (raw_material_cost_inr * 1.3) + machining_cost_inr + tooling_cost_inr;
        let mass_production_unit_cost_inr = (raw_material_cost_inr * 1.05) + (machining_cost_inr * 0.45) + (tooling_cost_inr / 1000.0);

        let iso_fit_tolerance = if is_high_precision {
            "ISO H6 / js5 (±0.005 mm Precision Ground)".to_string()
        } else {
            "ISO H8 / f7 (±0.025 mm Standard Machined)".to_string()
        };

        let surface_finish_ra_um = if is_high_precision { 0.4 } else { 1.6 };

        ManufacturingReport {
            part_name: part_name.to_string(),
            material_name: material.name.clone(),
            volume_cm3,
            mass_grams,
            raw_material_cost_inr: (raw_material_cost_inr * 10.0).round() / 10.0,
            primary_process: primary_process.to_string(),
            machining_cycle_time_mins: (machining_cycle_time_mins * 10.0).round() / 10.0,
            machining_cost_inr: (machining_cost_inr * 10.0).round() / 10.0,
            tooling_cost_inr,
            prototype_unit_cost_inr: prototype_unit_cost_inr.round(),
            mass_production_unit_cost_inr: mass_production_unit_cost_inr.round(),
            iso_fit_tolerance,
            surface_finish_ra_um,
        }
    }
}
