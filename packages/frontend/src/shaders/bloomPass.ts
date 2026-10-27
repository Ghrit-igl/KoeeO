/* ═══════════════════════════════════════════════════════════════════════════
 * bloomPass.ts — Post-processing bloom/glow configuration
 * Uses @react-three/postprocessing EffectComposer
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Bloom effect parameters matching Tony Stark holographic aesthetic */
export const BLOOM_CONFIG = {
  /** Overall bloom intensity */
  intensity: 1.2,
  /** Luminance threshold — how bright a pixel must be to bloom */
  luminanceThreshold: 0.1,
  /** Luminance smoothing for softer glow transitions */
  luminanceSmoothing: 0.9,
  /** Blur kernel size (must match KernelSize enum from postprocessing) */
  kernelSize: 3, // KernelSize.LARGE
  /** Number of mip-map levels for the bloom */
  mipmapBlur: true,
} as const;

/**
 * Vignette configuration for cinematic edge darkening
 */
export const VIGNETTE_CONFIG = {
  offset: 0.3,
  darkness: 0.9,
} as const;
