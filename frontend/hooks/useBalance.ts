import type { Web3Provider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { useWeb3React } from "@web3-react/core";
import { useQuery } from "@tanstack/react-query";

const ERC20Abi = [
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
]

export default function useBalance(address: string, contractAddress?: string) {
  const { library } = useWeb3React<Web3Provider>();
  const shouldFetch = typeof address === "string" && !!library && !!contractAddress;
  const { data } = useQuery({
    enabled: shouldFetch,
    queryKey: ["Balance"],
    refetchInterval: 1000,
    queryFn: async () => {
      const contract = new Contract(contractAddress, ERC20Abi, library);
      const amount = await contract.balanceOf(address);
      
      return amount;
    }
  });

  return data;
}
