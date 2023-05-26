import { ethers } from "ethers";
import { abi } from '../../artifacts/contracts/TradeBot.sol/SingleSwap.json'
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const address = '0x364492771fddd3eef9416ff78b287c472bc9ebb9';
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ALCHEMY_RPC
  );
  const contract = new ethers.Contract(address, abi, provider);

  const logs = await contract.provider.getLogs({
    fromBlock: 0,
    toBlock: 'latest',
    topics: [ethers.utils.id('GridBreached(uint256,bool,uint256,uint256)')]
  });
  const i = new ethers.utils.Interface(abi);

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