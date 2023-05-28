import { useMutation } from "@tanstack/react-query";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { toast } from "react-toastify";
import { parseEther } from "@ethersproject/units";

interface UseCreateBotParams {
  upperRange: number;
  lowerRange: number; 
  grids: number;
  amount: BigNumber;
}

const abi = [
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

export function useCreateBot() {
  const { library } = useWeb3React();

  const { mutate } = useMutation({
    mutationKey: ['createBot'],
    mutationFn: async ({
      upperRange, lowerRange, grids, amount
    }: UseCreateBotParams) => {
      const toastId = toast.loading('Creating bot...');
      const address = '0xDa3f4f092219601488B58352ed13B3dcDf457bF5';
      const signer = library.getSigner();
      const contract = new Contract(address, abi, signer);

      try {
        const result = await contract.connect(signer).CreateBot(
          BigNumber.from(parseEther(upperRange.toString())), 
          BigNumber.from(parseEther(lowerRange.toString())), 
          BigNumber.from(parseEther(grids.toString())),
          amount
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