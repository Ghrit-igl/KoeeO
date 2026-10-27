/* ═══════════════════════════════════════════════════════════════════════════
 * ExperimentControls.tsx — Simulation selection and parameter configuration
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useState } from 'react';
import { Play, Square, Sliders, Dna, Orbit, Layers, CircleDot, Wind, Atom, Bug, Cpu, Wrench, Cog, Sparkles } from 'lucide-react';
import type { UseSimulationReturn } from '../hooks/useSimulation';
import type {
  ExperimentType,
  MobiusParams,
  MolecularParams,
  ParticleParams,
  BlackHoleParams,
  AerodynamicsParams,
  NuclearParams,
  PathogenParams,
  AayuQuantumParams,
  DynamicCadParams,
} from '../lib/types';

interface ExperimentControlsProps {
  simulation: UseSimulationReturn;
  selectedType: ExperimentType;
  onSelectType: (t: ExperimentType) => void;
}

export const ExperimentControls: React.FC<ExperimentControlsProps> = ({
  simulation,
  selectedType,
  onSelectType,
}) => {

  // Params state
  const [mobiusParams, setMobiusParams] = useState<MobiusParams>({
    twist_factor: 1.0,
    resolution: 32,
    deformation_speed: 1.0,
  });

  const [molecularParams, setMolecularParams] = useState<MolecularParams>({
    molecule: 'C6H6',
    orbital_scale: 1.0,
    vibration_amplitude: 0.2,
  });

  const [particleParams, setParticleParams] = useState<ParticleParams>({
    num_particles: 50,
    force_type: 'gravity',
    dt: 0.016,
    softening: 0.1,
  });

  const [blackholeParams, setBlackholeParams] = useState<BlackHoleParams>({
    mass_solar: 10.0,
  });

  const [aeroParams, setAeroParams] = useState<AerodynamicsParams>({
    temperature_c: 25.0,
    frequency_hz: 12.0,
  });

  const [nuclearParams, setNuclearParams] = useState<NuclearParams>({
    protons_z: 120,
    neutrons_n: 184,
  });

  const [pathogenParams, setPathogenParams] = useState<PathogenParams>({
    inhibitor_uM: 0.8,
  });

  const [aayuParams, setAayuParams] = useState<AayuQuantumParams>({
    grover_target: 3,
    alpha: 0.6,
    beta: 0.8,
  });

  const [cadParams, setCadParams] = useState<DynamicCadParams>({
    prompt: 'Kawasaki Ninja H2R Supercharged 998cc',
    rpm: 14000,
    boost_bar: 2.4,
    piston_material: 'titanium_ti6al4v',
    supercharger_material: 'forged_carbon',
    exploded_factor: 0.0,
  });

  const handleLaunch = () => {
    let params: any;
    if (selectedType === 'mobius') params = mobiusParams;
    else if (selectedType === 'molecular') params = molecularParams;
    else if (selectedType === 'particles') params = particleParams;
    else if (selectedType === 'blackhole') params = blackholeParams;
    else if (selectedType === 'aerodynamics') params = aeroParams;
    else if (selectedType === 'nuclear') params = nuclearParams;
    else if (selectedType === 'pathogen') params = pathogenParams;
    else if (selectedType === 'aayu_quantum') params = aayuParams;
    else if (selectedType === 'dynamic_cad') params = cadParams;

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
            Engineering & Science Matrix (9 Labs)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
          {/* Dynamic CAD & Stress Engine Option */}
          <button
            type="button"
            onClick={() => onSelectType('dynamic_cad')}
            className={`flex items-center gap-2.5 p-2 rounded border transition-all text-left ${
              selectedType === 'dynamic_cad'
                ? 'bg-hud-cyan/20 border-hud-cyan text-hud-cyan hud-glow-border shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'bg-[rgba(0,20,45,0.4)] border-hud-cyan/10 hover:border-hud-cyan/30 text-hud-muted'
            }`}
          >
            <Wrench size={14} className={selectedType === 'dynamic_cad' ? 'text-yellow-400 animate-spin' : 'text-hud-muted'} />
            <div>
              <div className="text-[11px] font-bold tracking-wider flex items-center gap-1.5">
                <span>DYNAMIC CAD & STRESS LAB</span>
                <span className="text-[8px] bg-yellow-950 text-yellow-400 px-1 py-0.5 rounded border border-yellow-700">USER INPUT</span>
              </div>
              <div className="text-[9px] opacity-70">Custom Machinery, Exploded View & Part Upgrades</div>
            </div>
          </button>

          {/* AAYU Silicon Quantum Engine Option */}
          <button
            type="button"
            onClick={() => onSelectType('aayu_quantum')}
            className={`flex items-center gap-2.5 p-2 rounded border transition-all text-left ${
              selectedType === 'aayu_quantum'
                ? 'bg-hud-cyan/20 border-hud-cyan text-hud-cyan hud-glow-border'
                : 'bg-[rgba(0,20,45,0.4)] border-hud-cyan/10 hover:border-hud-cyan/30 text-hud-muted'
            }`}
          >
            <Cpu size={14} className={selectedType === 'aayu_quantum' ? 'text-hud-cyan animate-pulse' : 'text-hud-muted'} />
            <div>
              <div className="text-[11px] font-bold tracking-wider flex items-center gap-1.5">
                <span>AAYU SILICON QUANTUM</span>
                <span className="text-[8px] bg-cyan-950 text-cyan-400 px-1 py-0.5 rounded border border-cyan-800">NATIVE</span>
              </div>
              <div className="text-[9px] opacity-70">Bell State, Grover Search & Cooley-Tukey FFT</div>
            </div>
          </button>

          {/* Black Hole Option */}
          <button
            type="button"
            onClick={() => onSelectType('blackhole')}
            className={`flex items-center gap-2.5 p-2 rounded border transition-all text-left ${
              selectedType === 'blackhole'
                ? 'bg-hud-cyan/20 border-hud-cyan text-hud-cyan hud-glow-border'
                : 'bg-[rgba(0,20,45,0.4)] border-hud-cyan/10 hover:border-hud-cyan/30 text-hud-muted'
            }`}
          >
            <CircleDot size={14} className={selectedType === 'blackhole' ? 'text-hud-cyan' : 'text-hud-muted'} />
            <div>
              <div className="text-[11px] font-bold tracking-wider">SCHWARZSCHILD BLACK HOLE</div>
              <div className="text-[9px] opacity-70">Photon Sphere (3M) & Geodesics</div>
            </div>
          </button>

          {/* Butterfly Aerodynamics Option */}
          <button
            type="button"
            onClick={() => onSelectType('aerodynamics')}
            className={`flex items-center gap-2.5 p-2 rounded border transition-all text-left ${
              selectedType === 'aerodynamics'
                ? 'bg-hud-cyan/20 border-hud-cyan text-hud-cyan hud-glow-border'
                : 'bg-[rgba(0,20,45,0.4)] border-hud-cyan/10 hover:border-hud-cyan/30 text-hud-muted'
            }`}
          >
            <Wind size={14} className={selectedType === 'aerodynamics' ? 'text-hud-cyan' : 'text-hud-muted'} />
            <div>
              <div className="text-[11px] font-bold tracking-wider">BUTTERFLY AERODYNAMICS</div>
              <div className="text-[9px] opacity-70">Navier-Stokes LEV & Sutherland Law</div>
            </div>
          </button>

          {/* Nuclear Island of Stability Option */}
          <button
            type="button"
            onClick={() => onSelectType('nuclear')}
            className={`flex items-center gap-2.5 p-2 rounded border transition-all text-left ${
              selectedType === 'nuclear'
                ? 'bg-hud-cyan/20 border-hud-cyan text-hud-cyan hud-glow-border'
                : 'bg-[rgba(0,20,45,0.4)] border-hud-cyan/10 hover:border-hud-cyan/30 text-hud-muted'
            }`}
          >
            <Atom size={14} className={selectedType === 'nuclear' ? 'text-hud-cyan' : 'text-hud-muted'} />
            <div>
              <div className="text-[11px] font-bold tracking-wider">ISLAND OF STABILITY</div>
              <div className="text-[9px] opacity-70">Bethe-Weizsäcker SEMF (Z=120, 126)</div>
            </div>
          </button>

          {/* Pathogen Root Cause Option */}
          <button
            type="button"
            onClick={() => onSelectType('pathogen')}
            className={`flex items-center gap-2.5 p-2 rounded border transition-all text-left ${
              selectedType === 'pathogen'
                ? 'bg-hud-cyan/20 border-hud-cyan text-hud-cyan hud-glow-border'
                : 'bg-[rgba(0,20,45,0.4)] border-hud-cyan/10 hover:border-hud-cyan/30 text-hud-muted'
            }`}
          >
            <Bug size={14} className={selectedType === 'pathogen' ? 'text-hud-cyan' : 'text-hud-muted'} />
            <div>
              <div className="text-[11px] font-bold tracking-wider">A. BAUMANNII LPXC INHIBITION</div>
              <div className="text-[9px] opacity-70">Lipid A Root-Cause & Zinc Active Site</div>
            </div>
          </button>

          {/* Möbius Strip Option */}
          <button
            type="button"
            onClick={() => onSelectType('mobius')}
            className={`flex items-center gap-2.5 p-2 rounded border transition-all text-left ${
              selectedType === 'mobius'
                ? 'bg-hud-cyan/20 border-hud-cyan text-hud-cyan hud-glow-border'
                : 'bg-[rgba(0,20,45,0.4)] border-hud-cyan/10 hover:border-hud-cyan/30 text-hud-muted'
            }`}
          >
            <Orbit size={14} className={selectedType === 'mobius' ? 'text-hud-cyan' : 'text-hud-muted'} />
            <div>
              <div className="text-[11px] font-bold tracking-wider">INVERTED MÖBIUS</div>
              <div className="text-[9px] opacity-70">Topological Eigenvalues & Deformation</div>
            </div>
          </button>

          {/* Molecular Orbitals Option */}
          <button
            type="button"
            onClick={() => onSelectType('molecular')}
            className={`flex items-center gap-2.5 p-2 rounded border transition-all text-left ${
              selectedType === 'molecular'
                ? 'bg-hud-cyan/20 border-hud-cyan text-hud-cyan hud-glow-border'
                : 'bg-[rgba(0,20,45,0.4)] border-hud-cyan/10 hover:border-hud-cyan/30 text-hud-muted'
            }`}
          >
            <Dna size={14} className={selectedType === 'molecular' ? 'text-hud-cyan' : 'text-hud-muted'} />
            <div>
              <div className="text-[11px] font-bold tracking-wider">MOLECULAR ORBITAL</div>
              <div className="text-[9px] opacity-70">Electron Density & Bond Conformation</div>
            </div>
          </button>

          {/* Particle Dynamics Option */}
          <button
            type="button"
            onClick={() => onSelectType('particles')}
            className={`flex items-center gap-2.5 p-2 rounded border transition-all text-left ${
              selectedType === 'particles'
                ? 'bg-hud-cyan/20 border-hud-cyan text-hud-cyan hud-glow-border'
                : 'bg-[rgba(0,20,45,0.4)] border-hud-cyan/10 hover:border-hud-cyan/30 text-hud-muted'
            }`}
          >
            <Sliders size={14} className={selectedType === 'particles' ? 'text-hud-cyan' : 'text-hud-muted'} />
            <div>
              <div className="text-[11px] font-bold tracking-wider">N-BODY PARTICLES</div>
              <div className="text-[9px] opacity-70">Gravitational / Lorentz Dynamics</div>
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

        {selectedType === 'blackhole' && (
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-hud-muted mb-1">
                <span>SOLAR MASS (M_☉)</span>
                <span className="text-hud-cyan font-bold">{blackholeParams.mass_solar.toFixed(1)} M_☉</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="50.0"
                step="0.5"
                value={blackholeParams.mass_solar}
                onChange={(e) =>
                  setBlackholeParams({ mass_solar: parseFloat(e.target.value) })
                }
                className="w-full accent-hud-cyan cursor-pointer"
              />
            </div>
            <div className="text-[10px] text-hud-muted/80 bg-black/40 p-2 rounded border border-hud-cyan/10">
              <div>r_s = {(2.953 * blackholeParams.mass_solar).toFixed(1)} km</div>
              <div>r_ph = {(4.429 * blackholeParams.mass_solar).toFixed(1)} km</div>
              <div>b_c = {(7.672 * blackholeParams.mass_solar).toFixed(1)} km</div>
            </div>
          </div>
        )}

        {selectedType === 'aerodynamics' && (
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-hud-muted mb-1">
                <span>AIR TEMPERATURE (°C)</span>
                <span className="text-hud-cyan font-bold">{aeroParams.temperature_c}°C</span>
              </div>
              <input
                type="range"
                min="-10.0"
                max="45.0"
                step="1.0"
                value={aeroParams.temperature_c}
                onChange={(e) =>
                  setAeroParams({ ...aeroParams, temperature_c: parseFloat(e.target.value) })
                }
                className="w-full accent-hud-cyan cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-hud-muted mb-1">
                <span>FLAPPING FREQUENCY (Hz)</span>
                <span className="text-hud-cyan font-bold">{aeroParams.frequency_hz} Hz</span>
              </div>
              <input
                type="range"
                min="6.0"
                max="25.0"
                step="0.5"
                value={aeroParams.frequency_hz}
                onChange={(e) =>
                  setAeroParams({ ...aeroParams, frequency_hz: parseFloat(e.target.value) })
                }
                className="w-full accent-hud-cyan cursor-pointer"
              />
            </div>
          </div>
        )}

        {selectedType === 'nuclear' && (
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-hud-muted mb-1">
                <span>PROTONS (Z)</span>
                <span className="text-hud-cyan font-bold">{nuclearParams.protons_z}</span>
              </div>
              <input
                type="range"
                min="82"
                max="130"
                step="1"
                value={nuclearParams.protons_z}
                onChange={(e) =>
                  setNuclearParams({ ...nuclearParams, protons_z: parseInt(e.target.value, 10) })
                }
                className="w-full accent-hud-cyan cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-hud-muted mb-1">
                <span>NEUTRONS (N)</span>
                <span className="text-hud-cyan font-bold">{nuclearParams.neutrons_n}</span>
              </div>
              <input
                type="range"
                min="126"
                max="200"
                step="1"
                value={nuclearParams.neutrons_n}
                onChange={(e) =>
                  setNuclearParams({ ...nuclearParams, neutrons_n: parseInt(e.target.value, 10) })
                }
                className="w-full accent-hud-cyan cursor-pointer"
              />
            </div>
          </div>
        )}

        {selectedType === 'pathogen' && (
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-hud-muted mb-1">
                <span>INHIBITOR CONCENTRATION (μM)</span>
                <span className="text-hud-cyan font-bold">{pathogenParams.inhibitor_uM.toFixed(2)} μM</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="5.0"
                step="0.05"
                value={pathogenParams.inhibitor_uM}
                onChange={(e) =>
                  setPathogenParams({ inhibitor_uM: parseFloat(e.target.value) })
                }
                className="w-full accent-hud-cyan cursor-pointer"
              />
            </div>
          </div>
        )}

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
          </div>
        )}

        {selectedType === 'aayu_quantum' && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] text-hud-muted mb-1.5">
                GROVER QUANTUM SEARCH TARGET STATE
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { idx: 0, label: '|00⟩' },
                  { idx: 1, label: '|01⟩' },
                  { idx: 2, label: '|10⟩' },
                  { idx: 3, label: '|11⟩' },
                ].map((item) => (
                  <button
                    key={item.idx}
                    type="button"
                    onClick={() => setAayuParams({ ...aayuParams, grover_target: item.idx })}
                    className={`py-1.5 px-2 rounded font-mono text-[11px] font-bold border transition-all ${
                      aayuParams.grover_target === item.idx
                        ? 'bg-hud-cyan/20 border-hud-cyan text-hud-cyan hud-glow-border'
                        : 'bg-black/40 border-hud-cyan/20 text-hud-muted hover:border-hud-cyan/40'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="text-[9px] text-hud-muted/80 mt-1">
                Amplifies target probability to 100% on silicon in 1 step
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-hud-muted mb-1">
                <span>SUPERPOSITION ALPHA (α)</span>
                <span className="text-hud-cyan font-bold">{aayuParams.alpha.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={aayuParams.alpha}
                onChange={(e) => setAayuParams({ ...aayuParams, alpha: parseFloat(e.target.value) })}
                className="w-full accent-hud-cyan cursor-pointer"
              />
            </div>

            <div className="p-2 rounded bg-cyan-950/30 border border-cyan-800/40 text-[9px] text-cyan-300">
              ⚡ <strong>Intent-to-Silicon Engine:</strong> Direct AAYU AST bytecode execution with zero-wrap 128-bit NaN-boxed arithmetic and Cooley-Tukey Radix-2 FFT.
            </div>
          </div>
        )}

        {selectedType === 'dynamic_cad' && (
          <div className="space-y-3 text-xs">
            {/* User Custom Model Input Bar */}
            <div>
              <label className="block text-[11px] text-hud-cyan font-bold mb-1 flex items-center justify-between">
                <span>TARGET VEHICLE / MACHINERY</span>
                <span className="text-[9px] text-yellow-400">AAYU RAG</span>
              </label>
              <input
                type="text"
                value={cadParams.prompt}
                onChange={(e) => setCadParams({ ...cadParams, prompt: e.target.value })}
                placeholder="e.g. Kawasaki Ninja H2R, Twin Turbo V8..."
                className="w-full bg-[rgba(0,25,50,0.8)] border border-hud-cyan/40 text-hud-cyan rounded px-2.5 py-1.5 font-mono text-[11px] focus:outline-none focus:border-yellow-400 shadow-[0_0_10px_rgba(0,240,255,0.15)]"
              />
              {/* Quick Presets */}
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {[
                  { label: 'Ninja H2R', query: 'Kawasaki Ninja H2R Supercharged 998cc', rpm: 14000, boost: 2.4 },
                  { label: 'Twin-Turbo V8', query: '4.0L Twin-Turbo 90° Hot-V V8', rpm: 8500, boost: 1.9 },
                  { label: 'SR-71 Jet Turbine', query: 'Pratt & Whitney J58 Afterburning Turbo-Ramjet', rpm: 7200, boost: 4.5 },
                  { label: 'Ferrari V12', query: '6.5L 65° Naturally Aspirated V12', rpm: 9500, boost: 0.0 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() =>
                      setCadParams({
                        ...cadParams,
                        prompt: item.query,
                        rpm: item.rpm,
                        boost_bar: item.boost,
                      })
                    }
                    className="text-[8px] bg-cyan-950/80 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800 hover:border-hud-cyan"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exploded View Slider */}
            <div className="bg-cyan-950/20 p-2 rounded border border-hud-cyan/20">
              <div className="flex justify-between text-[11px] text-hud-muted mb-1">
                <span className="text-yellow-400 font-bold">EXPLODED VIEW EXPANSION</span>
                <span className="text-yellow-400 font-bold">{(cadParams.exploded_factor * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={cadParams.exploded_factor}
                onChange={(e) => setCadParams({ ...cadParams, exploded_factor: parseFloat(e.target.value) })}
                className="w-full accent-yellow-400 cursor-pointer"
              />
              <div className="text-[8px] text-gray-400 mt-0.5">
                Pulls sub-assemblies apart with holographic leader lines
              </div>
            </div>

            {/* Part Upgrade: Piston Material */}
            <div>
              <label className="block text-[11px] text-hud-muted mb-1">
                COMPONENT UPGRADE: PISTON MATERIAL
              </label>
              <select
                value={cadParams.piston_material}
                onChange={(e) => setCadParams({ ...cadParams, piston_material: e.target.value })}
                className="w-full bg-[rgba(0,25,50,0.8)] border border-hud-cyan/30 text-hud-cyan rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-hud-cyan"
              >
                <option value="forged_aluminum_7075">Forged Aluminum 7075-T6 (Yield: 505 MPa)</option>
                <option value="titanium_ti6al4v">Ti-6Al-4V Grade 5 Titanium (Yield: 950 MPa)</option>
                <option value="forged_carbon">Billet Forged Carbon Composite (Yield: 1200 MPa)</option>
                <option value="silicon_nitride_ceramic">Silicon Nitride Si3N4 Ceramic (Yield: 850 MPa)</option>
              </select>
            </div>

            {/* Part Upgrade: Supercharger Impeller */}
            <div>
              <label className="block text-[11px] text-hud-muted mb-1">
                COMPONENT UPGRADE: SUPERCHARGER IMPELLER
              </label>
              <select
                value={cadParams.supercharger_material}
                onChange={(e) => setCadParams({ ...cadParams, supercharger_material: e.target.value })}
                className="w-full bg-[rgba(0,25,50,0.8)] border border-hud-cyan/30 text-hud-cyan rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-hud-cyan"
              >
                <option value="billet_aluminum">5-Axis Billet Aluminum (CNC Machined)</option>
                <option value="forged_carbon">Continuous Fiber Forged Carbon (Lightweight)</option>
                <option value="inconel_718">Inconel 718 Nickel Superalloy (1100 MPa)</option>
              </select>
            </div>

            {/* Operating Sliders: RPM & Boost */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[10px] text-hud-muted mb-1">
                  <span>RPM</span>
                  <span className="text-hud-cyan font-bold">{cadParams.rpm}</span>
                </div>
                <input
                  type="range"
                  min="4000"
                  max="16000"
                  step="500"
                  value={cadParams.rpm}
                  onChange={(e) => setCadParams({ ...cadParams, rpm: parseFloat(e.target.value) })}
                  className="w-full accent-hud-cyan cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-hud-muted mb-1">
                  <span>BOOST (bar)</span>
                  <span className="text-hud-cyan font-bold">{cadParams.boost_bar.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="3.5"
                  step="0.1"
                  value={cadParams.boost_bar}
                  onChange={(e) => setCadParams({ ...cadParams, boost_bar: parseFloat(e.target.value) })}
                  className="w-full accent-hud-cyan cursor-pointer"
                />
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
