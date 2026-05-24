import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import {
  VigilLayout,
  SectionLabel,
} from "@/components/vigil/VigilLayout";
import { usePostBond, useApproveUSDC } from "@/lib/contracts";
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

interface FormErrors {
  handle?: string;
  mandateStyle?: string;
  maxLeverage?: string;
  maxDrawdown?: string;
  venues?: string;
  bondAmount?: string;
}

function RegisterPage() {
  const { address, isConnected } = useAccount();
  const { isArcTestnet, switchToArc, isPending: isSwitching } = useArcNetwork();
  const { approve, data: approveHash, isPending: isApproving, error: approveError } = useApproveUSDC();
  const { postBond, data: bondHash, isPending: isBonding, error: bondError } = usePostBond();
  const [handle, setHandle] = useState("");
  const [mandateStyle, setMandateStyle] = useState("");
  const [maxLeverage, setMaxLeverage] = useState("");
  const [maxDrawdown, setMaxDrawdown] = useState("");
  const [venues, setVenues] = useState("");
  const [bondAmount, setBondAmount] = useState("");
  const [threshold, setThreshold] = useState<ThresholdType>("STANDARD");
  const [step, setStep] = useState<"approve" | "bond" | "done">("approve");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  const { isSuccess: bondSuccess } = useWaitForTransactionReceipt({
    hash: bondHash,
  });

  const bondValue = Number.parseFloat(bondAmount) || 0;
  const thresholdDetails = thresholds.find((t) => t.label === threshold) || thresholds[1];

  const allFieldsFilled = Boolean(
    handle.trim() &&
    mandateStyle.trim() &&
    maxLeverage.trim() &&
    maxDrawdown.trim() &&
    venues.trim() &&
    bondAmount.trim() &&
    bondValue > 0,
  );

  function validateField(name: string, value: string): string | undefined {
    if (!value.trim()) {
      return `${name.replace(/([A-Z])/g, ' $1').toUpperCase().trim()} IS REQUIRED`;
    }
    return undefined;
  }

  function validateAll(): FormErrors {
    const e: FormErrors = {};
    if (!handle.trim()) e.handle = "HANDLE IS REQUIRED";
    if (!mandateStyle.trim()) e.mandateStyle = "MANDATE STYLE IS REQUIRED";
    if (!maxLeverage.trim()) e.maxLeverage = "MAX LEVERAGE IS REQUIRED";
    if (!maxDrawdown.trim()) e.maxDrawdown = "MAX DRAWDOWN IS REQUIRED";
    if (!venues.trim()) e.venues = "VENUES IS REQUIRED";
    if (!bondAmount.trim() || bondValue <= 0) e.bondAmount = "BOND AMOUNT MUST BE > 0";
    return e;
  }

  function markTouched(name: string) {
    setTouched((prev) => new Set(prev).add(name));
  }

  function handleBlur(name: string, value: string) {
    markTouched(name);
    const err = validateField(name, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[name as keyof FormErrors] = err;
      else delete next[name as keyof FormErrors];
      return next;
    });
  }

  // Reset step when wallet disconnects mid-flow
  useEffect(() => {
    if (!isConnected) {
      setStep("approve");
      setErrors({});
      setTouched(new Set());
    }
  }, [isConnected]);

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

  useEffect(() => {
    if (!approveError) return;
    const message = approveError instanceof Error ? approveError.message.toLowerCase() : "";
    if (message.includes("rejected")) {
      toast.error("APPROVAL REJECTED", {
        description: "The wallet request was rejected.",
      });
    } else {
      toast.error("APPROVAL FAILED", {
        description: approveError instanceof Error ? approveError.message : "Could not approve USDC.",
      });
    }
  }, [approveError]);

  useEffect(() => {
    if (!bondError) return;
    const message = bondError instanceof Error ? bondError.message.toLowerCase() : "";
    if (message.includes("rejected")) {
      toast.error("BOND REJECTED", {
        description: "The wallet request was rejected.",
      });
    } else {
      toast.error("BOND FAILED", {
        description: bondError instanceof Error ? bondError.message : "Could not post bond.",
      });
    }
  }, [bondError]);

  const handleSubmit = () => {
    if (!address) {
      toast.error("WALLET NOT CONNECTED", {
        description: "Connect your wallet to post a bond.",
      });
      return;
    }

    const validationErrors = validateAll();
    setErrors(validationErrors);
    const allTouched = new Set(["handle", "mandateStyle", "maxLeverage", "maxDrawdown", "venues", "bondAmount"]);
    setTouched(allTouched);

    if (Object.keys(validationErrors).length > 0) return;

    if (!isArcTestnet) {
      switchToArc();
      return;
    }

    if (step === "approve") {
      approve(bondValue);
    } else if (step === "bond") {
      postBond(bondValue, thresholdDetails.score, 80);
    }
  };

  const isSubmitDisabled = !address || isSwitching || isApproving || isBonding || !allFieldsFilled;

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

  function renderField(
    name: string,
    label: string,
    value: string,
    setter: (v: string) => void,
    placeholder: string,
  ) {
    const err = touched.has(name) ? errors[name as keyof FormErrors] : undefined;
    return (
      <div className="max-md:!mb-3" style={{ marginBottom: "24px" }}>
        <label
          className="text-[11px] uppercase tracking-[0.15em]"
          style={{
            color: "#666666",
            display: "block",
            marginBottom: "8px",
          }}
        >
          {label}
        </label>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setter(e.target.value)}
          onBlur={() => handleBlur(name, value)}
          className="font-mono text-[14px]"
          style={{
            width: "100%",
            padding: "10px 12px",
            backgroundColor: "#f8f8f8",
            border: err ? "1px solid #dc2626" : "1px solid #d0d0d0",
            color: "#0a0a0a",
            outline: "none",
          }}
        />
        {err && (
          <div
            className="font-mono text-[11px]"
            style={{ color: "#dc2626", marginTop: "6px" }}
          >
            {err}
          </div>
        )}
      </div>
    );
  }

  return (
    <VigilLayout>
      <div className="max-md:!px-4 max-md:!py-6" style={{ padding: "48px 40px" }}>
        {/* Section Label */}
        <SectionLabel>[TRADER] REGISTRATION</SectionLabel>

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
          Post a bond.
        </h1>

        {/* Subtext */}
        <p
          className="max-w-2xl max-md:!mb-6"
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
          className="grid max-md:!grid-cols-1 max-md:!gap-4"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
            marginBottom: "32px",
          }}
        >
          {/* Left Column - Form Fields */}
          <div>
            {renderField("handle", "HANDLE", handle, setHandle, "e.g. 0xkairos")}
            {renderField("mandateStyle", "MANDATE STYLE", mandateStyle, setMandateStyle, "e.g. Delta-neutral basis trading")}
            {renderField("maxLeverage", "MAX LEVERAGE", maxLeverage, setMaxLeverage, "e.g. 3.0x")}
            {renderField("maxDrawdown", "MAX DRAWDOWN", maxDrawdown, setMaxDrawdown, "e.g. 8.0%")}
            {renderField("venues", "VENUES", venues, setVenues, "e.g. Binance, Bybit, Hyperliquid")}

            {/* Bond Amount */}
            <div className="max-md:!mb-3" style={{ marginBottom: "24px" }}>
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
                onBlur={() => handleBlur("bondAmount", bondAmount)}
                className="font-mono text-[14px]"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#f8f8f8",
                  border: touched.has("bondAmount") && errors.bondAmount ? "1px solid #dc2626" : "1px solid #d0d0d0",
                  color: "#0a0a0a",
                  outline: "none",
                }}
              />
              {touched.has("bondAmount") && errors.bondAmount && (
                <div
                  className="font-mono text-[11px]"
                  style={{ color: "#dc2626", marginTop: "6px" }}
                >
                  {errors.bondAmount}
                </div>
              )}
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
                className="max-md:!grid-cols-3 max-md:!gap-1"
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
          disabled={isSubmitDisabled}
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
            cursor: isSubmitDisabled ? "not-allowed" : "pointer",
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
