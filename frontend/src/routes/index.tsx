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

          {/* ENTRY POINT CARDS - OVERLAPPING */}
          <div
            className="vigil-reveal"
            style={{
              position: "relative",
              alignSelf: "start",
              height: "400px",
              animationDelay: "80ms",
            }}
          >
            {/* I WANT TO STAKE CARD - Behind */}
            <Link
              to="/leaderboard"
              className="vigil-entry-card"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "50%",
                height: "90%",
                backgroundColor: "#0f1a2e",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "18px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
                transform: "rotate(-5deg) translateX(18px) translateY(-6px)",
                zIndex: 1,
                boxShadow: "0 18px 40px rgba(0, 0, 0, 0.28)",
                transition:
                  "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), background-color 220ms ease, box-shadow 320ms ease, z-index 0ms linear 120ms",
                willChange: "transform, box-shadow",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.zIndex = "10";
                e.currentTarget.style.backgroundColor = "#132847";
                e.currentTarget.style.transform =
                  "rotate(-3deg) translateX(28px) translateY(-18px) scale(1.03)";
                e.currentTarget.style.boxShadow = "0 28px 56px rgba(0, 0, 0, 0.34)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.zIndex = "1";
                e.currentTarget.style.backgroundColor = "#0f1a2e";
                e.currentTarget.style.transform =
                  "rotate(-5deg) translateX(18px) translateY(-6px) scale(1)";
                e.currentTarget.style.boxShadow = "0 18px 40px rgba(0, 0, 0, 0.28)";
              }}
            >
              <div>
                <div
                  className="text-[11px] uppercase tracking-[0.15em]"
                  style={{ color: "#3b82f6", marginBottom: "12px" }}
                >
                  I WANT TO STAKE
                </div>
                <h3
                  className="font-bold tracking-tight"
                  style={{
                    fontSize: "24px",
                    lineHeight: 1.1,
                    color: "#ffffff",
                    marginBottom: "12px",
                    fontWeight: 800,
                  }}
                >
                  Back a trader.
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.5,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Browse ranked traders.
                </p>
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.15em]"
                style={{
                  color: "#3b82f6",
                  fontWeight: 600,
                }}
              >
                BROWSE TRADERS →
              </div>
            </Link>

            {/* I AM A TRADER CARD - Front */}
            <Link
              to="/register"
              className="vigil-entry-card"
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "50%",
                height: "90%",
                backgroundColor: "#1a1500",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: "18px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
                transform: "rotate(5deg) translateX(-18px) translateY(36px)",
                zIndex: 2,
                boxShadow: "0 18px 40px rgba(0, 0, 0, 0.28)",
                transition:
                  "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), background-color 220ms ease, box-shadow 320ms ease, z-index 0ms linear 120ms",
                willChange: "transform, box-shadow",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.zIndex = "10";
                e.currentTarget.style.backgroundColor = "#2a2200";
                e.currentTarget.style.transform =
                  "rotate(3deg) translateX(-28px) translateY(22px) scale(1.03)";
                e.currentTarget.style.boxShadow = "0 28px 56px rgba(0, 0, 0, 0.34)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.zIndex = "2";
                e.currentTarget.style.backgroundColor = "#1a1500";
                e.currentTarget.style.transform =
                  "rotate(5deg) translateX(-18px) translateY(36px) scale(1)";
                e.currentTarget.style.boxShadow = "0 18px 40px rgba(0, 0, 0, 0.28)";
              }}
            >
              <div>
                <div
                  className="text-[11px] uppercase tracking-[0.15em]"
                  style={{ color: "#f59e0b", marginBottom: "12px" }}
                >
                  I AM A TRADER
                </div>
                <h3
                  className="font-bold tracking-tight"
                  style={{
                    fontSize: "24px",
                    lineHeight: 1.1,
                    color: "#ffffff",
                    marginBottom: "12px",
                    fontWeight: 800,
                  }}
                >
                  Post a bond.
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.5,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Declare your mandate.
                </p>
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.15em]"
                style={{
                  color: "#f59e0b",
                  fontWeight: 600,
                }}
              >
                REGISTER AS TRADER →
              </div>
            </Link>
          </div>
        </div>

        <div
          className="grid"
          style={{
            marginTop: "48px",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div>
            <SectionLabel>[AGENT] LIVE LOG</SectionLabel>
            <div
              className="vigil-panel vigil-reveal"
              style={{
                marginTop: "16px",
                border: "1px solid #1f1f1f",
                backgroundColor: "#0a0a0a",
                animationDelay: "0ms",
              }}
            >
              <div
                className="flex items-center justify-between"
                style={{ padding: "16px 24px", borderBottom: "1px solid #1f1f1f" }}
              >
                <div
                  className="font-mono text-[11px] flex items-center gap-2"
                  style={{ color: "#888888" }}
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
                        i < feed.length - 1 ? "1px solid #1f1f1f" : "none",
                      color: "#888888",
                    }}
                  >
                    <span style={{ color: "#666666" }}>{f.ts}</span>
                    <TagChip tag={f.tag} />
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>
                      <span
                        style={{
                          color: "#ffffff",
                          textDecoration:
                            f.tag === "SLASH" ? "line-through" : "none",
                        }}
                      >
                        {f.trader}
                      </span>{" "}
                      � {f.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>TOP BONDED TRADERS</SectionLabel>
            <div
              className="vigil-panel vigil-reveal"
              style={{
                marginTop: "16px",
                border: "1px solid #1f1f1f",
                backgroundColor: "#0a0a0a",
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
                  borderBottom: "1px solid #1f1f1f",
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
                  className="vigil-trader-row vigil-table-row grid"
                  style={{
                    gridTemplateColumns: "60px 1.4fr 0.8fr 0.8fr 140px",
                    padding: "0 24px",
                    height: "48px",
                    alignItems: "center",
                    color: "#ffffff",
                    fontSize: "14px",
                    borderBottom: "1px solid #1f1f1f",
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
      {/* HOW IT WORKS */}
      <div
        style={{
          padding: "48px 40px",
          borderTop: "1px solid #e5e5e5",
          backgroundColor: "#fafafa",
        }}
      >
        <SectionLabel>HOW IT WORKS</SectionLabel>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "24px",
            marginTop: "24px",
          }}
        >
          {steps.map((s, idx) => {
            const colors = ["#eef6ff", "#fff8e7", "#edf9f2"];
            const bgColor = colors[idx % colors.length];
            return (
              <div
                key={s.n}
                className="vigil-step-card"
                style={{
                  backgroundColor: bgColor,
                  border: "1px solid #d8d8d8",
                  borderRadius: "18px",
                  minHeight: "220px",
                  padding: "28px 24px",
                  animationDelay: `${idx * 80}ms`,
                  boxShadow: "0 10px 28px rgba(0, 0, 0, 0.04)",
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
                    color: "rgba(10,10,10,0.72)",
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
      </div>
    </VigilLayout>
  );
}


