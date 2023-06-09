import { formatEther, parseEther, parseUnits } from "@ethersproject/units";
import { useQuery } from "@tanstack/react-query";
import { useWeb3React } from "@web3-react/core";
import { Token } from "../token-selector-modal/TokenSelectorModal.helpers";

interface ContractEvent {
  botId: string;
  amount: string;
}

export interface Amount {
  botId: string;
  amount: number;
}

export function useInitialAmounts () {
  const { account } = useWeb3React();
  const { data: amounts = [], isLoading, refetch } = useQuery<Amount[]>({
    queryKey: ['initialAmounts'],
    queryFn: async () => {
      const response = await fetch(`/api/initial-amounts?userAddress=${account}`);
      const contractEvents = await response.json();

      if (!Array.isArray(contractEvents)) throw new Error('Invalid response from server');

      return contractEvents.map((contractEvent: ContractEvent) => {
        const amount: Amount = {
          botId: contractEvent.botId,
          amount: parseFloat(formatEther(contractEvent.amount)),
        };

        return amount;
      });
    },
  });

  return {
    amounts, isLoading, refetch
  } as const;
}

export function useInitialAmount(botId: string) {
  const { amounts } = useInitialAmounts();

  return amounts.find(amount => amount.botId === botId)?.amount ?? 0;
}

export function useDeposits() {
  const { account } = useWeb3React();
  const { data: amounts = [], isLoading, refetch } = useQuery<Amount[]>({
    queryKey: ['deposits'],
    queryFn: async () => {
      const response = await fetch(`/api/deposits?userAddress=${account}`);
      const contractEvents = await response.json();

      if (!Array.isArray(contractEvents)) throw new Error('Invalid response from server');

      return contractEvents.map((contractEvent: ContractEvent) => {
        const amount: Amount = {
          botId: contractEvent.botId,
          amount: parseFloat(formatEther(contractEvent.amount)),
        };

        return amount;
      });
    },
  });

  return {
    amounts, isLoading, refetch
  } as const;
}

export function useDepositsAmount(botId: string | undefined) {
  const { amounts } = useDeposits();

  return amounts.filter(amount => amount.botId === botId).reduce((acc, amount) => acc + amount.amount, 0);
}

interface UseQuoteParams {
  tokenIn: Token | undefined;
  tokenOut: Token | undefined;
  amount: number;
}

export function useQuote({ tokenIn, tokenOut, amount }: UseQuoteParams) {
  const { library } = useWeb3React();
  const { data, isLoading } = useQuery({
    enabled: !!tokenIn && !!tokenOut,
    queryKey: ['quote'],
    queryFn: async () => {
      const formattedAmount = parseEther(amount.toString());
      const data = await fetch(`https://api.uniswap.org/v1/quote?protocols=v2%2Cv3%2Cmixed&tokenInAddress=${tokenIn.address}&tokenInChainId=${tokenIn.chainId}&tokenOutAddress=${tokenOut.address}&tokenOutChainId=${tokenOut.chainId}&amount=${formattedAmount}&type=exactIn`)
      const { quoteDecimals } = await data.json();

      return parseFloat(quoteDecimals);
    },
    onError: (error) => {
      console.log(error);
    }
  });

  return {
    quote: data, isLoading
  } as const;
}