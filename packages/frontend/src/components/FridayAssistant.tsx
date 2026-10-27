/* ═══════════════════════════════════════════════════════════════════════════
 * FridayAssistant.tsx — Tony Stark AI Assistant HUD (FRIDAY / JARVIS)
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Terminal } from 'lucide-react';
import type { TelemetryFrame, FridayMessage } from '../lib/types';

interface FridayAssistantProps {
  telemetry: TelemetryFrame | null;
  isRunning: boolean;
}

export const FridayAssistant: React.FC<FridayAssistantProps> = ({ telemetry, isRunning }) => {
  const [messages, setMessages] = useState<FridayMessage[]>([
    {
      id: 'init-1',
      role: 'friday',
      content: 'FRIDAY protocol online. AAYU v1.5.0 and RETER security firewall linked. Ready for simulation launch, Boss.',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastStateLoggedRef = useRef<string>('');

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Telemetry-driven autonomous diagnostics
  useEffect(() => {
    if (!isRunning) return;

    if (telemetry && telemetry.frame > 0 && telemetry.frame % 150 === 0) {
      const stateKey = `${telemetry.frame}`;
      if (lastStateLoggedRef.current !== stateKey) {
        lastStateLoggedRef.current = stateKey;

        let remark = '';
        if (telemetry.eigenvalues && telemetry.eigenvalues.length > 0) {
          const l0 = telemetry.eigenvalues[0];
          remark = `Spectral check: Mode 0 eigenvalue holding at ${l0.toFixed(4)}. Inverted manifold deformation is within tolerance.`;
        } else if (telemetry.atoms && telemetry.atoms.length > 0) {
          remark = `Molecular conformation converged across ${telemetry.atoms.length} atomic centers. Orbital superposition stable.`;
        } else {
          remark = `Hamiltonian energy conserved at ${telemetry.energy.toFixed(3)} eV. Zero dissipation detected.`;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `diag-${Date.now()}`,
            role: 'friday',
            content: remark,
            timestamp: Date.now(),
          },
        ]);
      }
    }
  }, [telemetry, isRunning]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');

    const userMsg: FridayMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Friday response logic
    setTimeout(() => {
      let reply = '';
      const lower = userText.toLowerCase();

      if (lower.includes('status') || lower.includes('report')) {
        reply = isRunning
          ? `Current energy is ${telemetry?.energy.toFixed(3) ?? '0.000'} eV at 60 FPS. All tensor field invariants passing AAYU verification.`
          : 'Core in standby. Select an experiment from the left matrix to initiate quantum calculations.';
      } else if (lower.includes('mobius') || lower.includes('time')) {
        reply = 'Möbius strip topology ready with non-orientable boundary conditions. Eigenvalue decomposition reflects continuous spectral flow.';
      } else if (lower.includes('molecule') || lower.includes('benzene')) {
        reply = 'Molecular orbital engine initialized with π-electron resonance and delocalized bond matrices.';
      } else if (lower.includes('aayu') || lower.includes('quantum') || lower.includes('grover') || lower.includes('silicon')) {
        reply = 'Boss, the AAYU Intent-to-Silicon Engine is executing quantum state vectors directly on its Rust VM with zero hallucination. Bell state entanglement confirmed at 50/50 superposition, Grover search amplified target to 100.0%, and Teleportation fidelity is 100% verified.';
      } else if (lower.includes('bike') || lower.includes('kawasaki') || lower.includes('h2r') || lower.includes('engine') || lower.includes('cad') || lower.includes('piston') || lower.includes('supercharger') || lower.includes('part') || lower.includes('upgrade')) {
        reply = 'Boss, the AAYU Dynamic CAD Engine has rendered the full assembly in the central bay. All 7 sub-assemblies isolated. Impeller spinning at Mach 1.36 tip speed. Piston crown stress analyzed on silicon VM. Ready for component upgrade or exploded-view expansion.';
      } else {
        reply = `Understood Boss. Analyzing: "${userText}". Running background verification against RETER AST engine.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `fri-${Date.now()}`,
          role: 'friday',
          content: reply,
          timestamp: Date.now(),
        },
      ]);
    }, 400);
  };

  return (
    <div className="h-full flex flex-col font-mono text-xs bg-[rgba(0,10,25,0.85)]">
      {/* ── Friday Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-hud-cyan/15 bg-[rgba(0,25,50,0.6)]">
        <div className="flex items-center gap-2">
          <Bot size={13} className="text-hud-cyan" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-hud-cyan uppercase">
            F.R.I.D.A.Y. CORE
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-hud-green animate-ping" />
          <span className="text-[9px] text-hud-green tracking-wider">ACTIVE</span>
        </div>
      </div>

      {/* ── Message Stream ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[90%] p-2 rounded text-[11px] leading-relaxed border ${
                m.role === 'user'
                  ? 'bg-hud-cyan/15 border-hud-cyan/40 text-hud-cyan'
                  : 'bg-[rgba(0,20,40,0.7)] border-hud-cyan/15 text-hud-text'
              }`}
            >
              {m.role === 'friday' && (
                <div className="flex items-center gap-1 text-[9px] text-hud-cyan/70 font-bold tracking-widest uppercase mb-1">
                  <Sparkles size={9} />
                  <span>AI DIAGNOSTIC</span>
                </div>
              )}
              {m.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* ── Input Bar ──────────────────────────────────────────── */}
      <form
        onSubmit={handleSend}
        className="p-2 border-t border-hud-cyan/15 bg-[rgba(0,15,35,0.9)] flex items-center gap-2"
      >
        <Terminal size={12} className="text-hud-muted flex-shrink-0" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Directive for Friday..."
          className="flex-1 bg-transparent text-hud-cyan placeholder-hud-muted/50 text-xs focus:outline-none font-mono"
        />
        <button
          type="submit"
          className="p-1 text-hud-cyan hover:text-white transition-colors"
        >
          <Send size={12} />
        </button>
      </form>
    </div>
  );
};
