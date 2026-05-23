import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, zeroAddress } from "viem";

export const VIGIL_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
export const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS as `0x${string}`;


console.log("ENV CHECK - VIGIL_ADDRESS:", import.meta.env.VITE_CONTRACT_ADDRESS);
console.log("ENV CHECK - USDC_ADDRESS:", import.meta.env.VITE_USDC_ADDRESS);

export const VIGIL_ABI = [
  {
    "type": "function",
    "name": "postBond",
    "inputs": [
      { "name": "amount", "type": "uint256" },
      { "name": "slashThreshold", "type": "uint256" },
      { "name": "initialScore", "type": "uint256" }
    ],
    "outputs": [{ "name": "traderId", "type": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "stake",
    "inputs": [
      { "name": "traderId", "type": "uint256" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "exit",
    "inputs": [{ "name": "traderId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getTraderBond",
    "inputs": [{ "name": "traderId", "type": "uint256" }],
    "outputs": [{
      "name": "",
      "type": "tuple",
      "components": [
        { "name": "trader", "type": "address" },
        { "name": "bondAmount", "type": "uint256" },
        { "name": "slashThreshold", "type": "uint256" },
        { "name": "currentScore", "type": "uint256" },
        { "name": "createdAt", "type": "uint256" },
        { "name": "status", "type": "uint8" }
      ]
    }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "nextTraderId",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  }
] as const;

export const USDC_ABI = [
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{ "name": "account", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  }
] as const;

export function useUsdcAllowance(owner?: `0x${string}`) {
  const result = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "allowance",
    args: [owner ?? zeroAddress, VIGIL_ADDRESS],
    query: {
      enabled: Boolean(owner && USDC_ADDRESS && VIGIL_ADDRESS),
    },
  });

  return {
    allowance: result.data ?? 0n,
    isLoading: result.isLoading,
    refetch: result.refetch,
  };
}

export function useUsdcBalance(owner?: `0x${string}`) {
  const result = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: [owner ?? zeroAddress],
    query: {
      enabled: Boolean(owner && USDC_ADDRESS),
    },
  });

  return {
    balance: result.data ?? 0n,
    isLoading: result.isLoading,
    refetch: result.refetch,
  };
}

// Hook to stake alongside a trader
export function useStake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const stake = (traderId: number, usdcAmount: number) => {
    const amount = parseUnits(usdcAmount.toString(), 6); // USDC has 6 decimals
    writeContract({
      address: VIGIL_ADDRESS,
      abi: VIGIL_ABI,
      functionName: "stake",
      args: [BigInt(traderId), amount],
    });
  };

  return { stake, hash, data: hash, isPending, isConfirming, isSuccess, error };
}

// Hook to approve USDC spending
export function useApproveUSDC() {
  const { writeContract, data: hash, isPending, isSuccess, error } = useWriteContract();

  const approve = (amount: number) => {
    const parsedAmount = parseUnits(amount.toString(), 6);
    writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: "approve",
      args: [VIGIL_ADDRESS, parsedAmount],
    });
  };

  return { approve, hash, data: hash, isPending, isConfirming: false, isSuccess, error };
}

// Hook to post a bond as a trader
export function usePostBond() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const postBond = (usdcAmount: number, slashThreshold: number, initialScore: number) => {
    const amount = parseUnits(usdcAmount.toString(), 6);
    writeContract({
      address: VIGIL_ADDRESS,
      abi: VIGIL_ABI,
      functionName: "postBond",
      args: [amount, BigInt(slashThreshold), BigInt(initialScore)],
    });
  };

  return { postBond, hash, data: hash, isPending, isConfirming, isSuccess, error };
}
