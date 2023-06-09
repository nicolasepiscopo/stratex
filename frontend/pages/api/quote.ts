import { Contract } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";

const QUOTER_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
const FEE = '3000';

/**
 * NextJS endpoint that retrieves 
*/
export default async function handler(req, res) {
  const { tokenInAddress, tokenOutAddress, amount } = req.query;
  try {
    const provider = new JsonRpcProvider(process.env.ALCHEMY_RPC);
    const quoter = new Contract(
      QUOTER_ADDRESS,
      Quoter.abi,
      provider
    );
    const amountOut = await quoter.callStatic.quoteExactInputSingle(
      tokenInAddress,
      tokenOutAddress,
      FEE,
      amount,
      0
    );
    
    res.status(200).json({
      quote: amountOut,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.message });
  }
}
