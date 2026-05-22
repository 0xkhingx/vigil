import { Link, type LinkProps } from "@tanstack/react-router";
import { type ReactNode, type ComponentType, useState } from "react";
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Slash,
  Github,
  Menu,
  X,
  type LucideProps,
} from "lucide-react";
import { ConnectKitButton } from "connectkit";

const navItems: { to: LinkProps["to"]; label: string }[] = [
  { to: "/", label: "OVERVIEW" },
  { to: "/leaderboard", label: "LEADERBOARD" },
  { to: "/portfolio", label: "PORTFOLIO" },
  { to: "/agent-log", label: "AGENT LOG" },
];



function WalletButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        if (!isConnected) {
          return (
            <button
              onClick={show}
              className="vigil-clickable text-[11px] uppercase tracking-[0.15em] max-md:!text-[10px] max-md:!px-3 max-md:!py-2"
              style={{
                color: "#fff",
                backgroundColor: "#0a0a0a",
                border: "1px solid #333",
                padding: "10px 20px",
              }}
            >
              CONNECT WALLET
            </button>
          );
        }
        return (
          <button
            onClick={show}
            className="vigil-clickable font-mono text-[13px] uppercase tracking-[0.1em] flex items-center gap-3 max-md:!text-[11px] max-md:!px-3 max-md:!py-2"
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
            {ensName ?? truncatedAddress}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}

function TopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e5e5e5" }}
    >
      <div
        className="flex items-center justify-between max-md:!px-4"
        style={{ padding: "0 40px", height: "64px" }}
      >
        <Link
          to="/"
          className="vigil-clickable font-mono font-bold text-[13px] tracking-[0.2em] uppercase trader-bonds-heading"
          style={{ color: "#0a0a0a", fontWeight: 700 }}
          onClick={() => setMobileMenuOpen(false)}
        >
          VIGIL
        </Link>
        <nav className="flex items-center gap-10 max-md:hidden">
          {navItems.map((item) => {
            const navClass =
              item.to === "/"
                ? "nav-overview"
                : item.to === "/leaderboard"
                ? "nav-leaderboard"
                : item.to === "/portfolio"
                ? "nav-portfolio"
                : item.to === "/agent-log"
                ? "nav-agent-log"
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
        <div className="max-md:hidden">
          <WalletButton />
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center"
          aria-label="Toggle menu"
          style={{
            background: "none",
            border: "1px solid #333",
            color: "#0a0a0a",
            cursor: "pointer",
            padding: "8px 10px",
          }}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            borderTop: "1px solid #e5e5e5",
            backgroundColor: "#ffffff",
            padding: "12px 16px",
          }}
        >
          <div className="flex flex-col" style={{ gap: "4px" }}>
            {navItems.map((item) => {
              const navClass =
                item.to === "/"
                  ? "nav-overview"
                  : item.to === "/leaderboard"
                  ? "nav-leaderboard"
                  : item.to === "/portfolio"
                  ? "nav-portfolio"
                  : item.to === "/agent-log"
                  ? "nav-agent-log"
                  : "";
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`vigil-clickable text-[11px] uppercase tracking-[0.15em] nav-link ${navClass} block py-3`}
                  activeProps={{ style: { color: "#0a0a0a" } }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3" style={{ borderTop: "1px solid #e5e5e5" }}>
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}



function Footer() {
  return (
    <footer
      className="relative z-10 max-md:!px-4"
      style={{
        backgroundColor: "#f8f8f8",
        borderTop: "1px solid #e5e5e5",
        padding: "24px 40px",
      }}
    >
      <div className="flex items-center justify-between max-md:!flex-col max-md:!items-start max-md:!gap-2">
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
        className="relative z-10 max-md:!pt-16"
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
