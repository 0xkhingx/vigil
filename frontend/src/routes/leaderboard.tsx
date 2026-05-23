import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  VigilLayout,
  StatusBadge,
  SectionLabel,
} from "@/components/vigil/VigilLayout";
import { type TraderStatus } from "@/lib/vigil-data";
import { useTraders } from "@/hooks/useTraders";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Vigil" },
      {
        name: "description",
        content:
          "Top bonded traders ranked by the Vigil AI custodian: AI score, PnL, bond size, and live policy status.",
      },
      { property: "og:title", content: "Leaderboard — Vigil" },
      {
        property: "og:description",
        content: "Ranked traders, AI scores, and live bond status.",
      },
    ],
  }),
  component: LeaderboardPage,
});

type SortKey = "rank" | "aiScore" | "pnl30d" | "bondSize";
const sortOptions: { key: SortKey; label: string }[] = [
  { key: "rank", label: "RANK" },
  { key: "aiScore", label: "AI SCORE" },
  { key: "pnl30d", label: "PNL (30D)" },
  { key: "bondSize", label: "BOND" },
];
const statusFilters: ("ALL" | TraderStatus)[] = ["ALL", "HEALTHY", "AT RISK", "SLASHED"];

const getFilterColor = (status: "ALL" | TraderStatus): { bg: string; border: string } => {
  switch (status) {
    case "ALL":
      return { bg: "#dde8ff", border: "#9ecbff" };
    case "HEALTHY":
      return { bg: "#e8f5e8", border: "#b8e6c1" };
    case "AT RISK":
      return { bg: "#fff8d0", border: "#f3e3a3" };
    case "SLASHED":
      return { bg: "#ffe8e8", border: "#ffb3b3" };
  }
};

function LeaderboardPage() {
  const { traders } = useTraders();
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TraderStatus>("ALL");

  const rows = useMemo(() => {
    const filtered =
      statusFilter === "ALL"
        ? traders
        : traders.filter((t) => t.status === statusFilter);
    const sorted = [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return sorted;
  }, [sortKey, sortDir, statusFilter]);

  const onSort = (k: SortKey) => {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir(k === "rank" ? "asc" : "desc");
    }
  };

  return (
    <VigilLayout>
      <div className="max-md:!px-4" style={{ padding: "48px 40px" }}>
        <SectionLabel>[INDEX] BONDED TRADERS</SectionLabel>
        <h1
          className="font-bold tracking-tight max-md:!text-4xl"
          style={{
            fontSize: "64px",
            lineHeight: 1.05,
            color: "#0a0a0a",
            marginTop: "16px",
            marginBottom: "16px",
            fontWeight: 800,
          }}
        >
          Leaderboard.
        </h1>
        <p
          className="max-w-2xl"
          style={{
            fontSize: "15px",
            lineHeight: 1.6,
            color: "rgba(10,10,10,0.7)",
            marginBottom: "32px",
          }}
        >
          Every trader is continuously scored by the Vigil AI agent. Rank
          reflects risk-adjusted performance against the trader's stated
          mandate. Bonds are slashed without discretion when policy breaks.
        </p>

        {/* Register Link */}
        <div style={{ marginBottom: "24px" }}>
          <Link
            to="/register"
            className="text-[11px] uppercase tracking-[0.15em] inline-block"
            style={{
              color: "#ffffff",
              backgroundColor: "#0a0a0a",
              border: "1px solid #0a0a0a",
              padding: "10px 20px",
              textDecoration: "none",
            }}
          >
            + REGISTER AS TRADER
          </Link>
        </div>

        {/* Controls */}
        <div
          className="max-md:!flex-col max-md:!items-stretch"
          style={{
            marginTop: "40px",
            border: "1px solid #e5e5e5",
            backgroundColor: "#f8f8f8",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <div className="flex items-center gap-4 max-md:!flex-col max-md:!items-start">
            <SectionLabel>FILTER</SectionLabel>
            <div className="flex max-md:!flex-wrap">
              {statusFilters.map((s) => {
                const active = statusFilter === s;
                const colors = getFilterColor(s);
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className="text-[11px] uppercase tracking-[0.15em]"
                    style={{
                      color: active ? "#0a0a0a" : "#666666",
                      backgroundColor: active ? colors.bg : "transparent",
                      border: active ? `1px solid ${colors.border}` : "1px solid #d0d0d0",
                      borderLeft: "1px solid #d0d0d0",
                      padding: "8px 14px",
                      marginLeft: "-1px",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SectionLabel>SORT</SectionLabel>
            <span
              className="font-mono text-[11px]"
              style={{ color: "#0a0a0a" }}
            >
              {sortOptions.find((o) => o.key === sortKey)?.label} ·{" "}
              {sortDir === "asc" ? "ASC ↑" : "DESC ↓"}
            </span>
            <span
              className="text-[11px] uppercase tracking-[0.15em]"
              style={{ color: "#666666" }}
            >
              · {rows.length} RESULTS
            </span>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {rows.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                color: "#666666",
                fontSize: "14px",
              }}
            >
              No traders match this filter.
            </div>
          ) : (
            rows.map((t) => (
              <Link
                key={t.handle}
                to="/traders/$handle"
                params={{ handle: t.handle }}
                style={{
                  display: "block",
                  border: "1px solid #e5e5e5",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "12px",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#0a0a0a",
                      textDecoration: t.status === "SLASHED" ? "line-through" : "none",
                      opacity: t.status === "SLASHED" ? 0.6 : 1,
                    }}
                  >
                    {t.handle}
                  </div>
                  <div className="font-mono text-[13px]" style={{ color: "#666666" }}>
                    #{t.rank}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div>
                    <div
                      className="text-[11px] uppercase tracking-[0.15em]"
                      style={{ color: "#666666", marginBottom: "4px" }}
                    >
                      AI SCORE
                    </div>
                    <div className="font-mono" style={{ color: "#0a0a0a", fontSize: "15px" }}>
                      {t.aiScore.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-[11px] uppercase tracking-[0.15em]"
                      style={{ color: "#666666", marginBottom: "4px" }}
                    >
                      PNL (30D)
                    </div>
                    <div
                      className="font-mono"
                      style={{
                        color: t.pnl30d < 0 ? "#666666" : "#0a0a0a",
                        fontSize: "15px",
                      }}
                    >
                      {t.pnl30d >= 0 ? "+" : ""}
                      {t.pnl30d.toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Table (desktop only) */}
        <div
          className="hidden md:block"
          style={{
            marginTop: "16px",
            border: "1px solid #e5e5e5",
            backgroundColor: "#f8f8f8",
          }}
        >
          <div
            className="grid font-mono text-[11px] uppercase tracking-[0.15em]"
            style={{
              gridTemplateColumns: "60px 1.4fr 1fr 0.8fr 1fr 1fr 140px",
              padding: "0 24px",
              height: "48px",
              alignItems: "center",
              color: "#666666",
              borderBottom: "1px solid #e5e5e5",
            }}
          >
            <SortHeader label="RANK" k="rank" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <div>HANDLE</div>
            <div>ADDRESS</div>
            <SortHeader label="AI SCORE" k="aiScore" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <SortHeader label="PNL (30D)" k="pnl30d" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <SortHeader label="BOND" k="bondSize" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <div>STATUS</div>
          </div>
          {rows.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                color: "#666666",
                fontSize: "14px",
              }}
            >
              No traders match this filter.
            </div>
          ) : (
            rows.map((t) => (
              <Link
                key={t.handle}
                to="/traders/$handle"
                params={{ handle: t.handle }}
                className="vigil-trader-row grid"
                style={{
                  gridTemplateColumns: "60px 1.4fr 1fr 0.8fr 1fr 1fr 140px",
                  padding: "0 24px",
                  height: "48px",
                  alignItems: "center",
                  color: "#0a0a0a",
                  fontSize: "14px",
                  borderBottom: "1px solid #e5e5e5",
                  textDecoration: "none",
                }}
              >
                <div className="font-mono" style={{ color: "#666666" }}>
                  {String(t.rank).padStart(2, "0")}
                </div>
                <div
                  style={{
                    textDecoration: t.status === "SLASHED" ? "line-through" : "none",
                    opacity: t.status === "SLASHED" ? 0.6 : 1,
                  }}
                >
                  {t.handle}
                </div>
                <div className="font-mono text-[13px]" style={{ color: "#666666" }}>
                  {t.address}
                </div>
                <div className="font-mono">{t.aiScore.toFixed(1)}</div>
                <div
                  className="font-mono"
                  style={{ color: t.pnl30d < 0 ? "#666666" : "#0a0a0a" }}
                >
                  {t.pnl30d >= 0 ? "+" : ""}
                  {t.pnl30d.toFixed(1)}%
                </div>
                <div className="font-mono">${t.bondSize.toLocaleString()}</div>
                <div>
                  <StatusBadge status={t.status} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </VigilLayout>
  );
}

function SortHeader({
  label,
  k,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (k: SortKey) => void;
}) {
  const active = k === sortKey;
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onSort(k);
      }}
      className="text-left flex items-center gap-2 text-[11px] uppercase tracking-[0.15em]"
      style={{
        color: active ? "#0a0a0a" : "#666666",
        backgroundColor: "transparent",
      }}
    >
      {label}
      <span style={{ color: active ? "#0a0a0a" : "#d0d0d0" }}>
        {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </button>
  );
}
