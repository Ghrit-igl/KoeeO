/* ═══════════════════════════════════════════════════════════════════════════
 * hologramMaterial.ts — Custom Three.js ShaderMaterial
 * Cyan glow, scanlines, fresnel edge glow, and subtle flicker
 * ═══════════════════════════════════════════════════════════════════════════ */

import * as THREE from 'three';

/** Vertex shader — passes UVs, normals, and world position to the fragment */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDirection = normalize(cameraPosition - worldPos.xyz);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Fragment shader — holographic scanlines + fresnel glow + flicker */
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uScanlineIntensity;
  uniform float uFresnelPower;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;

  void main() {
    // ── Fresnel edge glow ──
    float fresnel = pow(1.0 - abs(dot(vViewDirection, vNormal)), uFresnelPower);
    fresnel = clamp(fresnel, 0.0, 1.0);

    // ── Scanline effect (horizontal lines based on world Y) ──
    float scanline = sin(vWorldPosition.y * 80.0 + uTime * 2.0) * 0.5 + 0.5;
    scanline = smoothstep(0.3, 0.7, scanline) * uScanlineIntensity;

    // ── Secondary fine scanlines ──
    float fineScan = sin(vWorldPosition.y * 200.0 - uTime * 5.0) * 0.5 + 0.5;
    fineScan = smoothstep(0.45, 0.55, fineScan) * 0.15;

    // ── Subtle flicker (time-based opacity wobble) ──
    float flicker = 0.97 + 0.03 * sin(uTime * 3.7) * cos(uTime * 7.3);

    // ── Combine ──
    float baseIntensity = 0.3 + fresnel * 0.7;
    float finalAlpha = (baseIntensity - scanline + fineScan) * uOpacity * flicker;

    vec3 glowColor = uColor + fresnel * vec3(0.2, 0.4, 0.5);

    gl_FragColor = vec4(glowColor, finalAlpha);
  }
`;

export interface HologramMaterialOptions {
  color?: THREE.Color | string;
  opacity?: number;
  scanlineIntensity?: number;
  fresnelPower?: number;
}

/**
 * Creates a holographic ShaderMaterial with scanlines, fresnel glow, and flicker.
 */
export function createHologramMaterial(
  options: HologramMaterialOptions = {}
): THREE.ShaderMaterial {
  const {
    color = '#00f0ff',
    opacity = 0.6,
    scanlineIntensity = 0.25,
    fresnelPower = 2.5,
  } = options;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uScanlineIntensity: { value: scanlineIntensity },
      uFresnelPower: { value: fresnelPower },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}
