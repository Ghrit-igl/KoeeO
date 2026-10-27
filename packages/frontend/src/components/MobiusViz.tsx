/* ═══════════════════════════════════════════════════════════════════════════
 * MobiusViz.tsx — 3D Möbius strip mesh renderer
 * Creates parametric geometry, custom hologram shader, slow rotation
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { TelemetryFrame } from '../lib/types';

interface MobiusVizProps {
  telemetry: TelemetryFrame | null;
}

/**
 * Generate Möbius strip vertices parametrically.
 * u ∈ [0, 2π] — around the strip
 * v ∈ [-0.5, 0.5] — across the width
 * twist determines how many half-twists (1 = classic Möbius)
 */
function generateMobiusGeometry(
  resolution: number,
  twist: number
): { positions: Float32Array; normals: Float32Array; indices: Uint16Array } {
  const uSegments = resolution * 2;
  const vSegments = Math.max(4, Math.floor(resolution / 4));
  const vertexCount = (uSegments + 1) * (vSegments + 1);

  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);

  let idx = 0;
  for (let i = 0; i <= uSegments; i++) {
    const u = (i / uSegments) * Math.PI * 2;
    for (let j = 0; j <= vSegments; j++) {
      const v = (j / vSegments - 0.5) * 1.5; // width

      const halfU = u * twist * 0.5;
      const R = 2.0; // major radius

      const x = (R + v * Math.cos(halfU)) * Math.cos(u);
      const y = (R + v * Math.cos(halfU)) * Math.sin(u);
      const z = v * Math.sin(halfU);

      positions[idx * 3] = x;
      positions[idx * 3 + 1] = z; // swap y/z for Three.js coords
      positions[idx * 3 + 2] = y;

      // Approximate normal
      const nx = Math.cos(halfU) * Math.cos(u);
      const ny = Math.sin(halfU);
      const nz = Math.cos(halfU) * Math.sin(u);
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

      normals[idx * 3] = nx / len;
      normals[idx * 3 + 1] = ny / len;
      normals[idx * 3 + 2] = nz / len;

      idx++;
    }
  }

  // Generate face indices
  const faceCount = uSegments * vSegments * 2;
  const indices = new Uint16Array(faceCount * 3);
  let fi = 0;
  for (let i = 0; i < uSegments; i++) {
    for (let j = 0; j < vSegments; j++) {
      const a = i * (vSegments + 1) + j;
      const b = a + vSegments + 1;
      const c = a + 1;
      const d = b + 1;

      indices[fi++] = a;
      indices[fi++] = b;
      indices[fi++] = c;
      indices[fi++] = c;
      indices[fi++] = b;
      indices[fi++] = d;
    }
  }

  return { positions, normals, indices };
}

/** Holographic vertex shader for Möbius */
const mobiusVertexShader = /* glsl */ `
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

/** Holographic fragment shader for Möbius */
const mobiusFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;

  void main() {
    // Fresnel edge glow
    float fresnel = pow(1.0 - abs(dot(vViewDirection, vNormal)), 2.5);
    fresnel = clamp(fresnel, 0.0, 1.0);

    // Scanlines
    float scan = sin(vWorldPosition.y * 60.0 + uTime * 3.0) * 0.5 + 0.5;
    scan = smoothstep(0.3, 0.7, scan) * 0.2;

    // Flow lines along the strip
    float flow = sin(vUv.x * 40.0 - uTime * 4.0) * 0.5 + 0.5;
    flow = smoothstep(0.4, 0.6, flow) * 0.15;

    // Flicker
    float flicker = 0.97 + 0.03 * sin(uTime * 3.7) * cos(uTime * 7.3);

    float baseAlpha = 0.15 + fresnel * 0.65;
    float finalAlpha = (baseAlpha - scan + flow) * flicker;

    vec3 finalColor = uColor + fresnel * vec3(0.3, 0.5, 0.6);

    gl_FragColor = vec4(finalColor, clamp(finalAlpha, 0.0, 1.0));
  }
`;

export const MobiusViz: React.FC<MobiusVizProps> = ({ telemetry }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.LineSegments>(null);

  // Generate or use telemetry vertices
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    if (telemetry?.vertices && telemetry.vertices.length > 0) {
      // Use server-provided vertices
      const positions = new Float32Array(telemetry.vertices);
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      if (telemetry.normals) {
        geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(telemetry.normals), 3));
      }
      geo.computeVertexNormals();
    } else {
      // Generate parametric Möbius strip
      const resolution = 60;
      const twist = 1;
      const { positions, normals, indices } = generateMobiusGeometry(resolution, twist);
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      geo.setIndex(new THREE.BufferAttribute(indices, 1));
    }

    return geo;
  }, [telemetry?.vertices, telemetry?.normals]);

  // Wireframe geometry
  const wireGeometry = useMemo(() => {
    const wireGeo = new THREE.WireframeGeometry(geometry);
    return wireGeo;
  }, [geometry]);

  // Shader uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#00f0ff') },
    }),
    []
  );

  // Animate
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15;
    }
  });

  // Eigenvalue annotations
  const eigenvalues = telemetry?.eigenvalues ?? [1.414, 2.718, 3.141];

  return (
    <group ref={groupRef}>
      {/* Solid holographic surface */}
      <mesh ref={meshRef} geometry={geometry}>
        <shaderMaterial
          vertexShader={mobiusVertexShader}
          fragmentShader={mobiusFragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Wireframe overlay */}
      <lineSegments ref={wireRef} geometry={wireGeometry}>
        <lineBasicMaterial color="#00f0ff" transparent opacity={0.15} />
      </lineSegments>

      {/* Eigenvalue annotations */}
      {eigenvalues.map((val, i) => (
        <Text
          key={i}
          position={[3.5, 1.5 - i * 0.6, 0]}
          fontSize={0.2}
          color="#00f0ff"
          anchorX="left"
          font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOTk6OThhvA.woff2"
        >
          {`λ${i} = ${val.toFixed(4)}`}
        </Text>
      ))}
    </group>
  );
};
