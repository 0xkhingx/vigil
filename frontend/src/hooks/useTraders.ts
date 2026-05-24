import { useState, useEffect } from "react";
import { traders as mockTraders } from "@/lib/vigil-data";
import { fetchTraders, fetchStats, fetchAgentLog } from "@/lib/api";

export function useTraders() {
  const [traders, setTraders] = useState(mockTraders);
  const [loading, setLoading] = useState(true);
  const [backendOffline, setBackendOffline] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchTraders().then((data) => {
      if (data) {
        setBackendOffline(false);
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
      } else {
        setBackendOffline(true);
      }
      setLoading(false);
    });
  }, []);

  return { traders, loading, backendOffline };
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
  const [loading, setLoading] = useState(true);
  const [apiFailed, setApiFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAgentLog().then((data) => {
      if (data) {
        setLog(data);
        setApiFailed(false);
      } else {
        setApiFailed(true);
      }
      setLoading(false);
    });

    const interval = setInterval(() => {
      fetchAgentLog().then((data) => {
        if (data) setLog(data);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return { log, loading, apiFailed };
}