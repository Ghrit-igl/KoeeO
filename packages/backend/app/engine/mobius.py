"""
Möbius Strip Topological Engine — KoeeO Science Lab.

Generates parametric Möbius strip meshes with configurable twist,
computes discrete Laplacian eigenvalue spectra for topological analysis,
and produces JSON-serializable output for 3D rendering.

Parametric equations:
    x(u,v) = (1 + v/2 * cos(twist * u/2)) * cos(u)
    y(u,v) = (1 + v/2 * cos(twist * u/2)) * sin(u)
    z(u,v) = v/2 * sin(twist * u/2)

where u ∈ [0, 2π), v ∈ [-1, 1], twist = number of half-twists (default 1).
"""

import numpy as np
from scipy.sparse import lil_matrix
from scipy.sparse.linalg import eigsh


def generate_mobius_mesh(
    u_resolution: int = 40,
    v_resolution: int = 10,
    twist: float = 1.0,
    num_eigenvalues: int = 6,
) -> dict:
    """
    Generate a Möbius strip mesh with eigenvalue spectral analysis.

    Args:
        u_resolution: Number of grid points along u (angular) direction.
        v_resolution: Number of grid points along v (width) direction.
        twist: Half-twist factor (1.0 = standard Möbius strip).
        num_eigenvalues: Number of smallest eigenvalues to compute.

    Returns:
        Dict with vertices, normals, eigenvalues, energy, twist_angle.
        All arrays are Python lists for JSON serialization.
    """
    # --- Parametric mesh generation ---
    u = np.linspace(0, 2 * np.pi, u_resolution, endpoint=False)
    v = np.linspace(-1, 1, v_resolution)
    U, V = np.meshgrid(u, v, indexing="ij")  # shape: (u_res, v_res)

    # Möbius parametric equations with configurable twist
    half_twist = twist * U / 2.0
    cos_ht = np.cos(half_twist)
    sin_ht = np.sin(half_twist)
    cos_u = np.cos(U)
    sin_u = np.sin(U)

    R = 1.0 + V / 2.0 * cos_ht
    X = R * cos_u
    Y = R * sin_u
    Z = V / 2.0 * sin_ht

    # Flatten to (N*M, 3)
    n_vertices = u_resolution * v_resolution
    vertices = np.stack([X.ravel(), Y.ravel(), Z.ravel()], axis=-1)

    # --- Surface normals via cross product of partial derivatives ---
    # Numerical partial derivatives
    du = 2 * np.pi / u_resolution
    dv = 2.0 / (v_resolution - 1) if v_resolution > 1 else 1.0

    # Partial derivative with respect to u (central differences, wrapped)
    dXdu = np.gradient(X, du, axis=0)
    dYdu = np.gradient(Y, du, axis=0)
    dZdu = np.gradient(Z, du, axis=0)

    # Partial derivative with respect to v
    dXdv = np.gradient(X, dv, axis=1)
    dYdv = np.gradient(Y, dv, axis=1)
    dZdv = np.gradient(Z, dv, axis=1)

    # Cross product for normals
    Nx = dYdu * dZdv - dZdu * dYdv
    Ny = dZdu * dXdv - dXdu * dZdv
    Nz = dXdu * dYdv - dYdu * dXdv

    normals = np.stack([Nx.ravel(), Ny.ravel(), Nz.ravel()], axis=-1)
    # Normalize
    norms = np.linalg.norm(normals, axis=1, keepdims=True)
    norms = np.where(norms < 1e-12, 1.0, norms)
    normals = normals / norms

    # --- Discrete Laplacian eigenvalue spectral analysis ---
    # Build graph Laplacian on the mesh grid
    L = lil_matrix((n_vertices, n_vertices), dtype=np.float64)

    for i in range(u_resolution):
        for j in range(v_resolution):
            idx = i * v_resolution + j
            degree = 0
            # Neighbor along u (periodic)
            i_next = (i + 1) % u_resolution
            idx_next_u = i_next * v_resolution + j
            L[idx, idx_next_u] = -1.0
            L[idx_next_u, idx] = -1.0
            degree += 1

            # Neighbor along v (non-periodic)
            if j + 1 < v_resolution:
                idx_next_v = i * v_resolution + (j + 1)
                L[idx, idx_next_v] = -1.0
                L[idx_next_v, idx] = -1.0
                degree += 1

    # Set diagonal to degree
    L_csr = L.tocsr()
    for idx in range(n_vertices):
        L_csr[idx, idx] = -L_csr[idx].sum()

    # Clamp num_eigenvalues
    max_eig = min(num_eigenvalues, n_vertices - 2)
    if max_eig < 1:
        max_eig = 1

    eigenvalues, _ = eigsh(L_csr.astype(np.float64), k=max_eig, which="SM")
    eigenvalues = np.sort(np.real(eigenvalues))

    # Skip the trivial zero eigenvalue for energy calculation
    positive_eigs = eigenvalues[eigenvalues > 1e-10]
    energy = float(np.sum(positive_eigs)) if len(positive_eigs) > 0 else float(np.sum(np.abs(eigenvalues)))

    # Ensure we return exactly the requested count
    eig_list = eigenvalues.tolist()
    while len(eig_list) < num_eigenvalues:
        eig_list.append(0.0)
    eig_list = eig_list[:num_eigenvalues]

    return {
        "vertices": vertices.tolist(),
        "normals": normals.tolist(),
        "eigenvalues": eig_list,
        "energy": energy,
        "twist_angle": float(twist * np.pi),
        "u_resolution": u_resolution,
        "v_resolution": v_resolution,
    }
