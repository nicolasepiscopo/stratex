import { ChainId, Token, WETH, Fetcher, Route } from '@uniswap/sdk';
import { ETHEREUM_TOKEN } from '../modules/token-selector-modal/TokenSelectorModal.helpers';
import { useQuery } from '@tanstack/react-query';

const USDC_ADDRESSES = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

type PartialToken = Pick<Token, 'address' | 'chainId' | 'symbol' | 'decimals'>;

const usdcToken: PartialToken = {
  chainId: ChainId.MAINNET,
  address: USDC_ADDRESSES,
  decimals: 6,
  symbol: 'USDC',
}

async function getPrice (token: PartialToken, invert = false) {
  const usedToken = !token.address ? usdcToken : token;
  const TargetToken = new Token(usedToken.chainId, usedToken.address, usedToken.decimals);
  const WETHPair = await Fetcher.fetchPairData(TargetToken, WETH[usedToken.chainId]);
  const route = new Route([WETHPair], WETH[usedToken.chainId]);

  return Number((invert ? route.midPrice.invert() : route.midPrice).toSignificant(6));
}

async function getPrice2 (token: PartialToken, token2?: PartialToken) {
  const usedToken = !token.address ? usdcToken : token;
  const TargetToken = new Token(usedToken.chainId, usedToken.address, usedToken.decimals);
  const TargetToken2 = token2 && new Token(token2.chainId, token2.address, token2.decimals);
  const WETHPair = await Fetcher.fetchPairData(TargetToken, TargetToken2 ?? WETH[usedToken.chainId]);
  const route = new Route([WETHPair], TargetToken2 ?? WETH[usedToken.chainId]);

  return Number(route.midPrice.toSignificant(6));
}

export function useTokenPrice (token: PartialToken | undefined, targetToken?: PartialToken) {
  const { data: price, isLoading } = useQuery({
    queryKey: ['tokenPrice', token, targetToken],
    queryFn: async () => {
      if (!token) return 0;

      const ethPrice = await getPrice(ETHEREUM_TOKEN);
      
      if (token.address === ETHEREUM_TOKEN.address) {
        return ethPrice ?? 0;
      }
      
      const invertedTokenPrice = await getPrice(token, true);
      const tokenPrice = ethPrice * invertedTokenPrice;
      const invertedTargetTokenPrice = targetToken ? await getPrice2(targetToken, token) : 0; 
      const targetTokenPrice = ethPrice * invertedTargetTokenPrice;
      
      if (!targetTokenPrice) {
        return tokenPrice ?? 0;
      }

      return targetTokenPrice ?? 0;
    }
  });

  return {
    price,
    isLoading
  };
}