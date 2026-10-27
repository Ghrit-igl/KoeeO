/* ═══════════════════════════════════════════════════════════════════════════
 * App.tsx — Root application component
 * Full-screen holographic lab layout with simulation state management
 * ═══════════════════════════════════════════════════════════════════════════ */

import React from 'react';
import { HolographicHUD } from './components/HolographicHUD';
import { useSimulation } from './hooks/useSimulation';

const App: React.FC = () => {
  const simulation = useSimulation();

  return <HolographicHUD simulation={simulation} />;
};

export default App;
