import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { startOracleLoop } from "./oracle";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Vigil backend running on port ${PORT}`);
  console.log(`Agent ONLINE — monitoring traders...`);
  
  // Start the oracle loop
  startOracleLoop();
});