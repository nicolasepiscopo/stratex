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

export function useEvents (): { events: Event[]; isLoading: boolean; refetch: () => void } {
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

  const mock = false;

  if (mock) {
    return {
      events: [
        {
          id: '1',
          date: new Date().toLocaleString(),
          orderType: 'sell',
          quantity: 10,
          symbol: 'WETH',
          symbolImage: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
          tradePrice: 1816.53,
        },
        {
          id: '2',
          date: new Date().toLocaleString(),
          orderType: 'buy',
          quantity: 0.67670,
          symbol: 'WBTC',
          symbolImage: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
          tradePrice: 26843.80,
        },
        {
          id: '3',
          date: new Date().toLocaleString(),
          orderType: 'buy',
          quantity: 11,
          symbol: 'WETH',
          symbolImage: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
          tradePrice: 1760.00,
        },
      ],
      isLoading: false,
      refetch: () => {},
    }
  }

  return {
    events, isLoading, refetch
  } as const;
}