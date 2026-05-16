import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { startOracleLoop, agentLog } from "./oracle";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

// Get all traders with their current scores
app.get("/api/traders", (req, res) => {
  const traders = [
    {
      id: 1,
      handle: "0xkairos",
      rank: 1,
      aiScore: 96,
      pnl30d: 18.4,
      maxDrawdown: 4.2,
      winRate: 68,
      bondAmount: 412000,
      status: "HEALTHY",
    },
    {
      id: 2,
      handle: "merlin.eth",
      rank: 2,
      aiScore: 92,
      pnl30d: 14.1,
      maxDrawdown: 6.1,
      winRate: 61,
      bondAmount: 318500,
      status: "HEALTHY",
    },
    {
      id: 3,
      handle: "ploutos",
      rank: 3,
      aiScore: 88,
      pnl30d: 11.9,
      maxDrawdown: 9.8,
      winRate: 55,
      bondAmount: 276900,
      status: "AT_RISK",
    },
    {
      id: 4,
      handle: "vega.lens",
      rank: 4,
      aiScore: 86,
      pnl30d: 9.3,
      maxDrawdown: 5.5,
      winRate: 59,
      bondAmount: 204000,
      status: "HEALTHY",
    },
    {
      id: 5,
      handle: "icarus_x",
      rank: 5,
      aiScore: 41,
      pnl30d: -22.6,
      maxDrawdown: 14.8,
      winRate: 31,
      bondAmount: 0,
      status: "SLASHED",
    },
  ];
  res.json(traders);
});

// Get single trader
app.get("/api/traders/:handle", (req, res) => {
  res.json({
    handle: req.params.handle,
    message: "Trader profile endpoint — full data coming soon",
  });
});

// Get agent log
app.get("/api/agent-log", (req, res) => {
  res.json(agentLog);
});

// Get platform stats
app.get("/api/stats", (req, res) => {
  res.json({
    tvlBonded: 48200000,
    activeBonds: 1284,
    slashes30d: 37,
    meanSharpe: 2.41,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Vigil backend running on port ${PORT}`);
  console.log(`Agent ONLINE — monitoring traders...`);
  startOracleLoop();
});