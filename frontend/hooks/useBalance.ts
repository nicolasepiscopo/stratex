import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import useSWR from "swr";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";
import { Contract } from "ethers";
import ERC20 from "../contracts/ERC20.json";

export default function useBalance(address: string, contractAddress?: string, suspense = false) {
  const { library, chainId } = useWeb3React<Web3Provider>();

  const shouldFetch = typeof address === "string" && !!library;

  const result = useSWR(
    shouldFetch ? ["Balance", address, contractAddress, chainId] : null,
    ([, address]) => {
      if (!contractAddress) {
        return library.getBalance(address)
      } else {
        const contract = new Contract(contractAddress, ERC20, library);

        return contract.methods.balanceOf(address).call();
      }
    },
    {
      suspense,
    }
  );

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);

  return result;
}
