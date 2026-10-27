/* ═══════════════════════════════════════════════════════════════════════════
 * MolecularViz.tsx — 3D Molecular structure renderer
 * Atoms as spheres, bonds as cylinders, orbital lobes as pulsing spheres
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { TelemetryFrame, Atom, Bond } from '../lib/types';

interface MolecularVizProps {
  telemetry: TelemetryFrame | null;
}

/** Default element color map */
const ELEMENT_COLORS: Record<string, string> = {
  H: '#ffffff',
  C: '#808080',
  N: '#3050F8',
  O: '#ff2020',
  S: '#FFD700',
  P: '#FF8000',
  Cl: '#1FF01F',
  default: '#00f0ff',
};

/** Default element radii */
const ELEMENT_RADII: Record<string, number> = {
  H: 0.25,
  C: 0.4,
  N: 0.38,
  O: 0.35,
  S: 0.5,
  P: 0.45,
  default: 0.35,
};

/** Default water molecule for when no telemetry data is available */
const DEFAULT_ATOMS: Atom[] = [
  { element: 'O', position: [0, 0, 0], radius: 0.35, color: '#ff2020' },
  { element: 'H', position: [0.96, 0, 0], radius: 0.25, color: '#ffffff' },
  { element: 'H', position: [-0.24, 0.93, 0], radius: 0.25, color: '#ffffff' },
];

const DEFAULT_BONDS: Bond[] = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
];

/** Computes position & rotation for a cylinder between two points */
function bondTransform(
  start: [number, number, number],
  end: [number, number, number]
): { position: THREE.Vector3; quaternion: THREE.Quaternion; length: number } {
  const s = new THREE.Vector3(...start);
  const e = new THREE.Vector3(...end);
  const dir = new THREE.Vector3().subVectors(e, s);
  const length = dir.length();
  const center = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);

  const quaternion = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  quaternion.setFromUnitVectors(up, dir.clone().normalize());

  return { position: center, quaternion, length };
}

export const MolecularViz: React.FC<MolecularVizProps> = ({ telemetry }) => {
  const groupRef = useRef<THREE.Group>(null);
  const orbitalRefs = useRef<THREE.Mesh[]>([]);

  const atoms = telemetry?.atoms ?? DEFAULT_ATOMS;
  const bonds = telemetry?.bonds ?? DEFAULT_BONDS;

  // Pre-compute bond transforms
  const bondTransforms = useMemo(() => {
    return bonds.map((bond) => {
      const startAtom = atoms[bond.from];
      const endAtom = atoms[bond.to];
      if (!startAtom || !endAtom) return null;
      return bondTransform(startAtom.position, endAtom.position);
    }).filter(Boolean) as { position: THREE.Vector3; quaternion: THREE.Quaternion; length: number }[];
  }, [atoms, bonds]);

  // Animate
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
    }

    // Pulse orbital lobes
    orbitalRefs.current.forEach((mesh, i) => {
      if (mesh) {
        const scale = 1.0 + 0.15 * Math.sin(t * 2.0 + i * 1.5);
        mesh.scale.setScalar(scale);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* ── Atoms ──────────────────────────────────────────────────────── */}
      {atoms.map((atom, i) => {
        const color = ELEMENT_COLORS[atom.element] ?? ELEMENT_COLORS.default;
        const radius = ELEMENT_RADII[atom.element] ?? ELEMENT_RADII.default;

        return (
          <group key={`atom-${i}`} position={atom.position}>
            {/* Core sphere */}
            <mesh>
              <sphereGeometry args={[radius, 32, 32]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.3}
                transparent
                opacity={0.85}
                roughness={0.3}
                metalness={0.2}
              />
            </mesh>

            {/* Glow halo */}
            <mesh>
              <sphereGeometry args={[radius * 1.3, 16, 16]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.08}
                side={THREE.BackSide}
              />
            </mesh>

            {/* Element label */}
            <Text
              position={[0, radius + 0.25, 0]}
              fontSize={0.18}
              color="#00f0ff"
              anchorX="center"
              anchorY="bottom"
              font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOTk6OThhvA.woff2"
            >
              {atom.element}
            </Text>
          </group>
        );
      })}

      {/* ── Bonds ──────────────────────────────────────────────────────── */}
      {bondTransforms.map((bt, i) => (
        <mesh key={`bond-${i}`} position={bt.position} quaternion={bt.quaternion}>
          <cylinderGeometry args={[0.06, 0.06, bt.length, 8]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={0.4}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}

      {/* ── Orbital Lobes (for first heavy atom) ──────────────────────── */}
      {atoms.filter((a) => a.element !== 'H').slice(0, 2).map((atom, i) => (
        <group key={`orbital-${i}`} position={atom.position}>
          {/* p-orbital positive lobe */}
          <mesh
            ref={(el) => { if (el) orbitalRefs.current[i * 2] = el; }}
            position={[0, 0.8, 0]}
          >
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial
              color="#00f0ff"
              transparent
              opacity={0.06}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* p-orbital negative lobe */}
          <mesh
            ref={(el) => { if (el) orbitalRefs.current[i * 2 + 1] = el; }}
            position={[0, -0.8, 0]}
          >
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial
              color="#ff6b00"
              transparent
              opacity={0.06}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
