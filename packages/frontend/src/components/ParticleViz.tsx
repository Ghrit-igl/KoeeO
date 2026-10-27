/* ═══════════════════════════════════════════════════════════════════════════
 * ParticleViz.tsx — 3D N-body particle cloud renderer
 * Uses instanced meshes for performance with velocity-based coloring
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TelemetryFrame } from '../lib/types';

interface ParticleVizProps {
  telemetry: TelemetryFrame | null;
}

const MAX_PARTICLES = 200;
const PARTICLE_RADIUS = 0.08;

/** Generate random initial positions for demo mode */
function generateDefaultPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.5 + Math.random() * 2.5;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

/** Color gradient based on velocity magnitude: blue → cyan → green → yellow → orange */
function velocityToColor(speed: number): THREE.Color {
  const t = Math.min(speed / 3.0, 1.0);
  if (t < 0.25) return new THREE.Color('#0040ff').lerp(new THREE.Color('#00f0ff'), t / 0.25);
  if (t < 0.5) return new THREE.Color('#00f0ff').lerp(new THREE.Color('#00ff88'), (t - 0.25) / 0.25);
  if (t < 0.75) return new THREE.Color('#00ff88').lerp(new THREE.Color('#ffcc00'), (t - 0.5) / 0.25);
  return new THREE.Color('#ffcc00').lerp(new THREE.Color('#ff6b00'), (t - 0.75) / 0.25);
}

export const ParticleViz: React.FC<ParticleVizProps> = ({ telemetry }) => {
  const instanceRef = useRef<THREE.InstancedMesh>(null);
  const trailRef = useRef<THREE.InstancedMesh>(null);
  const dummyMatrix = useMemo(() => new THREE.Matrix4(), []);
  const dummyColor = useMemo(() => new THREE.Color(), []);

  // Previous positions for trail effect (store last 3 frames)
  const trailHistory = useRef<Float32Array[]>([]);

  // Particle count
  const particleCount = useMemo(() => {
    if (telemetry?.positions) return telemetry.positions.length / 3;
    return 80; // default demo count
  }, [telemetry?.positions]);

  // Default positions for demo mode
  const defaultPositions = useMemo(
    () => generateDefaultPositions(particleCount),
    [particleCount]
  );

  // Update instances
  useFrame((state) => {
    if (!instanceRef.current) return;
    const t = state.clock.elapsedTime;

    const positions = telemetry?.positions
      ? new Float32Array(telemetry.positions)
      : defaultPositions;

    const velocities = telemetry?.velocities
      ? new Float32Array(telemetry.velocities)
      : null;

    const count = Math.min(positions.length / 3, MAX_PARTICLES);

    // Store trail history
    trailHistory.current.unshift(new Float32Array(positions));
    if (trailHistory.current.length > 3) trailHistory.current.pop();

    for (let i = 0; i < count; i++) {
      let x = positions[i * 3];
      let y = positions[i * 3 + 1];
      let z = positions[i * 3 + 2];

      // In demo mode, apply gentle orbital animation
      if (!telemetry?.positions) {
        const angle = t * 0.3 + i * 0.1;
        const radius = Math.sqrt(x * x + z * z);
        x = radius * Math.cos(angle + i);
        z = radius * Math.sin(angle + i);
        y += Math.sin(t * 0.5 + i * 0.5) * 0.1;
      }

      dummyMatrix.makeTranslation(x, y, z);
      instanceRef.current.setMatrixAt(i, dummyMatrix);

      // Color by velocity
      if (velocities) {
        const vx = velocities[i * 3];
        const vy = velocities[i * 3 + 1];
        const vz = velocities[i * 3 + 2];
        const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
        dummyColor.copy(velocityToColor(speed));
      } else {
        // Demo: color by position
        const dist = Math.sqrt(x * x + y * y + z * z);
        dummyColor.copy(velocityToColor(dist * 0.5));
      }
      instanceRef.current.setColorAt(i, dummyColor);
    }

    instanceRef.current.count = count;
    instanceRef.current.instanceMatrix.needsUpdate = true;
    if (instanceRef.current.instanceColor) {
      instanceRef.current.instanceColor.needsUpdate = true;
    }

    // Update trail instances
    if (trailRef.current && trailHistory.current.length > 1) {
      let ti = 0;
      for (let frame = 1; frame < trailHistory.current.length; frame++) {
        const prevPositions = trailHistory.current[frame];
        const opacity = 1 - frame * 0.35;
        for (let i = 0; i < count && ti < MAX_PARTICLES * 3; i++) {
          const px = prevPositions[i * 3] ?? 0;
          const py = prevPositions[i * 3 + 1] ?? 0;
          const pz = prevPositions[i * 3 + 2] ?? 0;

          const scale = PARTICLE_RADIUS * 0.5 * opacity;
          dummyMatrix.makeScale(scale / PARTICLE_RADIUS, scale / PARTICLE_RADIUS, scale / PARTICLE_RADIUS);
          dummyMatrix.setPosition(px, py, pz);
          trailRef.current.setMatrixAt(ti, dummyMatrix);

          dummyColor.setHSL(0.55, 0.8, 0.4 * opacity);
          trailRef.current.setColorAt(ti, dummyColor);
          ti++;
        }
      }
      trailRef.current.count = ti;
      trailRef.current.instanceMatrix.needsUpdate = true;
      if (trailRef.current.instanceColor) {
        trailRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* Main particles */}
      <instancedMesh
        ref={instanceRef}
        args={[undefined, undefined, MAX_PARTICLES]}
      >
        <sphereGeometry args={[PARTICLE_RADIUS, 12, 12]} />
        <meshStandardMaterial
          emissive="#00f0ff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Trail particles */}
      <instancedMesh
        ref={trailRef}
        args={[undefined, undefined, MAX_PARTICLES * 3]}
      >
        <sphereGeometry args={[PARTICLE_RADIUS, 6, 6]} />
        <meshBasicMaterial transparent opacity={0.3} toneMapped={false} />
      </instancedMesh>
    </group>
  );
};
