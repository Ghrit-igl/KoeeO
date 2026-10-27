/* ═══════════════════════════════════════════════════════════════════════════
 * PathogenViz.tsx — 3D A. baumannii LpxC Zinc Active Site & Inhibitor Renderer
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { TelemetryFrame } from '../lib/types';

interface PathogenVizProps {
  telemetry: TelemetryFrame | null;
}

export const PathogenViz: React.FC<PathogenVizProps> = ({ telemetry }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  const atoms = telemetry?.active_site_atoms ?? [];
  const kinetics = telemetry?.kinetics;
  const target = kinetics?.target_pathogen ?? 'A. baumannii (CRAB)';
  const dG = kinetics?.gibbs_free_energy_dG_kj_mol ?? -38.4;
  const inhibition = kinetics?.inhibition_efficacy_percent ?? 94.2;

  return (
    <group position={[0, 0, 0]}>
      <group ref={groupRef}>
        {/* Render catalytic atoms & residues */}
        {atoms.map((atom, idx) => (
          <mesh key={idx} position={atom.pos}>
            <sphereGeometry args={[atom.radius, 24, 24]} />
            <meshBasicMaterial color={atom.color} />
          </mesh>
        ))}

        {/* Catalytic zinc coordination bonds */}
        <mesh position={[0, 0, 0]}>
          <ringGeometry args={[0.5, 0.55, 32]} />
          <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* ── Telemetry Annotation Label ───────────────────────── */}
      <Html position={[0, 2.5, 0]} center>
        <div className="bg-black/85 px-3 py-1.5 rounded border border-hud-amber/40 text-[10px] text-hud-amber font-mono tracking-widest whitespace-nowrap pointer-events-none">
          TARGET: {target} │ ΔG = {dG} kJ/mol │ INHIBITION = {inhibition}%
        </div>
      </Html>
    </group>
  );
};
