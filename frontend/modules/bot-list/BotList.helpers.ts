import { Contract } from "@ethersproject/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWeb3React } from "@web3-react/core";
import { Bot } from "./BotList";
import { Token, useTokenList } from "../token-selector-modal/TokenSelectorModal.helpers";
import { formatEther, parseUnits } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { orderBy } from "lodash";

const ERC20_ABI = [
  {
    "constant": false,
    "inputs": [
        {
            "name": "guy",
            "type": "address"
        },
        {
            "name": "wad",
            "type": "uint256"
        }
    ],
    "name": "approve",
    "outputs": [
        {
            "name": "",
            "type": "bool"
        }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
        {
            "name": "",
            "type": "address"
        },
        {
            "name": "",
            "type": "address"
        }
    ],
    "name": "allowance",
    "outputs": [
        {
            "name": "",
            "type": "uint256"
        }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
]

const STRATEX_ABI = [
  {
    "inputs": [],
    "name": "botCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "bots",
    "outputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "upper_range",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lower_range",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentGrid",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "buyCounter",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "sellCounter",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastExecutionTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isCancelled",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "tokenIn",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "tokenOut",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "balances",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_botIndex",
        "type": "uint256"
      }
    ],
    "name": "getGrids",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "_grids",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "botIndex",
        "type": "uint256"
      }
    ],
    "name": "toggleBot",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "botIndex",
        "type": "uint256"
      }
    ],
    "name": "deleteBot",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_botId",
        "type": "uint256"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "botId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export function useBotList () {
  const { library, chainId, account } = useWeb3React();
  const tokens = useTokenList(chainId);
  const { data = [], isLoading } = useQuery<Bot[]>({
    queryKey: ['botList'],
    enabled: !!tokens.length && !!library,
    refetchOnMount: true,
    queryFn: async () => {
      const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      const signer = library.getSigner();
      const contract = new Contract(address, STRATEX_ABI, signer);
      const botCount = BigNumber.from(await contract.connect(signer).botCounter()).toNumber();
      const bots: Bot[] = [];

      for (let i = 0; i < botCount; i++) {
        const data = await contract.connect(signer).bots(BigNumber.from(i));
        const isOwner = data.user === account;

        if (isOwner) {
          const amount = formatEther(await contract.connect(signer).balances(BigNumber.from(i), data.tokenIn)).toString();
          const amountPair = formatEther(await contract.connect(signer).balances(BigNumber.from(i), data.tokenOut)).toString();
          const grids = (await contract.connect(signer).getGrids(BigNumber.from(i))).length - 1;
          const token = tokens.find(token => token.address === data.tokenIn);
          const tokenPair = tokens.find(token => token.address === data.tokenOut);

          bots.push({
            id: `${i}`,
            amount: parseFloat(parseFloat(amount).toFixed(4)),
            amountPair: parseFloat(parseFloat(amountPair).toFixed(4)),
            lastExecution: new Date(BigNumber.from(data.lastExecutionTime * 1000).toNumber()).toLocaleString(),
            lowerRange: data.lower_range,
            upperRange: data.upper_range,
            grids,
            token,
            tokenPair,
            status: data.isCancelled ? 'paused' : 'running'
          });
        }
      }

      return orderBy(bots, 'lastExecution', 'desc');
    }
  });

  return {
    bots: data, isLoading
  } as const;
}

export function useBot (id: string) {
  const { library, chainId, account } = useWeb3React();
  const tokens = useTokenList(chainId);
  const { data, isLoading } = useQuery<Bot>({
    queryKey: ['bot', id],
    enabled: !!tokens.length && !!library,
    refetchOnMount: true,
    queryFn: async () => {
      const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      const signer = library.getSigner();
      const contract = new Contract(address, STRATEX_ABI, signer);

      const data = await contract.connect(signer).bots(BigNumber.from(id));
      const isOwner = data.user === account;

      if (isOwner) {
        const amount = formatEther(await contract.connect(signer).balances(BigNumber.from(id), data.tokenIn)).toString();
        const amountPair = formatEther(await contract.connect(signer).balances(BigNumber.from(id), data.tokenOut)).toString();
        const grids = (await contract.connect(signer).getGrids(BigNumber.from(id))).length - 1;
        const token = tokens.find(token => token.address === data.tokenIn);
        const tokenPair = tokens.find(token => token.address === data.tokenOut);

        return {
          id,
          amount: parseFloat(parseFloat(amount).toFixed(4)),
          amountPair: parseFloat(parseFloat(amountPair).toFixed(4)),
          lastExecution: new Date(BigNumber.from(data.lastExecutionTime * 1000).toNumber()).toLocaleString(),
          lowerRange: data.lower_range,
          upperRange: data.upper_range,
          grids,
          token,
          tokenPair,
          status: data.isCancelled ? 'paused' : 'running'
        };
      }

      return undefined;
    }
  });

  return {
    bot: data, isLoading
  } as const;
}

export function usePauseBot () {
  const queryClient = useQueryClient();
  const { library } = useWeb3React();
  const { mutate, isLoading } = useMutation({
    mutationKey: ['pauseBot'],
    mutationFn: async (id: string) => {
      const toastId = toast.loading('Pausing bot...');

      try {
        const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        const signer = library.getSigner();
        const contract = new Contract(address, STRATEX_ABI, signer);
        const tx = await contract.connect(signer).toggleBot(BigNumber.from(id));
        await signer.provider?.waitForTransaction(tx.hash, 1, 100000);
        toast.update(toastId, { 
          render: "Bot paused successfully!", 
          type: "success", 
          isLoading: false,
          autoClose: 3000
        });
        await queryClient.invalidateQueries(['bot', id]);
      } catch (e) {
        toast.update(toastId, { 
          render: "Failed to pause bot. Please try again.", 
          type: "error",
          isLoading: false,
          autoClose: 3000
        });
        throw e;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['botList']);
    },
  });

  return {
    pause: mutate,
    isLoading
  } as const;
}

export function useResumeBot () {
  const queryClient = useQueryClient();
  const { library } = useWeb3React();
  const { mutate, isLoading } = useMutation({
    mutationKey: ['resumeBot'],
    mutationFn: async (id: string) => {
      const toastId = toast.loading('Resuming bot...');

      try {
        const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        const signer = library.getSigner();
        const contract = new Contract(address, STRATEX_ABI, signer);
        const tx = await contract.connect(signer).toggleBot(BigNumber.from(id));
        await signer.provider?.waitForTransaction(tx.hash, 1, 100000);
        toast.update(toastId, { 
          render: "Bot resumed successfully!", 
          type: "success", 
          isLoading: false,
          autoClose: 3000
        });
        await queryClient.invalidateQueries(['bot', id]);
      } catch (e) {
        toast.update(toastId, { 
          render: "Failed to resume bot. Please try again.", 
          type: "error",
          isLoading: false,
          autoClose: 3000
        });
        throw e;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['botList']);
    },
  });

  return {
    resume: mutate,
    isLoading
  } as const;
}

export function useDeleteBot () {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { library } = useWeb3React();
  const { mutate, isLoading } = useMutation({
    mutationKey: ['deleteBot'],
    mutationFn: async (id: string) => {
      const toastId = toast.loading('Deleting bot...');

      try {
        const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        const signer = library.getSigner();
        const contract = new Contract(address, STRATEX_ABI, signer);
        const tx = await contract.connect(signer).deleteBot(BigNumber.from(id));
        await signer.provider?.waitForTransaction(tx.hash, 1, 100000);
        toast.update(toastId, { 
          render: "Bot deleted successfully!", 
          type: "success", 
          isLoading: false,
          autoClose: 3000
        });
      } catch (e) {
        toast.update(toastId, { 
          render: "Failed to delete bot. Please try again.", 
          type: "error",
          isLoading: false,
          autoClose: 3000
        });
        throw e;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['botList']);
      router.push('/app');
    },
  });

  return {
    deleteBot: mutate,
    isLoading
  } as const;
}

export function useDeposit (id: string) {
  const queryClient = useQueryClient();
  const { library, account } = useWeb3React();
  const { mutate, isLoading } = useMutation({
    mutationKey: ['deposit'],
    mutationFn: async (token: Token) => {
      const toastId = toast.loading('Performing deposit...');

      try {
        const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        const signer = library.getSigner();
        const contract = new Contract(address, STRATEX_ABI, signer);
        const tokenContract = new Contract(token.address, ERC20_ABI, signer);
        const approveTx = await tokenContract.connect(signer).approve(address, 0);
        await signer.provider?.waitForTransaction(approveTx.hash, 1, 100000);
        const allowedAmount = await tokenContract.connect(signer).allowance(account, address);
        const tx = await contract.connect(signer).deposit(allowedAmount, BigNumber.from(id));
        await signer.provider?.waitForTransaction(tx.hash, 5, 100000);
        toast.update(toastId, { 
          render: "Deposit done successfully!", 
          type: "success", 
          isLoading: false,
          autoClose: 3000
        });
      } catch (e) {
        toast.update(toastId, { 
          render: "Failed to deposit. Please try again.", 
          type: "error",
          isLoading: false,
          autoClose: 3000
        });
        throw e;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['botList']);
      await queryClient.invalidateQueries(['bot', id]);
    },
  });

  return {
    deposit: mutate,
    isLoading
  } as const;
}

export function useWithdraw (id: string) {
  const queryClient = useQueryClient();
  const { library } = useWeb3React();
  const { mutate, isLoading } = useMutation({
    mutationKey: ['withdraw'],
    mutationFn: async ({ amount, token }: {amount: number, token: Token}) => {
      const toastId = toast.loading('Performing withdrawal...');

      try {
        const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        const signer = library.getSigner();
        const contract = new Contract(address, STRATEX_ABI, signer);
        const tx = await contract.connect(signer).withdraw(BigNumber.from(parseUnits(amount.toString())).toString(), BigNumber.from(id), token.address);
        await signer.provider?.waitForTransaction(tx.hash, 1, 100000);
        toast.update(toastId, { 
          render: "Withdrawal done successfully!", 
          type: "success", 
          isLoading: false,
          autoClose: 3000
        });
      } catch (e) {
        toast.update(toastId, { 
          render: "Failed to withdraw. Please try again.", 
          type: "error",
          isLoading: false,
          autoClose: 3000
        });
        throw e;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['botList']);
      await queryClient.invalidateQueries(['bot', id]);
    },
  });

  return {
    withdraw: mutate,
    isLoading
  } as const;
}