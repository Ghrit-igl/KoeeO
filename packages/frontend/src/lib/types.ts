/* ═══════════════════════════════════════════════════════════════════════════
 * types.ts — Core TypeScript interfaces for KoeeO Virtual Science Lab
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Supported experiment categories */
export type ExperimentType = 'mobius' | 'molecular' | 'particles';

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

/** Union of all parameter types */
export type ExperimentParams = MobiusParams | MolecularParams | ParticleParams;

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
