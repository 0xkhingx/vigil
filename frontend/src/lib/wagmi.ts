import { createConfig, http, fallback, useChainId, useSwitchChain } from "wagmi";
import { defineChain, custom } from "viem";
import { getDefaultConfig } from "connectkit";

export const ARC_TESTNET_CHAIN_ID = 5_042_002;
export const ARC_TESTNET_RPC_URL =
  "https://rpc.testnet.arc-node.thecanteenapp.com/v1/swrm_90b09dab4724525c8b266b90c5e08d3e886f4a310a1cda387f641b9ce38137eb";
export const ARC_TESTNET_CHAIN_HEX = "0x4cef52";

export const arcTestnet = defineChain({
  id: ARC_TESTNET_CHAIN_ID,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_RPC_URL || ARC_TESTNET_RPC_URL],
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

const arcTransport =
  typeof window !== "undefined" && window.ethereum
    ? fallback([
        custom(window.ethereum as any),
        http(import.meta.env.VITE_RPC_URL),
      ])
    : http(import.meta.env.VITE_RPC_URL);

export const config = createConfig(
  getDefaultConfig({
    chains: [arcTestnet],
    transports: {
      [arcTestnet.id]: arcTransport,
    },
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "vigil-hackathon",
    appName: "Vigil",
    appDescription: "AI-custodied trader bonds. Stake. Watch. Slash.",
    appUrl: "https://vigil.app",
  })
);

export function useArcNetwork() {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  return {
    isArcTestnet: chainId === ARC_TESTNET_CHAIN_ID,
    switchToArc: () => switchChain({ chainId: ARC_TESTNET_CHAIN_ID }),
    isPending,
  };
}
