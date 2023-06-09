import { useWeb3React } from "@web3-react/core";
import { Token, useTokenList } from "../../token-selector-modal/TokenSelectorModal.helpers";
import { useQuery } from "@tanstack/react-query";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";

const STRATEX_ABI = [
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
]

export function useBotTokenIn (id: string) {
  const { library, chainId, account } = useWeb3React();
  const tokens = useTokenList(chainId);
  const { data, isLoading } = useQuery<Token>({
    queryKey: ['botTokenIn', id],
    enabled: !!tokens.length && !!library,
    queryFn: async () => {
      const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      const signer = library.getSigner();
      const contract = new Contract(address, STRATEX_ABI, signer);
      const data = await contract.connect(signer).bots(BigNumber.from(id));
      const isOwner = data.user === account;

      if (!isOwner) return null;
      
      return tokens.find(token => token.address === data.tokenIn);
    }
  });

  return {
    tokenIn: data, isLoading
  } as const;
}