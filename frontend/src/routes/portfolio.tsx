import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  VigilLayout,
  StatusBadge,
  SectionLabel,
  Card,
  TagChip,
} from "@/components/vigil/VigilLayout";
import {
  portfolioPositions,
  portfolioActivity,
  getTrader,
} from "@/lib/vigil-data";
import { useWallet, shortAddress } from "@/lib/wallet";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Vigil" },
      {
        name: "description",
        content:
          "Your bonded USDC positions, current risk status, earned amounts, and live agent activity.",
      },
      { property: "og:title", content: "Portfolio — Vigil" },
    ],
  }),
  component: PortfolioPage,
});

type ExitState = {
  trader: string;
  staked: number;
  earned: number;
  step: "details" | "confirm" | "submitting" | "done";
};

function PortfolioPage() {
  const { address, connect } = useWallet();
  const [exitState, setExitState] = useState<ExitState | null>(null);
  const [exited, setExited] = useState<Set<string>>(new Set());

  const positions = useMemo(
    () => portfolioPositions.filter((p) => !exited.has(p.trader)),
    [exited],
  );

  if (!address) {
    return (
      <VigilLayout>
        <div className="max-md:!px-4" style={{ padding: "48px 40px" }}>
          <SectionLabel>[ACCOUNT] PORTFOLIO</SectionLabel>
          <h1
            className="font-bold tracking-tight max-md:!text-4xl"
            style={{
              fontSize: "64px",
              lineHeight: 1.05,
              color: "#0a0a0a",
              marginTop: "16px",
              fontWeight: 800,
            }}
          >
            Connect to view bonds.
          </h1>
          <p
            className="max-w-xl"
            style={{
              fontSize: "15px",
              lineHeight: 1.6,
              color: "rgba(10,10,10,0.7)",
              marginTop: "16px",
            }}
          >
            Your portfolio shows every active bond, its risk status, and live
            agent activity. Connect a wallet to load it.
          </p>
          <button
            onClick={connect}
            className="vigil-clickable text-[11px] uppercase tracking-[0.15em]"
            style={{
              color: "#fff",
              backgroundColor: "#0a0a0a",
              border: "1px solid #0a0a0a",
              padding: "14px 24px",
              marginTop: "32px",
            }}
          >
            CONNECT WALLET
          </button>
        </div>
      </VigilLayout>
    );
  }

  const totalStaked = positions.reduce((s, p) => s + p.staked, 0);
  const totalEarned = positions.reduce((s, p) => s + p.earned, 0);
  const atRisk = positions.filter((p) => p.status !== "HEALTHY").length;

  const stats = [
    ["TOTAL BONDED", `$${totalStaked.toLocaleString()}`],
    ["EARNED (30D)", `+$${totalEarned.toFixed(2)}`],
    ["POSITIONS", String(positions.length)],
    ["AT RISK / SLASHED", String(atRisk)],
  ];

  return (
    <VigilLayout>
      <div className="max-md:!px-4" style={{ padding: "48px 40px" }}>
        <SectionLabel>[ACCOUNT] PORTFOLIO · {shortAddress(address)}</SectionLabel>
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
          Your bonds.
        </h1>
        <p
          className="max-w-2xl"
          style={{
            fontSize: "15px",
            lineHeight: 1.6,
            color: "rgba(10,10,10,0.7)",
          }}
        >
          Every position is monitored by the Vigil agent in real time. Earnings
          accrue while traders stay within mandate. Slashes are automatic.
        </p>

        <div
          className="grid max-md:!grid-cols-2"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            marginTop: "48px",
            border: "1px solid #e5e5e5",
            backgroundColor: "#f8f8f8",
          }}
        >
          {stats.map(([label, value], i) => (
            <div
              key={label}
              style={{
                padding: "24px",
                borderRight: i < stats.length - 1 ? "1px solid #e5e5e5" : "none",
              }}
            >
              <div
                className="text-[11px] uppercase tracking-[0.15em]"
                style={{ color: "#666666" }}
              >
                {label}
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: "32px",
                  color: "#0a0a0a",
                  marginTop: "12px",
                  fontWeight: 600,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        <div
          className="grid max-md:!grid-cols-1"
          style={{
            gridTemplateColumns: "1.4fr 1fr",
            gap: "24px",
            marginTop: "24px",
          }}
        >
          {/* POSITIONS */}
          <div
            className="max-md:!overflow-x-auto"
            style={{ border: "1px solid #e5e5e5", backgroundColor: "#f8f8f8" }}
          >
            <div
              style={{ padding: "16px 24px", borderBottom: "1px solid #e5e5e5" }}
            >
              <SectionLabel>POSITIONS</SectionLabel>
            </div>
            <div
              className="grid font-mono text-[11px] uppercase tracking-[0.15em]"
              style={{
                gridTemplateColumns: "1.1fr 0.9fr 0.9fr 130px 180px",
                padding: "0 24px",
                height: "48px",
                alignItems: "center",
                color: "#666666",
                borderBottom: "1px solid #e5e5e5",
              }}
            >
              <div>TRADER</div>
              <div>STAKED</div>
              <div>EARNED</div>
              <div>STATUS</div>
              <div>ACTIONS</div>
            </div>
            {positions.length === 0 ? (
              <div
                style={{
                  padding: "48px 24px",
                  color: "#666666",
                  fontSize: "14px",
                }}
              >
                No active bonds.
              </div>
            ) : (
              positions.map((p) => (
                <div
                  key={p.trader}
                  className="grid"
                  style={{
                    gridTemplateColumns: "1.1fr 0.9fr 0.9fr 130px 180px",
                    padding: "0 24px",
                    height: "48px",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "#0a0a0a",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  <div
                    style={{
                      textDecoration:
                        p.status === "SLASHED" ? "line-through" : "none",
                    }}
                  >
                    {p.trader}
                  </div>
                  <div className="font-mono">${p.staked.toLocaleString()}</div>
                  <div className="font-mono">+${p.earned.toFixed(2)}</div>
                  <div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/traders/$handle"
                      params={{ handle: p.trader }}
                      className="vigil-clickable text-[11px] uppercase tracking-[0.15em]"
                      style={{
                        color: "#0a0a0a",
                        border: "1px solid #d0d0d0",
                        padding: "6px 10px",
                        textDecoration: "none",
                      }}
                    >
                      DETAILS
                    </Link>
                    <button
                      onClick={() =>
                        setExitState({
                          trader: p.trader,
                          staked: p.staked,
                          earned: p.earned,
                          step: "details",
                        })
                      }
                      className="vigil-clickable vigil-clickable-orange text-[11px] uppercase tracking-[0.15em]"
                      style={{
                        color: "#9a3412",
                        backgroundColor: "#fff3e8",
                        border: "1px solid #f0b58e",
                        padding: "6px 10px",
                      }}
                    >
                      EXIT
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* AGENT ACTIVITY */}
          <div
            style={{ border: "1px solid #e5e5e5", backgroundColor: "#f8f8f8" }}
          >
            <div
              style={{ padding: "16px 24px", borderBottom: "1px solid #e5e5e5" }}
            >
              <SectionLabel>AGENT ACTIVITY</SectionLabel>
            </div>
            <div>
              {portfolioActivity.map((a, i) => (
                <div
                  key={i}
                  className="font-mono text-[13px]"
                  style={{
                    padding: "16px 24px",
                    borderBottom:
                      i < portfolioActivity.length - 1
                        ? "1px solid #e5e5e5"
                        : "none",
                    color: "#0a0a0a",
                  }}
                >
                  <div
                    className="flex items-center gap-3"
                    style={{ color: "#666666", fontSize: "11px" }}
                  >
                    <span>{a.timestamp}</span>
                    <span style={{ color: "#d0d0d0" }}>·</span>
                    <TagChip tag={a.type} />
                  </div>
                  <div style={{ marginTop: "6px" }}>{a.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "24px" }}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <SectionLabel>NEW BOND</SectionLabel>
                <div
                  style={{
                    fontSize: "15px",
                    color: "rgba(240,240,240,0.8)",
                    marginTop: "8px",
                  }}
                >
                  Stake USDC alongside a ranked trader.
                </div>
              </div>
              <Link
                to="/leaderboard"
                className="vigil-clickable vigil-clickable-green text-[11px] uppercase tracking-[0.15em]"
                style={{
                  color: "#166534",
                  backgroundColor: "#ecfdf3",
                  border: "1px solid #b7e4c7",
                  padding: "12px 24px",
                  textDecoration: "none",
                }}
              >
                BROWSE LEADERBOARD →
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {exitState && (
        <ExitModal
          state={exitState}
          onClose={() => setExitState(null)}
          onConfirm={() => {
            setExitState({ ...exitState, step: "submitting" });
            setTimeout(() => {
              setExited((prev) => new Set(prev).add(exitState.trader));
              setExitState({ ...exitState, step: "done" });
            }, 900);
          }}
          onAdvance={() => setExitState({ ...exitState, step: "confirm" })}
        />
      )}
    </VigilLayout>
  );
}

function ExitModal({
  state,
  onClose,
  onConfirm,
  onAdvance,
}: {
  state: ExitState;
  onClose: () => void;
  onConfirm: () => void;
  onAdvance: () => void;
}) {
  const trader = getTrader(state.trader);
  const exitFee = state.staked * 0.005;
  const payout = state.staked + state.earned - exitFee;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center max-md:!p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", padding: "40px" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e5e5",
          width: "100%",
          maxWidth: "560px",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ padding: "20px 24px", borderBottom: "1px solid #e5e5e5" }}
        >
          <SectionLabel>
            {state.step === "details" && "BOND DETAILS"}
            {state.step === "confirm" && "CONFIRM EXIT"}
            {state.step === "submitting" && "SUBMITTING"}
            {state.step === "done" && "EXIT COMPLETE"}
          </SectionLabel>
          <button
            onClick={onClose}
            className="vigil-clickable text-[11px] uppercase tracking-[0.15em]"
            style={{ color: "#666666", backgroundColor: "transparent" }}
          >
            CLOSE ✕
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          <div
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "#0a0a0a",
              letterSpacing: "-0.01em",
            }}
          >
            {state.trader}
          </div>
          {trader && (
            <div
              className="font-mono text-[13px]"
              style={{ color: "#666666", marginTop: "8px" }}
            >
              {trader.address} · AI SCORE {trader.aiScore.toFixed(1)} · RANK #
              {String(trader.rank).padStart(2, "0")}
            </div>
          )}

          <div
            style={{
              marginTop: "24px",
              border: "1px solid #e5e5e5",
            }}
          >
            {[
              ["STAKED", `$${state.staked.toLocaleString()}`],
              ["EARNED (30D)", `+$${state.earned.toFixed(2)}`],
              ["EXIT FEE (0.5%)", `−$${exitFee.toFixed(2)}`],
              ["NET PAYOUT", `$${payout.toFixed(2)}`],
            ].map(([k, v], i, arr) => (
              <div
                key={k}
                className="grid"
                style={{
                  gridTemplateColumns: "1fr auto",
                  padding: "0 16px",
                  height: "44px",
                  alignItems: "center",
                  borderBottom:
                    i < arr.length - 1 ? "1px solid #e5e5e5" : "none",
                }}
              >
                <div
                  className="text-[11px] uppercase tracking-[0.15em]"
                  style={{ color: "#666666" }}
                >
                  {k}
                </div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: "14px",
                    color: k === "NET PAYOUT" ? "#0a0a0a" : "rgba(10,10,10,0.7)",
                    fontWeight: k === "NET PAYOUT" ? 600 : 400,
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>

          {state.step === "details" && (
            <p
              style={{
                fontSize: "13px",
                color: "rgba(10,10,10,0.7)",
                marginTop: "20px",
                lineHeight: 1.6,
              }}
            >
              Exiting closes your bond with this trader. Pending agent checks
              settle before payout. This action is irreversible.
            </p>
          )}
          {state.step === "confirm" && (
            <p
              style={{
                fontSize: "13px",
                color: "#0a0a0a",
                marginTop: "20px",
                lineHeight: 1.6,
              }}
            >
              Confirm exit of bond with {state.trader}. Net payout will settle
              in USDC to {`(your wallet)`}.
            </p>
          )}
          {state.step === "submitting" && (
            <p
              className="font-mono"
              style={{
                fontSize: "13px",
                color: "#666666",
                marginTop: "20px",
              }}
            >
              [AGENT] settling final policy check…
            </p>
          )}
          {state.step === "done" && (
            <p
              className="font-mono"
              style={{
                fontSize: "13px",
                color: "#0a0a0a",
                marginTop: "20px",
              }}
            >
              [AGENT] exit confirmed. ${payout.toFixed(2)} USDC released.
            </p>
          )}
        </div>

        <div
          className="flex items-center justify-end gap-2"
          style={{ padding: "16px 24px", borderTop: "1px solid #e5e5e5" }}
        >
          {state.step === "details" && (
            <>
              <button
                onClick={onClose}
                className="vigil-clickable text-[11px] uppercase tracking-[0.15em]"
                style={{
                  color: "#0a0a0a",
                  border: "1px solid #d0d0d0",
                  padding: "10px 18px",
                  backgroundColor: "transparent",
                }}
              >
                CANCEL
              </button>
              <button
                onClick={onAdvance}
                className="vigil-clickable vigil-clickable-orange text-[11px] uppercase tracking-[0.15em]"
                style={{
                  color: "#9a3412",
                  backgroundColor: "#fff3e8",
                  border: "1px solid #f0b58e",
                  padding: "10px 18px",
                }}
              >
                INITIATE EXIT →
              </button>
            </>
          )}
          {state.step === "confirm" && (
            <>
              <button
                onClick={() => onClose()}
                className="vigil-clickable text-[11px] uppercase tracking-[0.15em]"
                style={{
                  color: "#0a0a0a",
                  border: "1px solid #d0d0d0",
                  padding: "10px 18px",
                  backgroundColor: "transparent",
                }}
              >
                CANCEL
              </button>
              <button
                onClick={onConfirm}
                className="vigil-clickable vigil-clickable-orange text-[11px] uppercase tracking-[0.15em]"
                style={{
                  color: "#9a3412",
                  backgroundColor: "#fff3e8",
                  border: "1px solid #f0b58e",
                  padding: "10px 18px",
                }}
              >
                CONFIRM EXIT
              </button>
            </>
          )}
          {state.step === "submitting" && (
            <span
              className="font-mono text-[11px]"
              style={{ color: "#666666" }}
            >
              PROCESSING…
            </span>
          )}
          {state.step === "done" && (
            <button
              onClick={onClose}
              className="vigil-clickable vigil-clickable-green text-[11px] uppercase tracking-[0.15em]"
              style={{
                color: "#166534",
                backgroundColor: "#ecfdf3",
                border: "1px solid #b7e4c7",
                padding: "10px 18px",
              }}
            >
              DONE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
