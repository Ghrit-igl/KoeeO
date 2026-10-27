/* ═══════════════════════════════════════════════════════════════════════════
 * TelemetryPanel.tsx — Live scientific telemetry readout HUD
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Cpu, Compass, Radio } from 'lucide-react';
import type { TelemetryFrame } from '../lib/types';

interface TelemetryPanelProps {
  telemetry: TelemetryFrame | null;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ telemetry }) => {
  const [energyHistory, setEnergyHistory] = useState<number[]>([]);
  const prevFrameRef = useRef<number>(0);

  useEffect(() => {
    if (telemetry && telemetry.frame !== prevFrameRef.current) {
      prevFrameRef.current = telemetry.frame;
      setEnergyHistory((prev) => {
        const next = [...prev, telemetry.energy];
        return next.length > 50 ? next.slice(next.length - 50) : next;
      });
    }
  }, [telemetry]);

  // Compute sparkline path
  const renderSparkline = () => {
    if (energyHistory.length < 2) return null;
    const width = 260;
    const height = 40;
    const min = Math.min(...energyHistory);
    const max = Math.max(...energyHistory);
    const range = max - min || 1;

    const points = energyHistory.map((val, idx) => {
      const x = (idx / (energyHistory.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return (
      <svg className="w-full h-10 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="energyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d={`M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`}
          fill="url(#energyGrad)"
        />
        <polyline
          fill="none"
          stroke="#00f0ff"
          strokeWidth="1.5"
          points={points.join(' ')}
        />
      </svg>
    );
  };

  const energy = telemetry?.energy ?? 0.0;
  const momentum = telemetry?.momentum ?? [0, 0, 0];
  const eigenvalues = telemetry?.eigenvalues ?? [1.0, 0.618, 0.382];
  const frame = telemetry?.frame ?? 0;
  const fps = telemetry?.fps ?? 60;

  return (
    <div className="p-4 space-y-4 text-hud-text font-mono">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="hud-corner-box p-3">
        <div className="flex items-center justify-between border-b border-hud-cyan/20 pb-2">
          <div className="flex items-center gap-2">
            <Radio size={12} className="text-hud-cyan animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-hud-cyan uppercase">
              Quantum Telemetry
            </span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-hud-green/10 border border-hud-green/40 text-hud-green font-semibold">
            SYNCHRONIZED
          </span>
        </div>

        {/* ── Primary Metrics ───────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-[rgba(0,30,60,0.4)] p-2 rounded border border-hud-cyan/10">
            <div className="flex items-center gap-1.5 text-hud-muted text-[10px]">
              <Zap size={10} className="text-hud-amber" />
              <span>HAMILTONIAN ENERGY</span>
            </div>
            <div className="text-lg font-bold text-hud-cyan tracking-wider mt-0.5">
              {energy.toFixed(3)}{' '}
              <span className="text-[10px] text-hud-muted font-normal">eV</span>
            </div>
          </div>

          <div className="bg-[rgba(0,30,60,0.4)] p-2 rounded border border-hud-cyan/10">
            <div className="flex items-center gap-1.5 text-hud-muted text-[10px]">
              <Activity size={10} className="text-hud-green" />
              <span>SIM FRAME RATE</span>
            </div>
            <div className="text-lg font-bold text-hud-green tracking-wider mt-0.5">
              {fps}{' '}
              <span className="text-[10px] text-hud-muted font-normal">FPS</span>
            </div>
          </div>
        </div>

        {/* ── Energy Sparkline ──────────────────────────────────── */}
        <div className="mt-3">
          <div className="flex justify-between items-center text-[10px] text-hud-muted mb-1">
            <span>ENERGY CONVERGENCE SPECTRA</span>
            <span className="text-hud-cyan">FRAME #{frame}</span>
          </div>
          <div className="bg-[rgba(0,15,35,0.7)] p-1 rounded border border-hud-cyan/15">
            {renderSparkline() || (
              <div className="h-10 flex items-center justify-center text-[10px] text-hud-muted/50">
                AWAITING QUANTUM CYCLE...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Eigenvalues / Spectral Decomposition ─────────────── */}
      <div className="hud-corner-box p-3">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-hud-cyan tracking-[0.15em] uppercase border-b border-hud-cyan/20 pb-1.5 mb-2.5">
          <Cpu size={11} className="text-hud-cyan" />
          <span>EIGENVALUE HARMONICS (λ)</span>
        </div>
        <div className="space-y-1.5 text-xs">
          {eigenvalues.slice(0, 3).map((val, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-[rgba(0,25,50,0.3)] px-2 py-1 rounded border border-hud-cyan/10"
            >
              <span className="text-[10px] text-hud-muted">λ_{idx} (MODE {idx + 1})</span>
              <span className="text-hud-cyan font-bold tracking-wider">
                {val.toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Spatial Momentum Vector ───────────────────────────── */}
      <div className="hud-corner-box p-3">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-hud-cyan tracking-[0.15em] uppercase border-b border-hud-cyan/20 pb-1.5 mb-2.5">
          <Compass size={11} className="text-hud-amber" />
          <span>MOMENTUM FLUX VECTOR</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
          <div className="bg-[rgba(0,25,50,0.3)] p-1.5 rounded border border-hud-cyan/10">
            <div className="text-[9px] text-hud-muted">P_X</div>
            <div className="text-hud-text font-bold text-[11px] mt-0.5">
              {momentum[0].toFixed(2)}
            </div>
          </div>
          <div className="bg-[rgba(0,25,50,0.3)] p-1.5 rounded border border-hud-cyan/10">
            <div className="text-[9px] text-hud-muted">P_Y</div>
            <div className="text-hud-text font-bold text-[11px] mt-0.5">
              {momentum[1].toFixed(2)}
            </div>
          </div>
          <div className="bg-[rgba(0,25,50,0.3)] p-1.5 rounded border border-hud-cyan/10">
            <div className="text-[9px] text-hud-muted">P_Z</div>
            <div className="text-hud-text font-bold text-[11px] mt-0.5">
              {momentum[2].toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* ── AAYU Silicon Quantum Readout (When Active) ─────────── */}
      {telemetry?.grover_search && (
        <div className="hud-corner-box p-3 border-hud-cyan/30 bg-cyan-950/20">
          <div className="flex items-center justify-between border-b border-hud-cyan/20 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <Zap size={11} className="text-yellow-400" />
              <span className="text-[10px] font-bold text-yellow-400 tracking-[0.15em] uppercase">
                AAYU SILICON VM INVARIANTS
              </span>
            </div>
            <span className="text-[9px] px-1 rounded bg-yellow-400/10 text-yellow-300 font-mono">
              {telemetry.execution_time_us} μs
            </span>
          </div>
          <div className="space-y-1.5 text-[10px]">
            <div className="flex justify-between items-center bg-black/40 px-2 py-1 rounded">
              <span className="text-hud-muted">BELL STATE |Φ⁺⟩</span>
              <span className="text-cyan-400 font-mono font-bold">
                P(00)={((telemetry.bell_state?.probabilities?.['00'] ?? 0.5) * 100).toFixed(0)}% │ P(11)={((telemetry.bell_state?.probabilities?.['11'] ?? 0.5) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center bg-black/40 px-2 py-1 rounded">
              <span className="text-hud-muted">GROVER TARGET |{telemetry.grover_search.target_binary}⟩</span>
              <span className="text-yellow-400 font-mono font-bold">
                {telemetry.grover_search.amplified_probability_pct.toFixed(1)}% AMPLIFIED
              </span>
            </div>
            <div className="flex justify-between items-center bg-black/40 px-2 py-1 rounded">
              <span className="text-hud-muted">TELEPORTATION FIDELITY</span>
              <span className="text-green-400 font-mono font-bold">
                {telemetry.teleportation?.fidelity_pct.toFixed(1)}% (EXACT)
              </span>
            </div>
            <div className="flex justify-between items-center bg-black/40 px-2 py-1 rounded">
              <span className="text-hud-muted">COOLEY-TUKEY FFT DC</span>
              <span className="text-purple-400 font-mono font-bold">
                MAG[0] = {telemetry.scientific_fft?.spectrum_magnitudes?.[0]?.toFixed(2) ?? '2.00'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
