import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

interface WalletState {
  address: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

const STORAGE_KEY = "vigil:wallet";

function generateAddress() {
  const hex = "0123456789abcdef";
  let out = "0x";
  for (let i = 0; i < 40; i++) out += hex[Math.floor(Math.random() * 16)];
  return out;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setAddress(stored);
    } catch {
      // ignore
    }
  }, []);

  const connect = () => {
    const addr = generateAddress();
    setAddress(addr);
    try {
      localStorage.setItem(STORAGE_KEY, addr);
    } catch {
      // ignore
    }
    toast.success("WALLET CONNECTED", {
      description: `${addr.slice(0, 6)}...${addr.slice(-4)} · session signed`,
    });
  };

  const disconnect = () => {
    setAddress(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    toast("WALLET DISCONNECTED");
  };

  return (
    <WalletContext.Provider value={{ address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}

export function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
