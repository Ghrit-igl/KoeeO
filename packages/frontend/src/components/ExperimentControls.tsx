/* ═══════════════════════════════════════════════════════════════════════════
 * ExperimentControls.tsx — Simulation selection and parameter configuration
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useState } from 'react';
import { Play, Square, Sliders, Dna, Orbit, Layers } from 'lucide-react';
import type { UseSimulationReturn } from '../hooks/useSimulation';
import type {
  ExperimentType,
  MobiusParams,
  MolecularParams,
  ParticleParams,
} from '../lib/types';

interface ExperimentControlsProps {
  simulation: UseSimulationReturn;
}

export const ExperimentControls: React.FC<ExperimentControlsProps> = ({ simulation }) => {
  const [selectedType, setSelectedType] = useState<ExperimentType>('mobius');

  // Mobius params state
  const [mobiusParams, setMobiusParams] = useState<MobiusParams>({
    twist_factor: 1.0,
    resolution: 32,
    deformation_speed: 1.0,
  });

  // Molecular params state
  const [molecularParams, setMolecularParams] = useState<MolecularParams>({
    molecule: 'C6H6',
    orbital_scale: 1.0,
    vibration_amplitude: 0.2,
  });

  // Particle params state
  const [particleParams, setParticleParams] = useState<ParticleParams>({
    num_particles: 50,
    force_type: 'gravity',
    dt: 0.016,
    softening: 0.1,
  });

  const handleLaunch = () => {
    let params;
    if (selectedType === 'mobius') params = mobiusParams;
    else if (selectedType === 'molecular') params = molecularParams;
    else params = particleParams;

    simulation.create(selectedType, params);
  };

  const handleTerminate = () => {
    simulation.destroy();
  };

  return (
    <div className="p-4 space-y-4 text-hud-text font-mono">
      {/* ── Experiment Selector ─────────────────────────────────── */}
      <div className="hud-corner-box p-3">
        <div className="flex items-center gap-2 border-b border-hud-cyan/20 pb-2 mb-3">
          <Layers size={13} className="text-hud-cyan" />
          <span className="text-[11px] font-bold tracking-[0.2em] text-hud-cyan uppercase">
            Experiment Matrix
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* Möbius Strip Option */}
          <button
            type="button"
            onClick={() => setSelectedType('mobius')}
            className={`flex items-center gap-3 p-2.5 rounded border transition-all text-left ${
              selectedType === 'mobius'
                ? 'bg-hud-cyan/15 border-hud-cyan text-hud-cyan hud-glow-border'
                : 'bg-[rgba(0,20,45,0.4)] border-hud-cyan/10 hover:border-hud-cyan/30 text-hud-muted'
            }`}
          >
            <Orbit size={16} className={selectedType === 'mobius' ? 'text-hud-cyan' : 'text-hud-muted'} />
            <div>
              <div className="text-xs font-bold tracking-wider">INVERTED MÖBIUS</div>
              <div className="text-[10px] opacity-70">Topological Eigenvalues & Deformation</div>
            </div>
          </button>

          {/* Molecular Orbitals Option */}
          <button
            type="button"
            onClick={() => setSelectedType('molecular')}
            className={`flex items-center gap-3 p-2.5 rounded border transition-all text-left ${
              selectedType === 'molecular'
                ? 'bg-hud-cyan/15 border-hud-cyan text-hud-cyan hud-glow-border'
                : 'bg-[rgba(0,20,45,0.4)] border-hud-cyan/10 hover:border-hud-cyan/30 text-hud-muted'
            }`}
          >
            <Dna size={16} className={selectedType === 'molecular' ? 'text-hud-cyan' : 'text-hud-muted'} />
            <div>
              <div className="text-xs font-bold tracking-wider">MOLECULAR ORBITAL</div>
              <div className="text-[10px] opacity-70">Electron Density & Bond Conformation</div>
            </div>
          </button>

          {/* Particle Dynamics Option */}
          <button
            type="button"
            onClick={() => setSelectedType('particles')}
            className={`flex items-center gap-3 p-2.5 rounded border transition-all text-left ${
              selectedType === 'particles'
                ? 'bg-hud-cyan/15 border-hud-cyan text-hud-cyan hud-glow-border'
                : 'bg-[rgba(0,20,45,0.4)] border-hud-cyan/10 hover:border-hud-cyan/30 text-hud-muted'
            }`}
          >
            <Sliders size={16} className={selectedType === 'particles' ? 'text-hud-cyan' : 'text-hud-muted'} />
            <div>
              <div className="text-xs font-bold tracking-wider">N-BODY PARTICLES</div>
              <div className="text-[10px] opacity-70">Gravitational / Lorentz Field Dynamics</div>
            </div>
          </button>
        </div>
      </div>

      {/* ── Dynamic Parameters Panel ───────────────────────────── */}
      <div className="hud-corner-box p-3">
        <div className="flex items-center gap-2 border-b border-hud-cyan/20 pb-2 mb-3">
          <Sliders size={13} className="text-hud-amber" />
          <span className="text-[11px] font-bold tracking-[0.2em] text-hud-amber uppercase">
            System Parameters
          </span>
        </div>

        {selectedType === 'mobius' && (
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-hud-muted mb-1">
                <span>TWIST HARMONIC (π)</span>
                <span className="text-hud-cyan font-bold">{mobiusParams.twist_factor.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={mobiusParams.twist_factor}
                onChange={(e) =>
                  setMobiusParams({ ...mobiusParams, twist_factor: parseFloat(e.target.value) })
                }
                className="w-full accent-hud-cyan cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-hud-muted mb-1">
                <span>MESH RESOLUTION</span>
                <span className="text-hud-cyan font-bold">{mobiusParams.resolution}</span>
              </div>
              <input
                type="range"
                min="16"
                max="64"
                step="4"
                value={mobiusParams.resolution}
                onChange={(e) =>
                  setMobiusParams({ ...mobiusParams, resolution: parseInt(e.target.value, 10) })
                }
                className="w-full accent-hud-cyan cursor-pointer"
              />
            </div>
          </div>
        )}

        {selectedType === 'molecular' && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] text-hud-muted mb-1">MOLECULAR TARGET</label>
              <select
                value={molecularParams.molecule}
                onChange={(e) =>
                  setMolecularParams({
                    ...molecularParams,
                    molecule: e.target.value as MolecularParams['molecule'],
                  })
                }
                className="w-full bg-[rgba(0,25,50,0.8)] border border-hud-cyan/30 text-hud-cyan rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-hud-cyan"
              >
                <option value="C6H6">Benzene (C6H6) — Conjugated Ring</option>
                <option value="H2O">Water (H2O) — Dipole Bond</option>
                <option value="CO2">Carbon Dioxide (CO2) — Linear Quadrupole</option>
                <option value="CH4">Methane (CH4) — Tetrahedral</option>
                <option value="H2">Hydrogen (H2) — Sigma Orbital</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-hud-muted mb-1">
                <span>ORBITAL LOBE SCALE</span>
                <span className="text-hud-cyan font-bold">{molecularParams.orbital_scale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={molecularParams.orbital_scale}
                onChange={(e) =>
                  setMolecularParams({ ...molecularParams, orbital_scale: parseFloat(e.target.value) })
                }
                className="w-full accent-hud-cyan cursor-pointer"
              />
            </div>
          </div>
        )}

        {selectedType === 'particles' && (
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-hud-muted mb-1">
                <span>PARTICLE COUNT (N)</span>
                <span className="text-hud-cyan font-bold">{particleParams.num_particles}</span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                step="10"
                value={particleParams.num_particles}
                onChange={(e) =>
                  setParticleParams({ ...particleParams, num_particles: parseInt(e.target.value, 10) })
                }
                className="w-full accent-hud-cyan cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] text-hud-muted mb-1">FORCE FIELD TENSOR</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setParticleParams({ ...particleParams, force_type: 'gravity' })}
                  className={`py-1.5 px-2 rounded text-[11px] font-bold border ${
                    particleParams.force_type === 'gravity'
                      ? 'bg-hud-cyan/20 border-hud-cyan text-hud-cyan'
                      : 'bg-black/30 border-hud-cyan/15 text-hud-muted'
                  }`}
                >
                  GRAVITATIONAL
                </button>
                <button
                  type="button"
                  onClick={() => setParticleParams({ ...particleParams, force_type: 'electromagnetic' })}
                  className={`py-1.5 px-2 rounded text-[11px] font-bold border ${
                    particleParams.force_type === 'electromagnetic'
                      ? 'bg-hud-amber/20 border-hud-amber text-hud-amber'
                      : 'bg-black/30 border-hud-cyan/15 text-hud-muted'
                  }`}
                >
                  LORENTZ / EM
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Action Buttons ─────────────────────────────────────── */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleLaunch}
          disabled={simulation.isLoading}
          className="w-full py-2.5 px-4 bg-hud-cyan/20 hover:bg-hud-cyan/30 text-hud-cyan border border-hud-cyan font-bold tracking-[0.2em] rounded text-xs transition-all flex items-center justify-center gap-2 hud-glow-border disabled:opacity-50"
        >
          <Play size={13} className="fill-hud-cyan" />
          <span>{simulation.isRunning ? 'RE-INITIALIZE QUANTUM CORE' : 'INITIATE SIMULATION'}</span>
        </button>

        {simulation.isRunning && (
          <button
            type="button"
            onClick={handleTerminate}
            className="w-full py-2 px-4 bg-hud-red/20 hover:bg-hud-red/30 text-hud-red border border-hud-red/50 font-bold tracking-[0.2em] rounded text-xs transition-all flex items-center justify-center gap-2"
          >
            <Square size={13} className="fill-hud-red" />
            <span>TERMINATE SEQUENCE</span>
          </button>
        )}
      </div>
    </div>
  );
};
