import { useState, useEffect, useRef, useCallback } from 'react';

export type ConnectionQuality = 'Excellent' | 'Good' | 'Fair' | 'Poor';
export type NetworkStatus = 'Connected' | 'Poor Connection' | 'Connection Unstable' | 'Connection Lost';

export interface UseConnectionStatsOptions {
  peerConnection?: RTCPeerConnection | null;
  intervalMs?: number;
  simulate?: boolean;
}

export function useConnectionStats(options: UseConnectionStatsOptions = {}) {
  const { peerConnection = null, intervalMs = 1000, simulate = true } = options;

  const [ping, setPing] = useState<number | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('Excellent');
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('Connected');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<number | null>(null);
  const isMonitoringRef = useRef(false);

  // Keep references to current values to avoid unnecessary re-renders when they don't change
  const lastStateRef = useRef({
    ping: null as number | null,
    connectionQuality: 'Excellent' as ConnectionQuality,
    networkStatus: 'Connected' as NetworkStatus,
    isConnected: true,
  });

  const updateStats = useCallback((newPing: number | null, nextConnected: boolean) => {
    let nextQuality: ConnectionQuality = 'Excellent';
    let nextStatus: NetworkStatus = 'Connected';

    if (!nextConnected || newPing === null) {
      nextQuality = 'Poor';
      nextStatus = 'Connection Lost';
    } else {
      if (newPing <= 50) {
        nextQuality = 'Excellent';
      } else if (newPing <= 100) {
        nextQuality = 'Good';
      } else if (newPing <= 200) {
        nextQuality = 'Fair';
      } else {
        nextQuality = 'Poor';
      }

      if (newPing > 500) {
        nextStatus = 'Connection Unstable';
      } else if (newPing > 300) {
        nextStatus = 'Poor Connection';
      } else {
        nextStatus = 'Connected';
      }
    }

    const current = lastStateRef.current;
    if (
      current.ping !== newPing ||
      current.connectionQuality !== nextQuality ||
      current.networkStatus !== nextStatus ||
      current.isConnected !== nextConnected
    ) {
      lastStateRef.current = {
        ping: newPing,
        connectionQuality: nextQuality,
        networkStatus: nextStatus,
        isConnected: nextConnected,
      };

      setPing(newPing);
      setConnectionQuality(nextQuality);
      setNetworkStatus(nextStatus);
      setIsConnected(nextConnected);
      setLastUpdated(new Date());
    }
  }, []);

  const monitorTick = useCallback(async () => {
    // 1. Try real WebRTC RTCPeerConnection first
    if (peerConnection) {
      try {
        if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
          updateStats(null, false);
          return;
        }

        const stats = await peerConnection.getStats();
        let foundPing: number | null = null;

        stats.forEach((report) => {
          if (report.type === 'candidate-pair' && report.currentRoundTripTime !== undefined) {
            foundPing = Math.round(report.currentRoundTripTime * 1000);
          } else if (report.type === 'remote-inbound-rtp' && report.roundTripTime !== undefined) {
            foundPing = Math.round(report.roundTripTime * 1000);
          }
        });

        if (foundPing !== null) {
          updateStats(foundPing, true);
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch WebRTC connection stats:', err);
      }
    }

    // 2. Fallback to simulation
    if (simulate) {
      const isConnectedSim = (window as any).__bloopSimulateConnected !== false;
      if (!isConnectedSim) {
        updateStats(null, false);
        return;
      }

      // Read current simulated ping base
      const basePing = typeof (window as any).__bloopSimulatePing === 'number'
        ? (window as any).__bloopSimulatePing
        : 18; // default starting ping

      // Add small fluctuation: -3 to +3 ms to look real and lively
      const fluctuation = Math.floor(Math.random() * 7) - 3;
      const nextPing = Math.max(1, basePing + fluctuation);

      updateStats(nextPing, true);
    }
  }, [peerConnection, simulate, updateStats]);

  const startMonitoring = useCallback(() => {
    if (isMonitoringRef.current) return;
    isMonitoringRef.current = true;

    // Run first tick immediately
    monitorTick();

    intervalRef.current = window.setInterval(monitorTick, intervalMs);
  }, [monitorTick, intervalMs]);

  const stopMonitoring = useCallback(() => {
    isMonitoringRef.current = false;
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Monitor automatically based on parameters
  useEffect(() => {
    startMonitoring();

    const handleSimChange = () => {
      monitorTick();
    };

    window.addEventListener('bloop-sim-change', handleSimChange);

    return () => {
      stopMonitoring();
      window.removeEventListener('bloop-sim-change', handleSimChange);
    };
  }, [startMonitoring, stopMonitoring, monitorTick]);

  return {
    ping,
    connectionQuality,
    networkStatus,
    isConnected,
    lastUpdated,
    startMonitoring,
    stopMonitoring,
  };
}
export type UseConnectionStatsReturn = ReturnType<typeof useConnectionStats>;
