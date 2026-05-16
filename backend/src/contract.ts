import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const VIGIL_ABI = [
  "function updateScore(uint256 traderId, uint256 newScore) external",
  "function slash(uint256 traderId, uint256 slashPercent) external",
  "function getTraderBond(uint256 traderId) external view returns (tuple(address trader, uint256 bondAmount, uint256 slashThreshold, uint256 currentScore, uint256 createdAt, uint8 status))",
  "function getFollowers(uint256 traderId) external view returns (address[])",
  "event ScoreUpdated(uint256 indexed traderId, uint256 oldScore, uint256 newScore)",
  "event BondSlashed(uint256 indexed traderId, uint256 slashAmount, uint256 followersCompensated)"
];

const CONTRACT_ADDRESS = process.env.VIGIL_CONTRACT_ADDRESS!;
const RPC_URL = process.env.RPC_URL!;
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY!;

export function getContract() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, VIGIL_ABI, wallet);
}

export async function updateScoreOnchain(traderId: number, score: number) {
  const contract = getContract();
  const tx = await contract.updateScore(traderId, score);
  await tx.wait();
  console.log(`[SCORE] Trader ${traderId} score updated to ${score} — tx: ${tx.hash}`);
  return tx.hash;
}

export async function slashOnchain(traderId: number, slashPercent: number) {
  const contract = getContract();
  const tx = await contract.slash(traderId, slashPercent);
  await tx.wait();
  console.log(`[SLASH] Trader ${traderId} slashed ${slashPercent}% — tx: ${tx.hash}`);
  return tx.hash;
}

export async function getTraderBond(traderId: number) {
  const contract = getContract();
  return await contract.getTraderBond(traderId);
}