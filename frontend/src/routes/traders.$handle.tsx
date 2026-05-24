import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { BondModal } from "@/components/vigil/BondModal";
import {
  VigilLayout,
  StatusBadge,
  SectionLabel,
  TagChip,
} from "@/components/vigil/VigilLayout";
import { getTrader, type Trader } from "@/lib/vigil-data";

export const Route = createFileRoute("/traders/$handle")({
  loader: ({ params }): Trader => {
    const trader = getTrader(params.handle);
    if (!trader) throw notFound();
    return trader;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.handle} — Vigil` : "Trader — Vigil" },
      {
        name: "description",
        content: loaderData
          ? `Mandate, bond status, and policy history for ${loaderData.handle}.`
          : "Trader detail.",
      },
      {
        property: "og:title",
        content: loaderData ? `${loaderData.handle} — Vigil` : "Trader — Vigil",
      },
    ],
  }),
  notFoundComponent: () => (
    <VigilLayout>
      <div className="max-md:!px-4" style={{ padding: "48px 40px" }}>
        <SectionLabel>[404] TRADER NOT FOUND</SectionLabel>
        <Link
          to="/leaderboard"
          className="text-[11px] uppercase tracking-[0.15em] inline-block"
          style={{ color: "#0a0a0a", marginTop: "24px" }}
        >
          ← BACK TO LEADERBOARD
        </Link>
      </div>
    </VigilLayout>
  ),
  errorComponent: ({ error }) => (
    <VigilLayout>
      <div style={{ padding: "48px 40px", color: "#0a0a0a" }}>
        <SectionLabel>[ERROR]</SectionLabel>
        <p style={{ marginTop: "16px" }}>{error.message}</p>
      </div>
    </VigilLayout>
  ),
  component: TraderPage,
});

function TraderPage() {
  const t = Route.useLoaderData() as Trader;
  const [isBondModalOpen, setIsBondModalOpen] = useState(false);

  // Extract sharpe ratio from history (if available)
  const sharpeEntry = t.history.find((h) =>
    h.detail.toLowerCase().includes("sharpe")
  );
  const sharpe = sharpeEntry
    ? parseFloat(sharpeEntry.detail.match(/\d+\.\d+/)?.[0] || "2.5")
    : 2.5;

  // Calculate a reasonable win rate (placeholder based on PnL and status)
  const winRate =
    t.status === "SLASHED"
      ? 38
      : t.pnl30d > 15
        ? 72
        : t.pnl30d > 10
          ? 68
          : t.pnl30d > 5
            ? 62
            : 55;

  // Extract max drawdown from mandate
  const maxDrawdown = parseFloat(t.mandate.maxDrawdown);

  // Stats for the left panel
  const stats = [
    ["30D PNL", `${t.pnl30d >= 0 ? "+" : ""}${t.pnl30d.toFixed(1)}%`],
    ["MAX DRAWDOWN", `${maxDrawdown.toFixed(1)}%`],
    ["WIN RATE", `${winRate}%`],
    ["SHARPE RATIO", sharpe.toFixed(2)],
    ["CURRENT RANK", `#${String(t.rank).padStart(2, "0")}`],
    ["PEAK RANK", `#${String(Math.max(1, t.rank - 2)).padStart(2, "0")}`],
    ["BOND SIZE", `$${t.bondSize.toLocaleString()}`],
  ];

  // Placeholder stakers data
  const stakers = [
    {
      staker: "0x7a2f...9e1b",
      amount: "$45,000",
      joined: "2026-04-02",
    },
    {
      staker: "0x3c8d...2a4f",
      amount: "$38,500",
      joined: "2026-04-15",
    },
    {
      staker: "0x9b1e...7f3c",
      amount: "$32,000",
      joined: "2026-04-28",
    },
    {
      staker: "0x5d2a...1e8b",
      amount: "$25,300",
      joined: "2026-05-01",
    },
  ];

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-5)}`;
  };

  return (
    <VigilLayout>
      <div className="max-md:!px-4 max-md:!py-6" style={{ padding: "48px 40px" }}>
        {/* Section Label */}
        <SectionLabel>[TRADER] PROFILE</SectionLabel>

        {/* Headline */}
        <h1
          className="font-bold tracking-tight max-md:!text-4xl max-md:!mt-3"
          style={{
            fontSize: "72px",
            lineHeight: 1.05,
            color: "#0a0a0a",
            marginTop: "24px",
            fontWeight: 800,
            textDecoration: t.status === "SLASHED" ? "line-through" : "none",
            opacity: t.status === "SLASHED" ? 0.7 : 1,
          }}
        >
          {t.handle}
        </h1>

        {/* Header row: AI score, status badge, wallet address */}
        <div
          className="flex items-center justify-between max-md:!flex-col max-md:!items-start max-md:!gap-4"
          style={{ marginTop: "32px", paddingBottom: "24px", borderBottom: "1px solid #e5e5e5" }}
        >
          <div className="max-md:!flex-wrap" style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <div>
              <div
                className="text-[11px] uppercase tracking-[0.15em]"
                style={{ color: "#666666", marginBottom: "8px" }}
              >
                AI SCORE
              </div>
              <div
                className="font-mono font-bold max-md:!text-3xl"
                style={{ fontSize: "48px", lineHeight: 1, color: "#0a0a0a" }}
              >
                {t.aiScore.toFixed(1)}
              </div>
            </div>
            <div style={{ borderLeft: "1px solid #e5e5e5", paddingLeft: "32px" }}>
              <StatusBadge status={t.status} />
            </div>
          </div>
          <div className="font-mono text-[14px]" style={{ color: "#0a0a0a" }}>
            {truncateAddress(t.address)}
          </div>
        </div>

        {/* Two-column layout: Stats and Agent Log */}
        <div
          className="grid max-md:!grid-cols-1"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginTop: "32px",
          }}
        >
          {/* LEFT: Stats Panel */}
          <div
            style={{ border: "1px solid #e5e5e5", backgroundColor: "#f8f8f8" }}
          >
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #e5e5e5",
              }}
            >
              <SectionLabel>PERFORMANCE STATS</SectionLabel>
            </div>
            {stats.map(([label, value], i) => (
              <div
                key={label}
                style={{
                  padding: "16px 24px",
                  borderBottom:
                    i < stats.length - 1 ? "1px solid #e5e5e5" : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  className="text-[11px] uppercase tracking-[0.15em]"
                  style={{ color: "#666666" }}
                >
                  {label}
                </div>
                <div
                  className="font-mono text-[14px]"
                  style={{ color: "#0a0a0a" }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Agent Reasoning Log */}
          <div
            style={{ border: "1px solid #e5e5e5", backgroundColor: "#f8f8f8" }}
          >
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #e5e5e5",
              }}
            >
              <SectionLabel>AGENT REASONING LOG</SectionLabel>
            </div>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {t.history.map((entry, i) => {
                const timeMatch = entry.timestamp.match(/(\d{2}:\d{2}:\d{2})/);
                const timeOnly = timeMatch ? timeMatch[1] : entry.timestamp;
                return (
                  <div
                    key={i}
                    style={{
                      padding: "12px 24px",
                      borderBottom:
                        i < t.history.length - 1 ? "1px solid #e5e5e5" : "none",
                    }}
                  >
                    <div
                      className="font-mono text-[11px]"
                      style={{
                        color: "#666666",
                        marginBottom: "4px",
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <span>{timeOnly}</span>
                      <TagChip tag={entry.type} />
                    </div>
                    <div
                      className="font-mono text-[12px]"
                      style={{ color: "#0a0a0a", opacity: 0.85 }}
                    >
                      {entry.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bond Button */}
        <button
          onClick={() => setIsBondModalOpen(true)}
          style={{
            width: "100%",
            marginTop: "32px",
            padding: "16px 24px",
            backgroundColor: "#ffffff",
            border: "1px solid #0a0a0a",
            color: "#0a0a0a",
            fontSize: "13px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            cursor: "pointer",
          }}
        >
          BOND THIS TRADER
        </button>

        <BondModal
          trader={t}
          isOpen={isBondModalOpen}
          onClose={() => setIsBondModalOpen(false)}
        />

        {/* Stakers Table */}
        {/* Mobile cards */}
        <div className="md:hidden" style={{ marginTop: "32px" }}>
          <div
            style={{
              padding: "16px 0",
            }}
          >
            <SectionLabel>STAKERS</SectionLabel>
          </div>
          {stakers.map((s, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #e5e5e5",
                backgroundColor: "#fff",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <div
                className="font-mono"
                style={{
                  color: "#0a0a0a",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                {s.staker}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    className="text-[11px] uppercase tracking-[0.15em]"
                    style={{ color: "#666666", marginBottom: "2px" }}
                  >
                    AMOUNT
                  </div>
                  <div
                    className="font-mono"
                    style={{ color: "#0a0a0a", fontSize: "15px" }}
                  >
                    {s.amount}
                  </div>
                </div>
                <div>
                  <div
                    className="text-[11px] uppercase tracking-[0.15em]"
                    style={{ color: "#666666", marginBottom: "2px" }}
                  >
                    JOINED
                  </div>
                  <div
                    className="font-mono"
                    style={{ color: "#0a0a0a", fontSize: "14px" }}
                  >
                    {s.joined}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="hidden md:block"
          style={{
            marginTop: "32px",
            border: "1px solid #e5e5e5",
            backgroundColor: "#f8f8f8",
          }}
        >
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid #e5e5e5",
            }}
          >
            <SectionLabel>STAKERS</SectionLabel>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 150px 150px",
              padding: "0 24px",
              minHeight: "48px",
              alignItems: "center",
              borderBottom: "1px solid #e5e5e5",
            }}
          >
            <div
              className="text-[11px] uppercase tracking-[0.15em]"
              style={{ color: "#666666" }}
            >
              STAKER
            </div>
            <div
              className="text-[11px] uppercase tracking-[0.15em]"
              style={{ color: "#666666" }}
            >
              AMOUNT
            </div>
            <div
              className="text-[11px] uppercase tracking-[0.15em]"
              style={{ color: "#666666" }}
            >
              JOINED
            </div>
          </div>
          {stakers.map((s, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 150px 150px",
                padding: "0 24px",
                minHeight: "48px",
                alignItems: "center",
                borderBottom:
                  i < stakers.length - 1 ? "1px solid #e5e5e5" : "none",
              }}
            >
              <div
                className="font-mono text-[13px]"
                style={{ color: "#0a0a0a" }}
              >
                {s.staker}
              </div>
              <div
                className="font-mono text-[13px]"
                style={{ color: "#0a0a0a" }}
              >
                {s.amount}
              </div>
              <div
                className="font-mono text-[13px]"
                style={{ color: "#0a0a0a" }}
              >
                {s.joined}
              </div>
            </div>
          ))}
        </div>
      </div>
    </VigilLayout>
  );
}
