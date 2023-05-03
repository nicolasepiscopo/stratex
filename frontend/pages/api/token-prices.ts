/**
 * NextJS endpoint that retrieves latest token prices from CoinMarketCap
 */
export default async function handler(req, res) {
  const response = await fetch(`https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?CMC_PRO_API_KEY=${process.env.CMC_PRO_API_KEY}`);
  const data = await response.json();
  res.status(200).json(data);
}
