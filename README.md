# Vigil — AI-custodied trader bonds. Stake. Watch. Slash.

Traders post USDC bonds, an AI oracle scores their performance, and anyone scoring below their slash threshold gets slashed. Followers can stake behind traders they believe in.

**Live demo:** https://vigil-mu-three.vercel.app

## How it works

1. **Stake** — a trader locks USDC into a `TraderBond` with a personal slash threshold.
2. **Watch** — the oracle (backend agent loop) posts AI performance scores on-chain; only the oracle address can update scores.
3. **Slash** — if a score drops below threshold, the bond is slashed (2% protocol fee). Followers stake alongside traders and accumulate yield.

## Repo layout

| Dir | Stack | Contents |
|---|---|---|
| `contracts/` | Solidity + Foundry (Arc network) | `src/VigilSlash.sol` (USDC bonds, oracle scores, follower stakes), `script/Deploy.s.sol`, `test/` |
| `backend/` | Express + TypeScript | Oracle agent loop (`oracle.ts`, `agent.ts`), contract bindings (`contract.ts`), REST API (`/api/traders`, `/api/stats`, `/api/agent-log`) |
| `frontend/` | Vite + TanStack Router + Cloudflare | Trader leaderboard, profiles, wallet connect (SDKs stubbed for edge build) |

## Run it locally

**Contracts** (needs [Foundry](https://book.getfoundry.sh/)):

```bash
cd contracts
forge build
forge test
forge script script/Deploy.s.sol --rpc-url <arc_rpc_url> --private-key <key>
```

**Backend:**

```bash
cd backend
npm ci
npm start        # port 3001; /health to check
```

**Frontend:**

```bash
cd frontend
npm ci
npm run dev
```

## Contract notes

- `VigilSlash.sol` (SPDX MIT): `SafeERC20` + `ReentrancyGuard`; `BondStatus` = ACTIVE / SLASHED / EXITED.
- Oracle is the sole scorer — set it to the backend agent address at deploy time.
- Demo data: the backend serves mock trader/stats responses; wire it to index real bond events for production.

## License

MIT — see [LICENSE](LICENSE).
