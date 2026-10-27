/* ═══════════════════════════════════════════════════════════════════════════
 * HolographicGrid.tsx — Tony Stark Holographic Projector Table & Grid Base
 * Cyan grid lines, rotating emitter rings, and vertical projection light cone.
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const gridVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const gridFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;

  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    // Grid lines
    vec2 grid = abs(fract(vWorldPos.xz * 0.5) - 0.5);
    float line = min(grid.x, grid.y);
    float gridLine = 1.0 - smoothstep(0.0, 0.03, line);

    // Fine sub-grid
    vec2 fineGrid = abs(fract(vWorldPos.xz * 2.0) - 0.5);
    float fineLine = min(fineGrid.x, fineGrid.y);
    float fineGridLine = 1.0 - smoothstep(0.0, 0.015, fineLine);

    // Distance fade from center
    float dist = length(vWorldPos.xz) / 16.0;
    float fade = 1.0 - smoothstep(0.2, 1.0, dist);

    // Pulse effect
    float pulse = 0.85 + 0.15 * sin(uTime * 0.6 + dist * 3.0);

    // Scan ring expanding outward
    float ring = abs(dist - fract(uTime * 0.12));
    float ringGlow = smoothstep(0.06, 0.0, ring) * 0.45;

    float alpha = (gridLine * 0.35 + fineGridLine * 0.1 + ringGlow) * fade * pulse;

    gl_FragColor = vec4(uColor, alpha);
  }
`;

export const HolographicGrid: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const coneRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#00f0ff') },
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.2;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -t * 0.35;
    }
    if (coneRef.current) {
      const p = 0.08 + Math.sin(t * 1.5) * 0.02;
      (coneRef.current.material as THREE.MeshBasicMaterial).opacity = p;
    }
  });

  return (
    <group position={[0, -2, 0]}>
      {/* ── 1. Holographic Floor Grid ────────────────────────────── */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[44, 44, 1, 1]} />
        <shaderMaterial
          vertexShader={gridVertexShader}
          fragmentShader={gridFragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ── 2. Stark Projector Emitter Base Rings ─────────────────── */}
      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        {/* Outer Ring */}
        <mesh ref={outerRingRef}>
          <ringGeometry args={[4.2, 4.3, 64]} />
          <meshBasicMaterial
            color="#00f0ff"
            side={THREE.DoubleSide}
            transparent
            opacity={0.65}
          />
        </mesh>

        {/* Inner Ring */}
        <mesh ref={innerRingRef}>
          <ringGeometry args={[3.2, 3.26, 48]} />
          <meshBasicMaterial
            color="#00ffff"
            side={THREE.DoubleSide}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Focal Center Point */}
        <mesh>
          <ringGeometry args={[0.9, 0.95, 32]} />
          <meshBasicMaterial
            color="#38bdf8"
            side={THREE.DoubleSide}
            transparent
            opacity={0.4}
          />
        </mesh>
      </group>

      {/* ── 3. Vertical Projection Light Column ──────────────────── */}
      <mesh ref={coneRef} position={[0, 3.0, 0]}>
        <cylinderGeometry args={[2.8, 4.3, 6.0, 32, 1, true]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
