import { NextApiRequest, NextApiResponse } from "next";
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from "@ethersproject/contracts";
import { id } from '@ethersproject/hash';
import { Interface, defaultAbiCoder } from '@ethersproject/abi';

const abi = [{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "address",
      "name": "user",
      "type": "address"
    },
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "botId",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    }
  ],
  "name": "Deposit",
  "type": "event"
}];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userAddress } = req.query;
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const provider = new JsonRpcProvider(
    process.env.ALCHEMY_RPC
  );
  const contract = new Contract(address, abi, provider);

  const logs = await contract.provider.getLogs({
    address,
    fromBlock: 0,
    toBlock: 'latest',
    topics: [id('Deposit(address,uint256,uint256)'), defaultAbiCoder.encode(["address"], [userAddress])]
  });
  const i = new Interface(abi);

  res.status(200).json(logs.map(log => {
    try {
      const logData = i.parseLog(log);

      return {
        botId: logData.args[1].toString(),
        amount: logData.args[2].toString(),
      };
    } catch (e) {
      return null;
    }
  }).filter(log => !!log));
}