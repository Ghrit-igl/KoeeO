/* ═══════════════════════════════════════════════════════════════════════════
 * SimulationCanvas.tsx — Three.js R3F canvas with holographic 3D scene
 * Renders the appropriate visualization based on active experiment type
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { HolographicGrid } from './HolographicGrid';
import { MobiusViz } from './MobiusViz';
import { MolecularViz } from './MolecularViz';
import { ParticleViz } from './ParticleViz';
import { BlackHoleViz } from './BlackHoleViz';
import { AerodynamicsViz } from './AerodynamicsViz';
import { NuclearViz } from './NuclearViz';
import { PathogenViz } from './PathogenViz';
import { BLOOM_CONFIG, VIGNETTE_CONFIG } from '../shaders/bloomPass';
import type { ExperimentType, TelemetryFrame } from '../lib/types';

interface SimulationCanvasProps {
  experimentType: ExperimentType | null;
  telemetry: TelemetryFrame | null;
}

/** Idle prompt shown when no experiment is active */
const IdlePrompt: React.FC = () => (
  <Html center>
    <div className="select-none text-center" style={{ width: 500 }}>
      <div className="text-hud-cyan text-2xl font-light tracking-[0.4em] mb-2 hud-glow-text">
        SELECT EXPERIMENT
      </div>
      <div className="text-hud-muted text-xs tracking-[0.2em]">
        CHOOSE A SIMULATION FROM THE LEFT PANEL TO BEGIN
      </div>
      <div className="flex gap-4 mt-6 justify-center flex-wrap">
        {[
          { icon: '●', label: 'SCHWARZSCHILD BLACK HOLE' },
          { icon: '༄', label: 'BUTTERFLY LEV' },
          { icon: '⚛', label: 'ISLAND OF STABILITY' },
          { icon: '☣', label: 'LPXC PATHOGEN INHIBITOR' },
        ].map((item) => (
          <div
            key={item.label}
            className="hud-panel hud-border-glow px-4 py-3 text-center cursor-default hover:border-hud-cyan/40 transition-all duration-300"
          >
            <div className="text-2xl text-hud-cyan mb-1 hud-glow-text">{item.icon}</div>
            <div className="text-[9px] text-hud-muted tracking-[0.15em]">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  </Html>
);

/** Renders the correct 3D visualization based on experiment type */
const ActiveVisualization: React.FC<{
  type: ExperimentType;
  telemetry: TelemetryFrame | null;
}> = ({ type, telemetry }) => {
  switch (type) {
    case 'mobius':
      return <MobiusViz telemetry={telemetry} />;
    case 'molecular':
      return <MolecularViz telemetry={telemetry} />;
    case 'particles':
      return <ParticleViz telemetry={telemetry} />;
    case 'blackhole':
      return <BlackHoleViz telemetry={telemetry} />;
    case 'aerodynamics':
      return <AerodynamicsViz telemetry={telemetry} />;
    case 'nuclear':
      return <NuclearViz telemetry={telemetry} />;
    case 'pathogen':
      return <PathogenViz telemetry={telemetry} />;
    default:
      return null;
  }
};

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  experimentType,
  telemetry,
}) => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 3, 8], fov: 60, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: '#030712' }}
      >
        {/* ── Lighting ─────────────────────────────────────────────────── */}
        <ambientLight color="#1a3a5c" intensity={0.4} />
        <pointLight position={[10, 10, 10]} color="#00f0ff" intensity={0.8} />
        <pointLight position={[-10, 5, -10]} color="#ff6b00" intensity={0.4} />
        <pointLight position={[0, -5, 5]} color="#00f0ff" intensity={0.3} />

        {/* ── Stars Background ─────────────────────────────────────────── */}
        <Stars
          radius={100}
          depth={60}
          count={3000}
          factor={3}
          saturation={0.1}
          fade
          speed={0.5}
        />

        {/* ── Camera Controls ──────────────────────────────────────────── */}
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          autoRotate={!experimentType}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI * 0.85}
          minDistance={3}
          maxDistance={30}
        />

        {/* ── Ground Grid ──────────────────────────────────────────────── */}
        <HolographicGrid />

        {/* ── Visualization or Idle Prompt ──────────────────────────────── */}
        <Suspense fallback={null}>
          {experimentType ? (
            <ActiveVisualization type={experimentType} telemetry={telemetry} />
          ) : (
            <IdlePrompt />
          )}
        </Suspense>

        {/* ── Post-processing ──────────────────────────────────────────── */}
        <EffectComposer>
          <Bloom
            intensity={BLOOM_CONFIG.intensity}
            luminanceThreshold={BLOOM_CONFIG.luminanceThreshold}
            luminanceSmoothing={BLOOM_CONFIG.luminanceSmoothing}
            mipmapBlur={BLOOM_CONFIG.mipmapBlur}
          />
          <Vignette
            offset={VIGNETTE_CONFIG.offset}
            darkness={VIGNETTE_CONFIG.darkness}
          />
        </EffectComposer>
      </Canvas>

      {/* ── Experiment type label overlay ──────────────────────────────── */}
      {experimentType && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] text-hud-cyan/60 tracking-[0.3em] uppercase">
          {experimentType === 'mobius' && '◎ MÖBIUS TOPOLOGY SIMULATION'}
          {experimentType === 'molecular' && '⬡ MOLECULAR ORBITAL ANALYSIS'}
          {experimentType === 'particles' && '✦ N-BODY PARTICLE DYNAMICS'}
        </div>
      )}
    </div>
  );
};
