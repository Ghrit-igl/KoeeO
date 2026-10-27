/* ═══════════════════════════════════════════════════════════════════════════
 * AerodynamicsViz.tsx — 3D Butterfly Aerodynamics & Navier-Stokes LEV Renderer
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
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);

  // Flapping angle from telemetry or fallback oscillation
  const flapAngle = useMemo(() => {
    return THREE.MathUtils.degToRad(telemetry?.flapping_angle_deg ?? 0.0);
  }, [telemetry?.flapping_angle_deg]);

  // LEV vortex streamline curve
  const vortexLine = useMemo(() => {
    if (!telemetry?.lev_streamlines || telemetry.lev_streamlines.length === 0) {
      return null;
    }
    const pts = [];
    for (let i = 0; i < telemetry.lev_streamlines.length; i += 3) {
      pts.push(
        new THREE.Vector3(
          telemetry.lev_streamlines[i],
          telemetry.lev_streamlines[i + 1],
          telemetry.lev_streamlines[i + 2]
        )
      );
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [telemetry?.lev_streamlines]);

  useFrame(() => {
    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = flapAngle;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = -flapAngle;
    }
  });

  const reynolds = telemetry?.reynolds_number ?? 1250;
  const liftCoeff = telemetry?.lift_coefficient ?? 1.85;

  return (
    <group position={[0, 0, 0]}>
      {/* ── Left Wing Mesh ────────────────────────────────────── */}
      <group position={[-0.1, 0, 0]}>
        <mesh ref={leftWingRef} position={[-1.2, 0, 0]}>
          <planeGeometry args={[2.2, 1.4, 8, 8]} />
          <meshBasicMaterial
            color="#00f0ff"
            wireframe
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ── Right Wing Mesh ───────────────────────────────────── */}
      <group position={[0.1, 0, 0]}>
        <mesh ref={rightWingRef} position={[1.2, 0, 0]}>
          <planeGeometry args={[2.2, 1.4, 8, 8]} />
          <meshBasicMaterial
            color="#00f0ff"
            wireframe
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ── Central Butterfly Thorax ──────────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.8, 12, 16]} />
        <meshBasicMaterial color="#ff6b00" />
      </mesh>

      {/* ── Leading-Edge Vortex (LEV) Streamlines ──────────────── */}
      {vortexLine && (
        <primitive
          object={
            new THREE.Line(
              vortexLine,
              new THREE.LineBasicMaterial({
                color: '#39ff14',
                transparent: true,
                opacity: 0.85,
              })
            )
          }
        />
      )}

      {/* ── Telemetry Annotation Label ───────────────────────── */}
      <Html position={[0, 1.8, 0]} center>
        <div className="bg-black/80 px-2 py-1 rounded border border-hud-green/30 text-[10px] text-hud-green font-mono tracking-widest whitespace-nowrap pointer-events-none">
          Re = {reynolds} │ C_L = {liftCoeff} (LEV AUGMENTED)
        </div>
      </Html>
    </group>
  );
};
