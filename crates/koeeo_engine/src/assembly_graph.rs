use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ShapeGeneratorType {
    RevolveCylinder,
    RevolvePistonDish,
    ExtrudeHBeam,
    InvoluteGear,
    LogarithmicImpeller,
    HelicalSpring,
    AirfoilLoft,
    CapsidPolyhedron,
    BlackHoleHorizon,
    BoxStructural,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum JointType {
    Revolute,     // Rotary pin bearing
    Prismatic,    // Linear slide
    Cylindrical,  // Rotate + Slide
    Spherical,    // Ball joint
    Fixed,        // Rigid weld or bolted flange
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartNode {
    pub id: String,
    pub name: String,
    pub role: String,
    pub material_id: String,
    pub shape_type: ShapeGeneratorType,
    pub dimensions_mm: Vec<f64>, // e.g. [bore, stroke, height] or [radius, thickness]
    pub position_offset: [f64; 3],
    pub rotation_rad: [f64; 3],
    pub explode_vector: [f64; 3],
    pub mass_grams: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JointConnection {
    pub parent_part_id: String,
    pub child_part_id: String,
    pub joint_type: JointType,
    pub anchor_offset_mm: [f64; 3],
    pub axis_of_motion: [f64; 3],
    pub motion_limits: [f64; 2],
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssemblyGraph {
    pub system_name: String,
    pub category: String,
    pub scale_unit: String, // "mm", "cm", "meters"
    pub total_parts: usize,
    pub parts: Vec<PartNode>,
    pub joints: Vec<JointConnection>,
    pub operational_rpm: Option<f64>,
    pub operational_temp_c: f64,
    pub ambient_pressure_bar: f64,
}

pub struct AssemblyGraphBuilder;

impl AssemblyGraphBuilder {
    pub fn build_ninja_h2r() -> AssemblyGraph {
        let parts = vec![
            PartNode {
                id: "crankshaft".to_string(),
                name: "Counterweighted Billet Crankshaft".to_string(),
                role: "Converts reciprocating linear piston forces into high-speed rotary torque".to_string(),
                material_id: "steel_4340".to_string(),
                shape_type: ShapeGeneratorType::RevolveCylinder,
                dimensions_mm: vec![35.0, 360.0, 55.0], // journal dia, length, stroke
                position_offset: [0.0, -1.3, 0.0],
                rotation_rad: [0.0, 0.0, std::f64::consts::FRAC_PI_2],
                explode_vector: [0.0, -1.8, 0.0],
                mass_grams: 6400.0,
            },
            PartNode {
                id: "conrod_01".to_string(),
                name: "H-Beam Serrated Connecting Rod".to_string(),
                role: "Articulating structural linkage transferring gas pressure to crankpin".to_string(),
                material_id: "titanium_gr5".to_string(),
                shape_type: ShapeGeneratorType::ExtrudeHBeam,
                dimensions_mm: vec![115.0, 38.0, 18.0], // c-c length, big end dia, small end dia
                position_offset: [0.0, 0.0, 0.0],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [1.4, 0.0, 0.0],
                mass_grams: 285.0,
            },
            PartNode {
                id: "piston_01".to_string(),
                name: "Forged Piston Crown & Slipper Skirt".to_string(),
                role: "Contains combustion flame pressure up to 185 bar and seals gas chamber".to_string(),
                material_id: "forged_al_2618".to_string(),
                shape_type: ShapeGeneratorType::RevolvePistonDish,
                dimensions_mm: vec![76.0, 44.5, 18.0], // bore, height, pin dia
                position_offset: [0.0, 1.45, 0.0],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, 2.6, 0.0],
                mass_grams: 185.0,
            },
            PartNode {
                id: "cylinder_liner".to_string(),
                name: "Nikasil-Coated Aluminum Cylinder Liner".to_string(),
                role: "Precision ground low-friction bore for high-speed piston reciprocation".to_string(),
                material_id: "cast_al_a356".to_string(),
                shape_type: ShapeGeneratorType::RevolveCylinder,
                dimensions_mm: vec![82.0, 76.0, 110.0], // outer dia, inner bore, height
                position_offset: [0.0, 1.1, 0.0],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, 0.5, -2.0],
                mass_grams: 920.0,
            },
            PartNode {
                id: "supercharger_impeller".to_string(),
                name: "Centrifugal Blower Impeller (12-Blade)".to_string(),
                role: "Compresses atmospheric air up to 2.4 bar boost spinning at 128,800 RPM".to_string(),
                material_id: "titanium_gr5".to_string(),
                shape_type: ShapeGeneratorType::LogarithmicImpeller,
                dimensions_mm: vec![69.0, 28.0, 12.0], // tip dia, hub dia, blade count
                position_offset: [2.6, 1.2, 0.0],
                rotation_rad: [std::f64::consts::FRAC_PI_2, 0.0, 0.0],
                explode_vector: [3.2, 0.8, 0.0],
                mass_grams: 142.0,
            },
            PartNode {
                id: "valves_assembly".to_string(),
                name: "Titanium Intake & Sodium-Filled Exhaust Valves".to_string(),
                role: "Regulates supersonic intake charge and exhaust gas evacuation at 14,200 RPM".to_string(),
                material_id: "titanium_gr5".to_string(),
                shape_type: ShapeGeneratorType::RevolveCylinder,
                dimensions_mm: vec![30.0, 5.0, 92.0], // head dia, stem dia, length
                position_offset: [0.0, 2.7, 0.0],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, 2.0, 0.0],
                mass_grams: 88.0,
            },
        ];

        let joints = vec![
            JointConnection {
                parent_part_id: "crankshaft".to_string(),
                child_part_id: "conrod_01".to_string(),
                joint_type: JointType::Revolute,
                anchor_offset_mm: [0.0, -27.5, 0.0],
                axis_of_motion: [1.0, 0.0, 0.0],
                motion_limits: [0.0, std::f64::consts::TAU],
                description: "Crankpin journal needle bearing converts crank angle rotation to rod oscillation".to_string(),
            },
            JointConnection {
                parent_part_id: "conrod_01".to_string(),
                child_part_id: "piston_01".to_string(),
                joint_type: JointType::Revolute,
                anchor_offset_mm: [0.0, 60.0, 0.0],
                axis_of_motion: [1.0, 0.0, 0.0],
                motion_limits: [-0.35, 0.35],
                description: "Floating wrist pin joint transfers reciprocating inertia from rod to piston".to_string(),
            },
            JointConnection {
                parent_part_id: "cylinder_liner".to_string(),
                child_part_id: "piston_01".to_string(),
                joint_type: JointType::Prismatic,
                anchor_offset_mm: [0.0, 0.0, 0.0],
                axis_of_motion: [0.0, 1.0, 0.0],
                motion_limits: [-27.5, 27.5],
                description: "Linear sliding constraint with 0.045mm piston-to-bore oil film clearance".to_string(),
            },
            JointConnection {
                parent_part_id: "crankshaft".to_string(),
                child_part_id: "supercharger_impeller".to_string(),
                joint_type: JointType::Revolute,
                anchor_offset_mm: [180.0, 0.0, 0.0],
                axis_of_motion: [0.0, 0.0, 1.0],
                motion_limits: [0.0, std::f64::consts::TAU],
                description: "Planetary gear step-up drive (9.2:1 ratio) spins impeller at 128,800 RPM".to_string(),
            },
        ];

        AssemblyGraph {
            system_name: "Kawasaki Ninja H2R Supercharged 998cc".to_string(),
            category: "Mechanical Propulsion".to_string(),
            scale_unit: "mm".to_string(),
            total_parts: parts.len(),
            parts,
            joints,
            operational_rpm: Some(14200.0),
            operational_temp_c: 650.0,
            ambient_pressure_bar: 1.013,
        }
    }

    pub fn build_from_prompt(prompt: &str) -> AssemblyGraph {
        let p_lower = prompt.to_lowercase();
        if p_lower.contains("black") || p_lower.contains("kerr") || p_lower.contains("hole") || p_lower.contains("space") && p_lower.contains("time") {
            Self::build_black_hole()
        } else if p_lower.contains("virus") || p_lower.contains("pathogen") || p_lower.contains("capsid") || p_lower.contains("covid") {
            Self::build_pathogen()
        } else if p_lower.contains("jet") || p_lower.contains("turbofan") || p_lower.contains("turbine") || p_lower.contains("aircraft") || p_lower.contains("airplane") {
            Self::build_turbofan()
        } else if p_lower.contains("rocket") || p_lower.contains("raptor") || p_lower.contains("merlin") || p_lower.contains("propulsion") || p_lower.contains("nozzle") {
            Self::build_rocket_engine()
        } else if p_lower.contains("bionic") || p_lower.contains("hand") || p_lower.contains("prosthetic") || p_lower.contains("orthopedic") || p_lower.contains("finger") {
            Self::build_bionic_hand()
        } else {
            Self::build_ninja_h2r()
        }
    }

    pub fn build_turbofan() -> AssemblyGraph {
        let parts = vec![
            PartNode {
                id: "fan_rotor".to_string(),
                name: "Wide-Chord Titanium Fan Blisk".to_string(),
                role: "Generates 82% of total bypass thrust accelerating bypass airflow".to_string(),
                material_id: "titanium_gr5".to_string(),
                shape_type: ShapeGeneratorType::LogarithmicImpeller,
                dimensions_mm: vec![1850.0, 320.0, 24.0], // tip dia, hub dia, blade count
                position_offset: [0.0, 0.0, 2.2],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, 0.0, 2.8],
                mass_grams: 145000.0,
            },
            PartNode {
                id: "compressor_spool".to_string(),
                name: "High-Pressure 9-Stage Compressor Rotor".to_string(),
                role: "Compresses core air by 23:1 pressure ratio before combustor entry".to_string(),
                material_id: "inconel_718".to_string(),
                shape_type: ShapeGeneratorType::RevolveCylinder,
                dimensions_mm: vec![620.0, 1100.0, 9.0],
                position_offset: [0.0, 0.0, 0.6],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, 0.0, 1.2],
                mass_grams: 82000.0,
            },
            PartNode {
                id: "combustor_liner".to_string(),
                name: "Annular Low-NOx Combustion Chamber".to_string(),
                role: "Mixes atomized jet-A fuel sustaining 1650°C stoichiometric flame".to_string(),
                material_id: "silicon_nitride".to_string(),
                shape_type: ShapeGeneratorType::RevolveCylinder,
                dimensions_mm: vec![740.0, 480.0, 680.0],
                position_offset: [0.0, 0.0, -0.6],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, 1.8, 0.0],
                mass_grams: 38000.0,
            },
            PartNode {
                id: "hp_turbine".to_string(),
                name: "Single-Crystal High Pressure Turbine Stage".to_string(),
                role: "Extracts enthalpy from 1500°C combustion gas to drive compressor spool".to_string(),
                material_id: "inconel_718".to_string(),
                shape_type: ShapeGeneratorType::LogarithmicImpeller,
                dimensions_mm: vec![640.0, 280.0, 56.0],
                position_offset: [0.0, 0.0, -1.5],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, 0.0, -1.4],
                mass_grams: 54000.0,
            },
            PartNode {
                id: "exhaust_nozzle".to_string(),
                name: "Convergent Variable Area Exhaust Nozzle".to_string(),
                role: "Accelerates core combustion gas to supersonic Mach 1.4 exit velocity".to_string(),
                material_id: "titanium_gr5".to_string(),
                shape_type: ShapeGeneratorType::RevolveCylinder,
                dimensions_mm: vec![890.0, 720.0, 850.0],
                position_offset: [0.0, 0.0, -2.6],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, 0.0, -2.6],
                mass_grams: 46000.0,
            },
        ];

        let joints = vec![
            JointConnection {
                parent_part_id: "fan_rotor".to_string(),
                child_part_id: "hp_turbine".to_string(),
                joint_type: JointType::Revolute,
                anchor_offset_mm: [0.0, 0.0, 0.0],
                axis_of_motion: [0.0, 0.0, 1.0],
                motion_limits: [0.0, std::f64::consts::TAU],
                description: "Low-pressure coaxial drive shaft transferring turbine torque to bypass fan".to_string(),
            },
            JointConnection {
                parent_part_id: "compressor_spool".to_string(),
                child_part_id: "hp_turbine".to_string(),
                joint_type: JointType::Revolute,
                anchor_offset_mm: [0.0, 0.0, 0.0],
                axis_of_motion: [0.0, 0.0, 1.0],
                motion_limits: [0.0, std::f64::consts::TAU],
                description: "High-pressure concentric hollow shaft spinning at 16,800 RPM".to_string(),
            },
        ];

        AssemblyGraph {
            system_name: "GE-X90 High-Bypass Commercial Turbofan".to_string(),
            category: "Aviation Gas Turbine".to_string(),
            scale_unit: "mm".to_string(),
            total_parts: parts.len(),
            parts,
            joints,
            operational_rpm: Some(16800.0),
            operational_temp_c: 1450.0,
            ambient_pressure_bar: 0.26,
        }
    }

    pub fn build_rocket_engine() -> AssemblyGraph {
        let parts = vec![
            PartNode {
                id: "injector_head".to_string(),
                name: "Coaxial Swirl Injector Dome".to_string(),
                role: "Atomizes cryogenic LOX & Liquid Methane at 300 bar chamber pressure".to_string(),
                material_id: "inconel_718".to_string(),
                shape_type: ShapeGeneratorType::RevolveCylinder,
                dimensions_mm: vec![420.0, 180.0, 120.0],
                position_offset: [0.0, 2.4, 0.0],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, 1.8, 0.0],
                mass_grams: 48000.0,
            },
            PartNode {
                id: "regen_chamber".to_string(),
                name: "Milled CuCrZr Regenerative Combustion Chamber".to_string(),
                role: "Milled 180 cooling channels channel sub-zero fuel keeping inner wall below 520°C".to_string(),
                material_id: "copper_cucrzr".to_string(),
                shape_type: ShapeGeneratorType::RevolveCylinder,
                dimensions_mm: vec![380.0, 210.0, 650.0],
                position_offset: [0.0, 1.0, 0.0],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [1.6, 0.0, 0.0],
                mass_grams: 62000.0,
            },
            PartNode {
                id: "bell_nozzle".to_string(),
                name: "Niobium C-103 De Laval Expansion Nozzle".to_string(),
                role: "Expands supersonic exhaust to Mach 4.2 with 80:1 area expansion ratio".to_string(),
                material_id: "niobium_c103".to_string(),
                shape_type: ShapeGeneratorType::RevolveCylinder,
                dimensions_mm: vec![1250.0, 210.0, 1400.0],
                position_offset: [0.0, -1.2, 0.0],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, -2.4, 0.0],
                mass_grams: 85000.0,
            },
            PartNode {
                id: "turbopump".to_string(),
                name: "Dual-Shaft Cryogenic Turbopump".to_string(),
                role: "Spins at 36,000 RPM pumping 650 kg/s of propellant at 320 bar".to_string(),
                material_id: "titanium_gr5".to_string(),
                shape_type: ShapeGeneratorType::LogarithmicImpeller,
                dimensions_mm: vec![280.0, 95.0, 16.0],
                position_offset: [1.8, 1.6, 0.0],
                rotation_rad: [0.0, 0.0, std::f64::consts::FRAC_PI_2],
                explode_vector: [2.5, 0.8, 0.0],
                mass_grams: 32000.0,
            },
            PartNode {
                id: "gimbal_ring".to_string(),
                name: "Dual-Axis Thrust Vectoring Gimbal Bearing".to_string(),
                role: "Allows +/- 8 degrees of pitch and yaw thrust vector actuation in flight".to_string(),
                material_id: "steel_4340".to_string(),
                shape_type: ShapeGeneratorType::RevolveCylinder,
                dimensions_mm: vec![520.0, 440.0, 75.0],
                position_offset: [0.0, 2.9, 0.0],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, 2.6, 0.0],
                mass_grams: 28000.0,
            },
        ];

        let joints = vec![
            JointConnection {
                parent_part_id: "gimbal_ring".to_string(),
                child_part_id: "injector_head".to_string(),
                joint_type: JointType::Spherical,
                anchor_offset_mm: [0.0, 0.0, 0.0],
                axis_of_motion: [1.0, 1.0, 0.0],
                motion_limits: [-0.14, 0.14],
                description: "2-Axis hydraulic gimbal actuators for rocket ascent vector steering".to_string(),
            },
            JointConnection {
                parent_part_id: "injector_head".to_string(),
                child_part_id: "regen_chamber".to_string(),
                joint_type: JointType::Fixed,
                anchor_offset_mm: [0.0, 0.0, 0.0],
                axis_of_motion: [0.0, 0.0, 0.0],
                motion_limits: [0.0, 0.0],
                description: "Bolted structural flange sealed with gold-plated metallic C-rings".to_string(),
            },
            JointConnection {
                parent_part_id: "regen_chamber".to_string(),
                child_part_id: "bell_nozzle".to_string(),
                joint_type: JointType::Fixed,
                anchor_offset_mm: [0.0, 0.0, 0.0],
                axis_of_motion: [0.0, 0.0, 0.0],
                motion_limits: [0.0, 0.0],
                description: "Electron-beam welded throat transition joint".to_string(),
            },
        ];

        AssemblyGraph {
            system_name: "Raptor Full-Flow Staged Combustion Rocket Engine".to_string(),
            category: "Aerospace Rocket Propulsion".to_string(),
            scale_unit: "mm".to_string(),
            total_parts: parts.len(),
            parts,
            joints,
            operational_rpm: Some(36000.0),
            operational_temp_c: 3300.0,
            ambient_pressure_bar: 0.001,
        }
    }

    pub fn build_bionic_hand() -> AssemblyGraph {
        let parts = vec![
            PartNode {
                id: "palm_chassis".to_string(),
                name: "3D-Printed Titanium Metacarpal Palm Chassis".to_string(),
                role: "Houses micro-servos and provides skeletal anchor for all 5 digit kinematics".to_string(),
                material_id: "titanium_gr5".to_string(),
                shape_type: ShapeGeneratorType::BoxStructural,
                dimensions_mm: vec![95.0, 85.0, 32.0],
                position_offset: [0.0, -1.0, 0.0],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, -1.6, 0.0],
                mass_grams: 185.0,
            },
            PartNode {
                id: "servo_actuators".to_string(),
                name: "Neodymium Micro-Linear Actuator Spool".to_string(),
                role: "Drives Dyneema tendon cables pulling fingers with 45 N grip pinch force".to_string(),
                material_id: "steel_4340".to_string(),
                shape_type: ShapeGeneratorType::RevolveCylinder,
                dimensions_mm: vec![16.0, 42.0, 12.0],
                position_offset: [0.0, -0.9, 0.3],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, -0.8, 1.2],
                mass_grams: 95.0,
            },
            PartNode {
                id: "proximal_phalanx".to_string(),
                name: "PEEK-OPTIMA Proximal Finger Bone Link".to_string(),
                role: "Biocompatible load-bearing finger segment flexing around MCP joint".to_string(),
                material_id: "peek_optima".to_string(),
                shape_type: ShapeGeneratorType::ExtrudeHBeam,
                dimensions_mm: vec![45.0, 14.0, 12.0],
                position_offset: [0.0, 0.3, 0.0],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, 0.6, 0.0],
                mass_grams: 28.0,
            },
            PartNode {
                id: "distal_phalanx".to_string(),
                name: "Articulated Distal Phalanx Segment".to_string(),
                role: "Terminal finger bone with pulley guides for precision pinch articulation".to_string(),
                material_id: "peek_optima".to_string(),
                shape_type: ShapeGeneratorType::ExtrudeHBeam,
                dimensions_mm: vec![28.0, 12.0, 10.0],
                position_offset: [0.0, 1.4, 0.0],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, 1.4, 0.0],
                mass_grams: 16.0,
            },
            PartNode {
                id: "tactile_fingertip".to_string(),
                name: "Medical Silicone Piezoresistive Fingertip".to_string(),
                role: "Provides human-grade friction grip and 0.05 N touch sensitivity feedback".to_string(),
                material_id: "medical_silicone".to_string(),
                shape_type: ShapeGeneratorType::BoxStructural,
                dimensions_mm: vec![18.0, 14.0, 8.0],
                position_offset: [0.0, 2.1, 0.0],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, 2.2, 0.0],
                mass_grams: 8.0,
            },
        ];

        let joints = vec![
            JointConnection {
                parent_part_id: "palm_chassis".to_string(),
                child_part_id: "proximal_phalanx".to_string(),
                joint_type: JointType::Revolute,
                anchor_offset_mm: [0.0, 45.0, 0.0],
                axis_of_motion: [1.0, 0.0, 0.0],
                motion_limits: [-0.1, 1.57],
                description: "Metacarpophalangeal (MCP) knuckle revolute joint with 90° flexion".to_string(),
            },
            JointConnection {
                parent_part_id: "proximal_phalanx".to_string(),
                child_part_id: "distal_phalanx".to_string(),
                joint_type: JointType::Revolute,
                anchor_offset_mm: [0.0, 40.0, 0.0],
                axis_of_motion: [1.0, 0.0, 0.0],
                motion_limits: [0.0, 1.40],
                description: "Interphalangeal (PIP/DIP) tendon-coupled flexion joint".to_string(),
            },
        ];

        AssemblyGraph {
            system_name: "Neuro-Prosthetic Bionic Articulated Hand".to_string(),
            category: "Biomedical Prosthetics".to_string(),
            scale_unit: "mm".to_string(),
            total_parts: parts.len(),
            parts,
            joints,
            operational_rpm: None,
            operational_temp_c: 37.0,
            ambient_pressure_bar: 1.013,
        }
    }

    pub fn build_black_hole() -> AssemblyGraph {
        let parts = vec![
            PartNode {
                id: "event_horizon".to_string(),
                name: "Event Horizon Sphere".to_string(),
                role: "Spacetime boundary beyond which null geodesics cannot escape to infinity".to_string(),
                material_id: "tungsten_pure".to_string(), // Proxy
                shape_type: ShapeGeneratorType::BlackHoleHorizon,
                dimensions_mm: vec![1600.0, 1600.0, 1600.0],
                position_offset: [0.0, 0.0, 0.0],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, 0.0, 0.0],
                mass_grams: 1.989e33,
            },
            PartNode {
                id: "accretion_disk".to_string(),
                name: "Relativistic Relativistic Accretion Disk".to_string(),
                role: "Plasma friction heating up to 10^7 Kelvin emitting intense X-ray synchrotron flux".to_string(),
                material_id: "silicon_nitride".to_string(),
                shape_type: ShapeGeneratorType::LogarithmicImpeller,
                dimensions_mm: vec![3500.0, 2000.0, 200.0],
                position_offset: [0.0, 0.0, 0.0],
                rotation_rad: [0.52, 0.0, 0.0],
                explode_vector: [0.0, 0.0, 0.0],
                mass_grams: 5.0e28,
            },
        ];

        AssemblyGraph {
            system_name: "Kerr Relativistic Black Hole (Spin a=0.94)".to_string(),
            category: "Astrophysics / Spacetime".to_string(),
            scale_unit: "km".to_string(),
            total_parts: parts.len(),
            parts,
            joints: vec![],
            operational_rpm: Some(45000.0),
            operational_temp_c: 1.0e6,
            ambient_pressure_bar: 1.0e-12,
        }
    }

    pub fn build_pathogen() -> AssemblyGraph {
        let parts = vec![
            PartNode {
                id: "viral_capsid".to_string(),
                name: "T=13 Icosahedral Protein Capsid".to_string(),
                role: "780 capsomer shell protecting the encapsulated positive-sense viral RNA genome".to_string(),
                material_id: "peek_optima".to_string(),
                shape_type: ShapeGeneratorType::CapsidPolyhedron,
                dimensions_mm: vec![120.0, 120.0, 120.0],
                position_offset: [0.0, 0.0, 0.0],
                rotation_rad: [0.0, 0.0, 0.0],
                explode_vector: [0.0, 0.0, 0.0],
                mass_grams: 1.2e-18,
            },
        ];

        AssemblyGraph {
            system_name: "Synthetic Pathogen Capsid (T=13)".to_string(),
            category: "Molecular Virology".to_string(),
            scale_unit: "nm".to_string(),
            total_parts: parts.len(),
            parts,
            joints: vec![],
            operational_rpm: None,
            operational_temp_c: 37.0,
            ambient_pressure_bar: 1.013,
        }
    }
}
