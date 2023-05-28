import { Token } from '@uniswap/sdk';
import { useQuery } from '@tanstack/react-query';

type PartialToken = Pick<Token, 'address' | 'chainId' | 'symbol' | 'decimals'>;

export function useTokenPrice (token: PartialToken | undefined, targetToken?: PartialToken) {
  const { data: price, isLoading } = useQuery({
    enabled: !!token,
    queryKey: ['tokenPrice', token, targetToken],
    queryFn: async () => {
      if (!token) return undefined;
      
      const response = await fetch('/api/token-price', {
        method: 'POST',
        body: JSON.stringify({
          symbolFrom: token.symbol,
          symbolTo: targetToken?.symbol,
        }),
      });
      const data = (await response.json())['data'];

      if (data[token.symbol]) {
        const price = data[token.symbol].quote[targetToken?.symbol || 'USD'].price;

        return price;
      }

      return undefined;
    }
  });

  return {
    price,
    isLoading
  };
}