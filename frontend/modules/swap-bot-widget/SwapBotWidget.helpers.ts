import { useMutation } from "@tanstack/react-query";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";

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
      const address = '0xDa3f4f092219601488B58352ed13B3dcDf457bF5';
      const signer = library.getSigner();
      const contract = new Contract(address, abi, signer);
    
      // TODO: fix this for supporting floating point numbers
      return contract.connect(signer).CreateBot(
        BigNumber.from(upperRange), 
        BigNumber.from(lowerRange), 
        BigNumber.from(grids),
        amount
      );
    }
  });

  return mutate;
}