import { createFileRoute, Link } from "@tanstack/react-router";
import {
  VigilLayout,
  StatusBadge,
  SectionLabel,
  TagChip,
} from "@/components/vigil/VigilLayout";
import { useWallet } from "@/lib/wallet";
import { traders } from "@/lib/vigil-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vigil — Stake. Watch. Slash." },
      {
        name: "description",
        content:
          "VIGIL lets you stake USDC alongside ranked crypto traders. A continuous-policy AI custodian scores every position and slashes bonds the moment risk discipline breaks.",
      },
      { property: "og:title", content: "Vigil — Stake. Watch. Slash." },
      {
        property: "og:description",
        content:
          "Trader bonds, policed in real time by an AI custodian. No discretion. No grace period.",
      },
    ],
  }),
  component: LandingPage,
});

const feed = [
  { ts: "14:18:33", tag: "WARN", trader: "ploutos", detail: "drawdown 8.7% — within 1.3% of limit" },
  { ts: "14:02:11", tag: "SCORE", trader: "0xkairos", detail: "risk score 93.8 → 94.2" },
  { ts: "13:51:47", tag: "SCORE", trader: "merlin.eth", detail: "risk score 91.4 → 91.7" },
  { ts: "13:40:00", tag: "SCORE", trader: "vega.lens", detail: "risk score 85.7 → 86.0" },
  { ts: "13:22:18", tag: "POLICY", trader: "lyra.fi", detail: "funding capture +0.42% logged" },
  { ts: "12:55:41", tag: "WARN", trader: "noctis", detail: "single-name concentration > 35%" },
  { ts: "12:02:51", tag: "POLICY", trader: "ploutos", detail: "leverage spike to 3.9x detected" },
  { ts: "08:11:23", tag: "SCORE", trader: "noctis", detail: "risk score downgraded 81.0 → 79.4" },
  { ts: "02:11:09", tag: "SLASH", trader: "icarus_x", detail: "bond fully slashed: drawdown 14.8%" },
  { ts: "02:10:51", tag: "POLICY", trader: "icarus_x", detail: "mandate breach: max drawdown" },
];

const stats = [
  ["TVL BONDED", "$48.2M"],
  ["ACTIVE TRADERS", "1,284"],
  ["SLASHES (30D)", "37"],
  ["MEAN SHARPE", "2.41"],
];

const steps = [
  { n: "01", h: "BROWSE", body: "Find ranked traders scored by the Vigil AI agent. Every score reflects risk-adjusted performance against a stated mandate." },
  { n: "02", h: "BOND", body: "Stake USDC alongside a trader you believe in. Your bond pools with theirs and earns when the mandate holds." },
  { n: "03", h: "EARN OR EXIT", body: "Earn proportional yield while they perform. Get compensated automatically when discipline breaks. No discretion." },
];

function LandingPage() {
  const { address, connect } = useWallet();
  const top = traders.slice(0, 5);

  return (
    <VigilLayout>
      {/* HERO */}
      <div style={{ padding: "48px 40px 0 40px" }}>
        <div
          className="grid"
          style={{ gridTemplateColumns: "1.3fr 1fr", gap: "48px" }}
        >
          <div className="vigil-reveal">
            <SectionLabel>[SYSTEM] STAKE. WATCH. SLASH.</SectionLabel>
            <h1
              className="font-bold tracking-tight trader-bonds-heading"
              style={{
                fontSize: "72px",
                lineHeight: 1.02,
                color: "#0a0a0a",
                marginTop: "24px",
                fontWeight: 800,
              }}
            >
              Trader bonds,<br />policed in real time<br />by an AI custodian.
            </h1>
            <p
              className="max-w-xl"
              style={{
                fontSize: "15px",
                lineHeight: 1.65,
                color: "rgba(10,10,10,0.7)",
                marginTop: "32px",
              }}
            >
              VIGIL lets you stake USDC alongside ranked crypto traders. A
              continuous-policy AI agent scores every position, enforces the
              trader's stated mandate, and automatically slashes the bond the
              moment risk discipline breaks. No discretion. No grace period.
            </p>
            <div className="flex items-center gap-3" style={{ marginTop: "40px" }}>
              {address ? (
                <Link
                  to="/portfolio"
                  className="vigil-action vigil-clickable-green text-[11px] uppercase tracking-[0.15em]"
                  style={{
                    color: "#fff",
                    backgroundColor: "#208042",
                    border: "1px solid #208042",
                    padding: "14px 24px",
                    textDecoration: "none",
                  }}
                >
                  OPEN PORTFOLIO →
                </Link>
              ) : (
                <button
                  onClick={connect}
                  className="vigil-action vigil-clickable-dark text-[11px] uppercase tracking-[0.15em]"
                  style={{
                    color: "#fff",
                    backgroundColor: "#0a0a0a",
                    border: "1px solid #0a0a0a",
                    padding: "14px 24px",
                  }}
                >
                  CONNECT WALLET
                </button>
              )}
              <Link
                to="/leaderboard"
                className="vigil-action text-[11px] uppercase tracking-[0.15em]"
                style={{
                  color: "#0a0a0a",
                  border: "1px solid #0a0a0a",
                  backgroundColor: "transparent",
                  padding: "14px 24px",
                  textDecoration: "none",
                }}
              >
                BROWSE LEADERBOARD →
              </Link>
            </div>
          </div>

          {/* AGENT FEED */}
          <div
            className="vigil-panel vigil-reveal"
            style={{
              border: "1px solid #e5e5e5",
              backgroundColor: "#f8f8f8",
              alignSelf: "start",
              animationDelay: "80ms",
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{ padding: "16px 24px", borderBottom: "1px solid #e5e5e5" }}
            >
              <SectionLabel>AGENT — LIVE LOG</SectionLabel>
              <div
                className="font-mono text-[11px] flex items-center gap-2"
                style={{ color: "#0a0a0a" }}
              >
                <span
                  className="vigil-status-dot"
                  style={{
                    width: "6px",
                    height: "6px",
                    backgroundColor: "#208042",
                    display: "inline-block",
                  }}
                />
                ONLINE
              </div>
            </div>
            <div style={{ maxHeight: "420px", overflow: "hidden" }}>
              {feed.map((f, i) => (
                <div
                  key={i}
                  className="vigil-log-row font-mono text-[13px] grid"
                  style={{
                    gridTemplateColumns: "70px 70px 1fr",
                    gap: "12px",
                    padding: "10px 24px",
                    borderBottom:
                      i < feed.length - 1 ? "1px solid #e5e5e5" : "none",
                    color: "#0a0a0a",
                  }}
                >
                  <span style={{ color: "#666666" }}>{f.ts}</span>
                  <TagChip tag={f.tag} />
                  <span style={{ color: "rgba(10,10,10,0.7)" }}>
                    <span
                      style={{
                        color: "#0a0a0a",
                        textDecoration:
                          f.tag === "SLASH" ? "line-through" : "none",
                      }}
                    >
                      {f.trader}
                    </span>{" "}
                    · {f.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOP BONDED LIST */}
        <div style={{ marginTop: "48px" }}>
          <SectionLabel>TOP BONDED TRADERS</SectionLabel>
          <div
            className="vigil-panel vigil-reveal"
            style={{
              marginTop: "16px",
              border: "1px solid #e5e5e5",
              backgroundColor: "#f8f8f8",
              animationDelay: "130ms",
            }}
          >
            <div
              className="grid font-mono text-[11px] uppercase tracking-[0.15em]"
              style={{
                gridTemplateColumns: "60px 1.4fr 0.8fr 0.8fr 140px",
                padding: "0 24px",
                height: "48px",
                alignItems: "center",
                color: "#666666",
                borderBottom: "1px solid #e5e5e5",
              }}
            >
              <div>RANK</div>
              <div>HANDLE</div>
              <div>AI SCORE</div>
              <div>PNL (30D)</div>
              <div>STATUS</div>
            </div>
            {top.map((t) => (
              <Link
                key={t.handle}
                to="/traders/$handle"
                params={{ handle: t.handle }}
                className="vigil-table-row grid"
                style={{
                  gridTemplateColumns: "60px 1.4fr 0.8fr 0.8fr 140px",
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
                    textDecoration:
                      t.status === "SLASHED" ? "line-through" : "none",
                    opacity: t.status === "SLASHED" ? 0.6 : 1,
                  }}
                >
                  {t.handle}
                </div>
                <div className="font-mono">{t.aiScore.toFixed(1)}</div>
                <div className="font-mono">
                  {t.pnl30d >= 0 ? "+" : ""}
                  {t.pnl30d.toFixed(1)}%
                </div>
                <div>
                  <StatusBadge status={t.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          marginTop: "48px",
          borderTop: "1px solid #e5e5e5",
          borderBottom: "1px solid #e5e5e5",
          backgroundColor: "#f8f8f8",
        }}
      >
        {stats.map(([label, value], i) => (
          <div
            key={label}
            className="vigil-stat-cell"
            style={{
              padding: "32px 40px",
              borderRight:
                i < stats.length - 1 ? "1px solid #e5e5e5" : "none",
            }}
          >
            <div
              className="font-mono"
              style={{
                fontSize: "40px",
                color: "#0a0a0a",
                fontWeight: 600,
              }}
            >
              {value}
            </div>
            <div
              className="text-[11px] uppercase tracking-[0.15em]"
              style={{ color: "#666666", marginTop: "8px" }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <div style={{ padding: "48px 40px" }}>
        <SectionLabel>HOW IT WORKS</SectionLabel>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            marginTop: "24px",
            backgroundColor: "#d0d0d0",
            border: "1px solid #d0d0d0",
          }}
        >
          {steps.map((s, idx) => {
            const colors = ["#eef6ff", "#edf9f2", "#fff8e7"];
            const bgColor = colors[idx % colors.length];
            return (
              <div
                key={s.n}
                className="vigil-step-card"
                style={{
                  backgroundColor: bgColor,
                  padding: "32px 24px",
                  animationDelay: `${idx * 80}ms`,
                }}
              >
                <div
                  className="font-mono text-[11px] tracking-[0.15em]"
                  style={{ color: "#666666" }}
                >
                  {s.n}
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#0a0a0a",
                    marginTop: "12px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {s.h}
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: "rgba(10,10,10,0.7)",
                    marginTop: "16px",
                  }}
                >
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </VigilLayout>
  );
}
