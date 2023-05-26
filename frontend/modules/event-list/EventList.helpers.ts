import { useQuery } from "@tanstack/react-query";

interface Event {
  name: string;
  gridIndex: string;
  isFirstBreach: boolean;
  quantity: string;
  price: string;
}

export function useEvents () {
  const { data: events, isLoading, refetch } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      const data = await response.json();
      return data;
    },
  })

  return {
    events, isLoading, refetch
  } as const;
}