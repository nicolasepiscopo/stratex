const networkConfig = {
  31337: {
    name: "hardhat",
  },
  80001: {
    name: "mumbai",
    WMATIC: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
    WETH: "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
    USDC: "0xe11A86849d99F524cAC3E7A0Ec1241828e332C62",
  },
  // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
};
const developmentChains = ["hardhat"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;
module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
