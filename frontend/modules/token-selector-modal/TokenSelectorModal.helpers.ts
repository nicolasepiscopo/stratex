import { useQuery } from "@tanstack/react-query";
import { getTokenImg } from "../../utils/get-token-img";

export interface Token {
  chainId: number;
  name: string;
  address: string;
  decimals: number;
  symbol: string;
  logoURI: string;
}

export const ETHEREUM_TOKEN: Token = {
  "chainId": 1,
  "name": "Ethereum",
  "address": "",
  "decimals": 18,
  "symbol": "ETH",
  "logoURI": getTokenImg('ETH'),
};

export function useTokenList (): Token[] {
  const { data = [] } = useQuery({
    queryKey: ["tokenList"],
    queryFn: async () => {
      const response = await fetch(`https://gateway.ipfs.io/ipns/tokens.uniswap.org`);
      const data = await response.json();
      
      return data.tokens as Token[];
    }
  });

  return data;
}