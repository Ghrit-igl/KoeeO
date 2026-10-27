/* ═══════════════════════════════════════════════════════════════════════════
 * api.ts — REST API client for the KoeeO backend
 * ═══════════════════════════════════════════════════════════════════════════ */

import type { Experiment, ExperimentType, ExperimentParams } from './types';

const API_BASE = 'http://localhost:8000';

/**
 * List all experiments from the backend.
 */
export async function listExperiments(): Promise<Experiment[]> {
  const res = await fetch(`${API_BASE}/api/experiments`);
  if (!res.ok) throw new Error(`Failed to list experiments: ${res.statusText}`);
  return res.json();
}

/**
 * Create a new experiment with the given type and parameters.
 */
export async function createExperiment(
  type: ExperimentType,
  params: ExperimentParams
): Promise<Experiment> {
  const res = await fetch(`${API_BASE}/api/experiments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, params }),
  });
  if (!res.ok) throw new Error(`Failed to create experiment: ${res.statusText}`);
  return res.json();
}

/**
 * Delete / terminate an experiment by ID.
 */
export async function deleteExperiment(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/experiments/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete experiment: ${res.statusText}`);
}
