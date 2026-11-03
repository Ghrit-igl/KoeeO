use crate::materials::Material;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BioChemAnalysisResult {
    pub is_valid: bool,
    pub is_biocompatible: bool,
    pub cytotoxicity_warning: Option<String>,
    pub galvanic_corrosion_risk: Option<String>,
}

pub struct BioChemistryEngine;

impl BioChemistryEngine {
    pub fn validate_medical_use(material: &Material, is_implant: bool) -> BioChemAnalysisResult {
        if is_implant && !material.biocompatible {
            return BioChemAnalysisResult {
                is_valid: false,
                is_biocompatible: false,
                cytotoxicity_warning: Some(format!(
                    "FATAL CYTOTOXICITY: '{}' releases toxic metal ions into human bloodstream/tissue (ISO 10993 failure). Must use Medical Grade Ti-6Al-4V ELI, PEEK-OPTIMA, or 316L Implant Steel.",
                    material.name
                )),
                galvanic_corrosion_risk: None,
            };
        }

        BioChemAnalysisResult {
            is_valid: true,
            is_biocompatible: material.biocompatible,
            cytotoxicity_warning: None,
            galvanic_corrosion_risk: None,
        }
    }

    pub fn check_galvanic_coupling(mat_a: &Material, mat_b: &Material) -> Option<String> {
        // Carbon fiber + Aluminum causes rapid galvanic oxidation of aluminum in moisture
        if (mat_a.id == "forged_carbon" && mat_b.id.contains("al"))
            || (mat_b.id == "forged_carbon" && mat_a.id.contains("al"))
        {
            return Some("SEVERE GALVANIC CORROSION: Carbon fiber cathode accelerates rapid electrochemical oxidation of Aluminum anode in presence of electrolyte. Non-conductive fiberglass or ceramic isolation spacer required.".to_string());
        }
        None
    }
}
