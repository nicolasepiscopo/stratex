import { NextApiRequest, NextApiResponse } from "next";
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from "@ethersproject/contracts";
import { id } from '@ethersproject/hash';
import { Interface } from '@ethersproject/abi';

const abi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "botId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum StratEx.OrderType",
        "name": "ordertype",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gridIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "qty",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "OrderExecuted",
    "type": "event"
  },
]

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
    topics: [id('OrderExecuted(address,uint256,uint8,uint256,uint256,uint256,uint256)')]
  });
  const i = new Interface(abi);

  res.status(200).json(logs.filter(log => {
    try {
      const logData = i.parseLog(log);

      return logData.args[0] === userAddress;
    } catch (e) {
      return false;
    }
  }).map(log => {
    try {
      const logData = i.parseLog(log);

      return {
        botId: logData.args[1].toString(),
        orderType: logData.args[2] === 0 ? 'buy' : 'sell',
        gridIndex: logData.args[3].toString(),
        qty: logData.args[4].toString(),
        price: logData.args[5].toString(),
        timestamp: logData.args[6].toString(),
      }
    } catch (e) {
      return null;
    }
  }).filter(log => !!log));
}