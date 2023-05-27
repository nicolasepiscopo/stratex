import { formatEther } from "@ethersproject/units";
import { useQuery } from "@tanstack/react-query";

interface ContractEvent {
  name: string;
  gridIndex: string;
  isFirstBreach: boolean;
  quantity: string;
  price: string;
}

export interface Event {
  id: string;
  // Crypto currency symbol
  symbol: string;
  symbolImage: string;
  orderType: 'buy' | 'sell';
  quantity: number;
  // The price at which the order was executed
  tradePrice: number;
  // The date at which the order was executed
  date: string;
}

export function useEvents () {
  const { data: events, isLoading, refetch } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      const contractEvents = await response.json();

      if (!Array.isArray(contractEvents)) throw new Error('Invalid response from server');
      
      return contractEvents.map((contractEvent: ContractEvent, index) => {
        const event: Event = {
          id: `${index}`,
          symbol: 'WETH', // TODO: get this from the contract
          symbolImage: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
          orderType: contractEvent.isFirstBreach ? 'buy' : 'sell',
          quantity: parseFloat(formatEther(contractEvent.quantity)),
          date: new Date().toLocaleString(), // TODO: get this from the contract
          tradePrice: Number(contractEvent.price),
        };

        return event;
      });
    },
  });

  return {
    events, isLoading, refetch
  } as const;
}