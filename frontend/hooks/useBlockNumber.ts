import type { Web3Provider } from "@ethersproject/providers";
import { useQuery } from "@tanstack/react-query";
import { useWeb3React } from "@web3-react/core";

export default function useBlockNumber() {
  const { library } = useWeb3React<Web3Provider>();
  const shouldFetch = !!library;
  const { data } = useQuery({
    queryKey: ["BlockNumber"],
    enabled: shouldFetch,
    refetchInterval: 10 * 1000,
    queryFn: async () => {
      return library.getBlockNumber();
    }
  });

  return data;
}
