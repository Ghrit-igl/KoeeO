/* ═══════════════════════════════════════════════════════════════════════════
 * HolographicHUD.tsx — Main layout shell
 * Top nav bar, sidebars, overlays, and scanline effects
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Shield } from 'lucide-react';
import { SimulationCanvas } from './SimulationCanvas';
import { TelemetryPanel } from './TelemetryPanel';
import { ExperimentControls } from './ExperimentControls';
import { FridayAssistant } from './FridayAssistant';
import type { UseSimulationReturn } from '../hooks/useSimulation';

interface HolographicHUDProps {
  simulation: UseSimulationReturn;
}

export const HolographicHUD: React.FC<HolographicHUDProps> = ({ simulation }) => {
  const [timestamp, setTimestamp] = useState(new Date());

  // Update timestamp every second
  useEffect(() => {
    const interval = setInterval(() => setTimestamp(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour12: false }) +
    '.' +
    String(d.getMilliseconds()).padStart(3, '0');

  const formatDate = (d: Date) =>
    d.toISOString().split('T')[0];

  return (
    <div className="relative w-full h-full bg-hud-bg flex flex-col overflow-hidden animate-flicker">
      {/* ── Scanline Overlay ──────────────────────────────────────────── */}
      <div className="scanline-overlay" />
      <div className="scanline-bar" />

      {/* ── Top Navigation Bar ───────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-4 py-2 border-b border-hud-cyan/15 bg-gradient-to-r from-[rgba(0,20,40,0.9)] via-[rgba(0,10,30,0.95)] to-[rgba(0,20,40,0.9)]">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-hud-cyan hud-glow-text dot-pulse" />
          <h1 className="text-sm font-semibold tracking-[0.3em] text-hud-cyan hud-glow-text uppercase">
            KoeeO Virtual Science Lab
          </h1>
          <span className="text-[10px] text-hud-muted tracking-widest ml-2">
            HOLOGRAPHIC INTERFACE
          </span>
        </div>

        {/* Center: Status */}
        <div className="flex items-center gap-6 text-xs text-hud-muted">
          <span className="tracking-wider">{formatDate(timestamp)}</span>
          <span className="text-hud-cyan font-medium tracking-[0.15em]">
            {formatTime(timestamp)}
          </span>
        </div>

        {/* Right: Connection */}
        <div className="flex items-center gap-3">
          {simulation.isRunning && (
            <span className="text-[10px] text-hud-amber tracking-wider uppercase animate-pulse">
              ● EXPERIMENT ACTIVE
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {simulation.wsConnected ? (
              <>
                <Wifi size={12} className="text-hud-green" />
                <span className="text-[10px] text-hud-green tracking-wider">LINKED</span>
              </>
            ) : (
              <>
                <WifiOff size={12} className="text-hud-muted" />
                <span className="text-[10px] text-hud-muted tracking-wider">STANDBY</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content Area ────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Sidebar: Experiment Controls */}
        <aside className="w-72 flex-shrink-0 border-r border-hud-cyan/10 overflow-y-auto">
          <ExperimentControls simulation={simulation} />
        </aside>

        {/* Center: 3D Canvas */}
        <main className="flex-1 relative">
          <SimulationCanvas
            experimentType={simulation.experiment?.type ?? null}
            telemetry={simulation.telemetry}
          />
        </main>

        {/* Right Sidebar: Telemetry + Friday */}
        <aside className="w-80 flex-shrink-0 border-l border-hud-cyan/10 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <TelemetryPanel telemetry={simulation.telemetry} />
          </div>
          <div className="h-64 flex-shrink-0 border-t border-hud-cyan/10">
            <FridayAssistant
              telemetry={simulation.telemetry}
              isRunning={simulation.isRunning}
            />
          </div>
        </aside>
      </div>

      {/* ── Bottom Status Bar ────────────────────────────────────────── */}
      <footer className="relative z-10 flex items-center justify-between px-4 py-1.5 border-t border-hud-cyan/10 bg-[rgba(0,10,25,0.95)]">
        <div className="flex items-center gap-2 text-[10px] text-hud-muted tracking-wider">
          <Shield size={10} className="text-hud-green" />
          <span>AAYU ENGINE v1.5.0</span>
          <span className="text-hud-cyan/30">│</span>
          <span>RETER FIREWALL ACTIVE</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-hud-muted tracking-wider">
          <span>QUANTUM CORE: NOMINAL</span>
          <span className="text-hud-cyan/30">│</span>
          <span>
            MEMORY: {(performance as any)?.memory?.usedJSHeapSize
              ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB`
              : 'N/A'}
          </span>
        </div>
      </footer>
    </div>
  );
};
