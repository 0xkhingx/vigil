import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { getDefaultConfig } from "connectkit";

// Arc testnet chain definition
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_RPC_URL || "https://rpc.testnet.arc-node.thecanteenapp.com/v1/swrm_90b09dab4724525c8b266b90c5e08d3e886f4a310a1cda387f641b9ce38137eb"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: "https://explorer.arc.network",
    },
  },
  testnet: true,
});

export const config = createConfig(
  getDefaultConfig({
    chains: [arcTestnet],
    transports: {
      [arcTestnet.id]: http(),
    },
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "vigil-hackathon",
    appName: "Vigil",
    appDescription: "AI-custodied trader bonds. Stake. Watch. Slash.",
    appUrl: "https://vigil.app",
  })
);