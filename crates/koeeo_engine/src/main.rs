pub mod materials;
pub mod thermodynamics;
pub mod mechanics;
pub mod bio_chemistry;
pub mod manufacturing;
pub mod assembly_graph;
pub mod jarvis;

use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::thread;

use materials::MaterialDatabase;
use jarvis::JarvisConsultant;
use assembly_graph::AssemblyGraphBuilder;
use serde_json::json;

fn get_str_field(json_val: &serde_json::Value, query_str: &str, field_name: &str, default: &str) -> String {
    if let Some(v) = json_val.get(field_name).and_then(|v| v.as_str()) {
        return v.to_string();
    }
    for pair in query_str.split('&') {
        let mut kv = pair.split('=');
        if let (Some(k), Some(v)) = (kv.next(), kv.next()) {
            if k.eq_ignore_ascii_case(field_name) {
                let decoded = v.replace("%20", " ").replace('+', " ");
                return decoded;
            }
        }
    }
    default.to_string()
}

fn get_f64_field(json_val: &serde_json::Value, query_str: &str, field_name: &str, default: f64) -> f64 {
    if let Some(v) = json_val.get(field_name).and_then(|v| v.as_f64()) {
        return v;
    }
    for pair in query_str.split('&') {
        let mut kv = pair.split('=');
        if let (Some(k), Some(v)) = (kv.next(), kv.next()) {
            if k.eq_ignore_ascii_case(field_name) {
                if let Ok(num) = v.parse::<f64>() {
                    return num;
                }
            }
        }
    }
    default
}

fn handle_client(mut stream: TcpStream) {
    let mut buffer = [0u8; 8192];
    let bytes_read = match stream.read(&mut buffer) {
        Ok(n) if n > 0 => n,
        _ => return,
    };

    let request = String::from_utf8_lossy(&buffer[..bytes_read]);
    let first_line = request.lines().next().unwrap_or("");
    let parts: Vec<&str> = first_line.split_whitespace().collect();

    if parts.len() < 2 {
        return;
    }

    let method = parts[0];
    let full_path = parts[1];
    let route = full_path.split('?').next().unwrap_or(full_path);
    let query_string = full_path.split('?').nth(1).unwrap_or("");

    let body_str = if let Some(b) = request.split("\r\n\r\n").nth(1) {
        b
    } else {
        request.split("\n\n").nth(1).unwrap_or("")
    };
    let parsed_json: serde_json::Value = serde_json::from_str(body_str).unwrap_or_default();

    let (status_code, content_type, body) = match (method, route) {
        ("GET", "/api/health") => (
            "200 OK",
            "application/json",
            json!({
                "status": "online",
                "engine": "KoeeO Rust Physics & Reality Engine v1.0.0",
                "architecture": "Pure Rust Native Microsecond Runtime",
                "materials_count": MaterialDatabase::get_all().len(),
                "laws_enforced": [
                    "Thermodynamic Pyrolysis & Phase Melting",
                    "von Mises Continuum Stress Tensors",
                    "Wöhler S-N Cyclic Fatigue & Relapse Risk",
                    "ISO 10993 Biomedical Cytotoxicity",
                    "Galvanic Coupling Corrosion Matrix"
                ]
            }).to_string(),
        ),

        ("GET", "/api/materials") => (
            "200 OK",
            "application/json",
            serde_json::to_string(&MaterialDatabase::get_all()).unwrap_or_default(),
        ),

        ("POST", "/api/consult") | ("GET", "/api/consult") => {
            let query = get_str_field(&parsed_json, query_string, "query", "Wood Turbine Rotor");
            let component = get_str_field(&parsed_json, query_string, "component", "turbine_rotor");
            let material = get_str_field(&parsed_json, query_string, "material", "oak_wood");
            let temp = get_f64_field(&parsed_json, query_string, "temp_c", 600.0);
            let stress = get_f64_field(&parsed_json, query_string, "stress_mpa", 320.0);

            let report = JarvisConsultant::evaluate_design(&query, &component, &material, temp, stress);
            (
                "200 OK",
                "application/json",
                serde_json::to_string(&report).unwrap_or_default(),
            )
        }

        ("POST", "/api/synthesize") | ("GET", "/api/synthesize") => {
            let prompt = get_str_field(&parsed_json, query_string, "prompt", "Kawasaki Ninja H2R");
            let graph = AssemblyGraphBuilder::build_from_prompt(&prompt);
            (
                "200 OK",
                "application/json",
                serde_json::to_string(&graph).unwrap_or_default(),
            )
        }

        ("POST", "/api/validate_parametric") | ("GET", "/api/validate_parametric") => {
            let mat_id = get_str_field(&parsed_json, query_string, "material_id", "titanium_gr5");
            let temp_c = get_f64_field(&parsed_json, query_string, "temp_c", 320.0);
            let bore_mm = get_f64_field(&parsed_json, query_string, "bore_mm", 76.0);
            let stroke_mm = get_f64_field(&parsed_json, query_string, "stroke_mm", 55.0);
            let boost_bar = get_f64_field(&parsed_json, query_string, "boost_bar", 2.4);
            let rpm = get_f64_field(&parsed_json, query_string, "rpm", 14200.0);

            let mat = MaterialDatabase::find_by_id(&mat_id)
                .unwrap_or_else(|| MaterialDatabase::get_all()[0].clone());

            let piston_area_mm2 = std::f64::consts::PI * (bore_mm / 2.0).powi(2);
            let peak_cyl_pressure_bar = (100.0 + boost_bar * 35.0).max(10.0);
            let peak_gas_force_n = peak_cyl_pressure_bar * 0.1 * piston_area_mm2; // bar to N/mm2 = 0.1

            let thermal = thermodynamics::ThermodynamicsEngine::analyze(&mat, 25.0, temp_c, stroke_mm);
            let mechanics = mechanics::MechanicsEngine::analyze(
                &mat,
                peak_gas_force_n,
                piston_area_mm2 * 0.22, // pin & skirt bearing area
                peak_gas_force_n * 0.25, // side thrust shear
                thermal.thermal_stress_mpa,
                temp_c,
            );

            let volume_cm3 = (piston_area_mm2 * 45.0) / 1000.0;
            let mfg = manufacturing::ManufacturingEngine::estimate_cost("Parametric Piston", &mat, volume_cm3, true);

            let overall_status = if !thermal.is_valid || mechanics.safety_factor < 1.15 {
                "FAIL"
            } else if mechanics.safety_factor < 1.75 || thermal.violation_reason.is_some() {
                "REVIEW_REQUIRED"
            } else {
                "PASS"
            };

            let response_data = json!({
                "status": overall_status,
                "material": mat.name,
                "material_id": mat.id,
                "bore_mm": bore_mm,
                "stroke_mm": stroke_mm,
                "boost_bar": boost_bar,
                "rpm": rpm,
                "peak_gas_force_n": peak_gas_force_n.round(),
                "thermal": thermal,
                "mechanics": mechanics,
                "manufacturing": mfg,
            });

            (
                "200 OK",
                "application/json",
                response_data.to_string(),
            )
        }

        ("POST", "/api/export") | ("GET", "/api/export") => {
            let prompt = get_str_field(&parsed_json, query_string, "prompt", "Kawasaki Ninja H2R");
            let format = get_str_field(&parsed_json, query_string, "format", "step");
            let graph = AssemblyGraphBuilder::build_from_prompt(&prompt);

            match format.as_str() {
                "bom_csv" => {
                    let mut csv = String::from("Part_ID,Part_Name,Role,Material,Mass_Grams,Estimated_Cost_INR\n");
                    for part in &graph.parts {
                        let mat = MaterialDatabase::find_by_id(&part.material_id)
                            .unwrap_or_else(|| MaterialDatabase::get_all()[0].clone());
                        let cost = (part.mass_grams / 1000.0) * mat.market_rate_inr_per_kg * 1.5;
                        csv.push_str(&format!(
                            "\"{}\",\"{}\",\"{}\",\"{}\",{:.1},{:.0}\n",
                            part.id, part.name, part.role, mat.name, part.mass_grams, cost
                        ));
                    }
                    (
                        "200 OK",
                        "text/csv; charset=utf-8",
                        csv,
                    )
                }
                "drawing" => {
                    let mut spec = format!("==========================================================\n");
                    spec.push_str(&format!("  KOEEO MANUFACTURING TOLERANCE & QUALITY DRAWING SPEC\n"));
                    spec.push_str(&format!("  System: {}\n", graph.system_name));
                    spec.push_str(&format!("  Category: {} | Scale Unit: {}\n", graph.category, graph.scale_unit));
                    spec.push_str(&format!("==========================================================\n\n"));
                    for part in &graph.parts {
                        let mat = MaterialDatabase::find_by_id(&part.material_id)
                            .unwrap_or_else(|| MaterialDatabase::get_all()[0].clone());
                        spec.push_str(&format!("COMPONENT: {}\n", part.name));
                        spec.push_str(&format!("  • Material: {} (Density: {:.2} g/cm3)\n", mat.name, mat.density_g_cm3));
                        spec.push_str(&format!("  • Yield Strength: {:.0} MPa | Max Temp: {:.0}°C\n", mat.yield_strength_mpa, mat.max_service_temp_c));
                        spec.push_str(&format!("  • Critical Tolerance: ISO js6 / H7 (+/- 0.012 mm)\n"));
                        spec.push_str(&format!("  • Surface Roughness: Ra 0.4 μm (Precision Ground)\n\n"));
                    }
                    (
                        "200 OK",
                        "text/plain; charset=utf-8",
                        spec,
                    )
                }
                _ => {
                    let mut step = String::from("ISO-10303-21;\nHEADER;\n");
                    step.push_str("FILE_DESCRIPTION(('KoeeO Parametric CAD Model','Universal Engine'),'2;1');\n");
                    step.push_str(&format!("FILE_NAME('KoeeO_{}.step','2026-10-27T00:00:00',('KoeeO Author'),('DeepMind / KoeeO Team'),'KoeeO Rust CAD Engine v1.0','KoeeO Universal CAD System','None');\n", graph.category.replace(' ', "_")));
                    step.push_str("FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }'));\nENDSEC;\nDATA;\n");
                    step.push_str("#1 = APPLICATION_CONTEXT('mechanical design');\n");
                    step.push_str("#2 = APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',2000,#1);\n");
                    step.push_str(&format!("#3 = PRODUCT('{}','{}','',(#4));\n", graph.system_name, graph.category));
                    step.push_str("#4 = PRODUCT_CONTEXT('',#1,'mechanical');\n");
                    for (i, part) in graph.parts.iter().enumerate() {
                        let id_base = 10 + i * 5;
                        step.push_str(&format!("#{} = PRODUCT_DEFINITION_FORMATION('1.0','{}',#3);\n", id_base, part.id));
                        step.push_str(&format!("#{} = CARTESIAN_POINT('Position',({:.3},{:.3},{:.3}));\n", id_base + 1, part.position_offset[0], part.position_offset[1], part.position_offset[2]));
                        step.push_str(&format!("#{} = DIRECTION('Axis',({:.3},{:.3},{:.3}));\n", id_base + 2, part.explode_vector[0], part.explode_vector[1], part.explode_vector[2]));
                    }
                    step.push_str("ENDSEC;\nEND-ISO-10303-21;\n");
                    (
                        "200 OK",
                        "text/plain; charset=utf-8",
                        step,
                    )
                }
            }
        }

        ("GET", "/") | ("HEAD", "/") => {
            let html_content = std::fs::read_to_string("hologram_ui/index.html")
                .or_else(|_| std::fs::read_to_string("../../hologram_ui/index.html"))
                .or_else(|_| std::fs::read_to_string("d:/KoeeO/hologram_ui/index.html"))
                .unwrap_or_else(|_| include_str!("../../../hologram_ui/index.html").to_string());
            (
                "200 OK",
                "text/html; charset=utf-8",
                html_content,
            )
        }

        _ => (
            "404 NOT FOUND",
            "application/json",
            json!({"error": "Endpoint not found"}).to_string(),
        ),
    };

    let response = format!(
        "HTTP/1.1 {}\r\nContent-Type: {}\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\n{}",
        status_code,
        content_type,
        body.len(),
        body
    );

    let _ = stream.write_all(response.as_bytes());
}

fn main() {
    let port = 8080;
    let bind_addr = format!("0.0.0.0:{}", port);
    let listener = match TcpListener::bind(&bind_addr) {
        Ok(l) => l,
        Err(e) => {
            eprintln!("[KoeeO Rust Engine Error] Failed to bind port {}: {}", port, e);
            std::process::exit(1);
        }
    };

    println!("==========================================================");
    println!("   KOEEO // RUST & AAYU UNIVERSAL REALITY ENGINE          ");
    println!("   Physics, Chemistry, Materials & Autonomous Holograms   ");
    println!("   Port: http://localhost:{}                               ", port);
    println!("==========================================================");

    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                thread::spawn(move || {
                    handle_client(stream);
                });
            }
            Err(e) => eprintln!("[Server Error] {}", e),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use materials::MaterialDatabase;
    use jarvis::JarvisConsultant;
    use thermodynamics::ThermodynamicsEngine;

    #[test]
    fn test_wood_at_600c_pyrolysis_violation() {
        // Reality Test 1: Wood MUST fail at 600°C!
        let oak = MaterialDatabase::find_by_id("oak_wood").expect("Oak wood should exist");
        let result = ThermodynamicsEngine::analyze(&oak, 25.0, 600.0, 100.0);
        assert!(!result.is_valid, "Oak wood at 600°C must NOT be physically valid!");
        assert!(
            result.violation_reason.unwrap().contains("PYROLYSIS"),
            "Violation must specify thermal pyrolysis!"
        );
    }

    #[test]
    fn test_jarvis_4_advice_alternatives() {
        // Reality Test 2: When user asks for wood at 600°C, JARVIS must reject and give 4 alternatives
        let report = JarvisConsultant::evaluate_design(
            "Wood Turbine Rotor",
            "rotor_blade",
            "oak_wood",
            600.0,
            250.0,
        );
        assert!(!report.is_valid);
        assert_eq!(report.status, "PHYSICAL_VIOLATION_REJECTED");
        assert_eq!(report.advice_options.len(), 4, "Must provide exactly 4 engineering alternatives!");
        
        // Option 1 must be Inconel 718 or ceramic
        assert!(report.advice_options.iter().any(|o| o.material_id == "inconel_718"));
        assert!(report.advice_options.iter().any(|o| o.material_id == "silicon_nitride"));
    }

    #[test]
    fn test_inconel_at_650c_is_valid() {
        // Reality Test 3: Inconel 718 MUST be valid at 650°C!
        let inconel = MaterialDatabase::find_by_id("inconel_718").expect("Inconel 718 must exist");
        let result = ThermodynamicsEngine::analyze(&inconel, 25.0, 650.0, 100.0);
        assert!(result.is_valid, "Inconel 718 at 650°C must be physically valid!");
    }

    #[test]
    fn test_assembly_graph_kinematic_joints() {
        // Reality Test 4: Assembly graph must have valid joints and parts
        let graph = AssemblyGraphBuilder::build_ninja_h2r();
        assert_eq!(graph.parts.len(), 6);
        assert_eq!(graph.joints.len(), 4);
        assert!(graph.joints.iter().any(|j| j.parent_part_id == "crankshaft" && j.child_part_id == "conrod_01"));
    }

    #[test]
    fn test_turbofan_assembly_synthesis() {
        let graph = AssemblyGraphBuilder::build_from_prompt("Commercial Jet Turbofan");
        assert_eq!(graph.category, "Aviation Gas Turbine");
        assert_eq!(graph.parts.len(), 5);
        assert!(graph.parts.iter().any(|p| p.id == "fan_rotor"));
        assert!(graph.parts.iter().any(|p| p.id == "hp_turbine"));
    }

    #[test]
    fn test_bionic_hand_assembly_synthesis() {
        let graph = AssemblyGraphBuilder::build_from_prompt("Bionic Hand Prosthetic");
        assert_eq!(graph.category, "Biomedical Prosthetics");
        assert_eq!(graph.parts.len(), 5);
        assert!(graph.parts.iter().any(|p| p.id == "tactile_fingertip"));
    }

    #[test]
    fn test_prompt_query_resolution() {
        let graph_rocket = AssemblyGraphBuilder::build_from_prompt("SpaceX Raptor Rocket");
        assert_eq!(graph_rocket.category, "Aerospace Rocket Propulsion");
        assert_eq!(graph_rocket.parts.len(), 5);
    }
}
