import { useState, useEffect } from "react";
import { traders as mockTraders } from "@/lib/vigil-data";
import { fetchTraders, fetchStats, fetchAgentLog } from "@/lib/api";

export function useTraders() {
  const [traders, setTraders] = useState(mockTraders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTraders().then((data) => {
      if (data) {
        // Merge API scores into mock data structure
        const merged = mockTraders.map((mock) => {
          const live = data.find((d: any) => d.handle === mock.handle);
          if (live) {
            return {
              ...mock,
              aiScore: live.aiScore,
              status: live.status === "AT_RISK" ? "AT RISK" : live.status,
              bondSize: live.bondAmount ?? mock.bondSize,
            };
          }
          return mock;
        });
        setTraders(merged);
      }
      setLoading(false);
    });
  }, []);

  return { traders, loading };
}

export function useStats() {
  const [stats, setStats] = useState({
    tvlBonded: 48200000,
    activeBonds: 1284,
    slashes30d: 37,
    meanSharpe: 2.41,
  });

  useEffect(() => {
    fetchStats().then((data) => {
      if (data) setStats(data);
    });
  }, []);

  return stats;
}

export function useAgentLog() {
  const [log, setLog] = useState<any[]>([]);

  useEffect(() => {
    fetchAgentLog().then((data) => {
      if (data) setLog(data);
    });

    // Poll every 30 seconds for live updates
    const interval = setInterval(() => {
      fetchAgentLog().then((data) => {
        if (data) setLog(data);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return log;
}