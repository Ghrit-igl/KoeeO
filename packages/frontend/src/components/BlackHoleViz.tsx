/* ═══════════════════════════════════════════════════════════════════════════
 * BlackHoleViz.tsx — Cinematic General Relativity Black Hole & Gravitational Lens
 * Renders Schwarzschild Event Horizon (r_s = 2M), Photon Sphere (r_ph = 3M),
 * Relativistic Lensed Accretion Disk (Interstellar Doppler Beaming), and Polar Jets.
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { TelemetryFrame } from '../lib/types';

interface BlackHoleVizProps {
  telemetry: TelemetryFrame | null;
}

export const BlackHoleViz: React.FC<BlackHoleVizProps> = ({ telemetry }) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const diskRef = useRef<THREE.Points>(null);
  const upperLensDiskRef = useRef<THREE.Points>(null);
  const lowerLensDiskRef = useRef<THREE.Points>(null);
  const photonRingRef = useRef<THREE.Mesh>(null);
  const jetsRef = useRef<THREE.Points>(null);

  // 1. Accretion Disk particles with Doppler Beaming (300 particles)
  const [equatorialPositions, equatorialColors] = useMemo(() => {
    const count = 350;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 1.8 + Math.pow(Math.random(), 1.5) * 3.5;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 0.15;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = height;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Doppler beaming: approaching side (x < 0) is blue-shifted & brighter
      const vApprox = Math.sqrt(1.0 / radius);
      const doppler = Math.max(0.2, 1.0 - (x / radius) * vApprox);

      if (x < 0) {
        // Approaching: Cyan/Blue shift
        colors[i * 3] = 0.0 * doppler;
        colors[i * 3 + 1] = 0.9 * doppler;
        colors[i * 3 + 2] = 1.0 * doppler;
      } else {
        // Receding: Amber/Red shift
        colors[i * 3] = 1.0 * doppler;
        colors[i * 3 + 1] = 0.5 * doppler;
        colors[i * 3 + 2] = 0.1 * doppler;
      }
    }
    return [positions, colors];
  }, []);

  // 2. Gravitational Lensing Disks (Top & Bottom warped images of rear disk)
  const upperLensedPositions = useMemo(() => {
    const count = 180;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.PI * (0.05 + 0.9 * (i / count)); // Semi-circle arch
      const r = 1.7 + Math.random() * 0.5;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.sin(angle) * r;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    return pos;
  }, []);

  const lowerLensedPositions = useMemo(() => {
    const count = 180;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.PI * (1.05 + 0.9 * (i / count)); // Lower semi-circle arch
      const r = 1.6 + Math.random() * 0.45;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.sin(angle) * r;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    return pos;
  }, []);

  // 3. Relativistic Astrophysical Polar Jets
  const jetPositions = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      const dist = 0.8 + Math.random() * 4.5;
      const spread = (dist * 0.12) * (Math.random() - 0.5);
      const angle = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * spread;
      pos[i * 3 + 1] = dist * dir;
      pos[i * 3 + 2] = Math.sin(angle) * spread;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (rootGroupRef.current) {
      rootGroupRef.current.rotation.y = t * 0.08;
    }
    if (diskRef.current) {
      diskRef.current.rotation.y = t * 0.6;
    }
    if (photonRingRef.current) {
      photonRingRef.current.rotation.z = -t * 0.8;
      const s = 1.0 + Math.sin(t * 3.0) * 0.02;
      photonRingRef.current.scale.set(s, s, s);
    }
    if (jetsRef.current) {
      jetsRef.current.rotation.y = t * 1.5;
    }
  });

  const mSolar = telemetry?.metrics?.mass_solar ?? 12.0;
  const rsKm = telemetry?.metrics?.schwarzschild_radius_km ?? 35.44;
  const rphKm = telemetry?.metrics?.photon_sphere_radius_km ?? 53.16;
  const hawkingTemp = telemetry?.metrics?.hawking_temperature_kelvin ?? 5.14e-9;
  const bcKm = telemetry?.metrics?.critical_impact_parameter_km ?? 92.08;

  return (
    <group position={[0, 0, 0]} ref={rootGroupRef}>
      {/* ── 1. Central Pitch-Black Event Horizon (r = 2M) ──────── */}
      <mesh>
        <sphereGeometry args={[1.1, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* ── 2. Photon Sphere (r = 3M) Intense Holographic Ring ──── */}
      <mesh ref={photonRingRef}>
        <ringGeometry args={[1.11, 1.25, 64]} />
        <meshBasicMaterial
          color="#00f0ff"
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* ── 3. Equator Accretion Disk (Doppler Beaming) ───────── */}
      <points ref={diskRef} rotation={[Math.PI / 6, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[equatorialPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[equatorialColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.085}
          vertexColors
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ── 4. Upper Gravitationally Lensed Light Arch ──────────── */}
      <points ref={upperLensDiskRef} rotation={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[upperLensedPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#00f0ff"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ── 5. Lower Gravitationally Lensed Light Arch ──────────── */}
      <points ref={lowerLensDiskRef} rotation={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[lowerLensedPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#ff7700"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ── 6. Relativistic Astrophysical Polar Plasma Jets ─────── */}
      <points ref={jetsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[jetPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          color="#a855f7"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ── 7. Spacetime Curvature Coordinate Grids ────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 3.8, 32]} />
        <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.15} />
      </mesh>

      {/* ── Stark Diagnostic Holographic HUD Card ──────────────── */}
      <Html position={[0, 3.2, 0]} center>
        <div className="bg-black/90 px-4 py-2 rounded-lg border border-hud-cyan/40 shadow-[0_0_20px_rgba(0,240,255,0.3)] text-center font-mono pointer-events-none">
          <div className="text-[11px] font-bold text-hud-cyan tracking-wider flex items-center justify-center gap-2">
            <span>GENERAL RELATIVITY SCHWARZSCHILD GEODESICS</span>
            <span className="text-[8px] bg-cyan-950/80 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-700">
              M = {mSolar} M_☉
            </span>
          </div>
          <div className="text-[9px] text-gray-300 tracking-tight mt-1 flex items-center justify-center gap-2">
            <span>r_s: <strong className="text-cyan-400">{rsKm} km</strong></span>
            <span>│</span>
            <span>r_ph: <strong className="text-yellow-400">{rphKm} km (3M)</strong></span>
            <span>│</span>
            <span>b_c: <strong className="text-purple-400">{bcKm} km</strong></span>
            <span>│</span>
            <span>T_H: <strong className="text-red-400">{hawkingTemp.toExponential(2)} K</strong></span>
          </div>
        </div>
      </Html>
    </group>
  );
};
