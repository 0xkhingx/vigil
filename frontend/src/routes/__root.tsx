import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { WagmiProvider, useAccount, useChainId } from "wagmi";
import { ConnectKitProvider } from "connectkit";
import { toast } from "sonner";
import {
  ARC_TESTNET_CHAIN_HEX,
  ARC_TESTNET_CHAIN_ID,
  ARC_TESTNET_RPC_URL,
  config,
} from "@/lib/wagmi";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vigil — AI-Custodied Trader Bonds" },
      { name: "description", content: "Stake. Watch. Slash. AI-custodied trader bonds on Arc." },
      { property: "og:title", content: "Vigil" },
      { property: "og:description", content: "AI-custodied trader bonds. Stake. Watch. Slash." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="midnight"
          customTheme={{
            "--ck-font-family": "Inter, monospace",
            "--ck-border-radius": "0px",
            "--ck-accent-color": "#ffffff",
            "--ck-accent-text-color": "#000000",
          }}
        >
          <ArcNetworkGate />
          <div key={pathname} className="vigil-page-enter">
            <Outlet />
          </div>
          <Toaster theme="light" position="bottom-right" />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function ArcNetworkGate() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const prevConnectedRef = useRef(false);
  const prevChainIdRef = useRef<number | undefined>(undefined);
  const wasOnArcRef = useRef(false);
  const isRequestInFlightRef = useRef(false);
  const lastPromptedChainRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const provider = typeof window !== "undefined" ? ((window as Window & {
      ethereum?: EthereumProvider;
    }).ethereum) : undefined;

    if (!isConnected || !address) {
      prevConnectedRef.current = false;
      prevChainIdRef.current = chainId;
      wasOnArcRef.current = false;
      isRequestInFlightRef.current = false;
      lastPromptedChainRef.current = undefined;
      return;
    }

    const autoSwitchStorageKey = `vigil:arc-autoswitched:${address.toLowerCase()}`;
    const hasAutoSwitchedBefore = window.localStorage.getItem(autoSwitchStorageKey) === "true";
    const isFirstConnectedFrame = !prevConnectedRef.current;
    const isOnArc = chainId === ARC_TESTNET_CHAIN_ID;
    const manuallySwitchedAway =
      prevConnectedRef.current &&
      prevChainIdRef.current === ARC_TESTNET_CHAIN_ID &&
      chainId !== ARC_TESTNET_CHAIN_ID &&
      wasOnArcRef.current;
    const shouldPromptOnFirstConnect =
      isFirstConnectedFrame && !isOnArc && !hasAutoSwitchedBefore;
    const shouldPrompt = shouldPromptOnFirstConnect || manuallySwitchedAway;

    if (isOnArc) {
      wasOnArcRef.current = true;
      lastPromptedChainRef.current = undefined;
    }

    if (provider && shouldPrompt && !isRequestInFlightRef.current && lastPromptedChainRef.current !== chainId) {
      isRequestInFlightRef.current = true;
      lastPromptedChainRef.current = chainId;

      provider
        .request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: ARC_TESTNET_CHAIN_HEX,
              chainName: "Arc Testnet",
              rpcUrls: [ARC_TESTNET_RPC_URL],
              nativeCurrency: {
                name: "USDC",
                symbol: "USDC",
                decimals: 6,
              },
            },
          ],
        })
        .then(() => {
          window.localStorage.setItem(autoSwitchStorageKey, "true");
          wasOnArcRef.current = true;
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message.toLowerCase() : "";
          if (message.includes("rejected")) {
            toast.error("ARC NETWORK SWITCH REJECTED", {
              description: "Switch to Arc Testnet to bond and manage USDC positions.",
            });
          }
        })
        .finally(() => {
          isRequestInFlightRef.current = false;
        });
    }

    prevConnectedRef.current = isConnected;
    prevChainIdRef.current = chainId;
  }, [address, chainId, isConnected]);

  return null;
}
