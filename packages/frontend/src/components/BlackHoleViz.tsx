/* ═══════════════════════════════════════════════════════════════════════════
 * BlackHoleViz.tsx — 3D Relativistic Black Hole & Null Geodesics Renderer
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
  const diskRef = useRef<THREE.Points>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Parse accretion disk particle positions
  const diskPositions = useMemo(() => {
    if (!telemetry?.disk_particles || telemetry.disk_particles.length === 0) {
      // Default rotating ring
      const pts = [];
      for (let i = 0; i < 150; i++) {
        const r = 2.8 + Math.random() * 4.5;
        const theta = Math.random() * Math.PI * 2;
        pts.push(r * Math.cos(theta), (r * Math.sin(theta)) * 0.35, (Math.random() - 0.5) * 0.2);
      }
      return new Float32Array(pts);
    }
    return new Float32Array(telemetry.disk_particles);
  }, [telemetry?.disk_particles]);

  // Parse geodesic ray paths
  const rayLines = useMemo(() => {
    if (!telemetry?.rays) return [];
    return telemetry.rays.map((ray) => {
      const points = ray.path.map((p: number[]) => new THREE.Vector3(p[0] * 0.2, p[1] * 0.2, p[2] * 0.2));
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      return {
        geom,
        isCaptured: ray.status === 'captured',
        criticalRatio: ray.critical_ratio,
      };
    });
  }, [telemetry?.rays]);

  useFrame((_, delta) => {
    if (diskRef.current) {
      diskRef.current.rotation.z += delta * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.15;
    }
  });

  const rHorizon = (telemetry?.event_horizon_radius ?? 2.0) * 0.45;
  const rPhoton = (telemetry?.photon_sphere_radius ?? 3.0) * 0.45;
  const mSolar = telemetry?.metrics?.mass_solar ?? 10.0;
  const hawkingTemp = telemetry?.metrics?.hawking_temperature_kelvin ?? 6.17e-9;

  return (
    <group position={[0, 0, 0]}>
      {/* ── Event Horizon (r = 2M) ────────────────────────────── */}
      <mesh>
        <sphereGeometry args={[rHorizon, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* ── Event Horizon Outer Glow Rim ──────────────────────── */}
      <mesh>
        <sphereGeometry args={[rHorizon * 1.04, 32, 32]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.2} wireframe />
      </mesh>

      {/* ── Photon Sphere Orbit Ring (r = 3M) ─────────────────── */}
      <mesh ref={ringRef} rotation={[Math.PI / 2.5, 0, 0]}>
        <ringGeometry args={[rPhoton * 0.98, rPhoton * 1.02, 64]} />
        <meshBasicMaterial color="#ff6b00" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Accretion Disk Particles ─────────────────────────── */}
      <points ref={diskRef} rotation={[Math.PI / 2.5, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[diskPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#ffaa00"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ── Relativistic Light Rays (Null Geodesics) ──────────── */}
      {rayLines.map((ray, i) => {
        const lineObj = new THREE.Line(
          ray.geom,
          new THREE.LineBasicMaterial({
            color: ray.isCaptured ? '#ff0055' : '#00f0ff',
            transparent: true,
            opacity: ray.isCaptured ? 0.7 : 0.85,
          })
        );
        return <primitive key={i} object={lineObj} />;
      })}

      {/* ── Telemetry Annotation Label ───────────────────────── */}
      <Html position={[0, rPhoton + 0.8, 0]} center>
        <div className="bg-black/80 px-2 py-1 rounded border border-hud-cyan/30 text-[10px] text-hud-cyan font-mono tracking-widest whitespace-nowrap pointer-events-none">
          M = {mSolar} M_☉ │ T_H = {hawkingTemp.toExponential(2)} K
        </div>
      </Html>
    </group>
  );
};
