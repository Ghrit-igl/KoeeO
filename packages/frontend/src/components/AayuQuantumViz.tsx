/* ═══════════════════════════════════════════════════════════════════════════
 * AayuQuantumViz.tsx — 3D Holographic AAYU Silicon Quantum State Visualizer
 * Renders 3D Bloch Sphere, Bell Pair Entanglement Beam, Grover 100% Amp,
 * and Cooley-Tukey Radix-2 FFT Spectrum calculated directly on AAYU VM.
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { TelemetryFrame } from '../lib/types';

interface AayuQuantumVizProps {
  telemetry: TelemetryFrame | null;
}

export const AayuQuantumViz: React.FC<AayuQuantumVizProps> = ({ telemetry }) => {
  const blochGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const fftGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (blochGroupRef.current) {
      blochGroupRef.current.rotation.y += delta * 0.25;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.5;
    }
    if (beamRef.current) {
      beamRef.current.rotation.x += delta * 1.5;
    }
    if (fftGroupRef.current) {
      fftGroupRef.current.rotation.y -= delta * 0.2;
    }
  });

  // Extract AAYU Silicon Telemetry
  const qubit = telemetry?.qubit_state;
  const blochCoords = qubit?.bloch_coords ?? { x: 0.0, y: 0.0, z: 1.0 };
  const bx = (blochCoords.x ?? 0) * 1.4;
  const by = (blochCoords.z ?? 1) * 1.4; // Map Z to 3D Y up
  const bz = (blochCoords.y ?? 0) * 1.4;

  const bell = telemetry?.bell_state;
  const p00 = bell?.probabilities?.['00'] ?? 0.5;
  const p11 = bell?.probabilities?.['11'] ?? 0.5;

  const grover = telemetry?.grover_search;
  const targetState = grover?.target_state ?? 3;
  const groverDist = grover?.distribution ?? [0.0, 0.0, 0.0, 1.0];
  const groverPct = grover?.amplified_probability_pct ?? 100.0;

  const fidelity = telemetry?.teleportation?.fidelity_pct ?? 100.0;
  const execTimeUs = telemetry?.execution_time_us ?? 420.5;
  const fftMags = telemetry?.scientific_fft?.spectrum_magnitudes ?? [2.0, 0.0, 1.414, 0.0];

  return (
    <group position={[0, 0.2, 0]}>
      {/* ── 1. Central 3D Bloch Sphere ────────────────────────────── */}
      <group position={[0, 0.8, 0]} ref={blochGroupRef}>
        {/* Wireframe Reference Sphere */}
        <mesh>
          <sphereGeometry args={[1.4, 24, 24]} />
          <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.2} />
        </mesh>

        {/* Equatorial & Meridian Guide Rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.39, 1.41, 48]} />
          <meshBasicMaterial color="#00ffcc" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[1.39, 1.41, 48]} />
          <meshBasicMaterial color="#00aaff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* Origin Hub */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Bloch Vector Arrow pointing to state |psi> */}
        <group>
          {/* Shaft */}
          <primitive
            object={
              new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([
                  new THREE.Vector3(0, 0, 0),
                  new THREE.Vector3(bx, by, bz),
                ]),
                new THREE.LineBasicMaterial({ color: '#ffcc00', linewidth: 3 })
              )
            }
          />

          {/* Glowing Arrow Tip */}
          <mesh position={[bx, by, bz]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color="#ffcc00" />
          </mesh>
        </group>

        {/* Polar Labels */}
        <Html position={[0, 1.6, 0]} center>
          <span className="text-[10px] font-mono text-cyan-300 font-bold bg-black/60 px-1 rounded">|0⟩</span>
        </Html>
        <Html position={[0, -1.6, 0]} center>
          <span className="text-[10px] font-mono text-cyan-300 font-bold bg-black/60 px-1 rounded">|1⟩</span>
        </Html>
      </group>

      {/* ── 2. Entangled Bell Pair Nodes & Laser Beam ────────────────── */}
      <group position={[0, 0.8, 0]}>
        {/* Qubit A */}
        <group position={[-2.8, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.25, 20, 20]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
          <mesh ref={ringRef}>
            <ringGeometry args={[0.35, 0.42, 32]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <Html position={[0, -0.5, 0]} center>
            <div className="text-[9px] font-mono text-cyan-400 bg-black/70 px-1 rounded border border-cyan-500/30 whitespace-nowrap">
              QUBIT A: P(0)={(p00 * 100).toFixed(0)}%
            </div>
          </Html>
        </group>

        {/* Qubit B */}
        <group position={[2.8, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.25, 20, 20]} />
            <meshBasicMaterial color="#ff007f" />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <ringGeometry args={[0.35, 0.42, 32]} />
            <meshBasicMaterial color="#ff007f" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <Html position={[0, -0.5, 0]} center>
            <div className="text-[9px] font-mono text-pink-400 bg-black/70 px-1 rounded border border-pink-500/30 whitespace-nowrap">
              QUBIT B: P(1)={(p11 * 100).toFixed(0)}%
            </div>
          </Html>
        </group>

        {/* Entanglement Beam */}
        <mesh ref={beamRef} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 5.6, 16]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* ── 3. Grover Amplitude Amplification Bar Chart ─────────────── */}
      <group position={[0, -1.8, 0]}>
        {['00', '01', '10', '11'].map((stateBin, idx) => {
          const prob = groverDist[idx] ?? 0.0;
          const isTarget = idx === targetState;
          const barHeight = Math.max(0.1, prob * 1.5);
          const barColor = isTarget ? '#ffcc00' : '#007aff';
          const xPos = (idx - 1.5) * 0.9;

          return (
            <group key={stateBin} position={[xPos, 0, 0]}>
              {/* 3D Bar */}
              <mesh position={[0, barHeight / 2, 0]}>
                <boxGeometry args={[0.5, barHeight, 0.5]} />
                <meshBasicMaterial color={barColor} transparent opacity={isTarget ? 0.9 : 0.4} />
              </mesh>

              {/* State label */}
              <Html position={[0, -0.2, 0]} center>
                <div className={`text-[9px] font-mono px-1 rounded whitespace-nowrap ${
                  isTarget
                    ? 'text-yellow-300 font-bold bg-yellow-950/80 border border-yellow-400'
                    : 'text-gray-400 bg-black/60'
                }`}>
                  |{stateBin}⟩ {isTarget ? `★ ${groverPct.toFixed(0)}%` : `${(prob * 100).toFixed(0)}%`}
                </div>
              </Html>
            </group>
          );
        })}
      </group>

      {/* ── 4. Cooley-Tukey FFT Spectrum Ring ───────────────────────── */}
      <group position={[0, -0.5, -2.0]} ref={fftGroupRef}>
        {fftMags.map((mag, i) => {
          const radius = 1.0 + i * 0.35;
          const height = Math.max(0.05, mag * 0.3);
          return (
            <mesh key={i} position={[0, height / 2, 0]}>
              <cylinderGeometry args={[radius, radius, height, 32, 1, true]} />
              <meshBasicMaterial
                color={i % 2 === 0 ? '#00f0ff' : '#a855f7'}
                transparent
                opacity={0.35}
                side={THREE.DoubleSide}
                wireframe
              />
            </mesh>
          );
        })}
      </group>

      {/* ── 5. Stark HUD Telemetry Overlay ──────────────────────────── */}
      <Html position={[0, 2.8, 0]} center>
        <div className="bg-black/90 px-3 py-1.5 rounded-lg border border-hud-cyan/40 shadow-[0_0_15px_rgba(0,240,255,0.25)] text-center pointer-events-none">
          <div className="text-[11px] font-bold text-hud-cyan tracking-wider font-mono">
            AAYU INTENT-TO-SILICON ENGINE v1.5.0
          </div>
          <div className="text-[9px] text-gray-300 font-mono tracking-tight mt-0.5 flex items-center justify-center gap-2">
            <span>BELL: <strong className="text-cyan-400">|Φ⁺⟩</strong></span>
            <span>│</span>
            <span>GROVER: <strong className="text-yellow-400">|{targetState.toString(2).padStart(2, '0')}⟩ {groverPct}%</strong></span>
            <span>│</span>
            <span>TELEPORT: <strong className="text-green-400">{fidelity}%</strong></span>
            <span>│</span>
            <span>LATENCY: <strong className="text-purple-400">{execTimeUs} μs</strong></span>
          </div>
        </div>
      </Html>
    </group>
  );
};
