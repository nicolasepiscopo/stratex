import { Contract } from "@ethersproject/contracts";
import { useQuery } from "@tanstack/react-query";
import { useWeb3React } from "@web3-react/core";
import { Bot } from "./BotList";
import { useTokenList } from "../token-selector-modal/TokenSelectorModal.helpers";
import { formatEther, parseEther } from "@ethersproject/units";

const STRATEX_ABI = [
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
  const { library, chainId } = useWeb3React();
  const tokens = useTokenList(chainId);
  const { data = [], isLoading } = useQuery<Bot[]>({
    queryKey: ['botList'],
    enabled: !!tokens.length && !!library,
    refetchOnMount: true,
    queryFn: async () => {
      const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      const signer = library.getSigner();
      const contract = new Contract(address, STRATEX_ABI, signer);
      const data = await contract.connect(signer).getBotsDetails();

      if (!data) {
        return [];
      }

      const tokenIn = tokens.find(token => token.address === data?.tokeIn); // TODO: fix typo
      const tokenOut = tokens.find(token => token.address === data?.tokenOut);
      const bot: Bot = {
        id: '1', // TODO: get from contract
        amount: data ? parseFloat(formatEther(data._amount)) : 0,
        createdAt: new Date().toISOString(), // TODO: get from contract
        lowerRange: parseFloat(formatEther(data?._lower_range)),
        upperRange: parseFloat(formatEther(data?._upper_range)),
        grids: parseInt(formatEther(data?._no_of_grids), 10),
        token: tokenIn,
        tokenPair: tokenOut,
      };

      return [bot];
    }
  });

  return {
    bots: data, isLoading
  } as const;
}