import { BigNumber } from "@ethersproject/bignumber";
import { formatEther } from "@ethersproject/units";
import { useQuery } from "@tanstack/react-query";
import { useWeb3React } from "@web3-react/core";
import { useState } from "react";

interface ContractEvent {
  botId: string;
  orderType: 'buy' | 'sell';
  gridIndex: string;
  qty: string;
  price: string;
  timestamp: string;
}

export interface Event {
  id: string;
  botId: string;
  orderType: 'buy' | 'sell';
  quantity: number;
  tradePrice: number;
  date: string;
}

export function useEvents () {
  const { account } = useWeb3React();
  const { data: events, isLoading, refetch } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await fetch(`/api/events?userAddress=${account}`);
      const contractEvents = await response.json();

      if (!Array.isArray(contractEvents)) throw new Error('Invalid response from server');
      
      return contractEvents.map((contractEvent: ContractEvent, index) => {
        const event: Event = {
          id: contractEvent.botId,
          botId: contractEvent.botId,
          orderType: contractEvent.orderType,
          quantity: parseFloat(formatEther(contractEvent.qty)),
          date: new Date(BigNumber.from(contractEvent.timestamp).toNumber() * 1000).toLocaleString(),
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