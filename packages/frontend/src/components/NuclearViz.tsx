/* ═══════════════════════════════════════════════════════════════════════════
 * NuclearViz.tsx — 3D Superheavy Island of Stability Nucleus Renderer
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { TelemetryFrame } from '../lib/types';

interface NuclearVizProps {
  telemetry: TelemetryFrame | null;
}

export const NuclearViz: React.FC<NuclearVizProps> = ({ telemetry }) => {
  const groupRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
      groupRef.current.rotation.x += delta * 0.2;
    }
    if (shellRef.current) {
      shellRef.current.rotation.y -= delta * 0.15;
    }
  });

  const nucleons = telemetry?.nucleons ?? [];
  const metrics = telemetry?.metrics;
  const z = metrics?.atomic_number_z ?? 120;
  const n = metrics?.neutron_number_n ?? 184;
  const status = metrics?.stability_status ?? 'SUPERHEAVY MAGIC ISLAND';
  const bPerA = metrics?.binding_energy_per_nucleon_mev ?? 7.12;

  return (
    <group position={[0, 0, 0]}>
      {/* ── Nucleons Group ─────────────────────────────────────── */}
      <group ref={groupRef}>
        {nucleons.map((nuc, idx) => (
          <mesh key={idx} position={nuc.pos}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshBasicMaterial
              color={nuc.type === 'proton' ? '#ff3b30' : '#007aff'}
            />
          </mesh>
        ))}
      </group>

      {/* ── Quantum Shell Closure Halo (Island of Stability) ─── */}
      <mesh ref={shellRef}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>

      {/* ── Telemetry Annotation Label ───────────────────────── */}
      <Html position={[0, 3.0, 0]} center>
        <div className="bg-black/80 px-2 py-1 rounded border border-hud-cyan/30 text-[10px] text-hud-cyan font-mono tracking-widest whitespace-nowrap pointer-events-none">
          Z = {z} (p⁺) │ N = {n} (n⁰) │ B/A = {bPerA} MeV │ {status}
        </div>
      </Html>
    </group>
  );
};
