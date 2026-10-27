"""
Molecular Orbital Engine — KoeeO Science Lab.

Supports predefined molecules (H2, H2O, CO2, CH4, C6H6/benzene)
with 3D atom positions, bond connectivity, simplified Gaussian orbital
electron density, HOMO-LUMO gap calculation, and vibration modes.
"""

import math
from typing import Any


# ─── Atom property database ───────────────────────────────────────────
ATOM_PROPS = {
    "H":  {"radius": 0.31, "color": "#FFFFFF"},
    "C":  {"radius": 0.77, "color": "#333333"},
    "N":  {"radius": 0.75, "color": "#3050F8"},
    "O":  {"radius": 0.73, "color": "#FF0D0D"},
    "S":  {"radius": 1.02, "color": "#FFFF30"},
}


def _make_atom(element: str, position: list[float]) -> dict:
    """Create an atom dict with element, position, radius, and color."""
    props = ATOM_PROPS.get(element, {"radius": 0.5, "color": "#888888"})
    return {
        "element": element,
        "position": [float(p) for p in position],
        "radius": props["radius"],
        "color": props["color"],
    }


def _make_bond(from_idx: int, to_idx: int) -> dict:
    """Create a bond dict."""
    return {"from": from_idx, "to": to_idx}


def _make_orbital(center: list[float], amplitude: float, phase: float) -> dict:
    """Create an orbital dict for electron density visualization."""
    return {
        "center": [float(c) for c in center],
        "amplitude": float(amplitude),
        "phase": float(phase),
    }


# ─── Molecule definitions ─────────────────────────────────────────────

def _h2() -> dict:
    """Diatomic hydrogen H2."""
    atoms = [
        _make_atom("H", [0.0, 0.0, -0.37]),
        _make_atom("H", [0.0, 0.0,  0.37]),
    ]
    bonds = [_make_bond(0, 1)]
    orbitals = [
        _make_orbital([0.0, 0.0, 0.0], 1.0, 0.0),   # σ bonding
        _make_orbital([0.0, 0.0, 0.0], 0.5, math.pi), # σ* antibonding
    ]
    energy_levels = [-15.43, -4.71]  # eV (simplified)
    homo_lumo_gap = 10.72
    return {
        "atoms": atoms,
        "bonds": bonds,
        "orbitals": orbitals,
        "energy_levels": energy_levels,
        "homo_lumo_gap": homo_lumo_gap,
    }


def _h2o() -> dict:
    """Water molecule H2O — bent geometry, ~104.5° bond angle."""
    angle = math.radians(104.5)
    oh_len = 0.96  # Angstroms
    atoms = [
        _make_atom("O", [0.0, 0.0, 0.0]),
        _make_atom("H", [oh_len * math.sin(angle / 2), 0.0, -oh_len * math.cos(angle / 2)]),
        _make_atom("H", [-oh_len * math.sin(angle / 2), 0.0, -oh_len * math.cos(angle / 2)]),
    ]
    bonds = [_make_bond(0, 1), _make_bond(0, 2)]
    orbitals = [
        _make_orbital([0.0, 0.0, 0.0], 2.0, 0.0),
        _make_orbital(atoms[1]["position"], 0.8, 0.0),
        _make_orbital(atoms[2]["position"], 0.8, 0.0),
        _make_orbital([0.0, 0.3, 0.0], 0.6, math.pi / 2),  # lone pair
    ]
    energy_levels = [-36.7, -19.2, -15.4, -13.6, -10.9]  # eV
    homo_lumo_gap = 6.9
    return {
        "atoms": atoms,
        "bonds": bonds,
        "orbitals": orbitals,
        "energy_levels": energy_levels,
        "homo_lumo_gap": homo_lumo_gap,
    }


def _co2() -> dict:
    """Carbon dioxide CO2 — linear geometry."""
    co_len = 1.16  # Angstroms
    atoms = [
        _make_atom("C", [0.0, 0.0, 0.0]),
        _make_atom("O", [0.0, 0.0,  co_len]),
        _make_atom("O", [0.0, 0.0, -co_len]),
    ]
    bonds = [_make_bond(0, 1), _make_bond(0, 2)]
    orbitals = [
        _make_orbital([0.0, 0.0, 0.0], 1.5, 0.0),
        _make_orbital([0.0, 0.0,  co_len], 1.2, 0.0),
        _make_orbital([0.0, 0.0, -co_len], 1.2, math.pi),
    ]
    energy_levels = [-40.8, -21.4, -18.1, -17.6, -14.0, -9.5]
    homo_lumo_gap = 7.4
    return {
        "atoms": atoms,
        "bonds": bonds,
        "orbitals": orbitals,
        "energy_levels": energy_levels,
        "homo_lumo_gap": homo_lumo_gap,
    }


def _ch4() -> dict:
    """Methane CH4 — tetrahedral geometry."""
    # Tetrahedral coordinates
    t = 1.09  # C-H bond length in Angstroms
    s = t / math.sqrt(3)
    atoms = [
        _make_atom("C", [0.0, 0.0, 0.0]),
        _make_atom("H", [ s,  s,  s]),
        _make_atom("H", [ s, -s, -s]),
        _make_atom("H", [-s,  s, -s]),
        _make_atom("H", [-s, -s,  s]),
    ]
    bonds = [_make_bond(0, i) for i in range(1, 5)]
    orbitals = [
        _make_orbital([0.0, 0.0, 0.0], 1.5, 0.0),
        _make_orbital(atoms[1]["position"], 0.7, 0.0),
        _make_orbital(atoms[2]["position"], 0.7, 0.0),
        _make_orbital(atoms[3]["position"], 0.7, math.pi),
        _make_orbital(atoms[4]["position"], 0.7, math.pi),
    ]
    energy_levels = [-23.1, -14.3, -14.3, -14.3]
    homo_lumo_gap = 9.8
    return {
        "atoms": atoms,
        "bonds": bonds,
        "orbitals": orbitals,
        "energy_levels": energy_levels,
        "homo_lumo_gap": homo_lumo_gap,
    }


def _benzene() -> dict:
    """Benzene C6H6 — planar hexagonal ring with equal C-C bonds."""
    cc_len = 1.40   # C-C bond length in Angstroms (aromatic)
    ch_len = 1.09   # C-H bond length
    atoms = []
    # Six carbon atoms in a regular hexagon
    for i in range(6):
        angle = math.radians(60 * i)
        x = cc_len * math.cos(angle)
        y = cc_len * math.sin(angle)
        atoms.append(_make_atom("C", [x, y, 0.0]))
    # Six hydrogen atoms
    for i in range(6):
        angle = math.radians(60 * i)
        x = (cc_len + ch_len) * math.cos(angle)
        y = (cc_len + ch_len) * math.sin(angle)
        atoms.append(_make_atom("H", [x, y, 0.0]))

    bonds = []
    # C-C ring bonds
    for i in range(6):
        bonds.append(_make_bond(i, (i + 1) % 6))
    # C-H bonds
    for i in range(6):
        bonds.append(_make_bond(i, i + 6))

    # π orbitals above and below the ring
    orbitals = []
    for i in range(6):
        c = atoms[i]["position"]
        orbitals.append(_make_orbital([c[0], c[1], 0.5], 0.8, math.pi * i / 3))
        orbitals.append(_make_orbital([c[0], c[1], -0.5], 0.8, math.pi * i / 3 + math.pi))

    energy_levels = [-29.4, -17.2, -14.0, -12.4, -12.4, -9.2, -9.2, -6.5, -6.5]
    homo_lumo_gap = 5.2
    return {
        "atoms": atoms,
        "bonds": bonds,
        "orbitals": orbitals,
        "energy_levels": energy_levels,
        "homo_lumo_gap": homo_lumo_gap,
    }


# ─── Molecule registry ────────────────────────────────────────────────

_MOLECULES = {
    "H2": _h2,
    "H2O": _h2o,
    "CO2": _co2,
    "CH4": _ch4,
    "C6H6": _benzene,
    "benzene": _benzene,
}


def get_molecule(name: str) -> dict:
    """
    Get a predefined molecule's full data.

    Args:
        name: Molecule formula (H2, H2O, CO2, CH4, C6H6, or benzene).

    Returns:
        Dict with atoms, bonds, orbitals, energy_levels, homo_lumo_gap.

    Raises:
        ValueError: If the molecule name is not recognized.
    """
    factory = _MOLECULES.get(name)
    if factory is None:
        raise ValueError(
            f"Unknown molecule: '{name}'. "
            f"Supported: {', '.join(_MOLECULES.keys())}"
        )
    return factory()
