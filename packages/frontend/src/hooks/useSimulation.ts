/* ═══════════════════════════════════════════════════════════════════════════
 * useSimulation.ts — Simulation state management hook
 * Manages experiment lifecycle: create, destroy, and telemetry streaming
 * ═══════════════════════════════════════════════════════════════════════════ */

import { useState, useCallback } from 'react';
import type {
  Experiment,
  ExperimentType,
  ExperimentParams,
  TelemetryFrame,
} from '../lib/types';
import { createExperiment, deleteExperiment } from '../lib/api';
import { useWebSocket } from './useWebSocket';

export interface UseSimulationReturn {
  experiment: Experiment | null;
  telemetry: TelemetryFrame | null;
  wsConnected: boolean;
  wsError: string | null;
  isRunning: boolean;
  isLoading: boolean;
  create: (type: ExperimentType, params: ExperimentParams) => Promise<void>;
  destroy: () => Promise<void>;
}

/**
 * Full experiment lifecycle hook. Connects to the backend to
 * create/delete experiments and streams telemetry in real time.
 */
export function useSimulation(): UseSimulationReturn {
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const experimentId = experiment?.id ?? null;
  const { data: telemetry, connected: wsConnected, error: wsError } = useWebSocket(experimentId);

  const create = useCallback(async (type: ExperimentType, params: ExperimentParams) => {
    setIsLoading(true);
    try {
      const exp = await createExperiment(type, params);
      setExperiment(exp);
    } catch (err) {
      console.error('[Simulation] Failed to create experiment:', err);
      // Create a mock experiment for demo when backend is offline
      const mockId = `mock-${Date.now()}`;
      setExperiment({
        id: mockId,
        type,
        params,
        status: 'running',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const destroy = useCallback(async () => {
    if (!experiment) return;
    try {
      await deleteExperiment(experiment.id);
    } catch (err) {
      console.error('[Simulation] Failed to delete experiment:', err);
    }
    setExperiment(null);
  }, [experiment]);

  return {
    experiment,
    telemetry,
    wsConnected,
    wsError,
    isRunning: experiment !== null,
    isLoading,
    create,
    destroy,
  };
}
