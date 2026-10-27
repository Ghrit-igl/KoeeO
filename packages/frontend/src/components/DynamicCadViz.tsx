/* ═══════════════════════════════════════════════════════════════════════════
 * DynamicCadViz.tsx — 3D Holographic CAD Engineering Assembly & Stress Engine
 * Renders high-precision machinery (Kawasaki Ninja H2R Supercharger, Pistons,
 * Crankshaft, Trellis Frame), exploded view kinematics, and AAYU stress heatmaps.
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { TelemetryFrame } from '../lib/types';

interface DynamicCadVizProps {
  telemetry: TelemetryFrame | null;
  explodedFactor?: number;
  onSelectPart?: (partId: string) => void;
}

export const DynamicCadViz: React.FC<DynamicCadVizProps> = ({
  telemetry,
  explodedFactor = 0.0,
  onSelectPart,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const crankshaftRef = useRef<THREE.Group>(null);
  const impellerRef = useRef<THREE.Mesh>(null);
  const pistonsRef = useRef<THREE.Group>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Fallback default specs if telemetry is loading
  const modelName = telemetry?.model_name ?? 'Kawasaki Ninja H2R Supercharged 998cc';
  const layout = telemetry?.layout ?? 'Inline-4 Centrifugal Supercharged';
  const cad = (telemetry as any)?.cad_telemetry || (telemetry as any)?.telemetry || {
    rpm: 14000.0,
    boost_bar: 2.4,
    horsepower: 607.0,
    torque_nm: 309.0,
    total_stress_mpa: 1721.5,
    yield_mpa: 950.0,
    safety_factor: 0.55,
    failure_risk_pct: 67.2,
    temperature_c: 738.0,
    impeller_rpm: 128800.0,
    mach_number: 1.36,
  };

  const expF = telemetry?.exploded_factor ?? explodedFactor;

  // Parts list from AAYU Silicon Driver
  const parts = useMemo(() => {
    if (telemetry?.parts && telemetry.parts.length > 0) {
      return telemetry.parts;
    }
    // Default Kawasaki H2R parts layout
    return [
      { id: 'engine_block', name: 'Cylinder Block & Crankcase', material: 'Forged Aluminum 7075-T6', type: 'block', pos: [0, -0.3 * expF, 0], color: '#00f0ff', is_stressed: false },
      { id: 'supercharger', name: 'Centrifugal Supercharger Impeller', material: 'Billet Aluminum 5-Axis CNC', type: 'impeller', pos: [-1.4 - 1.4 * expF, 0.8 + 0.6 * expF, 0], color: '#38bdf8', is_stressed: false },
      { id: 'crankshaft', name: 'Crossplane Forged Crankshaft', material: 'Forged 4340 Chromoly Steel', type: 'crankshaft', pos: [0, -0.7 - 1.1 * expF, 0], color: '#00f0ff', is_stressed: false },
      { id: 'pistons', name: 'High-Compression Pistons (x4)', material: 'Cast Aluminum / Titanium Coated', type: 'pistons', pos: [0, 0.4 + 1.4 * expF, 0], color: cad.safety_factor < 1.0 ? '#ef4444' : '#10b981', is_stressed: cad.safety_factor < 1.0 },
      { id: 'connecting_rods', name: 'Titanium Fracture-Split Conrods', material: 'Ti-6Al-4V Titanium', type: 'rods', pos: [0, -0.1 + 0.7 * expF, 0], color: '#00f0ff', is_stressed: false },
      { id: 'valves_cams', name: 'DOHC Titanium Intake & Inconel Exhaust Valves', material: 'Inconel 718', type: 'valves', pos: [0, 1.2 + 1.5 * expF, 0], color: '#a855f7', is_stressed: false },
      { id: 'exhaust_headers', name: 'TIG-Welded Titanium 4-into-1 Headers', material: 'Ultra-thin Titanium', type: 'exhaust', pos: [1.1 + 1.3 * expF, -0.2 - 0.2 * expF, 0], color: '#ff7700', is_stressed: false },
    ];
  }, [telemetry?.parts, expF, cad.safety_factor]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const rotSpeed = (cad.rpm / 60.0) * 0.05;

    // Ambient slow inspection rotation
    if (rootGroupRef.current) {
      rootGroupRef.current.rotation.y = t * 0.15;
    }

    // Crankshaft spinning at simulated engine speed
    if (crankshaftRef.current) {
      crankshaftRef.current.rotation.x += rotSpeed;
    }

    // Supercharger impeller spinning at ultra-high speed (9.2x engine RPM)
    if (impellerRef.current) {
      impellerRef.current.rotation.z += rotSpeed * 3.5;
    }

    // Pistons reciprocating up and down
    if (pistonsRef.current) {
      const stroke = Math.sin(t * (cad.rpm / 600.0)) * 0.35;
      pistonsRef.current.position.y = stroke;
    }
  });

  return (
    <group position={[0, 0.2, 0]} ref={rootGroupRef}>
      {/* ── 1. Engine Block Geometry ─────────────────────────────── */}
      {parts.map((p) => {
        const isHovered = hoveredPart === p.id;
        const [x, y, z] = p.pos as [number, number, number];

        return (
          <group
            key={p.id}
            position={[x, y, z]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredPart(p.id);
            }}
            onPointerOut={() => setHoveredPart(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPart?.(p.id);
            }}
          >
            {/* ── Part Mesh Type Renderers ── */}
            {p.type === 'block' && (
              <group>
                {/* Monolithic Cylinder Case */}
                <mesh>
                  <boxGeometry args={[2.4, 1.6, 1.8]} />
                  <meshBasicMaterial
                    color={isHovered ? '#ffcc00' : p.color}
                    wireframe
                    transparent
                    opacity={0.7}
                  />
                </mesh>
                {/* 4 Cylinder Bores */}
                {[-0.75, -0.25, 0.25, 0.75].map((bx, idx) => (
                  <mesh key={idx} position={[bx, 0.2, 0]} rotation={[0, 0, 0]}>
                    <cylinderGeometry args={[0.22, 0.22, 1.4, 24, 1, true]} />
                    <meshBasicMaterial color="#00f0ff" transparent opacity={0.3} side={THREE.DoubleSide} />
                  </mesh>
                ))}
              </group>
            )}

            {p.type === 'impeller' && (
              <group>
                {/* Scroll Housing */}
                <mesh rotation={[0, Math.PI / 2, 0]}>
                  <torusGeometry args={[0.8, 0.22, 16, 32, Math.PI * 1.8]} />
                  <meshBasicMaterial color={isHovered ? '#ffcc00' : p.color} transparent opacity={0.5} wireframe />
                </mesh>
                {/* 5-Axis Whirling Billet Impeller */}
                <mesh ref={impellerRef} position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.6, 0.35, 0.3, 16, 1]} />
                  <meshBasicMaterial color="#00ffff" wireframe />
                </mesh>
              </group>
            )}

            {p.type === 'crankshaft' && (
              <group ref={crankshaftRef}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.12, 0.12, 2.6, 24]} />
                  <meshBasicMaterial color={isHovered ? '#ffcc00' : p.color} />
                </mesh>
                {/* Counterweights */}
                {[-0.8, -0.3, 0.3, 0.8].map((cx, i) => (
                  <mesh key={i} position={[cx, 0.22, 0]}>
                    <boxGeometry args={[0.22, 0.45, 0.35]} />
                    <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
                  </mesh>
                ))}
              </group>
            )}

            {p.type === 'pistons' && (
              <group ref={pistonsRef}>
                {[-0.75, -0.25, 0.25, 0.75].map((px, i) => (
                  <group key={i} position={[px, 0, 0]}>
                    {/* Piston Crown & Skirt */}
                    <mesh>
                      <cylinderGeometry args={[0.21, 0.21, 0.32, 20]} />
                      <meshBasicMaterial color={isHovered ? '#ffcc00' : p.color} />
                    </mesh>
                    {/* Ring Grooves */}
                    <mesh position={[0, 0.08, 0]}>
                      <ringGeometry args={[0.212, 0.218, 20]} />
                      <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
                    </mesh>
                  </group>
                ))}
              </group>
            )}

            {p.type === 'rods' && (
              <group>
                {[-0.75, -0.25, 0.25, 0.75].map((rx, i) => (
                  <mesh key={i} position={[rx, 0, 0]} rotation={[0, 0, 0]}>
                    <cylinderGeometry args={[0.04, 0.04, 0.85, 12]} />
                    <meshBasicMaterial color={isHovered ? '#ffcc00' : p.color} />
                  </mesh>
                ))}
              </group>
            )}

            {p.type === 'valves' && (
              <group>
                {/* Dual Overhead Camshafts */}
                <mesh position={[0, 0.25, 0.4]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.07, 0.07, 2.2, 16]} />
                  <meshBasicMaterial color="#a855f7" />
                </mesh>
                <mesh position={[0, 0.25, -0.4]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.07, 0.07, 2.2, 16]} />
                  <meshBasicMaterial color="#a855f7" />
                </mesh>
                {/* 16 Valves (4 per cylinder) */}
                {[-0.75, -0.25, 0.25, 0.75].map((vx, i) => (
                  <group key={i} position={[vx, 0, 0]}>
                    <mesh position={[0, -0.2, 0.25]}>
                      <coneGeometry args={[0.09, 0.35, 12]} />
                      <meshBasicMaterial color="#c084fc" />
                    </mesh>
                    <mesh position={[0, -0.2, -0.25]}>
                      <coneGeometry args={[0.09, 0.35, 12]} />
                      <meshBasicMaterial color="#c084fc" />
                    </mesh>
                  </group>
                ))}
              </group>
            )}

            {p.type === 'exhaust' && (
              <group>
                {/* 4 Curved Titanium Header Pipes */}
                {[-0.6, -0.2, 0.2, 0.6].map((ex, i) => (
                  <primitive
                    key={i}
                    object={
                      new THREE.Line(
                        new THREE.BufferGeometry().setFromPoints([
                          new THREE.Vector3(ex, 0.4, 0.8),
                          new THREE.Vector3(ex * 0.7, 0.0, 1.2),
                          new THREE.Vector3(0.5, -0.5, 1.4),
                          new THREE.Vector3(1.2, -0.8, 1.6),
                        ]),
                        new THREE.LineBasicMaterial({ color: '#ff7700', linewidth: 3 })
                      )
                    }
                  />
                ))}
              </group>
            )}

            {/* ── Holographic Exploded-View Leader Line ───────────── */}
            {expF > 0.05 && (
              <primitive
                object={
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints([
                      new THREE.Vector3(0, 0, 0),
                      new THREE.Vector3(-x * 0.6, -y * 0.6, -z * 0.6),
                    ]),
                    new THREE.LineDashedMaterial({
                      color: '#00f0ff',
                      dashSize: 0.1,
                      gapSize: 0.05,
                      transparent: true,
                      opacity: 0.45,
                    })
                  )
                }
              />
            )}

            {/* ── Interactive Part Name Tag ───────────────────────── */}
            <Html position={[0, 0.5, 0]} center>
              <div
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded cursor-pointer transition-all whitespace-nowrap ${
                  isHovered
                    ? 'bg-yellow-950/90 text-yellow-300 border border-yellow-400 scale-110 shadow-lg'
                    : p.is_stressed
                    ? 'bg-red-950/90 text-red-300 border border-red-500 animate-pulse'
                    : 'bg-black/80 text-cyan-300 border border-cyan-800'
                }`}
              >
                {p.name} {p.is_stressed && '⚠️ [OVERSTRESSED]'}
              </div>
            </Html>
          </group>
        );
      })}

      {/* ── Diagnostic Stark HUD Card (Top Center) ───────────────── */}
      <Html position={[0, 3.4, 0]} center>
        <div className="bg-black/90 px-4 py-2 rounded-lg border border-hud-cyan/50 shadow-[0_0_25px_rgba(0,240,255,0.35)] text-center font-mono pointer-events-none">
          <div className="text-[12px] font-bold text-hud-cyan tracking-wider flex items-center justify-center gap-2">
            <span>{modelName.toUpperCase()}</span>
            <span className="text-[8px] bg-cyan-950/80 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-700">
              {layout}
            </span>
          </div>
          <div className="text-[9px] text-gray-300 tracking-tight mt-1 flex items-center justify-center gap-2">
            <span>POWER: <strong className="text-yellow-400">{cad.horsepower} HP</strong></span>
            <span>│</span>
            <span>TORQUE: <strong className="text-cyan-400">{cad.torque_nm} Nm</strong></span>
            <span>│</span>
            <span>BOOST: <strong className="text-purple-400">{cad.boost_bar} bar</strong></span>
            <span>│</span>
            <span>IMPELLER: <strong className="text-green-400">{cad.impeller_rpm.toLocaleString()} RPM (M {cad.mach_number})</strong></span>
            <span>│</span>
            <span>SAFETY: <strong className={cad.safety_factor < 1.0 ? 'text-red-400' : 'text-green-400'}>{cad.safety_factor}</strong></span>
          </div>
        </div>
      </Html>
    </group>
  );
};
