require('dotenv').config()
require('@nomiclabs/hardhat-etherscan')
require('@nomiclabs/hardhat-ethers')
require('solidity-coverage')
require('@nomicfoundation/hardhat-chai-matchers')

module.exports = {
  networks: {
    mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001
    }
  },
  solidity:{
    version: '0.8.7',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  etherscan: {
    apiKey: {
      // npx hardhat verify --list-networks
      polygonMumbai: process.env.POLYGONSCAN_API_KEY
    }
  }
}
