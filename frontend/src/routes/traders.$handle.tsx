import { createFileRoute, Link, notFound } from "@tanstack/react-router";
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
      <div style={{ padding: "48px 40px" }}>
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

  const mandateRows: [string, string][] = [
    ["STYLE", t.mandate.style],
    ["MAX LEVERAGE", t.mandate.maxLeverage],
    ["MAX DRAWDOWN", t.mandate.maxDrawdown],
    ["VENUES", t.mandate.venues],
    ["INSTRUMENTS", t.mandate.instruments],
  ];

  const bondRows: [string, string][] = [
    ["RANK", `#${String(t.rank).padStart(2, "0")}`],
    ["AI SCORE", t.aiScore.toFixed(1)],
    ["PNL (30D)", `${t.pnl30d >= 0 ? "+" : ""}${t.pnl30d.toFixed(1)}%`],
    ["BOND SIZE", t.status === "SLASHED" ? "$0 (slashed)" : `$${t.bondSize.toLocaleString()}`],
    ["ADDRESS", t.address],
  ];

  return (
    <VigilLayout>
      <div style={{ padding: "48px 40px" }}>
        <Link
          to="/leaderboard"
          className="text-[11px] uppercase tracking-[0.15em]"
          style={{ color: "#666666", textDecoration: "none" }}
        >
          ← LEADERBOARD
        </Link>

        <div
          className="flex items-start justify-between"
          style={{ marginTop: "24px" }}
        >
          <div>
            <SectionLabel>[TRADER] #{String(t.rank).padStart(2, "0")}</SectionLabel>
            <h1
              className="font-bold tracking-tight"
              style={{
                fontSize: "64px",
                lineHeight: 1.05,
                color: "#0a0a0a",
                marginTop: "16px",
                fontWeight: 800,
                textDecoration: t.status === "SLASHED" ? "line-through" : "none",
                opacity: t.status === "SLASHED" ? 0.7 : 1,
              }}
            >
              {t.handle}
            </h1>
            <div
              className="font-mono text-[13px]"
              style={{ color: "#666666", marginTop: "12px" }}
            >
              {t.address}
            </div>
          </div>
          <div style={{ marginTop: "8px" }}>
            <StatusBadge status={t.status} />
          </div>
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginTop: "48px",
          }}
        >
          <div
            style={{ border: "1px solid #e5e5e5", backgroundColor: "#f8f8f8" }}
          >
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #e5e5e5",
              }}
            >
              <SectionLabel>MANDATE</SectionLabel>
            </div>
            {mandateRows.map(([k, v], i) => (
              <div
                key={k}
                className="grid"
                style={{
                  gridTemplateColumns: "180px 1fr",
                  padding: "0 24px",
                  height: "48px",
                  alignItems: "center",
                  borderBottom:
                    i < mandateRows.length - 1 ? "1px solid #e5e5e5" : "none",
                }}
              >
                <div
                  className="text-[11px] uppercase tracking-[0.15em]"
                  style={{ color: "#666666" }}
                >
                  {k}
                </div>
                <div
                  className="font-mono text-[14px]"
                  style={{ color: "#0a0a0a" }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{ border: "1px solid #e5e5e5", backgroundColor: "#f8f8f8" }}
          >
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #e5e5e5",
              }}
            >
              <SectionLabel>BOND STATUS</SectionLabel>
            </div>
            {bondRows.map(([k, v], i) => (
              <div
                key={k}
                className="grid"
                style={{
                  gridTemplateColumns: "180px 1fr",
                  padding: "0 24px",
                  height: "48px",
                  alignItems: "center",
                  borderBottom:
                    i < bondRows.length - 1 ? "1px solid #e5e5e5" : "none",
                }}
              >
                <div
                  className="text-[11px] uppercase tracking-[0.15em]"
                  style={{ color: "#666666" }}
                >
                  {k}
                </div>
                <div
                  className="font-mono text-[14px]"
                  style={{ color: "#0a0a0a" }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: "24px",
            border: "1px solid #e5e5e5",
            backgroundColor: "#f8f8f8",
          }}
        >
          <div
            style={{ padding: "16px 24px", borderBottom: "1px solid #e5e5e5" }}
          >
            <SectionLabel>HISTORY — SCORES, POLICY EVENTS, SLASHES</SectionLabel>
          </div>
          <div
            className="grid font-mono text-[11px] uppercase tracking-[0.15em]"
            style={{
              gridTemplateColumns: "260px 100px 1fr",
              padding: "0 24px",
              height: "48px",
              alignItems: "center",
              color: "#666666",
              borderBottom: "1px solid #e5e5e5",
            }}
          >
            <div>TIMESTAMP (UTC)</div>
            <div>TYPE</div>
            <div>DETAIL</div>
          </div>
          {t.history.map((h, i) => (
            <div
              key={i}
              className="grid"
              style={{
                gridTemplateColumns: "260px 100px 1fr",
                padding: "0 24px",
                minHeight: "48px",
                alignItems: "center",
                borderBottom:
                  i < t.history.length - 1 ? "1px solid #e5e5e5" : "none",
              }}
            >
              <div
                className="font-mono text-[13px]"
                style={{ color: "#666666" }}
              >
                {h.timestamp}
              </div>
              <div>
                <TagChip tag={h.type} />
              </div>
              <div
                className="font-mono text-[13px]"
                style={{
                  color: "#0a0a0a",
                  opacity: h.type === "SCORE" ? 0.8 : 1,
                }}
              >
                {h.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </VigilLayout>
  );
}
