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
        "internalType": "uint256",
        "name": "gridIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isFirstBreach",
        "type": "bool"
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
      }
    ],
    "name": "GridBreached",
    "type": "event"
  },
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const address = '0x42AF787924287dA64a74D095517d130EAE5cDac9';
  const provider = new JsonRpcProvider(
    process.env.ALCHEMY_RPC
  );
  const contract = new Contract(address, abi, provider);

  const logs = await contract.provider.getLogs({
    fromBlock: 0,
    toBlock: 'latest',
    topics: [id('GridBreached(uint256,bool,uint256,uint256)')]
  });
  const i = new Interface(abi);

  res.status(200).json(logs.map(log => {
    try {
      const logData = i.parseLog(log);

      return {
        name: logData.name,
        gridIndex: logData.args[0].toString(),
        isFirstBreach: logData.args[1],
        quantity: logData.args[2].toString(),
        price: logData.args[3].toString()
      }
    } catch (e) {
      return null;
    }
  }).filter(log => !!log));
}