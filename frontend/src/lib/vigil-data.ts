export type TraderStatus = "HEALTHY" | "AT RISK" | "SLASHED";

export interface Trader {
  rank: number;
  handle: string;
  address: string;
  aiScore: number;
  pnl30d: number;
  bondSize: number;
  status: TraderStatus;
  mandate: {
    style: string;
    maxLeverage: string;
    maxDrawdown: string;
    venues: string;
    instruments: string;
  };
  history: {
    timestamp: string;
    type: "SCORE" | "WARN" | "POLICY" | "SLASH";
    detail: string;
  }[];
}

export const traders: Trader[] = [
  {
    rank: 1,
    handle: "0xkairos",
    address: "0x9a4f...c12e",
    aiScore: 94.2,
    pnl30d: 18.4,
    bondSize: 412_000,
    status: "HEALTHY",
    mandate: {
      style: "Delta-neutral basis trading",
      maxLeverage: "3.0x",
      maxDrawdown: "8.0%",
      venues: "Binance, Bybit, Hyperliquid",
      instruments: "Perps, spot",
    },
    history: [
      { timestamp: "2026-05-15 14:02:11 UTC", type: "SCORE", detail: "Risk score updated 93.8 → 94.2" },
      { timestamp: "2026-05-15 09:14:02 UTC", type: "POLICY", detail: "Leverage check passed at 2.4x" },
      { timestamp: "2026-05-14 22:48:56 UTC", type: "SCORE", detail: "Sharpe (30d) recalculated: 2.81" },
      { timestamp: "2026-05-14 11:03:22 UTC", type: "POLICY", detail: "Mandate compliance: full" },
      { timestamp: "2026-05-13 18:22:09 UTC", type: "WARN", detail: "Funding exposure approaching threshold" },
    ],
  },
  {
    rank: 2,
    handle: "merlin.eth",
    address: "0x71b2...8aa0",
    aiScore: 91.7,
    pnl30d: 14.1,
    bondSize: 318_500,
    status: "HEALTHY",
    mandate: {
      style: "Trend following, BTC/ETH majors",
      maxLeverage: "5.0x",
      maxDrawdown: "12.0%",
      venues: "Hyperliquid, dYdX",
      instruments: "Perps",
    },
    history: [
      { timestamp: "2026-05-15 13:51:47 UTC", type: "SCORE", detail: "Risk score updated 91.4 → 91.7" },
      { timestamp: "2026-05-15 06:30:19 UTC", type: "POLICY", detail: "Drawdown check passed at 4.2%" },
      { timestamp: "2026-05-14 19:11:02 UTC", type: "SCORE", detail: "Sortino (30d) recalculated: 3.04" },
    ],
  },
  {
    rank: 3,
    handle: "ploutos",
    address: "0xc0de...4411",
    aiScore: 88.5,
    pnl30d: 11.9,
    bondSize: 276_900,
    status: "AT RISK",
    mandate: {
      style: "Statistical arbitrage, alt-pairs",
      maxLeverage: "4.0x",
      maxDrawdown: "10.0%",
      venues: "Binance, OKX",
      instruments: "Spot, perps",
    },
    history: [
      { timestamp: "2026-05-15 14:18:33 UTC", type: "WARN", detail: "Drawdown 8.7% — within 1.3% of limit" },
      { timestamp: "2026-05-15 12:02:51 UTC", type: "POLICY", detail: "Leverage spike to 3.9x detected" },
      { timestamp: "2026-05-15 04:44:08 UTC", type: "SCORE", detail: "Risk score downgraded 90.1 → 88.5" },
      { timestamp: "2026-05-14 20:55:12 UTC", type: "WARN", detail: "Correlation breach across 4 alt-pairs" },
    ],
  },
  {
    rank: 4,
    handle: "vega.lens",
    address: "0x4f88...91dc",
    aiScore: 86.0,
    pnl30d: 9.3,
    bondSize: 204_000,
    status: "HEALTHY",
    mandate: {
      style: "Options vol selling",
      maxLeverage: "2.0x",
      maxDrawdown: "6.0%",
      venues: "Deribit, Aevo",
      instruments: "Options",
    },
    history: [
      { timestamp: "2026-05-15 13:40:00 UTC", type: "SCORE", detail: "Risk score updated 85.7 → 86.0" },
      { timestamp: "2026-05-14 21:17:44 UTC", type: "POLICY", detail: "Vega exposure within mandate" },
    ],
  },
  {
    rank: 5,
    handle: "icarus_x",
    address: "0xdead...beef",
    aiScore: 41.2,
    pnl30d: -22.6,
    bondSize: 0,
    status: "SLASHED",
    mandate: {
      style: "Discretionary momentum",
      maxLeverage: "5.0x",
      maxDrawdown: "12.0%",
      venues: "Hyperliquid",
      instruments: "Perps",
    },
    history: [
      { timestamp: "2026-05-15 02:11:09 UTC", type: "SLASH", detail: "Bond fully slashed: drawdown 14.8% > 12.0%" },
      { timestamp: "2026-05-15 02:10:51 UTC", type: "POLICY", detail: "Mandate breach: max drawdown exceeded" },
      { timestamp: "2026-05-15 01:58:22 UTC", type: "WARN", detail: "Drawdown 11.9% — within 0.1% of limit" },
      { timestamp: "2026-05-14 23:47:14 UTC", type: "WARN", detail: "Leverage pushed to 4.8x on single asset" },
    ],
  },
  {
    rank: 6,
    handle: "lyra.fi",
    address: "0x33aa...77fe",
    aiScore: 84.6,
    pnl30d: 7.8,
    bondSize: 188_400,
    status: "HEALTHY",
    mandate: {
      style: "Funding rate arbitrage",
      maxLeverage: "3.0x",
      maxDrawdown: "5.0%",
      venues: "Binance, Bybit",
      instruments: "Perps, spot",
    },
    history: [
      { timestamp: "2026-05-15 13:22:18 UTC", type: "SCORE", detail: "Risk score updated 84.2 → 84.6" },
      { timestamp: "2026-05-14 16:09:55 UTC", type: "POLICY", detail: "Funding capture: +0.42%" },
    ],
  },
  {
    rank: 7,
    handle: "noctis",
    address: "0xa8b1...02cc",
    aiScore: 79.4,
    pnl30d: 5.2,
    bondSize: 142_700,
    status: "AT RISK",
    mandate: {
      style: "Long/short alts, sector rotation",
      maxLeverage: "3.5x",
      maxDrawdown: "9.0%",
      venues: "Hyperliquid, dYdX",
      instruments: "Perps",
    },
    history: [
      { timestamp: "2026-05-15 12:55:41 UTC", type: "WARN", detail: "Single-name concentration > 35%" },
      { timestamp: "2026-05-15 08:11:23 UTC", type: "SCORE", detail: "Risk score downgraded 81.0 → 79.4" },
    ],
  },
  {
    rank: 8,
    handle: "0xhermes",
    address: "0x55cd...19ab",
    aiScore: 77.1,
    pnl30d: 4.6,
    bondSize: 124_300,
    status: "HEALTHY",
    mandate: {
      style: "Cross-exchange spot arbitrage",
      maxLeverage: "1.5x",
      maxDrawdown: "4.0%",
      venues: "Binance, OKX, Coinbase",
      instruments: "Spot",
    },
    history: [
      { timestamp: "2026-05-15 11:47:02 UTC", type: "SCORE", detail: "Risk score updated 76.9 → 77.1" },
    ],
  },
];

export const portfolioPositions = [
  { trader: "0xkairos", staked: 25_000, status: "HEALTHY" as TraderStatus, earned: 1_184.22, share: "0.18%" },
  { trader: "merlin.eth", staked: 15_000, status: "HEALTHY" as TraderStatus, earned: 612.40, share: "0.21%" },
  { trader: "ploutos", staked: 10_000, status: "AT RISK" as TraderStatus, earned: 318.07, share: "0.14%" },
  { trader: "vega.lens", staked: 8_000, status: "HEALTHY" as TraderStatus, earned: 192.55, share: "0.09%" },
];

export const portfolioActivity = [
  { timestamp: "2026-05-15 14:18:33 UTC", type: "WARN", detail: "ploutos drawdown 8.7% — within 1.3% of limit" },
  { timestamp: "2026-05-15 14:02:11 UTC", type: "SCORE", detail: "0xkairos risk score 93.8 → 94.2" },
  { timestamp: "2026-05-15 13:51:47 UTC", type: "SCORE", detail: "merlin.eth risk score 91.4 → 91.7" },
  { timestamp: "2026-05-15 13:40:00 UTC", type: "SCORE", detail: "vega.lens risk score 85.7 → 86.0" },
  { timestamp: "2026-05-15 12:02:51 UTC", type: "POLICY", detail: "ploutos leverage spike to 3.9x detected" },
  { timestamp: "2026-05-15 09:31:12 UTC", type: "EARN", detail: "+$48.22 distributed across 4 positions" },
  { timestamp: "2026-05-15 02:11:09 UTC", type: "SLASH", detail: "icarus_x bond slashed (no exposure)" },
];

export function getTrader(handle: string) {
  return traders.find((t) => t.handle === handle);
}
