import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { toast } from "sonner";
import { ACCENT, StatusBadge } from "@/components/vigil/VigilLayout";
import type { Trader } from "@/lib/vigil-data";

interface BondModalProps {
  trader: Trader;
  isOpen: boolean;
  onClose: () => void;
}

const durations = [7, 14, 30, 90] as const;

const slashThresholds = [
  { label: "CONSERVATIVE", score: 50, tint: ACCENT.green },
  { label: "STANDARD", score: 65, tint: ACCENT.yellow },
  { label: "AGGRESSIVE", score: 75, tint: ACCENT.blue },
] as const;

const durationTints = {
  7: ACCENT.blue,
  14: ACCENT.yellow,
  30: ACCENT.green,
  90: ACCENT.blue,
} as const;

const numberFont =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

const formatUsdc = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export function BondModal({ trader, isOpen, onClose }: BondModalProps) {
  const [amount, setAmount] = useState("1000");
  const [duration, setDuration] = useState<(typeof durations)[number]>(30);
  const [threshold, setThreshold] = useState<(typeof slashThresholds)[number]>(
    slashThresholds[1],
  );
  const [slashDetailsOpen, setSlashDetailsOpen] = useState(false);

  const amountValue = Number.parseFloat(amount) || 0;
  const protocolFee = amountValue * 0.02;
  const estimatedReturn = amountValue * 0.08 * (duration / 365);
  const isValidAmount = Number.isFinite(amountValue) && amountValue > 0;

  const summaryRows = [
    ["Bond Amount", `${formatUsdc(amountValue)} USDC`],
    ["Duration", `${duration}D`],
    ["Slash Threshold", `${threshold.label} / SCORE < ${threshold.score}`],
    ["Est. Return", `${formatUsdc(estimatedReturn)} USDC`],
    ["Protocol Fee (2%)", `${formatUsdc(protocolFee)} USDC`],
  ];

  const handleConfirmBond = () => {
    if (!isValidAmount) {
      toast.error("INVALID BOND AMOUNT", {
        description: "Enter a USDC amount greater than zero.",
      });
      return;
    }

    toast.success("BOND CONFIRMED", {
      description: `${formatUsdc(amountValue)} USDC bonded to ${trader.handle} for ${duration}D.`,
    });
    onClose();
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.82)" }}
        />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(640px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden"
          style={{
            backgroundColor: "#050505",
            border: "1px solid #2a2a2a",
            color: "#ffffff",
            maxHeight: "min(760px, calc(100vh - 24px))",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            className="bond-modal-scroll"
            style={{
              maxHeight: "inherit",
              overflowY: "auto",
              padding: "20px",
            }}
          >
            <div
              className="flex items-start justify-between gap-4"
              style={{ borderBottom: "1px solid #242424", paddingBottom: "16px" }}
            >
              <DialogPrimitive.Title
                className="text-[15px] font-bold uppercase tracking-[0.16em]"
                style={{ color: "#ffffff" }}
              >
                BOND {trader.handle}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <button
                  aria-label="Close bond modal"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center"
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #333333",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} strokeWidth={1.75} aria-hidden />
                </button>
              </DialogPrimitive.Close>
            </div>

            <div
              className="grid gap-0"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                border: "1px solid #242424",
                marginTop: "16px",
              }}
            >
              <ContextItem label="AI SCORE" value={trader.aiScore.toFixed(1)} />
              <ContextItem label="STATUS" value={<StatusBadge status={trader.status} />} bordered />
              <ContextItem label="CURRENT BOND" value={`$${trader.bondSize.toLocaleString()}`} />
            </div>

            <div style={{ marginTop: "20px" }}>
              <label
                htmlFor="bond-amount"
                className="block text-[11px] uppercase tracking-[0.15em]"
                style={{ color: "#a3a3a3", marginBottom: "10px" }}
              >
                BOND AMOUNT (USDC)
              </label>
              <input
                id="bond-amount"
                type="number"
                min="0"
                step="100"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="h-12 w-full px-4 text-[18px] font-bold outline-none"
                style={{
                  backgroundColor: "#0b0b0b",
                  border: "1px solid #333333",
                  color: "#ffffff",
                  fontFamily: numberFont,
                }}
              />
            </div>

            <ToggleGroup label="DURATION">
              {durations.map((option) => (
                <ToggleButton
                  key={option}
                  active={duration === option}
                  onClick={() => setDuration(option)}
                  tint={durationTints[option]}
                >
                  {option}D
                </ToggleButton>
              ))}
            </ToggleGroup>

            <ToggleGroup label="SLASH THRESHOLD">
              {slashThresholds.map((option) => (
                <ToggleButton
                  key={option.label}
                  active={threshold.label === option.label}
                  onClick={() => setThreshold(option)}
                  tint={option.tint}
                >
                  <span>{option.label}</span>
                  <span style={{ fontFamily: numberFont, opacity: 0.78 }}>
                    SCORE &lt; {option.score}
                  </span>
                </ToggleButton>
              ))}
            </ToggleGroup>

            <div
              style={{
                backgroundColor: "#111111",
                border: "1px solid #333333",
                marginTop: "20px",
              }}
            >
              {summaryRows.map(([label, value], index) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4"
                  style={{
                    borderBottom: index < summaryRows.length - 1 ? "1px solid #242424" : "none",
                    padding: "12px 14px",
                  }}
                >
                  <span
                    className="text-[11px] uppercase tracking-[0.15em]"
                    style={{ color: "#8b8b8b" }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-right text-[13px] uppercase"
                    style={{ color: "#ffffff", fontFamily: numberFont }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleConfirmBond}
              disabled={!isValidAmount}
              className="w-full text-[12px] font-bold uppercase tracking-[0.16em]"
              style={{
                backgroundColor: isValidAmount ? ACCENT.green : "#2f3a33",
                border: isValidAmount ? `1px solid ${ACCENT.green}` : "1px solid #2f3a33",
                color: isValidAmount ? "#0a0a0a" : "#8fa095",
                cursor: isValidAmount ? "pointer" : "not-allowed",
                opacity: isValidAmount ? 1 : 0.72,
                marginTop: "18px",
                padding: "15px 18px",
              }}
            >
              CONFIRM BOND
            </button>

            <div style={{ marginTop: "12px", borderTop: "1px solid #242424" }}>
              <button
                type="button"
                onClick={() => setSlashDetailsOpen((open) => !open)}
                className="flex w-full items-center justify-between gap-4 py-3 text-left text-[11px]"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#a3a3a3",
                  cursor: "pointer",
                }}
              >
                <span>What happens if slashed?</span>
                <ChevronDown
                  size={14}
                  strokeWidth={1.75}
                  aria-hidden
                  style={{
                    transform: slashDetailsOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 120ms ease",
                  }}
                />
              </button>
              {slashDetailsOpen && (
                <p className="pb-3 text-[12px] leading-5" style={{ color: "#d0d0d0" }}>
                  If the trader AI score crosses your selected threshold, the protocol may slash
                  bonded USDC according to the active bond terms and return the remaining balance.
                </p>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ContextItem({
  label,
  value,
  bordered = false,
}: {
  label: string;
  value: string | ReactElement;
  bordered?: boolean;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderInline: bordered ? "1px solid #242424" : "none",
      }}
    >
      <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: "#777777" }}>
        {label}
      </div>
      <div className="mt-2 text-[13px]" style={{ color: "#ffffff", fontFamily: numberFont }}>
        {value}
      </div>
    </div>
  );
}

function ToggleGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <div
        className="text-[11px] uppercase tracking-[0.15em]"
        style={{ color: "#a3a3a3", marginBottom: "10px" }}
      >
        {label}
      </div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(124px, 1fr))" }}
      >
        {children}
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
  tint,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  tint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 flex-col items-center justify-center gap-1 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em]"
      style={{
        backgroundColor: active ? tint : "#0b0b0b",
        border: active ? `1px solid ${tint}` : "1px solid #333333",
        color: active ? "#0a0a0a" : "#ffffff",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
