"""
Biomedical Pathogen & Root-Cause Drug Discovery Engine — KoeeO Science Lab.

Focus Target: Acinetobacter baumannii Outer-Membrane Lipid A Biosynthesis (LpxC Enzyme).
Root Cause Mechanism:
- LpxC (UDP-3-O-(R-3-hydroxymyristoyl)-N-acetylglucosamine deacetylase) catalyzes the
  first committed, irreversible step of Lipid A / lipopolysaccharide (LPS) outer membrane assembly.
- Inhibition suppresses endotoxic septic shock (TLR4 shedding) and reverses colistin/carbapenem resistance.

Enzyme Kinetics:
- Michaelis-Menten competitive inhibition:
    v_i = (V_max * [S]) / (K_m * (1 + [I] / K_i) + [S])
- Thermodynamic Gibbs Free Energy:
    Delta G_bind = R * T * ln(K_i)  [kJ/mol]
"""

import math
from typing import Dict, Any, List

R_GAS_CONST = 8.314462   # J / (mol K)
T_PHYSIO_K = 310.15      # 37 degrees C physiological body temp


def compute_lpxc_kinetics(
    inhibitor_conc_um: float = 0.5,
    substrate_conc_um: float = 10.0,
    k_i_um: float = 0.05,       # High potency nanomolar inhibitor (e.g. LPC-069)
    v_max_nmol_min: float = 120.0,
    k_m_um: float = 8.5,
) -> Dict[str, Any]:
    """
    Compute enzyme catalytic deacetylation rate and inhibition efficacy.
    """
    # Uninhibited velocity
    v_uninhibited = (v_max_nmol_min * substrate_conc_um) / (k_m_um + substrate_conc_um)

    # Competitive inhibition velocity
    apparent_km = k_m_um * (1.0 + (inhibitor_conc_um / k_i_um))
    v_inhibited = (v_max_nmol_min * substrate_conc_um) / (apparent_km + substrate_conc_um)

    inhibition_percent = ((v_uninhibited - v_inhibited) / v_uninhibited) * 100.0

    # Thermodynamic binding free energy: Delta G = R * T * ln(K_i_Molar) in kJ/mol
    k_i_molar = k_i_um * 1e-6
    delta_g_kj_mol = (R_GAS_CONST * T_PHYSIO_K * math.log(k_i_molar)) / 1000.0

    # TLR4 Endotoxic Shock Mitigation score (inversely proportional to remaining lipid A)
    endotoxin_suppression = min(99.9, inhibition_percent * 1.05)

    return {
        "target_pathogen": "Acinetobacter baumannii (Multi-Drug Resistant CRAB)",
        "target_enzyme": "LpxC Deacetylase (Zinc Metalloprotease)",
        "root_cause_pathway": "Gram-negative outer membrane Lipid A biosynthesis",
        "inhibitor_concentration_uM": inhibitor_conc_um,
        "binding_affinity_ki_uM": k_i_um,
        "gibbs_free_energy_dG_kj_mol": round(delta_g_kj_mol, 2),
        "catalytic_velocity_nmol_min": round(v_inhibited, 2),
        "inhibition_efficacy_percent": round(inhibition_percent, 2),
        "endotoxin_suppression_percent": round(endotoxin_suppression, 2),
        "antibiotic_resensitization": "RESTORED (Membrane permeability enhanced)" if inhibition_percent > 80.0 else "PARTIAL",
    }


def generate_pathogen_telemetry(frame: int, inhibitor_uM: float = 0.8) -> Dict[str, Any]:
    """
    Generate 3D active site residues, catalytic zinc coordinate, and docked inhibitor telemetry.
    """
    kinetics = compute_lpxc_kinetics(inhibitor_conc_um=inhibitor_uM)

    # 3D active site structural layout
    t_pulse = math.sin(frame * 0.08) * 0.05
    residues = [
        {"name": "Zn2+ (Catalytic Metal)", "element": "Zn", "pos": [0.0, 0.0, 0.0], "color": "#00f0ff", "radius": 0.45},
        {"name": "His265", "element": "N", "pos": [-1.2, 0.8 + t_pulse, 0.5], "color": "#3b82f6", "radius": 0.35},
        {"name": "Glu78", "element": "O", "pos": [1.1, -0.6, 0.7 - t_pulse], "color": "#ef4444", "radius": 0.35},
        {"name": "Thr191", "element": "O", "pos": [0.3, 1.4, -0.8], "color": "#ef4444", "radius": 0.32},
        {"name": "Asp242", "element": "O", "pos": [-0.8, -1.3, -0.6], "color": "#ef4444", "radius": 0.35},
        # Docked inhibitor backbone
        {"name": "Inhibitor-C1", "element": "C", "pos": [0.1, 0.4, 1.5], "color": "#ff6b00", "radius": 0.3},
        {"name": "Inhibitor-C2", "element": "C", "pos": [0.7, 0.9, 2.2], "color": "#ff6b00", "radius": 0.3},
        {"name": "Inhibitor-Hydroxamate", "element": "N", "pos": [0.2, 0.2, 0.8], "color": "#a855f7", "radius": 0.38},
    ]

    return {
        "type": "pathogen",
        "frame": frame,
        "energy": float(abs(kinetics["gibbs_free_energy_dG_kj_mol"])),
        "momentum": [0.0, float(kinetics["inhibition_efficacy_percent"]), 0.0],
        "kinetics": kinetics,
        "active_site_atoms": residues,
    }
