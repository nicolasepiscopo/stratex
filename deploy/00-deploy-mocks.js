const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config");
module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  // const priceFeedadd = networkConfig[chainId]["ethUsdPriceFeed"];
  if (developmentChains.includes(network.name)) {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying in mock");
    const mockV3AggregatorFactory = await ethers.getContractFactory(
      "MockV3Aggregator"
    );
    const mockV3Aggregator = await mockV3AggregatorFactory
      .connect(deployer)
      .deploy(DECIMALS, INITIAL_ANSWER);
    // const k = await deployments.get("MockV3Aggregator");
    // priceFeedadd = k.address;
    // const fundME = await deploy("FundMe", {
    //   from: deployer,
    //   args: [priceFeedadd],
    //   log: true,
    //   waitConfirmations: network.name.blockConfirmations || 1,
    // });
    console.log("MOCKS DEPLOYED!");
    console.log("--------------------------");
    const priceFeedResult = (await mockV3Aggregator.latestRoundData()).answer;
    console.log(priceFeedResult.toString());
    // const k = await deployments.get("MockV3Aggregator");
    //  = k.latestRoundData();
    // console.log(amt);
    // console.log("")
  }
};
// module.exports.default = deployfunc;
module.exports.tags = ["all", "mocks"];
