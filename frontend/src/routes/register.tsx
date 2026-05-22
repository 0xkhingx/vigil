import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import {
  VigilLayout,
  SectionLabel,
} from "@/components/vigil/VigilLayout";
import { usePostBond, useApproveUSDC, VIGIL_ADDRESS } from "@/lib/contracts";
import { useAccount } from "wagmi";
import { useArcNetwork } from "@/lib/wagmi";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Vigil" },
      {
        name: "description",
        content: "Register as a trader and post your bond on Vigil. Declare your mandate and attract followers.",
      },
      { property: "og:title", content: "Register — Vigil" },
    ],
  }),
  component: RegisterPage,
});

type ThresholdType = "CONSERVATIVE" | "STANDARD" | "AGGRESSIVE";

const ACCENT = {
  blue: "#9ecbff",
  green: "#b8e6c1",
  yellow: "#f3e3a3",
} as const;

const thresholds = [
  { label: "CONSERVATIVE", score: 50, color: ACCENT.blue },
  { label: "STANDARD", score: 65, color: ACCENT.green },
  { label: "AGGRESSIVE", score: 75, color: ACCENT.yellow },
] as const;

function RegisterPage() {
  const { address } = useAccount();
  const { isArcTestnet, switchToArc, isPending: isSwitching } = useArcNetwork();
  const { approve, data: approveHash, isPending: isApproving } = useApproveUSDC();
  const { postBond, data: bondHash, isPending: isBonding } = usePostBond();
  const [handle, setHandle] = useState("");
  const [mandateStyle, setMandateStyle] = useState("");
  const [maxLeverage, setMaxLeverage] = useState("");
  const [maxDrawdown, setMaxDrawdown] = useState("");
  const [venues, setVenues] = useState("");
  const [bondAmount, setBondAmount] = useState("");
  const [threshold, setThreshold] = useState<ThresholdType>("STANDARD");
  const [step, setStep] = useState<"approve" | "bond" | "done">("approve");

  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  const { isSuccess: bondSuccess } = useWaitForTransactionReceipt({
    hash: bondHash,
  });

  const bondValue = Number.parseFloat(bondAmount) || 0;
  const thresholdDetails = thresholds.find((t) => t.label === threshold) || thresholds[1];

  useEffect(() => {
    if (approveSuccess && step === "approve") {
      setStep("bond");
    }
  }, [approveSuccess, step]);

  useEffect(() => {
    if (bondSuccess) {
      setStep("done");
    }
  }, [bondSuccess]);

  const handleSubmit = () => {
    if (!address) return;
    if (!isArcTestnet) {
      switchToArc();
      return;
    }
    if (!bondAmount || bondValue <= 0) return;

    if (step === "approve") {
      approve(bondValue);
    } else if (step === "bond") {
      postBond(bondValue, thresholdDetails.score, 80);
    }
  };

  const buttonLabel = !address
    ? "CONNECT WALLET FIRST"
    : isSwitching
      ? "SWITCHING..."
      : !isArcTestnet
        ? "SWITCH TO ARC TESTNET"
        : step === "done"
          ? "BOND POSTED ✓"
          : isApproving
            ? "APPROVING..."
            : step === "approve"
              ? "APPROVE USDC"
              : isBonding
                ? "POSTING..."
                : "POST BOND";

  return (
    <VigilLayout>
      <div className="max-md:!px-4" style={{ padding: "48px 40px" }}>
        {/* Section Label */}
        <SectionLabel>[TRADER] REGISTRATION</SectionLabel>

        {/* Headline */}
        <h1
          className="font-bold tracking-tight trader-bonds-heading max-md:!text-4xl"
          style={{
            fontSize: "72px",
            lineHeight: 1.05,
            color: "#0a0a0a",
            marginTop: "24px",
            fontWeight: 800,
          }}
        >
          Post a bond.
        </h1>

        {/* Subtext */}
        <p
          className="max-w-2xl"
          style={{
            fontSize: "15px",
            lineHeight: 1.65,
            color: "rgba(10,10,10,0.7)",
            marginTop: "16px",
            marginBottom: "48px",
          }}
        >
          Declare your mandate. Post USDC. Attract followers. Get slashed if you break discipline.
        </p>

        {/* Form Layout - Two Columns */}
        <div
          className="grid max-md:!grid-cols-1"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
            marginBottom: "32px",
          }}
        >
          {/* Left Column - Form Fields */}
          <div>
            {/* Handle */}
            <div style={{ marginBottom: "24px" }}>
              <label
                className="text-[11px] uppercase tracking-[0.15em]"
                style={{
                  color: "#666666",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                HANDLE
              </label>
              <input
                type="text"
                placeholder="e.g. 0xkairos"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="font-mono text-[14px]"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#f8f8f8",
                  border: "1px solid #d0d0d0",
                  color: "#0a0a0a",
                  outline: "none",
                }}
              />
            </div>

            {/* Mandate Style */}
            <div style={{ marginBottom: "24px" }}>
              <label
                className="text-[11px] uppercase tracking-[0.15em]"
                style={{
                  color: "#666666",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                MANDATE STYLE
              </label>
              <input
                type="text"
                placeholder="e.g. Delta-neutral basis trading"
                value={mandateStyle}
                onChange={(e) => setMandateStyle(e.target.value)}
                className="font-mono text-[14px]"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#f8f8f8",
                  border: "1px solid #d0d0d0",
                  color: "#0a0a0a",
                  outline: "none",
                }}
              />
            </div>

            {/* Max Leverage */}
            <div style={{ marginBottom: "24px" }}>
              <label
                className="text-[11px] uppercase tracking-[0.15em]"
                style={{
                  color: "#666666",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                MAX LEVERAGE
              </label>
              <input
                type="text"
                placeholder="e.g. 3.0x"
                value={maxLeverage}
                onChange={(e) => setMaxLeverage(e.target.value)}
                className="font-mono text-[14px]"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#f8f8f8",
                  border: "1px solid #d0d0d0",
                  color: "#0a0a0a",
                  outline: "none",
                }}
              />
            </div>

            {/* Max Drawdown */}
            <div style={{ marginBottom: "24px" }}>
              <label
                className="text-[11px] uppercase tracking-[0.15em]"
                style={{
                  color: "#666666",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                MAX DRAWDOWN
              </label>
              <input
                type="text"
                placeholder="e.g. 8.0%"
                value={maxDrawdown}
                onChange={(e) => setMaxDrawdown(e.target.value)}
                className="font-mono text-[14px]"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#f8f8f8",
                  border: "1px solid #d0d0d0",
                  color: "#0a0a0a",
                  outline: "none",
                }}
              />
            </div>

            {/* Venues */}
            <div style={{ marginBottom: "24px" }}>
              <label
                className="text-[11px] uppercase tracking-[0.15em]"
                style={{
                  color: "#666666",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                VENUES
              </label>
              <input
                type="text"
                placeholder="e.g. Binance, Bybit, Hyperliquid"
                value={venues}
                onChange={(e) => setVenues(e.target.value)}
                className="font-mono text-[14px]"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#f8f8f8",
                  border: "1px solid #d0d0d0",
                  color: "#0a0a0a",
                  outline: "none",
                }}
              />
            </div>

            {/* Bond Amount */}
            <div style={{ marginBottom: "24px" }}>
              <label
                className="text-[11px] uppercase tracking-[0.15em]"
                style={{
                  color: "#666666",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                BOND AMOUNT (USDC)
              </label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={bondAmount}
                onChange={(e) => setBondAmount(e.target.value)}
                className="font-mono text-[14px]"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#f8f8f8",
                  border: "1px solid #d0d0d0",
                  color: "#0a0a0a",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Right Column - Threshold Selector & Summary */}
          <div>
            {/* Slash Threshold */}
            <div style={{ marginBottom: "32px" }}>
              <label
                className="text-[11px] uppercase tracking-[0.15em]"
                style={{
                  color: "#666666",
                  display: "block",
                  marginBottom: "12px",
                }}
              >
                SLASH THRESHOLD
              </label>
              <div
                className="max-md:!grid-cols-1"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "8px",
                }}
              >
                {thresholds.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => setThreshold(t.label as ThresholdType)}
                    className="text-[11px] uppercase tracking-[0.15em]"
                    style={{
                      padding: "12px 16px",
                      backgroundColor:
                        threshold === t.label ? t.color : "#f8f8f8",
                      border:
                        threshold === t.label
                          ? `1px solid ${t.color}`
                          : "1px solid #d0d0d0",
                      color:
                        threshold === t.label ? "#0a0a0a" : "#666666",
                      cursor: "pointer",
                      fontWeight: threshold === t.label ? 600 : 400,
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Box */}
            <div
              style={{
                border: "1px solid #e5e5e5",
                backgroundColor: "#f8f8f8",
                padding: "0",
              }}
            >
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid #e5e5e5",
                }}
              >
                <SectionLabel>MANDATE SUMMARY</SectionLabel>
              </div>

              {/* Summary Rows */}
              <div>
                {handle && (
                  <div
                    style={{
                      padding: "12px 24px",
                      borderBottom: "1px solid #e5e5e5",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      className="text-[11px] uppercase tracking-[0.15em]"
                      style={{ color: "#666666" }}
                    >
                      HANDLE
                    </span>
                    <span
                      className="font-mono text-[13px]"
                      style={{ color: "#0a0a0a" }}
                    >
                      {handle}
                    </span>
                  </div>
                )}

                {mandateStyle && (
                  <div
                    style={{
                      padding: "12px 24px",
                      borderBottom: "1px solid #e5e5e5",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      className="text-[11px] uppercase tracking-[0.15em]"
                      style={{ color: "#666666" }}
                    >
                      STYLE
                    </span>
                    <span
                      className="font-mono text-[13px]"
                      style={{ color: "#0a0a0a", textAlign: "right", maxWidth: "50%" }}
                    >
                      {mandateStyle}
                    </span>
                  </div>
                )}

                {maxLeverage && (
                  <div
                    style={{
                      padding: "12px 24px",
                      borderBottom: "1px solid #e5e5e5",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      className="text-[11px] uppercase tracking-[0.15em]"
                      style={{ color: "#666666" }}
                    >
                      MAX LEVERAGE
                    </span>
                    <span
                      className="font-mono text-[13px]"
                      style={{ color: "#0a0a0a" }}
                    >
                      {maxLeverage}
                    </span>
                  </div>
                )}

                {maxDrawdown && (
                  <div
                    style={{
                      padding: "12px 24px",
                      borderBottom: "1px solid #e5e5e5",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      className="text-[11px] uppercase tracking-[0.15em]"
                      style={{ color: "#666666" }}
                    >
                      MAX DRAWDOWN
                    </span>
                    <span
                      className="font-mono text-[13px]"
                      style={{ color: "#0a0a0a" }}
                    >
                      {maxDrawdown}
                    </span>
                  </div>
                )}

                {venues && (
                  <div
                    style={{
                      padding: "12px 24px",
                      borderBottom: "1px solid #e5e5e5",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      className="text-[11px] uppercase tracking-[0.15em]"
                      style={{ color: "#666666" }}
                    >
                      VENUES
                    </span>
                    <span
                      className="font-mono text-[13px]"
                      style={{ color: "#0a0a0a", textAlign: "right", maxWidth: "50%" }}
                    >
                      {venues}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    padding: "12px 24px",
                    borderBottom: "1px solid #e5e5e5",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    className="text-[11px] uppercase tracking-[0.15em]"
                    style={{ color: "#666666" }}
                  >
                    BOND AMOUNT
                  </span>
                  <span
                    className="font-mono text-[13px]"
                    style={{ color: "#0a0a0a" }}
                  >
                    ${bondValue.toLocaleString()}
                  </span>
                </div>

                <div
                  style={{
                    padding: "12px 24px",
                    backgroundColor: thresholdDetails.color,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    className="text-[11px] uppercase tracking-[0.15em]"
                    style={{ color: "#0a0a0a" }}
                  >
                    SLASH THRESHOLD
                  </span>
                  <span
                    className="font-mono text-[13px]"
                    style={{ color: "#0a0a0a", fontWeight: 600 }}
                  >
                    SCORE &lt; {thresholdDetails.score}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post Bond Button */}
        <button
          onClick={handleSubmit}
          disabled={!address || isSwitching || isApproving || isBonding || bondValue <= 0}
          style={{
            width: "100%",
            padding: "16px 24px",
            backgroundColor: "#ffffff",
            border: "1px solid #0a0a0a",
            color: "#0a0a0a",
            fontSize: "13px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            cursor:
              !address || isSwitching || isApproving || isBonding || bondValue <= 0
                ? "not-allowed"
                : "pointer",
            marginBottom: "16px",
          }}
        >
          {buttonLabel}
        </button>

        {step === "done" && (
          <div
            className="font-mono text-[11px]"
            style={{
              color: "#0a0a0a",
              lineHeight: 1.6,
              maxWidth: "800px",
              marginBottom: "16px",
            }}
          >
            Your bond is live. The agent is monitoring your position. Your trader ID will appear
            on the leaderboard shortly.
          </div>
        )}

        {/* Disclaimer */}
        <div
          className="font-mono text-[11px]"
          style={{
            color: "#666666",
            lineHeight: 1.6,
            maxWidth: "800px",
          }}
        >
          Your bond will be slashed automatically if your AI score drops below your selected
          threshold. No discretion. No grace period.
        </div>
      </div>
    </VigilLayout>
  );
}
