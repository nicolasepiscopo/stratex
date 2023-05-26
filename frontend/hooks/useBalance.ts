import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import useSWR from "swr";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";
import { Contract } from "ethers";
import ERC20 from "../contracts/ERC20.json";
import { useQuery } from "@tanstack/react-query";

export default function useBalance(address: string, contractAddress?: string, suspense = false) {
  const { library, chainId } = useWeb3React<Web3Provider>();
  const shouldFetch = typeof address === "string" && !!library;
  const { data } = useQuery({
    enabled: shouldFetch,
    queryKey: ["Balance"],
    refetchInterval: 1000,
    queryFn: async () => {
      if (!contractAddress) {
        const amount = await library.getBalance(address)
        return amount;
      } else {
        const contract = new Contract(contractAddress, ERC20, library);
        const amount = contract.methods.balanceOf(address).call();
        return amount;
      }
    }
  });

  return data;
}
