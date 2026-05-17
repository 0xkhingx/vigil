import { useAccount, useDisconnect, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  const connectWallet = () => {
    connect({ connector: injected() });
  };

  return {
    address: isConnected ? address : null,
    connect: connectWallet,
    disconnect,
  };
}

export function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}