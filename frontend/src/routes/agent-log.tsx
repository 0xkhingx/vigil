import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  VigilLayout,
  SectionLabel,
  TagChip,
} from "@/components/vigil/VigilLayout";
import { useAgentLog } from "@/hooks/useTraders";

export const Route = createFileRoute("/agent-log")({
  head: () => ({
    meta: [
      { title: "Agent Log — Vigil" },
      {
        name: "description",
        content: "Real-time activity log of the Vigil AI agent monitoring trader performance and compliance.",
      },
      { property: "og:title", content: "Agent Log — Vigil" },
    ],
  }),
  component: AgentLogPage,
});

// Placeholder data when API returns empty
const placeholderLog = [
  { timestamp: "2026-05-15 14:18:33 UTC", type: "WARN", trader: "ploutos", detail: "drawdown 8.7% — within 1.3% of limit", reasoning: "Drawdown exceeding mandate threshold. Position concentration increased 12% day-over-day. Recommend risk reduction." },
  { timestamp: "2026-05-15 14:02:11 UTC", type: "SCORE", trader: "0xkairos", detail: "risk score updated 93.8 → 94.2", reasoning: "Sharpe ratio improved to 2.81. Leverage maintained at safe levels. Position sizing within mandate." },
  { timestamp: "2026-05-15 13:51:47 UTC", type: "SCORE", trader: "merlin.eth", detail: "risk score updated 91.4 → 91.7", reasoning: "Trend following strategy performing within parameters. Win rate at 71%. No mandate violations detected." },
  { timestamp: "2026-05-15 13:40:00 UTC", type: "SCORE", trader: "vega.lens", detail: "risk score updated 85.7 → 86.0", reasoning: "Options vol strategy maintaining delta neutrality. Vega exposure within limits. Greeks balanced." },
  { timestamp: "2026-05-15 13:22:18 UTC", type: "POLICY", trader: "lyra.fi", detail: "funding capture +0.42% logged", reasoning: "Funding rate arbitrage successfully executed. Position pairs balanced. No leverage spike detected." },
  { timestamp: "2026-05-15 12:55:41 UTC", type: "WARN", trader: "noctis", detail: "single-name concentration > 35%", reasoning: "Single asset exposure exceeds 30% limit. Risk score impact -2.4 points. Recommend rebalance." },
  { timestamp: "2026-05-15 12:02:51 UTC", type: "POLICY", trader: "ploutos", detail: "leverage spike to 3.9x detected", reasoning: "Leverage increased from 2.1x to 3.9x in 8 minutes. Still within 4.0x mandate. Marked for monitoring." },
  { timestamp: "2026-05-15 08:11:23 UTC", type: "SCORE", trader: "noctis", detail: "risk score downgraded 81.0 → 79.4", reasoning: "Volatility spike across alt-pair portfolio. Win rate decreased 6%. Mandate still in compliance." },
  { timestamp: "2026-05-15 02:11:09 UTC", type: "SLASH", trader: "icarus_x", detail: "bond fully slashed: drawdown 14.8% > 12.0%", reasoning: "Maximum drawdown exceeded mandate of 12.0%. Automatic slash triggered. Bond value reduced to $0." },
  { timestamp: "2026-05-15 02:10:51 UTC", type: "POLICY", trader: "icarus_x", detail: "mandate breach detected: max drawdown", reasoning: "Drawdown reached 13.2%. Grace period: 180 seconds. Slash condition: drawdown > 12.0%." },
];

type FilterType = "ALL" | "SCORE" | "WARN" | "POLICY" | "SLASH";

interface LogEntry {
  timestamp: string;
  type: string;
  trader: string;
  detail: string;
  reasoning?: string;
}

const ENTRIES_PER_PAGE = 50;

function AgentLogPage() {
  const agentLog = useAgentLog();
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Use placeholder data if API returns empty
  const logData = agentLog.length > 0 ? agentLog : placeholderLog;

  // Filter and search
  const filtered = useMemo(() => {
    let result = logData;

    if (activeFilter !== "ALL") {
      result = result.filter((entry) => entry.type === activeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.trader.toLowerCase().includes(query) ||
          entry.detail.toLowerCase().includes(query)
      );
    }

    return result;
  }, [logData, activeFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ENTRIES_PER_PAGE);
  const paginatedEntries = filtered.slice(
    (currentPage - 1) * ENTRIES_PER_PAGE,
    currentPage * ENTRIES_PER_PAGE
  );

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1);
    setExpandedIndex(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setExpandedIndex(null);
  };

  return (
    <VigilLayout>
      <div style={{ padding: "48px 40px" }}>
        {/* Section Label */}
        <SectionLabel>[SYSTEM] AGENT ACTIVITY LOG</SectionLabel>

        {/* Headline */}
        <h1
          className="font-bold tracking-tight trader-bonds-heading"
          style={{
            fontSize: "72px",
            lineHeight: 1.05,
            color: "#0a0a0a",
            marginTop: "24px",
            fontWeight: 800,
          }}
        >
          Agent Log.
        </h1>

        {/* Filter and Search Bar */}
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "24px",
            paddingBottom: "24px",
            borderBottom: "1px solid #e5e5e5",
          }}
        >
          {/* Filter Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            {(["ALL", "SCORE", "WARN", "POLICY", "SLASH"] as FilterType[]).map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  className="vigil-clickable text-[11px] uppercase tracking-[0.15em]"
                  style={{
                    color:
                      activeFilter === filter ? "#ffffff" : "#0a0a0a",
                    backgroundColor:
                      activeFilter === filter ? "#0a0a0a" : "#f8f8f8",
                    border:
                      activeFilter === filter
                        ? "1px solid #0a0a0a"
                        : "1px solid #d0d0d0",
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
                  {filter}
                </button>
              )
            )}
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="SEARCH TRADER"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="font-mono text-[13px] uppercase tracking-[0.1em]"
            style={{
              color: "#0a0a0a",
              backgroundColor: "#f8f8f8",
              border: "1px solid #d0d0d0",
              padding: "8px 16px",
              width: "200px",
              outline: "none",
            }}
          />
        </div>

        {/* Log Entries */}
        <div style={{ marginTop: "32px" }}>
          {paginatedEntries.length > 0 ? (
            paginatedEntries.map((entry, pageIndex) => {
              const globalIndex =
                (currentPage - 1) * ENTRIES_PER_PAGE + pageIndex;
              const isExpanded = expandedIndex === globalIndex;
              const timeMatch = entry.timestamp.match(/(\d{2}:\d{2}:\d{2})/);
              const timeOnly = timeMatch ? timeMatch[1] : entry.timestamp;

              return (
                <div
                  key={globalIndex}
                  style={{
                    border: "1px solid #e5e5e5",
                    backgroundColor: "#f8f8f8",
                    marginBottom: "8px",
                  }}
                >
                  {/* Collapsed Row */}
                  <button
                    onClick={() =>
                      setExpandedIndex(
                        isExpanded ? null : globalIndex
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "12px 24px",
                      textAlign: "left",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "grid",
                      gridTemplateColumns:
                        "100px 120px 150px 1fr 20px",
                      gap: "16px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className="font-mono text-[13px]"
                      style={{ color: "#666666" }}
                    >
                      {timeOnly}
                    </div>
                    <div>
                      <TagChip tag={entry.type} />
                    </div>
                    <div
                      className="font-mono text-[13px]"
                      style={{ color: "#0a0a0a", fontWeight: 500 }}
                    >
                      {entry.trader}
                    </div>
                    <div
                      className="font-mono text-[13px]"
                      style={{ color: "#0a0a0a", opacity: 0.8 }}
                    >
                      {entry.detail}
                    </div>
                    <div
                      style={{
                        color: "#0a0a0a",
                        fontSize: "12px",
                        transition: "transform 0.2s",
                        transform: isExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      ▼
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: "16px 24px",
                        borderTop: "1px solid #e5e5e5",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          className="text-[11px] uppercase tracking-[0.15em]"
                          style={{
                            color: "#666666",
                            marginBottom: "6px",
                          }}
                        >
                          FULL REASONING
                        </div>
                        <div
                          className="font-mono text-[13px]"
                          style={{
                            color: "#0a0a0a",
                            lineHeight: 1.6,
                            opacity: 0.9,
                          }}
                        >
                          {entry.reasoning || entry.detail}
                        </div>
                      </div>
                      {entry.type === "SLASH" && (
                        <div>
                          <div
                            className="text-[11px] uppercase tracking-[0.15em]"
                            style={{
                              color: "#666666",
                              marginBottom: "6px",
                            }}
                          >
                            ONCHAIN TX HASH
                          </div>
                          <div
                            className="font-mono text-[13px]"
                            style={{
                              color: "#0a0a0a",
                              wordBreak: "break-all",
                            }}
                          >
                            0x{Math.random()
                              .toString(16)
                              .substring(2)
                              .padEnd(64, "0")}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: "32px 24px",
                textAlign: "center",
                color: "#666666",
              }}
            >
              <div className="font-mono text-[14px]">
                NO ENTRIES MATCH YOUR FILTER
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              marginTop: "32px",
              display: "flex",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="vigil-clickable text-[11px] uppercase tracking-[0.15em]"
              style={{
                color: currentPage === 1 ? "#cccccc" : "#0a0a0a",
                backgroundColor: "#f8f8f8",
                border:
                  currentPage === 1
                    ? "1px solid #e5e5e5"
                    : "1px solid #d0d0d0",
                padding: "8px 16px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              ← PREV
            </button>
            <div
              className="font-mono text-[11px]"
              style={{
                color: "#0a0a0a",
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
              }}
            >
              PAGE {currentPage} OF {totalPages}
            </div>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="vigil-clickable text-[11px] uppercase tracking-[0.15em]"
              style={{
                color:
                  currentPage === totalPages ? "#cccccc" : "#0a0a0a",
                backgroundColor: "#f8f8f8",
                border:
                  currentPage === totalPages
                    ? "1px solid #e5e5e5"
                    : "1px solid #d0d0d0",
                padding: "8px 16px",
                cursor:
                  currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              NEXT →
            </button>
          </div>
        )}
      </div>
    </VigilLayout>
  );
}
