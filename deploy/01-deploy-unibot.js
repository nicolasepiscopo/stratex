const { ethers, network } = require("hardhat");
const {
  developmentchains,
  networkConfig,
} = require("../helper-hardhat-config");
const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2");
// const { verify } = require("../utils/verify");
module.exports = async (hre) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let tokenin, tokenout;
  //   if (!developmentchains.includes(network.name)) {
  //while connecting with front end we can directly map users selected token to its corresponding token tracker address
  tokenin = networkConfig[chainId]["WETH"];
  tokenout = networkConfig[chainId]["WMATIC"];
  // const args = [tokenin, tokenout];
  const args = [];
  //   //   }
  const unibot = await deploy("SingleSwap", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  console.log("DEployed");
  const bot = await ethers.getContract("SingleSwap", deployer);
  // console.log(bot);
  const tranresponse = await bot.initialiseOrder(
    1,
    tokenin,
    tokenout,
    1800,
    1900,
    10
  );
  const k = await bot.getTokenIn(1);
  console.log(k);
  // console.log(tokenin);
  const res = await bot.testing(tokenin);
  console.log(res.toString());
};
