const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function fetchTraders() {
  try {
    const res = await fetch(`${API_BASE}/api/traders`);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    console.warn("[Vigil] Backend offline — using mock data");
    return null;
  }
}

export async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/api/stats`);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    console.warn("[Vigil] Backend offline — using mock data");
    return null;
  }
}

export async function fetchAgentLog() {
  try {
    const res = await fetch(`${API_BASE}/api/agent-log`);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    console.warn("[Vigil] Backend offline — using mock data");
    return null;
  }
}