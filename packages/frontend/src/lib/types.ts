/* ═══════════════════════════════════════════════════════════════════════════
 * types.ts — Core TypeScript interfaces for KoeeO Virtual Science Lab
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Supported experiment categories */
export type ExperimentType =
  | 'mobius'
  | 'molecular'
  | 'particles'
  | 'blackhole'
  | 'aerodynamics'
  | 'nuclear'
  | 'pathogen';

/** Experiment status lifecycle */
export type ExperimentStatus = 'pending' | 'running' | 'completed' | 'error';

/** Möbius topology parameters */
export interface MobiusParams {
  twist_factor: number;   // 0 – 4π
  resolution: number;     // 10 – 100
  deformation_speed: number;
}

/** Molecular orbital parameters */
export interface MolecularParams {
  molecule: 'H2' | 'H2O' | 'CO2' | 'CH4' | 'C6H6';
  orbital_scale: number;
  vibration_amplitude: number;
}

/** N-body particle dynamics parameters */
export interface ParticleParams {
  num_particles: number;       // 10 – 200
  force_type: 'gravity' | 'electromagnetic';
  dt: number;
  softening: number;
}

/** Black hole relativistic geodesics parameters */
export interface BlackHoleParams {
  mass_solar: number;
}

/** Butterfly Navier-Stokes aerodynamics parameters */
export interface AerodynamicsParams {
  temperature_c: number;
  frequency_hz: number;
}

/** Nuclear SEMF and Island of Stability parameters */
export interface NuclearParams {
  protons_z: number;
  neutrons_n: number;
}

/** Pathogen LpxC inhibitor discovery parameters */
export interface PathogenParams {
  inhibitor_uM: number;
}

/** Union of all parameter types */
export type ExperimentParams =
  | MobiusParams
  | MolecularParams
  | ParticleParams
  | BlackHoleParams
  | AerodynamicsParams
  | NuclearParams
  | PathogenParams;

/** Experiment entity returned by the backend API */
export interface Experiment {
  id: string;
  type: ExperimentType;
  params: ExperimentParams;
  status: ExperimentStatus;
  created_at?: string;
}

/** A single atom in a molecular visualization */
export interface Atom {
  element: string;
  position: [number, number, number];
  radius: number;
  color: string;
}

/** A bond connecting two atoms by index */
export interface Bond {
  from: number;
  to: number;
  order?: number;
}

/** Real-time telemetry frame pushed over WebSocket */
export interface TelemetryFrame {
  frame: number;
  timestamp: number;
  energy: number;
  momentum: [number, number, number];
  eigenvalues?: number[];

  // Möbius-specific
  vertices?: number[];
  normals?: number[];

  // Molecular-specific
  atoms?: Atom[];
  bonds?: Bond[];
  orbital_coefficients?: number[];

  // Particle-specific
  positions?: number[];
  velocities?: number[];

  // Black hole-specific
  metrics?: any;
  rays?: any[];
  disk_particles?: number[];
  event_horizon_radius?: number;
  photon_sphere_radius?: number;
  hawking_temp_nK?: number;

  // Aerodynamics-specific
  flapping_angle_deg?: number;
  reynolds_number?: number;
  lift_coefficient?: number;
  drag_coefficient?: number;
  lev_contribution?: number;
  lev_streamlines?: number[];

  // Nuclear-specific
  nucleons?: any[];

  // Pathogen-specific
  kinetics?: any;
  active_site_atoms?: any[];

  fps?: number;
}

/** Friday assistant chat message */
export interface FridayMessage {
  id: string;
  role: 'friday' | 'user';
  content: string;
  timestamp: number;
}

/** REST API response wrapper */
export interface ApiResponse<T> {
  data: T;
  status: 'ok' | 'error';
  message?: string;
}
