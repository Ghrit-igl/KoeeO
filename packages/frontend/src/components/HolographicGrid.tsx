/* ═══════════════════════════════════════════════════════════════════════════
 * HolographicGrid.tsx — Background holographic grid plane with scan effect
 * Cyan grid lines fading to transparent at edges with subtle pulse
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
    float dist = length(vWorldPos.xz) / 15.0;
    float fade = 1.0 - smoothstep(0.2, 1.0, dist);

    // Pulse effect
    float pulse = 0.8 + 0.2 * sin(uTime * 0.5 + dist * 3.0);

    // Scan ring expanding outward
    float ring = abs(dist - fract(uTime * 0.15));
    float ringGlow = smoothstep(0.05, 0.0, ring) * 0.5;

    float alpha = (gridLine * 0.3 + fineGridLine * 0.08 + ringGlow) * fade * pulse;

    gl_FragColor = vec4(uColor, alpha);
  }
`;

export const HolographicGrid: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#00f0ff') },
    }),
    []
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -2, 0]}
      receiveShadow
    >
      <planeGeometry args={[40, 40, 1, 1]} />
      <shaderMaterial
        vertexShader={gridVertexShader}
        fragmentShader={gridFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};
