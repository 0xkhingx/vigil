import axios from "axios";
import dotenv from "dotenv";
import { scoreTrader, TraderData } from "./agent";
import { updateScoreOnchain, slashOnchain, getTraderBond } from "./contract";

dotenv.config();

// In-memory log of agent decisions
export const agentLog: any[] = [];

// Mock trader data for now — will replace with real HL API
const MOCK_TRADERS: { [key: number]: TraderData } = {
  1: {
    handle: "0xkairos",
    rank: 1,
    pnl30d: 18.4,
    maxDrawdown: 4.2,
    winRate: 68,
    currentScore: 94,
    slashThreshold: 60,
  },
  2: {
    handle: "merlin.eth",
    rank: 2,
    pnl30d: 14.1,
    maxDrawdown: 6.1,
    winRate: 61,
    currentScore: 91,
    slashThreshold: 60,
  },
  3: {
    handle: "ploutos",
    rank: 3,
    pnl30d: 11.9,
    maxDrawdown: 9.8,
    winRate: 55,
    currentScore: 88,
    slashThreshold: 70,
  },
};

async function fetchHyperliquidData(address: string) {
  try {
    const response = await axios.post(
      "https://api.hyperliquid.xyz/info",
      { type: "clearinghouseState", user: address },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error(`[ORACLE] Failed to fetch HL data for ${address}`);
    return null;
  }
}

async function runAgentCycle() {
  console.log(`\n[ORACLE] Starting agent cycle — ${new Date().toISOString()}`);

  for (const [traderIdStr, traderData] of Object.entries(MOCK_TRADERS)) {
    const traderId = parseInt(traderIdStr);

    try {
      // Get AI decision
      const decision = await scoreTrader(traderId, traderData);
      
      console.log(`[${decision.shouldSlash ? "SLASH" : "SCORE"}] ${decision.handle} — Score: ${decision.newScore} — ${decision.reasoning}`);

      // Log the decision
      agentLog.unshift({
        ...decision,
        tag: decision.shouldSlash ? "SLASH" : decision.newScore < traderData.currentScore ? "WARN" : "SCORE",
      });

      // Keep log to last 100 entries
      if (agentLog.length > 100) agentLog.pop();

      // Update score onchain
      await updateScoreOnchain(traderId, decision.newScore);

      // Slash if needed
      if (decision.shouldSlash && decision.slashPercent > 0) {
        await slashOnchain(traderId, decision.slashPercent);
      }

      // Update mock data with new score
      MOCK_TRADERS[traderId].currentScore = decision.newScore;

    } catch (error) {
      console.error(`[ORACLE] Error processing trader ${traderId}:`, error);
    }
  }

  console.log(`[ORACLE] Cycle complete.`);
}

export function startOracleLoop() {
  console.log("[ORACLE] Oracle loop started — running every 60 minutes");
  
  // Run immediately on start
  runAgentCycle();

  // Then every 60 minutes
  setInterval(runAgentCycle, 60 * 60 * 1000);
}

// Export for API routes
export { agentLog as log };