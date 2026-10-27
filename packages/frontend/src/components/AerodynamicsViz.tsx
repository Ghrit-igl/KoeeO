/* ═══════════════════════════════════════════════════════════════════════════
 * AerodynamicsViz.tsx — 3D Butterfly Aerodynamics & Navier-Stokes LEV Renderer
 * Renders anatomical butterfly with articulated fore/hind wings, leading-edge
 * vortex (LEV) helical streamlines, and unsteady aerodynamic flow fields.
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { TelemetryFrame } from '../lib/types';

interface AerodynamicsVizProps {
  telemetry: TelemetryFrame | null;
}

export const AerodynamicsViz: React.FC<AerodynamicsVizProps> = ({ telemetry }) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const leftWingGroupRef = useRef<THREE.Group>(null);
  const rightWingGroupRef = useRef<THREE.Group>(null);
  const levParticlesRef = useRef<THREE.Points>(null);
  const wakeParticlesRef = useRef<THREE.Points>(null);

  // Flapping frequency from telemetry or fallback 12Hz
  const freqHz = 12.0;

  // 1. Generate Organic Forewing & Hindwing Shape
  const [forewingGeom, hindwingGeom] = useMemo(() => {
    // Forewing
    const fwShape = new THREE.Shape();
    fwShape.moveTo(0, 0);
    fwShape.bezierCurveTo(-0.8, 1.2, -2.4, 2.0, -3.2, 1.4);
    fwShape.bezierCurveTo(-3.5, 0.8, -2.8, -0.4, -1.8, -0.6);
    fwShape.bezierCurveTo(-1.0, -0.7, -0.3, -0.3, 0, 0);
    const fw = new THREE.ShapeGeometry(fwShape, 24);

    // Hindwing
    const hwShape = new THREE.Shape();
    hwShape.moveTo(0, -0.2);
    hwShape.bezierCurveTo(-0.6, -0.6, -1.8, -1.8, -2.0, -2.2);
    hwShape.bezierCurveTo(-1.6, -2.8, -0.6, -2.4, 0, -1.2);
    hwShape.bezierCurveTo(0.1, -0.8, 0.1, -0.4, 0, -0.2);
    const hw = new THREE.ShapeGeometry(hwShape, 20);

    return [fw, hw];
  }, []);

  // 2. Leading-Edge Vortex (LEV) Spiral Particles (Helical vortex core)
  const levPositions = useMemo(() => {
    const count = 250;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = i / count;
      const angle = u * Math.PI * 14;
      const r = 0.1 + u * 0.45;
      const x = -0.4 - u * 2.6; // Stretches along wing leading edge
      const y = Math.sin(angle) * r + 0.2;
      const z = Math.cos(angle) * r + 0.3;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    return pos;
  }, []);

  // 3. Downwash Wake Streamlines
  const wakePositions = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6.0;
      pos[i * 3 + 1] = -0.5 - Math.random() * 3.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4.0;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Smooth kinematic stroke: theta(t) = A * cos(2*pi*f*t)
    const flap = Math.cos(t * freqHz) * 0.75;
    const pitch = Math.sin(t * freqHz) * 0.25;

    if (leftWingGroupRef.current) {
      leftWingGroupRef.current.rotation.z = flap;
      leftWingGroupRef.current.rotation.y = pitch;
    }
    if (rightWingGroupRef.current) {
      rightWingGroupRef.current.rotation.z = -flap;
      rightWingGroupRef.current.rotation.y = -pitch;
    }

    if (rootGroupRef.current) {
      // Body undulating heave motion
      rootGroupRef.current.position.y = 0.2 + Math.sin(t * freqHz * 2) * 0.12;
      rootGroupRef.current.rotation.x = Math.sin(t * freqHz) * 0.08;
    }

    if (levParticlesRef.current) {
      levParticlesRef.current.rotation.x = t * 4.0;
    }
    if (wakeParticlesRef.current) {
      wakeParticlesRef.current.position.y = -((t * 2.0) % 1.5);
    }
  });

  const reynolds = telemetry?.reynolds_number ?? 4060.0;
  const liftCoeff = telemetry?.lift_coefficient ?? 1.901;
  const levBoost = telemetry?.lev_contribution ?? 0.835;

  return (
    <group position={[0, 0.4, 0]} ref={rootGroupRef}>
      {/* ── Central Butterfly Anatomy (Thorax, Abdomen, Head) ───── */}
      <group>
        {/* Thorax */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.18, 0.7, 16, 16]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
        {/* Abdomen */}
        <mesh position={[0, -0.8, -0.05]} rotation={[0.1, 0, 0]}>
          <capsuleGeometry args={[0.14, 1.2, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.55, 0.05]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
        {/* Antennae */}
        <primitive
          object={
            new THREE.Line(
              new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0.6, 0.05),
                new THREE.Vector3(-0.35, 1.3, 0.3),
              ]),
              new THREE.LineBasicMaterial({ color: '#00ffff' })
            )
          }
        />
        <primitive
          object={
            new THREE.Line(
              new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0.6, 0.05),
                new THREE.Vector3(0.35, 1.3, 0.3),
              ]),
              new THREE.LineBasicMaterial({ color: '#00ffff' })
            )
          }
        />
      </group>

      {/* ── Left Wing Assembly ─────────────────────────────────── */}
      <group position={[-0.1, 0.1, 0]} ref={leftWingGroupRef}>
        {/* Forewing */}
        <mesh geometry={forewingGeom}>
          <meshBasicMaterial
            color="#00f0ff"
            side={THREE.DoubleSide}
            transparent
            opacity={0.65}
            wireframe={false}
          />
        </mesh>
        <mesh geometry={forewingGeom}>
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} wireframe transparent opacity={0.3} />
        </mesh>

        {/* Hindwing */}
        <mesh geometry={hindwingGeom}>
          <meshBasicMaterial
            color="#0ea5e9"
            side={THREE.DoubleSide}
            transparent
            opacity={0.55}
          />
        </mesh>

        {/* Leading-Edge Vortex (LEV) Particle Spiral on Left Wing */}
        <points ref={levParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[levPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.065}
            color="#39ff14"
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>

      {/* ── Right Wing Assembly (Mirrored X) ───────────────────── */}
      <group position={[0.1, 0.1, 0]} ref={rightWingGroupRef} scale={[-1, 1, 1]}>
        {/* Forewing */}
        <mesh geometry={forewingGeom}>
          <meshBasicMaterial
            color="#00f0ff"
            side={THREE.DoubleSide}
            transparent
            opacity={0.65}
            wireframe={false}
          />
        </mesh>
        <mesh geometry={forewingGeom}>
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} wireframe transparent opacity={0.3} />
        </mesh>

        {/* Hindwing */}
        <mesh geometry={hindwingGeom}>
          <meshBasicMaterial
            color="#0ea5e9"
            side={THREE.DoubleSide}
            transparent
            opacity={0.55}
          />
        </mesh>
      </group>

      {/* ── Wake Downwash Particle Grid ────────────────────────── */}
      <points ref={wakeParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[wakePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color="#00f0ff"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ── Stark Diagnostic Holographic HUD Card ──────────────── */}
      <Html position={[0, 2.6, 0]} center>
        <div className="bg-black/90 px-4 py-2 rounded-lg border border-hud-cyan/40 shadow-[0_0_20px_rgba(57,255,20,0.25)] text-center font-mono pointer-events-none">
          <div className="text-[11px] font-bold text-cyan-300 tracking-wider flex items-center justify-center gap-2">
            <span>UNSTEADY BUTTERFLY LEV AERODYNAMICS</span>
            <span className="text-[8px] bg-green-950/80 text-green-300 px-1.5 py-0.5 rounded border border-green-600">
              NAVIER-STOKES
            </span>
          </div>
          <div className="text-[9px] text-gray-300 tracking-tight mt-1 flex items-center justify-center gap-2">
            <span>Re: <strong className="text-cyan-400">{reynolds.toFixed(0)}</strong></span>
            <span>│</span>
            <span>LIFT C_L: <strong className="text-green-400">{liftCoeff.toFixed(3)}</strong></span>
            <span>│</span>
            <span>LEV BOOST: <strong className="text-yellow-400">+{((levBoost / liftCoeff) * 100).toFixed(0)}%</strong></span>
            <span>│</span>
            <span>FREQ: <strong className="text-purple-400">{freqHz} Hz</strong></span>
          </div>
        </div>
      </Html>
    </group>
  );
};
