import { useMutation } from "@tanstack/react-query";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { toast } from "react-toastify";
import { parseEther } from "@ethersproject/units";

interface UseCreateBotMutateParams {
  upperRange: number;
  lowerRange: number; 
  grids: number;
  amount: BigNumber;
  tokenIn: string;
}

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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_upper_range",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_lower_range",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_no_of_grids",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "CreateBot",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
]

interface UseCreateBotParams {
  onSuccess: () => void;
}

export function useCreateBot({ onSuccess }: UseCreateBotParams) {
  const { library, account } = useWeb3React();

  const { mutate } = useMutation({
    mutationKey: ['createBot'],
    onSuccess,
    mutationFn: async ({
      upperRange, lowerRange, grids, amount, tokenIn
    }: UseCreateBotMutateParams) => {
      const toastId = toast.loading('Creating bot...');
      const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      const signer = library.getSigner();
      const tokenContract = new Contract(tokenIn, ERC20_ABI, signer);
      
      try {
        await tokenContract.connect(signer).approve(address, amount);

        const allowedAmount = await tokenContract.connect(signer).allowance(account, address);

        const contract = new Contract(address, STRATEX_ABI, signer);
        const result = await contract.connect(signer).CreateBot(
          BigNumber.from(parseEther(upperRange.toString())),
          BigNumber.from(parseEther(lowerRange.toString())),
          BigNumber.from(parseEther(grids.toString())),
          allowedAmount
        );
  
        toast.update(toastId, { 
          render: "Bot created successfully!", 
          type: "success", 
          isLoading: false 
        });

        return result;
      } catch (e) {
        toast.update(toastId, { 
          render: "Failed to create bot. Please try again.", 
          type: "error",
          isLoading: false 
        });
        throw e;
      }
    }
  });

  return mutate;
}