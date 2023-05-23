/**
 * NextJS endpoint that retrieves latest token prices from CoinMarketCap
 */
export default async function handler(req, res) {
  const { symbolFrom, symbolTo = 'USD' } = JSON.parse(req.body);
  const response = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbolFrom}&convert=${symbolTo}&CMC_PRO_API_KEY=${process.env.CMC_PRO_API_KEY}`);
  const data = await response.json();

  res.status(200).json(data);
}
