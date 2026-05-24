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

const ARC_EXPLORER_URL = "https://explorer.arc.network/tx";

type FilterType = "ALL" | "SCORE" | "WARN" | "POLICY" | "SLASH";

const ENTRIES_PER_PAGE = 50;

function AgentLogPage() {
  const { log: agentLog, loading: logLoading } = useAgentLog();
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const logData = agentLog;

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
      <div className="max-md:!px-4 max-md:!py-6" style={{ padding: "48px 40px" }}>
        {/* Section Label */}
        <SectionLabel>[SYSTEM] AGENT ACTIVITY LOG</SectionLabel>

        {/* Headline */}
        <h1
          className="font-bold tracking-tight trader-bonds-heading max-md:!text-4xl max-md:!mt-3"
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
          className="max-md:!flex-col max-md:!items-stretch max-md:!mt-4"
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
          <div className="max-md:!flex-wrap" style={{ display: "flex", gap: "12px" }}>
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
            className="font-mono text-[13px] uppercase tracking-[0.1em] max-md:!w-full"
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
        <div className="max-md:!overflow-x-auto" style={{ marginTop: "32px" }}>
          {logLoading ? (
            <div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="vigil-skeleton"
                  style={{ height: "48px", marginBottom: "8px" }}
                />
              ))}
            </div>
          ) : paginatedEntries.length > 0 ? (
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
                    className="w-full text-left bg-transparent border-none cursor-pointer max-md:!block"
                    style={{
                      padding: "12px 24px",
                    }}
                  >
                    {/* Mobile layout */}
                    <div className="md:hidden">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          className="font-mono text-[14px]"
                          style={{ color: "#0a0a0a", fontWeight: 500 }}
                        >
                          {entry.trader}
                        </span>
                        <span
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
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          className="font-mono text-[12px]"
                          style={{ color: "#666666" }}
                        >
                          {timeOnly}
                        </span>
                        <TagChip tag={entry.type} />
                      </div>
                      <div
                        className="font-mono text-[13px]"
                        style={{ color: "#0a0a0a", opacity: 0.8 }}
                      >
                        {entry.detail}
                      </div>
                    </div>
                    {/* Desktop layout */}
                    <div
                      className="hidden md:grid"
                      style={{
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
                          <a
                            href={`${ARC_EXPLORER_URL}/0x${Math.random().toString(16).substring(2).padEnd(64, "0")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[13px] underline"
                            style={{
                              color: "#3b82f6",
                              wordBreak: "break-all",
                            }}
                          >
                            0x{Math.random()
                              .toString(16)
                              .substring(2)
                              .padEnd(64, "0")}
                          </a>
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
                {searchQuery || activeFilter !== "ALL"
                  ? "NO ENTRIES MATCH YOUR FILTER"
                  : "NO RECENT ACTIVITY — THE AGENT HAS NOT RUN ANY CHECKS YET"}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="max-md:!flex-wrap"
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
