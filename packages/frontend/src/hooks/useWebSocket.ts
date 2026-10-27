/* ═══════════════════════════════════════════════════════════════════════════
 * useWebSocket.ts — Real-time WebSocket connection hook for telemetry
 * Auto-reconnects on disconnect with exponential backoff (max 3 retries)
 * ═══════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { TelemetryFrame } from '../lib/types';

const WS_BASE = 'ws://localhost:8000/ws/telemetry';
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

export interface UseWebSocketReturn {
  data: TelemetryFrame | null;
  connected: boolean;
  error: string | null;
}

/**
 * Connects to the backend WebSocket telemetry stream for a given experiment.
 * Returns the latest telemetry frame, connection status, and error info.
 */
export function useWebSocket(experimentId: string | null): UseWebSocketReturn {
  const [data, setData] = useState<TelemetryFrame | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!experimentId) return;

    const url = `${WS_BASE}/${experimentId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setConnected(true);
      setError(null);
      retriesRef.current = 0;
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const frame: TelemetryFrame = JSON.parse(event.data);
        setData(frame);
      } catch (e) {
        console.error('[WS] Failed to parse telemetry frame:', e);
      }
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      setError('WebSocket connection error');
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setConnected(false);

      // Auto-reconnect with exponential backoff
      if (retriesRef.current < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, retriesRef.current);
        retriesRef.current += 1;
        setTimeout(() => {
          if (mountedRef.current) connect();
        }, delay);
      } else {
        setError('Connection lost — max retries exceeded');
      }
    };
  }, [experimentId]);

  useEffect(() => {
    mountedRef.current = true;
    retriesRef.current = 0;
    setData(null);
    setError(null);
    setConnected(false);

    connect();

    return () => {
      mountedRef.current = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { data, connected, error };
}
