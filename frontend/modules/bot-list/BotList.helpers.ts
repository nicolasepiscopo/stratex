import { Contract } from "@ethersproject/contracts";
import { useQuery } from "@tanstack/react-query";
import { useWeb3React } from "@web3-react/core";

const abi = [
  {
    "inputs": [],
    "name": "getBotsDetails",
    "outputs": [
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
      },
      {
        "internalType": "address",
        "name": "tokeIn",
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
];

export function useBotList () {
  const { library } = useWeb3React();
  const { data } = useQuery({
    queryKey: ['bot-list'],
    queryFn: async () => {
      const address = '0xDa3f4f092219601488B58352ed13B3dcDf457bF5';
      const signer = library.getSigner();
      const contract = new Contract(address, abi, signer);
    
      return contract.connect(signer).getBotsDetails();
    }
  });

  console.log(data);

  return data;
}