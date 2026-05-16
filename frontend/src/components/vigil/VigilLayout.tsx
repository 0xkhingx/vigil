import { Link, type LinkProps } from "@tanstack/react-router";
import { useState, type ReactNode, type ComponentType } from "react";
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Slash,
  Github,
  type LucideProps,
} from "lucide-react";
import { useWallet, shortAddress } from "@/lib/wallet";

const navItems: { to: LinkProps["to"]; label: string }[] = [
  { to: "/", label: "OVERVIEW" },
  { to: "/leaderboard", label: "LEADERBOARD" },
  { to: "/portfolio", label: "PORTFOLIO" },
];



function WalletButton() {
  const { address, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);

  if (!address) {
    return (
      <button
        onClick={connect}
        className="vigil-clickable text-[11px] uppercase tracking-[0.15em]"
        style={{
          color: "#fff",
          backgroundColor: "#0a0a0a",
          border: "1px solid #0a0a0a",
          padding: "10px 20px",
        }}
      >
        CONNECT WALLET
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="vigil-clickable font-mono text-[13px] uppercase tracking-[0.1em] flex items-center gap-3"
        style={{
          color: "#0a0a0a",
          border: "1px solid #d0d0d0",
          backgroundColor: "#f8f8f8",
          padding: "10px 20px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            backgroundColor: "#0a0a0a",
            display: "inline-block",
          }}
        />
        {shortAddress(address)}
      </button>
      {open && (
        <div
          className="absolute right-0"
          style={{
            top: "calc(100% + 8px)",
            backgroundColor: "#ffffff",
            border: "1px solid #d0d0d0",
            minWidth: "240px",
            zIndex: 60,
          }}
        >
          <div
            className="font-mono text-[11px]"
            style={{
              color: "#666666",
              padding: "12px 16px",
              borderBottom: "1px solid #e5e5e5",
              wordBreak: "break-all",
            }}
          >
            {address}
          </div>
          <Link
            to="/portfolio"
            onClick={() => setOpen(false)}
            className="vigil-clickable block text-[11px] uppercase tracking-[0.15em]"
            style={{
              color: "#0a0a0a",
              padding: "12px 16px",
              borderBottom: "1px solid #e5e5e5",
              textDecoration: "none",
            }}
          >
            VIEW PORTFOLIO →
          </Link>
            <button
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="block w-full text-left text-[11px] uppercase tracking-[0.15em] vigil-clickable-danger"
              style={{
                color: "#666666",
                padding: "12px 16px",
                backgroundColor: "transparent",
              }}
            >
              DISCONNECT
            </button>
        </div>
      )}
    </div>
  );
}

function TopNav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e5e5e5" }}
    >
      <div
        className="flex items-center justify-between"
        style={{ padding: "0 40px", height: "64px" }}
      >
        <Link
          to="/"
          className="vigil-clickable font-mono font-bold text-[13px] tracking-[0.2em] uppercase trader-bonds-heading"
          style={{ color: "#0a0a0a", fontWeight: 700 }}
        >
          VIGIL
        </Link>
        <nav className="flex items-center gap-10">
          {navItems.map((item) => {
            const navClass =
              item.to === "/"
                ? "nav-overview"
                : item.to === "/leaderboard"
                ? "nav-leaderboard"
                : item.to === "/portfolio"
                ? "nav-portfolio"
                : "";
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`vigil-clickable text-[11px] uppercase tracking-[0.15em] nav-link ${navClass}`}
                activeProps={{ style: { color: "#0a0a0a" } }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <WalletButton />
      </div>
    </header>
  );
}



function Footer() {
  return (
    <footer
      className="relative z-10"
      style={{
        backgroundColor: "#f8f8f8",
        borderTop: "1px solid #e5e5e5",
        padding: "24px 40px",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-mono text-[13px] uppercase tracking-[0.2em]"
          style={{ color: "#0a0a0a" }}
        >
          VIGIL
        </span>
        <span
          className="text-[11px] uppercase tracking-[0.15em]"
          style={{ color: "#666666" }}
        >
          Built on Arc · Settled in USDC
        </span>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] transition-opacity hover:opacity-70"
          style={{ color: "#666666" }}
        >
          <Github size={14} strokeWidth={1.5} />
          GITHUB
        </a>
      </div>
    </footer>
  );
}

export function VigilLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: "#ffffff", color: "#0a0a0a" }}
    >
      <TopNav />
      <main
        className="relative z-10"
        style={{ paddingTop: "100px", minHeight: "calc(100vh - 80px)" }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}

export type StatusType = "HEALTHY" | "AT RISK" | "SLASHED";

export const ACCENT = {
  blue: "#9ecbff",
  green: "#b8e6c1",
  yellow: "#f3e3a3",
} as const;

export function tagColor(tag: string): string {
  switch (tag) {
    case "SCORE":
      return ACCENT.blue;
    case "POLICY":
    case "EARN":
      return ACCENT.green;
    case "WARN":
      return ACCENT.yellow;
    default:
      return "#0a0a0a";
  }
}

const tagIcons: Record<string, ComponentType<LucideProps>> = {
  SCORE: Activity,
  POLICY: ShieldCheck,
  EARN: TrendingUp,
  WARN: AlertTriangle,
  SLASH: Slash,
};

export function TagChip({ tag }: { tag: string }) {
  const Icon = tagIcons[tag];
  const color = tagColor(tag);
  return (
    <span
      className="font-mono inline-flex items-center gap-1.5 uppercase tracking-[0.15em]"
      style={{ color, fontSize: "11px" }}
    >
      {Icon && <Icon size={12} strokeWidth={1.75} aria-hidden />}
      [{tag}]
    </span>
  );
}

const statusIcons: Record<StatusType, ComponentType<LucideProps>> = {
  HEALTHY: ShieldCheck,
  "AT RISK": AlertTriangle,
  SLASHED: Slash,
};

export function StatusBadge({ status }: { status: StatusType }) {
  const dim = status === "AT RISK";
  const Icon = statusIcons[status];
  const iconColor =
    status === "HEALTHY"
      ? "#208042"
      : status === "AT RISK"
        ? "#cc8800"
        : "#0a0a0a";
  return (
    <span
      className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em]"
      style={{
        color: "#0a0a0a",
        backgroundColor: "#e5e5e5",
        border: "1px solid #d0d0d0",
        padding: "4px 10px",
        opacity: dim ? 0.85 : 1,
      }}
    >
      <Icon size={12} strokeWidth={1.75} color={iconColor} aria-hidden />
      {status}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="text-[11px] uppercase tracking-[0.15em]"
      style={{ color: "#666666" }}
    >
      {children}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "#f8f8f8",
        border: "1px solid #e5e5e5",
        padding: "24px",
      }}
    >
      {children}
    </div>
  );
}
