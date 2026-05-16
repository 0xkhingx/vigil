import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface TraderData {
  handle: string;
  rank: number;
  pnl30d: number;
  maxDrawdown: number;
  winRate: number;
  currentScore: number;
  slashThreshold: number;
}

export interface AgentDecision {
  traderId: number;
  handle: string;
  newScore: number;
  shouldSlash: boolean;
  slashPercent: number;
  reasoning: string;
  timestamp: string;
}

export async function scoreTrader(
  traderId: number,
  trader: TraderData
): Promise<AgentDecision> {
  const prompt = `You are Vigil's AI risk agent. Your job is to score a crypto trader's performance and decide if their bond should be slashed.

Trader: ${trader.handle}
Current Rank: ${trader.rank}
30d PnL: ${trader.pnl30d}%
Max Drawdown: ${trader.maxDrawdown}%
Win Rate: ${trader.winRate}%
Current AI Score: ${trader.currentScore}/100
Slash Threshold: ${trader.slashThreshold}/100

Score the trader from 0-100 based on:
- Consistency (not just raw PnL)
- Drawdown discipline (staying within mandate)
- Win rate sustainability
- Rank trajectory

Respond in this exact JSON format:
{
  "newScore": <number 0-100>,
  "shouldSlash": <true/false>,
  "slashPercent": <number 1-50 if shouldSlash, else 0>,
  "reasoning": "<one clear sentence explaining your decision>"
}

Only recommend slash if newScore < slashThreshold. Be strict but fair.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 200,
  });

  const content = response.choices[0].message.content || "{}";
  
  let parsed;
  try {
    const clean = content.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    parsed = { newScore: trader.currentScore, shouldSlash: false, slashPercent: 0, reasoning: "Parse error — maintaining current score" };
  }

  return {
    traderId,
    handle: trader.handle,
    newScore: parsed.newScore,
    shouldSlash: parsed.shouldSlash,
    slashPercent: parsed.slashPercent,
    reasoning: parsed.reasoning,
    timestamp: new Date().toISOString(),
  };
}