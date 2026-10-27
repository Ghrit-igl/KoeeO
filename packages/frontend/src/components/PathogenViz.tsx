/* ═══════════════════════════════════════════════════════════════════════════
 * PathogenViz.tsx — Cinematic 3D A. baumannii LpxC Macromolecular Visualizer
 * Renders complete LpxC Zinc Metalloprotease Active Site, Bacterial Lipid A
 * Membrane, Hydroxamate Inhibitor Ligand, and Quantum Coordination Geometry.
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { TelemetryFrame } from '../lib/types';

interface PathogenVizProps {
  telemetry: TelemetryFrame | null;
}

export const PathogenViz: React.FC<PathogenVizProps> = ({ telemetry }) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const activeSiteRef = useRef<THREE.Group>(null);
  const ligandRef = useRef<THREE.Group>(null);
  const membraneRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (rootGroupRef.current) {
      rootGroupRef.current.rotation.y = t * 0.15;
    }
    if (activeSiteRef.current) {
      activeSiteRef.current.position.y = Math.sin(t * 1.2) * 0.08;
    }
    if (haloRef.current) {
      haloRef.current.rotation.z = -t * 0.4;
      const s = 1.0 + Math.sin(t * 2.0) * 0.05;
      haloRef.current.scale.set(s, s, s);
    }
  });

  const kinetics = telemetry?.kinetics;
  const target = kinetics?.target_pathogen ?? 'A. baumannii (CRAB)';
  const dG = kinetics?.gibbs_free_energy_dG_kj_mol ?? -43.35;
  const inhibition = kinetics?.inhibition_efficacy_percent ?? 93.2;
  const ic50 = kinetics?.inhibition_constant_ki_nM ?? 14.2;

  // 1. Generate LpxC Protein Backbone Ribbon (Alpha helices & Beta sheets)
  const helixRibbon = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const numTurns = 5;
    const radius = 1.8;
    const height = 4.0;
    const samples = 120;
    for (let i = 0; i <= samples; i++) {
      const u = i / samples;
      const angle = u * Math.PI * 2 * numTurns;
      const x = Math.cos(angle) * (radius + Math.sin(u * Math.PI * 3) * 0.4);
      const y = (u - 0.5) * height;
      const z = Math.sin(angle) * (radius + Math.cos(u * Math.PI * 2) * 0.4);
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 100, 0.06, 8, false);
  }, []);

  // 2. Generate Second Alpha-Helix Envelope
  const helixRibbon2 = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const samples = 80;
    for (let i = 0; i <= samples; i++) {
      const u = i / samples;
      const angle = -u * Math.PI * 2 * 3.5 + Math.PI;
      const x = Math.cos(angle) * 1.5 - 0.4;
      const y = (u - 0.5) * 3.2;
      const z = Math.sin(angle) * 1.5 + 0.3;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 80, 0.05, 8, false);
  }, []);

  // 3. Catalytic Residues Coordinating Zn2+ (His265, His238, Asp242)
  const residues = useMemo(() => [
    { name: 'His265', pos: [-0.9, 0.7, 0.4] as [number, number, number], color: '#38bdf8' },
    { name: 'His238', pos: [0.8, 0.8, -0.5] as [number, number, number], color: '#38bdf8' },
    { name: 'Asp242', pos: [-0.4, -0.9, -0.3] as [number, number, number], color: '#f87171' },
    { name: 'Phe192', pos: [1.1, -0.6, 0.6] as [number, number, number], color: '#fbbf24' },
    { name: 'Met185', pos: [-1.2, -0.4, 0.8] as [number, number, number], color: '#34d399' },
  ], []);

  // 4. Inhibitor Hydroxamate Ligand Atoms (docked inside active tunnel)
  const ligandAtoms = useMemo(() => [
    { elem: 'Zn', pos: [0, 0.1, 0] as [number, number, number], color: '#00ffff', radius: 0.28 },
    { elem: 'O1', pos: [0.35, 0.45, 0.1] as [number, number, number], color: '#ef4444', radius: 0.16 },
    { elem: 'N1', pos: [0.75, 0.3, 0.2] as [number, number, number], color: '#3b82f6', radius: 0.17 },
    { elem: 'C1', pos: [1.15, 0.1, 0.15] as [number, number, number], color: '#9ca3af', radius: 0.18 },
    { elem: 'C2', pos: [1.6, -0.15, 0.1] as [number, number, number], color: '#9ca3af', radius: 0.18 },
    { elem: 'Ar1', pos: [2.1, -0.4, 0.05] as [number, number, number], color: '#fbbf24', radius: 0.19 },
    { elem: 'Ar2', pos: [2.6, -0.6, 0.0] as [number, number, number], color: '#fbbf24', radius: 0.19 },
    { elem: 'Ar3', pos: [2.4, -1.0, -0.1] as [number, number, number], color: '#fbbf24', radius: 0.19 },
    { elem: 'O2', pos: [-0.4, 0.35, -0.1] as [number, number, number], color: '#ef4444', radius: 0.16 },
  ], []);

  // 5. Lipid A Bacterial Membrane Phospholipid Grid
  const membraneLipids = useMemo(() => {
    const list = [];
    for (let x = -6; x <= 6; x += 1.2) {
      for (let z = -6; z <= 6; z += 1.2) {
        list.push({ x, z, y: -2.8 });
      }
    }
    return list;
  }, []);

  return (
    <group position={[0, 0.3, 0]}>
      <group ref={rootGroupRef}>
        {/* ── A. Protein Backbone Ribbons ────────────────────────── */}
        <mesh geometry={helixRibbon}>
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.65} wireframe={false} />
        </mesh>
        <mesh geometry={helixRibbon2}>
          <meshBasicMaterial color="#a855f7" transparent opacity={0.55} wireframe={false} />
        </mesh>

        {/* ── B. Active Site Tunnel Envelope (Holographic Mesh) ── */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[1.6, 24, 24]} />
          <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.12} />
        </mesh>

        {/* Catalytic Coordination Aura Ring */}
        <mesh ref={haloRef} position={[0, 0.1, 0]} rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[0.7, 0.78, 48]} />
          <meshBasicMaterial color="#00ffff" side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>

        {/* ── C. Coordinating Residues & Distance Lines ─────────── */}
        <group ref={activeSiteRef}>
          {residues.map((res, i) => (
            <group key={i} position={res.pos}>
              {/* Residue Atom Cluster */}
              <mesh>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshBasicMaterial color={res.color} />
              </mesh>

              {/* Residue Label */}
              <Html position={[0, 0.35, 0]} center>
                <div className="text-[8px] font-mono font-bold bg-black/80 px-1 rounded text-cyan-300 border border-cyan-800 whitespace-nowrap pointer-events-none">
                  {res.name}
                </div>
              </Html>

              {/* Coordination Bond to Zn2+ at [0, 0.1, 0] */}
              <primitive
                object={
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints([
                      new THREE.Vector3(0, 0, 0),
                      new THREE.Vector3(-res.pos[0], 0.1 - res.pos[1], -res.pos[2]),
                    ]),
                    new THREE.LineBasicMaterial({
                      color: '#00ffff',
                      transparent: true,
                      opacity: 0.75,
                    })
                  )
                }
              />
            </group>
          ))}

          {/* ── D. Docked Hydroxamate Inhibitor Molecule ───────── */}
          <group ref={ligandRef}>
            {ligandAtoms.map((atom, i) => (
              <mesh key={i} position={atom.pos}>
                <sphereGeometry args={[atom.radius, 20, 20]} />
                <meshBasicMaterial color={atom.color} />
              </mesh>
            ))}

            {/* Ligand Skeletal Bonds */}
            {ligandAtoms.slice(1).map((atom, i) => {
              const prev = ligandAtoms[i];
              return (
                <primitive
                  key={`bond-${i}`}
                  object={
                    new THREE.Line(
                      new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(...prev.pos),
                        new THREE.Vector3(...atom.pos),
                      ]),
                      new THREE.LineBasicMaterial({ color: '#ffcc00', linewidth: 2 })
                    )
                  }
                />
              );
            })}
          </group>
        </group>

        {/* ── E. Bacterial Lipid A Membrane Layer (Floor) ────────── */}
        <group ref={membraneRef}>
          {membraneLipids.map((lip, idx) => (
            <group key={idx} position={[lip.x, lip.y, lip.z]}>
              {/* Polar head group */}
              <mesh>
                <sphereGeometry args={[0.16, 12, 12]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
              </mesh>
              {/* Acyl chain tails */}
              <primitive
                object={
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints([
                      new THREE.Vector3(0, 0, 0),
                      new THREE.Vector3(0, -0.6, 0),
                    ]),
                    new THREE.LineBasicMaterial({ color: '#0284c7', transparent: true, opacity: 0.3 })
                  )
                }
              />
            </group>
          ))}
        </group>
      </group>

      {/* ── Stark Diagnostic Holographic HUD Card ──────────────── */}
      <Html position={[0, 2.9, 0]} center>
        <div className="bg-black/90 px-4 py-2 rounded-lg border border-hud-amber/50 shadow-[0_0_20px_rgba(255,170,0,0.3)] text-center font-mono pointer-events-none">
          <div className="text-[11px] font-bold text-hud-amber tracking-wider flex items-center justify-center gap-2">
            <span>LPXC ZINC METALLOPROTEASE INHIBITION</span>
            <span className="text-[8px] bg-amber-950/80 text-amber-300 px-1.5 py-0.5 rounded border border-amber-600">
              ROOT-CAUSE TARGET
            </span>
          </div>
          <div className="text-[9px] text-gray-300 tracking-tight mt-1 flex items-center justify-center gap-2">
            <span>TARGET: <strong className="text-cyan-300">{target}</strong></span>
            <span>│</span>
            <span>EFFICACY: <strong className="text-green-400">{inhibition}%</strong></span>
            <span>│</span>
            <span>ΔG: <strong className="text-yellow-400">{dG} kJ/mol</strong></span>
            <span>│</span>
            <span>Ki: <strong className="text-purple-400">{ic50} nM</strong></span>
          </div>
        </div>
      </Html>
    </group>
  );
};
