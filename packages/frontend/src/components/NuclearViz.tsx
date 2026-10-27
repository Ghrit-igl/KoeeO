/* ═══════════════════════════════════════════════════════════════════════════
 * NuclearViz.tsx — 3D Superheavy Island of Stability Nucleus Renderer
 * Renders Bethe-Weizsäcker Liquid Drop Core, Protons (Z=126), Neutrons (N=184),
 * Magic Shell Closure Halos, and Unbihexium 5g Electron Orbital Envelope.
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { TelemetryFrame } from '../lib/types';

interface NuclearVizProps {
  telemetry: TelemetryFrame | null;
}

export const NuclearViz: React.FC<NuclearVizProps> = ({ telemetry }) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const nucleusGroupRef = useRef<THREE.Group>(null);
  const shell5gRef = useRef<THREE.Mesh>(null);
  const magicHaloRef = useRef<THREE.Mesh>(null);

  // Generate realistic clustered nucleons based on spherical liquid drop
  const nucleonParticles = useMemo(() => {
    const list: { pos: [number, number, number]; isProton: boolean }[] = [];
    const total = 140; // Visually dense cluster
    const radius = 1.35;

    for (let i = 0; i < total; i++) {
      // Fibonacci spiral distribution on sphere
      const phi = Math.acos(1 - 2 * (i + 0.5) / total);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      const r = Math.cbrt(Math.random()) * radius;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      // Proportion: 126 protons to 184 neutrons (~40% protons)
      const isProton = (i % 5 < 2);
      list.push({ pos: [x, y, z], isProton });
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (rootGroupRef.current) {
      rootGroupRef.current.rotation.y = t * 0.2;
    }
    if (nucleusGroupRef.current) {
      nucleusGroupRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
      nucleusGroupRef.current.rotation.z = Math.cos(t * 0.4) * 0.1;
    }
    if (shell5gRef.current) {
      shell5gRef.current.rotation.y = -t * 0.35;
      shell5gRef.current.rotation.z = t * 0.2;
    }
    if (magicHaloRef.current) {
      const s = 1.0 + Math.sin(t * 2.5) * 0.03;
      magicHaloRef.current.scale.set(s, s, s);
    }
  });

  const metrics = telemetry?.metrics;
  const z = metrics?.atomic_number_z ?? 126;
  const n = metrics?.neutron_number_n ?? 184;
  const massA = metrics?.mass_number_a ?? 310;
  const bPerA = metrics?.binding_energy_per_nucleon_mev ?? 7.0018;
  const shellBonus = metrics?.shell_correction_mev ?? 14.5;
  const status = metrics?.stability_status ?? 'SUPERHEAVY MAGIC ISLAND';

  return (
    <group position={[0, 0, 0]} ref={rootGroupRef}>
      {/* ── 1. Clustered Nucleons (Liquid Drop Model) ─────────────── */}
      <group ref={nucleusGroupRef}>
        {nucleonParticles.map((nuc, idx) => (
          <mesh key={idx} position={nuc.pos}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshBasicMaterial
              color={nuc.isProton ? '#ef4444' : '#00f0ff'}
            />
          </mesh>
        ))}
      </group>

      {/* ── 2. Quantum Magic Shell Closure Halo (N=184, Z=126) ──── */}
      <mesh ref={magicHaloRef}>
        <sphereGeometry args={[1.65, 32, 32]} />
        <meshBasicMaterial
          color="#39ff14"
          transparent
          opacity={0.18}
          wireframe
        />
      </mesh>

      {/* ── 3. Unbihexium 5g Complex Electron Orbital Lobe ──────── */}
      <mesh ref={shell5gRef}>
        <torusKnotGeometry args={[2.3, 0.15, 64, 16, 3, 5]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.25}
          wireframe
        />
      </mesh>

      {/* ── 4. Stark Diagnostic Holographic HUD Card ─────────────── */}
      <Html position={[0, 3.1, 0]} center>
        <div className="bg-black/90 px-4 py-2 rounded-lg border border-hud-cyan/40 shadow-[0_0_20px_rgba(0,240,255,0.3)] text-center font-mono pointer-events-none">
          <div className="text-[11px] font-bold text-cyan-300 tracking-wider flex items-center justify-center gap-2">
            <span>SUPERHEAVY ISLAND OF STABILITY (Z=126, N=184)</span>
            <span className="text-[8px] bg-cyan-950/80 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-600">
              UNBIHEXIUM-310
            </span>
          </div>
          <div className="text-[9px] text-gray-300 tracking-tight mt-1 flex items-center justify-center gap-2">
            <span>Z (p⁺): <strong className="text-red-400">{z}</strong></span>
            <span>│</span>
            <span>N (n⁰): <strong className="text-cyan-400">{n}</strong></span>
            <span>│</span>
            <span>A: <strong className="text-white">{massA}</strong></span>
            <span>│</span>
            <span>B/A: <strong className="text-green-400">{bPerA} MeV</strong></span>
            <span>│</span>
            <span>SHELL BONUS: <strong className="text-yellow-400">+{shellBonus} MeV</strong></span>
          </div>
        </div>
      </Html>
    </group>
  );
};
