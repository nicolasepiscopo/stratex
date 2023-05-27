import { Contract } from "@ethersproject/contracts";
import { useQuery } from "@tanstack/react-query";
import { useWeb3React } from "@web3-react/core";
import { Bot } from "./BotList";
import { useTokenList } from "../token-selector-modal/TokenSelectorModal.helpers";
import { formatEther, parseEther } from "@ethersproject/units";

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

export function useBotList (): Bot[] {
  const { library, chainId } = useWeb3React();
  const tokens = useTokenList(chainId);
  const { data = [] } = useQuery<Bot[]>({
    queryKey: ['botList'],
    enabled: !!tokens.length && !!library,
    queryFn: async () => {
      const address = '0xDa3f4f092219601488B58352ed13B3dcDf457bF5';
      const signer = library.getSigner();
      const contract = new Contract(address, abi, signer);
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
        lowerRange: data?._lower_range,
        upperRange: data?._upper_range,
        grids: data?._no_of_grids,
        token: tokenIn,
        tokenPair: tokenOut,
      };

      return [bot];
    }
  });

  const mock = false;

  if (mock) {
    return [
      {
        id: '1',
        amount: 10,
        createdAt: new Date().toISOString(),
        lowerRange: 90,
        upperRange: 100,
        grids: 4,
        token: {
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          chainId: 1,
          decimals: 18,
          logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
          name: "Wrapped Ether",
          symbol: "WETH",
        },
        tokenPair: {
          address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          chainId: 1,
          decimals: 8,
          logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
          name: "Wrapped BTC",
          symbol: "WBTC",
        },
      },
    ]
  }

  return data;
}