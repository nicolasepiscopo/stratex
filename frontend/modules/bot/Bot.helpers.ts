import { formatEther, parseEther, parseUnits } from "@ethersproject/units";
import { useQuery } from "@tanstack/react-query";
import { useWeb3React } from "@web3-react/core";
import { Token } from "../token-selector-modal/TokenSelectorModal.helpers";
import { Bot } from "../bot-list";

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
  const { data, isLoading } = useQuery({
    enabled: !!tokenIn && !!tokenOut,
    queryKey: ['quote'],
    queryFn: async () => {
      const formattedAmount = parseEther(amount.toString());
      const data = await fetch(`/api/quote?tokenInAddress=${tokenIn?.address}&tokenOutAddress=${tokenOut?.address}&amount=${formattedAmount}`)
      const { quote } = await data.json();

      console.log({
        quote: formatEther(quote),
      })

      return parseFloat(formatEther(quote));
    },
    onError: (error) => {
      console.log(error);
    }
  });

  return {
    quote: data, isLoading
  } as const;
}

export function useBotStats (bot: Bot | undefined) {
  const initialAmount = useInitialAmount(bot?.id);
  const depositsAmount = useDepositsAmount(bot?.id);
  const totalInvested = initialAmount + depositsAmount;
  const totalAmount = bot ? bot.amount : 0;
  const profit = totalAmount - totalInvested;
  const shouldShowProfit = profit !== 0 && totalInvested > 0 && totalAmount > 0 && bot.amount > 0 && bot.amountPair === 0;
  const profitPercentage = ((profit*100)/totalInvested).toFixed(2);

  return {
    totalInvested,
    totalAmount,
    profit,
    profitPercentage,
    shouldShowProfit,
  }
}